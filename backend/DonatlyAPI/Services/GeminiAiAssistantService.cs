using System.Text;
using System.Text.Json;
using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;

namespace DonatlyAPI.Services;

/// <summary>
/// Donor recommendation assistant backed by Google Gemini (free tier,
/// e.g. gemini-1.5-flash). When no API key is configured it gracefully
/// falls back to a transparent keyword/urgency heuristic so the feature
/// still works in a demo without any credentials.
/// </summary>
public class GeminiAiAssistantService : IAiAssistantService
{
    private readonly IInitiativeService _initiativeService;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeminiAiAssistantService> _logger;

    public GeminiAiAssistantService(
        IInitiativeService initiativeService,
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GeminiAiAssistantService> logger)
    {
        _initiativeService = initiativeService;
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AiRecommendResponse> RecommendAsync(AiRecommendRequest request, CancellationToken ct = default)
    {
        var active = (await _initiativeService.GetActiveInitiativesAsync()).ToList();

        if (active.Count == 0)
        {
            return new AiRecommendResponse(
                "Наразі немає активних зборів. Завітайте трохи згодом — нові ініціативи з’являються регулярно.",
                Array.Empty<AiSuggestion>(),
                false);
        }

        // Heuristic ranking is always computed: it is both the no-key fallback
        // and the source of clickable suggestions next to the LLM message.
        var ranked = RankByHeuristic(request.Prompt, active);
        var suggestions = ranked
            .Take(3)
            .Select(i => new AiSuggestion(i.Id, i.Title, Math.Round(i.ProgressPercentage)))
            .ToList();

        var apiKey = _configuration["AI:Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new AiRecommendResponse(BuildHeuristicMessage(request.Prompt, suggestions, active), suggestions, false);
        }

        try
        {
            var message = await CallGeminiAsync(apiKey!, request.Prompt, ranked.Take(8).ToList(), ct);
            if (!string.IsNullOrWhiteSpace(message))
            {
                return new AiRecommendResponse(message!.Trim(), suggestions, true);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini call failed; falling back to heuristic recommendations.");
        }

        return new AiRecommendResponse(BuildHeuristicMessage(request.Prompt, suggestions, active), suggestions, false);
    }

    private async Task<string?> CallGeminiAsync(
        string apiKey,
        string prompt,
        IReadOnlyList<InitiativeDto> context,
        CancellationToken ct)
    {
        var model = _configuration["AI:Gemini:Model"];
        if (string.IsNullOrWhiteSpace(model)) model = "gemini-2.0-flash";

        var catalogue = new StringBuilder();
        foreach (var i in context)
        {
            catalogue.AppendLine(
                $"- {i.Title}: {Trim(i.Description, 160)} " +
                $"(зібрано {i.CollectedAmount:0} з {i.TargetAmount:0} грн, {Math.Round(i.ProgressPercentage)}%).");
        }

        var systemPrompt =
            "Ти — доброзичливий помічник благодійної платформи Donatly. " +
            "Користувач-донор описує, кому хоче допомогти. На основі СПИСКУ активних зборів нижче " +
            "порекомендуй 1–3 найбільш доречні збори та коротко поясни чому. " +
            "Відповідай українською, стисло (до 5 речень), без вигадування зборів, яких немає у списку.\n\n" +
            $"Запит донора: {prompt}\n\nАктивні збори:\n{catalogue}";

        var payload = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = systemPrompt } } }
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
        using var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var resp = await _httpClient.PostAsync(url, content, ct);

        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning("Gemini returned {Status}.", resp.StatusCode);
            return null;
        }

        var json = await resp.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(json);

        // candidates[0].content.parts[0].text
        if (doc.RootElement.TryGetProperty("candidates", out var candidates) &&
            candidates.GetArrayLength() > 0)
        {
            var parts = candidates[0].GetProperty("content").GetProperty("parts");
            if (parts.GetArrayLength() > 0 &&
                parts[0].TryGetProperty("text", out var textEl))
            {
                return textEl.GetString();
            }
        }
        return null;
    }

    private static List<InitiativeDto> RankByHeuristic(string prompt, List<InitiativeDto> initiatives)
    {
        var tokens = Tokenize(prompt);

        return initiatives
            .Select(i => new { Item = i, Score = ScoreInitiative(i, tokens) })
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Item.Deadline) // sooner deadline = more urgent
            .Select(x => x.Item)
            .ToList();
    }

    private static double ScoreInitiative(InitiativeDto i, HashSet<string> tokens)
    {
        var haystack = $"{i.Title} {i.Description}".ToLowerInvariant();
        double score = 0;

        foreach (var t in tokens)
        {
            if (haystack.Contains(t)) score += 10;
        }

        // Mild boost for nearly-funded initiatives (a small push finishes them).
        if (i.ProgressPercentage is >= 70 and < 100) score += 2;
        // Mild boost for fresh initiatives that have barely started.
        if (i.ProgressPercentage < 10) score += 1;

        return score;
    }

    private static string BuildHeuristicMessage(string prompt, List<AiSuggestion> suggestions, List<InitiativeDto> active)
    {
        if (suggestions.Count == 0)
        {
            return $"Зараз активних зборів: {active.Count}. Спробуйте уточнити запит — наприклад, вкажіть тему (медицина, діти, тварини) чи суму.";
        }

        var titles = string.Join("», «", suggestions.Select(s => s.Title));
        return string.IsNullOrWhiteSpace(prompt)
            ? $"Ось збори, яким зараз потрібна підтримка: «{titles}»."
            : $"За вашим запитом найкраще підходять: «{titles}». Натисніть на збір, щоб переглянути деталі та зробити внесок.";
    }

    private static HashSet<string> Tokenize(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return new HashSet<string>();
        return text
            .ToLowerInvariant()
            .Split(new[] { ' ', ',', '.', '!', '?', ';', ':', '\n', '\r', '\t', '"', '(', ')' },
                StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 4) // skip short stop-words
            .ToHashSet();
    }

    private static string Trim(string s, int max) =>
        string.IsNullOrEmpty(s) || s.Length <= max ? s : s[..max] + "…";
}

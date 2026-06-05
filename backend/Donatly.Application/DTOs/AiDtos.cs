namespace Donatly.Application.DTOs;

/// <summary>Donor's free-text request to the AI assistant.</summary>
public record AiRecommendRequest(string Prompt);

/// <summary>A single recommended initiative surfaced to the donor.</summary>
public record AiSuggestion(
    Guid InitiativeId,
    string Title,
    double ProgressPercentage
);

/// <summary>
/// AI assistant reply: a conversational message plus clickable initiative suggestions.
/// <c>UsedLlm</c> indicates whether a real LLM produced the message (true) or the
/// heuristic fallback was used (false).
/// </summary>
public record AiRecommendResponse(
    string Message,
    IEnumerable<AiSuggestion> Suggestions,
    bool UsedLlm
);

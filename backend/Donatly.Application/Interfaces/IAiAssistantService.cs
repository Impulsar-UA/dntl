using Donatly.Application.DTOs;

namespace Donatly.Application.Interfaces;

/// <summary>
/// AI assistant that recommends active initiatives to a donor based on a
/// free-text request (e.g. "I want to help children's hospitals up to 500 UAH").
/// </summary>
public interface IAiAssistantService
{
    Task<AiRecommendResponse> RecommendAsync(AiRecommendRequest request, CancellationToken ct = default);
}

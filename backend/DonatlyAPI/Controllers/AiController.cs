using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DonatlyAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IAiAssistantService _aiAssistant;

    public AiController(IAiAssistantService aiAssistant)
    {
        _aiAssistant = aiAssistant;
    }

    /// <summary>AI donor assistant — recommends active initiatives (MF-24).</summary>
    [HttpPost("recommend")]
    public async Task<ActionResult<AiRecommendResponse>> Recommend([FromBody] AiRecommendRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new { error = "Опишіть, кому ви хочете допомогти." });
        }

        var result = await _aiAssistant.RecommendAsync(request);
        return Ok(result);
    }
}

using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DonatlyAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PetitionsController : ControllerBase
{
    private readonly IPetitionService _petitionService;

    public PetitionsController(IPetitionService petitionService)
    {
        _petitionService = petitionService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PetitionDto>>> GetAll()
    {
        var petitions = await _petitionService.GetAllAsync();
        return Ok(petitions);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PetitionDto>> GetById(Guid id)
    {
        var petition = await _petitionService.GetByIdAsync(id);
        if (petition == null) return NotFound();
        return Ok(petition);
    }

    [HttpPost]
    public async Task<ActionResult<PetitionDto>> Create([FromBody] CreatePetitionDto dto)
    {
        var created = await _petitionService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PetitionDto>> Update(Guid id, [FromBody] UpdatePetitionDto dto)
    {
        var updated = await _petitionService.UpdateAsync(id, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _petitionService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("{id:guid}/vote")]
    public async Task<IActionResult> Vote(Guid id, [FromBody] VoteDto dto)
    {
        try
        {
            await _petitionService.VoteAsync(id, dto.DonorId);
            return Ok(new { message = "Голос успешно учтен." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
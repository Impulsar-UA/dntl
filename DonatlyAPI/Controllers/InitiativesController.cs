using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DonatlyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InitiativesController : ControllerBase
    {
        private readonly IInitiativeService _initiativeService;

        public InitiativesController(IInitiativeService initiativeService)
        {
            _initiativeService = initiativeService;
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<InitiativeDto>> GetById(Guid id)
        {
            var initiative = await _initiativeService.GetByIdAsync(id);
            if (initiative == null)
            {
                return NotFound();
            }
            return Ok(initiative);
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<InitiativeDto>>> GetActive()
        {
            var initiatives = await _initiativeService.GetActiveInitiativesAsync();
            return Ok(initiatives);
        }

        [HttpPost]
        public async Task<ActionResult<InitiativeDto>> Create([FromBody] CreateInitiativeDto dto)
        {
            try
            {
                var createdInitiative = await _initiativeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdInitiative.Id }, createdInitiative);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InitiativeDto>>> GetAll()
        {
            var initiatives = await _initiativeService.GetAllAsync();
            return Ok(initiatives);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<InitiativeDto>> Update(Guid id, [FromBody] UpdateInitiativeDto dto)
        {
            var updated = await _initiativeService.UpdateAsync(id, dto);
            if (updated == null)
            {
                return NotFound();
            }
            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _initiativeService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }

}

using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DonatlyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonationsController : ControllerBase
    {
        private readonly IDonationService _donationService;

        public DonationsController(IDonationService donationService)
        {
            _donationService = donationService;
        }

        [HttpPost]
        public async Task<ActionResult<DonationDto>> Donate([FromBody] CreateDonationDto dto)
        {
            try
            {
                var processedDonation = await _donationService.ProcessDonationAsync(dto);
                return Ok(processedDonation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

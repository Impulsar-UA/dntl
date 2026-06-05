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

        /// <summary>Donation history for a donor (MF-21).</summary>
        [HttpGet("donor/{donorId:guid}")]
        public async Task<ActionResult<IEnumerable<DonationDto>>> GetByDonor(Guid donorId)
        {
            var donations = await _donationService.GetDonationsByDonorAsync(donorId);
            return Ok(donations);
        }
    }
}

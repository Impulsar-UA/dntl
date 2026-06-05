using Donatly.Application.DTOs;

namespace Donatly.Application.Interfaces
{
    public interface IDonationService
    {
        Task<DonationDto> ProcessDonationAsync(CreateDonationDto dto);
        Task<IEnumerable<DonationDto>> GetDonationsByDonorAsync(Guid donorId);
    }

}

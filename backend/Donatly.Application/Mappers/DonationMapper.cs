using Donalty.Core.Domain.Entities;
using Donatly.Application.DTOs;

namespace Donatly.Application.Mappers
{
    public static class DonationMapper
    {
        public static DonationDto ToDto(this Donation donation)
        {
            return new DonationDto(
                donation.Id,
                donation.DonorId,
                donation.InitiativeId,
                donation.Amount,
                donation.Currency,
                donation.Timestamp,
                donation.IsProcessed
            );
        }
    }

}

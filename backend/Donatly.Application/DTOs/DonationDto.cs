
namespace Donatly.Application.DTOs
{
    public record DonationDto(
        Guid Id,
        Guid DonorId,
        Guid InitiativeId,
        decimal Amount,
        string Currency,
        DateTime Timestamp,
        bool IsProcessed
    );

}

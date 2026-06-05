namespace Donatly.Application.DTOs
{
    public record CreateDonationDto(
        Guid DonorId,
        Guid InitiativeId,
        decimal Amount,
        string Currency
    );

}

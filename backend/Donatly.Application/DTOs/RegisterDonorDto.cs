namespace Donatly.Application.DTOs
{
    public record RegisterDonorDto(
        string Email,
        string Password,
        string DisplayName
    );
}
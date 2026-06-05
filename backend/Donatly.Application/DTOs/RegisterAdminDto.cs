namespace Donatly.Application.DTOs
{
    public record RegisterAdminDto(
        string Email,
        string Password,
        string DisplayName
    );
}

namespace Donatly.Application.DTOs
{
    public record UserDto(
        Guid Id,
        string Email,
        string DisplayName,
        string UserType,
        bool IsActive = true
    );
}

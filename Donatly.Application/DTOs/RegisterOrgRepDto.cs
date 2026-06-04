namespace Donatly.Application.DTOs
{
    public record RegisterOrgRepDto(
        string Email,
        string Password,
        string DisplayName,
        string OrgRegistryCode,
        string ContactPhone
    );
}
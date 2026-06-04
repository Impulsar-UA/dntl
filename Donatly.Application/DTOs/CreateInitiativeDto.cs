namespace Donatly.Application.DTOs
{
    public record CreateInitiativeDto(
        string Title,
        string Description,
        decimal TargetAmount,
        DateTime Deadline,
        Guid OrganizationRepId
        );

}
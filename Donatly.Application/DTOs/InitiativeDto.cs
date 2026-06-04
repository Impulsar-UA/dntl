namespace Donatly.Application.DTOs
{
    public record InitiativeDto(
    Guid Id,
    string Title,
    string Description,
    decimal TargetAmount,
    decimal CollectedAmount,
    double ProgressPercentage,
    DateTime Deadline,
    string Status,
    bool IsGovernmentSupported,
    Guid OrganizationRepId
);

}

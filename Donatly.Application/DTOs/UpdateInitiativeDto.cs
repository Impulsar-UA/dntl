namespace Donatly.Application.DTOs;

public record UpdateInitiativeDto(
    string Title,
    string Description,
    decimal TargetAmount,
    DateTime Deadline,
    string Status
);
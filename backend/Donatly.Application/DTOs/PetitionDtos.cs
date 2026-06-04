namespace Donatly.Application.DTOs;

public record PetitionDto(
    Guid Id,
    string Title,
    string Body,
    int TargetVotes,
    int CurrentVotes,
    DateTime Deadline,
    string Status
);

public record CreatePetitionDto(
    string Title,
    string Body,
    int TargetVotes,
    DateTime Deadline
);

public record UpdatePetitionDto(
    string Title,
    string Body,
    int TargetVotes,
    DateTime Deadline,
    string Status
);

public record VoteDto(
    Guid DonorId
);
using Donalty.Core.Domain.Entities;
using Donatly.Application.DTOs;

namespace Donatly.Application.Mappers;

public static class PetitionMapper
{
    public static PetitionDto ToDto(this Petition petition)
    {
        return new PetitionDto(
            petition.Id,
            petition.Title,
            petition.Body,
            petition.TargetVotes,
            petition.CurrentVotes,
            petition.Deadline,
            petition.Status.ToString()
        );
    }

    public static Petition ToEntity(this CreatePetitionDto dto)
    {
        return new Petition(
            dto.Title,
            dto.Body,
            dto.TargetVotes,
            dto.Deadline
        );
    }
}
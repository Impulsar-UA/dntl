using Donalty.Core.Domain.Entities;
using Donatly.Application.DTOs;

namespace Donatly.Application.Mappers
{
    public static class InitiativeMapper
    {
        public static InitiativeDto ToDto(this Initiative initiative)
        {
            return new InitiativeDto(
                initiative.Id,
                initiative.Title,
                initiative.Description,
                initiative.TargetAmount,
                initiative.CollectedAmount,
                (double)initiative.CalculateProgress(),
                initiative.Deadline,
                initiative.Status.ToString(),
                initiative.IsGovernmentSupported,
                initiative.OrganizationRepId
            );
        }

        public static Initiative ToEntity(this CreateInitiativeDto dto)
        {
            return new Initiative(
                dto.Title,
                dto.Description,
                dto.TargetAmount,
                dto.Deadline,
                dto.OrganizationRepId
            );
        }
    }

}

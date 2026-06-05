using Donatly.Application.DTOs;

namespace Donatly.Application.Interfaces;

public interface IPetitionService
{
    Task<PetitionDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<PetitionDto>> GetAllAsync();
    Task<PetitionDto> CreateAsync(CreatePetitionDto dto);
    Task<PetitionDto?> UpdateAsync(Guid id, UpdatePetitionDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> VoteAsync(Guid petitionId, Guid donorId); // Правило BR-7
}
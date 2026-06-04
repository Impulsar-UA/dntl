using Donatly.Application.DTOs;

namespace Donatly.Application.Interfaces
{
    public interface IInitiativeService
    {
        Task<InitiativeDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<InitiativeDto>> GetActiveInitiativesAsync();
        Task<InitiativeDto> CreateAsync(CreateInitiativeDto dto);
 
        Task<IEnumerable<InitiativeDto>> GetAllAsync(); // Для админки
        Task<InitiativeDto?> UpdateAsync(Guid id, UpdateInitiativeDto dto);
        Task<bool> DeleteAsync(Guid id);
    }

}

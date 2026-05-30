using Donatly.Application.DTOs;

namespace Donatly.Application.Interfaces
{
    public interface IInitiativeService
    {
        Task<InitiativeDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<InitiativeDto>> GetActiveInitiativesAsync();
        Task<InitiativeDto> CreateAsync(CreateInitiativeDto dto);
    }

}

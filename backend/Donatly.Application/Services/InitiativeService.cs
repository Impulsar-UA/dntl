using Donatly.Application.DTOs;
using Donalty.Core.Domain.Enums;
using Donatly.Application.Interfaces;
using Donatly.Application.Mappers;
using Microsoft.EntityFrameworkCore;

namespace Donatly.Application.Services
{
    public class InitiativeService : IInitiativeService
    {
        private readonly IAppDbContext _context;

        public InitiativeService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<InitiativeDto?> GetByIdAsync(Guid id)
        {
            var initiative = await _context.Initiatives.FindAsync(id);
            return initiative?.ToDto();
        }

        public async Task<IEnumerable<InitiativeDto>> GetActiveInitiativesAsync()
        {
            var initiatives = await _context.Initiatives
                .Where(i => i.Status == InitiativeStatus.Active)
                .ToListAsync();

            return initiatives.Select(i => i.ToDto());
        }

        public async Task<InitiativeDto> CreateAsync(CreateInitiativeDto dto)
        {
            var repExists = await _context.OrganizationReps.AnyAsync(r => r.Id == dto.OrganizationRepId);
            if (!repExists)
            {
                throw new ArgumentException("Organization Representative not found.");
            }

            var initiative = dto.ToEntity();

            _context.Initiatives.Add(initiative);
            await _context.SaveChangesAsync();

            return initiative.ToDto();
        }
        public async Task<IEnumerable<InitiativeDto>> GetAllAsync()
        {
            var initiatives = await _context.Initiatives.ToListAsync();
            return initiatives.Select(i => i.ToDto());
        }

        public async Task<InitiativeDto?> UpdateAsync(Guid id, UpdateInitiativeDto dto)
        {
            var initiative = await _context.Initiatives.FindAsync(id);
            if (initiative == null) return null;

            initiative.UpdateDetails(dto.Title, dto.Description, dto.TargetAmount, dto.Deadline);

            if (Enum.TryParse<InitiativeStatus>(dto.Status, true, out var parsedStatus))
            {
                initiative.ChangeStatus(parsedStatus);
            }

            await _context.SaveChangesAsync();
            return initiative.ToDto();
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var initiative = await _context.Initiatives.FindAsync(id);
            if (initiative == null) return false;

            _context.Initiatives.Remove(initiative);
            await _context.SaveChangesAsync();
            return true;
        }
    }

}

using Donalty.Core.Domain.Entities;
using Donalty.Core.Domain.Enums;
using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Donatly.Application.Mappers;
using Microsoft.EntityFrameworkCore;

namespace Donatly.Application.Services;

public class PetitionService : IPetitionService
{
    private readonly IAppDbContext _context;

    public PetitionService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PetitionDto?> GetByIdAsync(Guid id)
    {
        var petition = await _context.Petitions.FindAsync(id);
        return petition?.ToDto();
    }

    public async Task<IEnumerable<PetitionDto>> GetAllAsync()
    {
        var petitions = await _context.Petitions.ToListAsync();
        return petitions.Select(p => p.ToDto());
    }

    public async Task<PetitionDto> CreateAsync(CreatePetitionDto dto)
    {
        var petition = dto.ToEntity();

        // По умолчанию петиция создается как Draft, но щас в Active для тестирования фронта
        petition.Publish();

        _context.Petitions.Add(petition);
        await _context.SaveChangesAsync();

        return petition.ToDto();
    }

    public async Task<PetitionDto?> UpdateAsync(Guid id, UpdatePetitionDto dto)
    {
        var petition = await _context.Petitions.FindAsync(id);
        if (petition == null) return null;

        petition.UpdateDetails(dto.Title, dto.Body, dto.TargetVotes, dto.Deadline);

        if (Enum.TryParse<PetitionStatus>(dto.Status, true, out var parsedStatus))
        {
            petition.ChangeStatus(parsedStatus);
        }

        await _context.SaveChangesAsync();
        return petition.ToDto();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var petition = await _context.Petitions.FindAsync(id);
        if (petition == null) return false;

        _context.Petitions.Remove(petition);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> VoteAsync(Guid petitionId, Guid donorId)
    {
        // Проверка повторного голосования
        var alreadyVoted = await _context.Votes
            .AnyAsync(v => v.DonorId == donorId && v.PetitionId == petitionId);

        if (alreadyVoted)
        {
            throw new InvalidOperationException("Вы уже поддержали эту петицию.");
        }

        var petition = await _context.Petitions.FindAsync(petitionId);
        if (petition == null) throw new KeyNotFoundException("Петиция не найдена.");

        var donor = await _context.Donors.FindAsync(donorId);
        if (donor == null) throw new KeyNotFoundException("Донор не найден.");

        var vote = new Vote
        {
            Id = Guid.NewGuid(),
            DonorId = donorId,
            PetitionId = petitionId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Votes.Add(vote);
        petition.AddVote(); 
        donor.IncrementSignedPetitions();

        await _context.SaveChangesAsync();
        return true;
    }
}
using Donalty.Core.Domain.Entities;
using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Donatly.Application.Mappers;
using Microsoft.EntityFrameworkCore;

namespace Donatly.Application.Services;

public class DonationService : IDonationService
{
    private readonly IAppDbContext _context;

    public DonationService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<DonationDto> ProcessDonationAsync(CreateDonationDto dto)
    {
        var initiative = await _context.Initiatives.FindAsync(dto.InitiativeId);
        if (initiative == null) throw new KeyNotFoundException("Initiative not found.");

        var donor = await _context.Donors.FindAsync(dto.DonorId);
        if (donor == null) throw new KeyNotFoundException("Donor not found.");

        var donation = new Donation(dto.DonorId, dto.InitiativeId, dto.Amount, dto.Currency);
        _context.Donations.Add(donation);

        // just simulating payment processing here
        donation.MarkAsProcessed();

        initiative.AddDonation(dto.Amount);
        donor.AddDonation(dto.Amount);

        var transaction = new PaymentTransaction(
            donation.Id,
            dto.Amount,
            dto.Currency,
            "SimulatedProvider",
            "SuccessPayload"
        );
        _context.PaymentTransactions.Add(transaction);

        await _context.SaveChangesAsync();

        return donation.ToDto();
    }

    public async Task<IEnumerable<DonationDto>> GetDonationsByDonorAsync(Guid donorId)
    {
        var donations = await _context.Donations
            .Where(d => d.DonorId == donorId)
            .OrderByDescending(d => d.Timestamp)
            .ToListAsync();

        return donations.Select(d => d.ToDto());
    }
}
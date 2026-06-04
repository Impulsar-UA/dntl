using Donalty.Core.Domain.Entities;
using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Donatly.Application.Mappers;
using Microsoft.EntityFrameworkCore;

namespace Donatly.Application.Services;

public class UserService : IUserService
{
    private readonly IAppDbContext _context;

    public UserService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto> RegisterDonorAsync(RegisterDonorDto dto)
    {
        var normalizedEmail = dto.Email.ToLowerInvariant();

        var emailExists = await _context.Users.AnyAsync(u => u.Email == normalizedEmail);
        if (emailExists)
        {
            throw new InvalidOperationException("A user with this email already exists");
        }

        var passwordHash = PasswordHasher.HashPassword(dto.Password);
        var donor = new Donor(normalizedEmail, passwordHash, dto.DisplayName);

        _context.Donors.Add(donor);
        await _context.SaveChangesAsync();

        return donor.ToDto();
    }

    public async Task<UserDto> RegisterOrgRepAsync(RegisterOrgRepDto dto)
    {
        var normalizedEmail = dto.Email.ToLowerInvariant();

        var emailExists = await _context.Users.AnyAsync(u => u.Email == normalizedEmail);
        if (emailExists)
        {
            throw new InvalidOperationException("A user with this email already exists");
        }

        var passwordHash = PasswordHasher.HashPassword(dto.Password);
        var rep = new OrganizationRep(
            normalizedEmail,
            passwordHash,
            dto.DisplayName,
            dto.OrgRegistryCode,
            dto.ContactPhone
        );

        _context.OrganizationReps.Add(rep);
        await _context.SaveChangesAsync();

        return rep.ToDto();
    }

    public async Task<UserDto?> LoginAsync(LoginDto dto)
    {
        var normalizedEmail = dto.Email.ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null || !PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash))
        {
            return null;
        }

        return user.ToDto();
    }
}
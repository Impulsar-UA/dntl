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

        // Deactivated accounts cannot sign in.
        if (!user.IsActive)
        {
            return null;
        }

        return user.ToDto();
    }

    public async Task<UserDto> FindOrCreateGoogleDonorAsync(GoogleLoginDto dto)
    {
        var normalizedEmail = dto.Email.ToLowerInvariant();
        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (existing != null)
        {
            if (!existing.IsActive)
            {
                throw new InvalidOperationException("This account is deactivated.");
            }
            return existing.ToDto();
        }

        // New Google users join as donors. A random password hash is stored
        // because they authenticate via Google, not a local password.
        var randomSecret = PasswordHasher.HashPassword(Guid.NewGuid().ToString("N"));
        var displayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? normalizedEmail : dto.DisplayName;
        var donor = new Donor(normalizedEmail, randomSecret, displayName);

        _context.Donors.Add(donor);
        await _context.SaveChangesAsync();

        return donor.ToDto();
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _context.Users.ToListAsync();
        return users.Select(u => u.ToDto());
    }

    public async Task<UserDto?> SetUserActiveAsync(Guid id, bool isActive)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        if (isActive) user.Activate();
        else user.Deactivate();

        await _context.SaveChangesAsync();
        return user.ToDto();
    }
}
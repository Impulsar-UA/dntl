using Donatly.Application.DTOs;

namespace Donatly.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> RegisterDonorAsync(RegisterDonorDto dto);
    Task<UserDto> RegisterOrgRepAsync(RegisterOrgRepDto dto);
    Task<UserDto?> LoginAsync(LoginDto dto);

    /// <summary>Finds an existing user by email or creates a new Donor (Google sign-in).</summary>
    Task<UserDto> FindOrCreateGoogleDonorAsync(GoogleLoginDto dto);

    // --- Administrator user management ---
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto?> SetUserActiveAsync(Guid id, bool isActive);
}

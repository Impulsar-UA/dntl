using Donatly.Application.DTOs;

namespace Donatly.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> RegisterDonorAsync(RegisterDonorDto dto);
    Task<UserDto> RegisterOrgRepAsync(RegisterOrgRepDto dto);
    Task<UserDto?> LoginAsync(LoginDto dto);
}
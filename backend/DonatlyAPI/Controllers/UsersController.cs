using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DonatlyAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("register/donor")]
    public async Task<ActionResult<UserDto>> RegisterDonor([FromBody] RegisterDonorDto dto)
    {
        try
        {
            var result = await _userService.RegisterDonorAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("register/org-representative")]
    public async Task<ActionResult<UserDto>> RegisterOrgRepresentative([FromBody] RegisterOrgRepDto dto)
    {
        try
        {
            var result = await _userService.RegisterOrgRepAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("register/admin")]
    public async Task<ActionResult<UserDto>> RegisterAdmin([FromBody] RegisterAdminDto dto)
    {
        try
        {
            var result = await _userService.RegisterAdminAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _userService.LoginAsync(dto);
        if (result == null)
        {
            return Unauthorized(new { error = "Invalid login or password" });
        }
        return Ok(result);
    }
}
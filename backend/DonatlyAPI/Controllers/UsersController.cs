using Donatly.Application.DTOs;
using Donatly.Application.Interfaces;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;

namespace DonatlyAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserService userService,
        IConfiguration configuration,
        ILogger<UsersController> logger)
    {
        _userService = userService;
        _configuration = configuration;
        _logger = logger;
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

    /// <summary>
    /// Google Sign-In. The frontend (Google Identity Services) sends the ID token;
    /// here it is verified against the configured Google OAuth Client ID and the
    /// matching donor account is found or created.
    /// </summary>
    [HttpPost("google")]
    public async Task<ActionResult<UserDto>> GoogleLogin([FromBody] GoogleTokenDto dto)
    {
        var clientId = _configuration["Google:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return StatusCode(503, new { error = "Google sign-in is not configured on the server." });
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                dto.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Google ID token validation failed.");
            return Unauthorized(new { error = "Invalid Google token." });
        }

        try
        {
            var user = await _userService.FindOrCreateGoogleDonorAsync(
                new GoogleLoginDto(payload.Email, payload.Name ?? payload.Email));
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // ---------------- Administrator user management ----------------

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPut("{id:guid}/active")]
    public async Task<ActionResult<UserDto>> SetActive(Guid id, [FromBody] SetActiveDto dto)
    {
        var updated = await _userService.SetUserActiveAsync(id, dto.IsActive);
        if (updated == null) return NotFound();
        return Ok(updated);
    }
}

/// <summary>Raw Google ID token from the frontend GIS flow.</summary>
public record GoogleTokenDto(string IdToken);

/// <summary>Activate / deactivate a user account.</summary>
public record SetActiveDto(bool IsActive);

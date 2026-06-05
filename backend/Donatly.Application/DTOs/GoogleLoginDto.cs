namespace Donatly.Application.DTOs
{
    /// <summary>
    /// Payload from the frontend Google Identity Services flow.
    /// Carries the verified user identity extracted from the Google ID token
    /// (token verification happens in the API layer).
    /// </summary>
    public record GoogleLoginDto(
        string Email,
        string DisplayName
    );
}

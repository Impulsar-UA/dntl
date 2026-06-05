using Donalty.Core.Domain.Base;

namespace Donalty.Core.Domain.Entities
{
    public abstract class User: Entity
    {
        public string Email { get; private set; }
        public string PasswordHash { get; private set; }
        public string DisplayName { get; private set; }
        public string AvatarUrl { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public bool IsActive { get; private set; }

        protected User(string email, string passwordHash, string displayName)
        {
            Email = email;
            PasswordHash = passwordHash;
            DisplayName = displayName;
            // AvatarUrl maps to a NOT NULL column; default to empty until the user
            // uploads an avatar (avoids SQLite NOT NULL constraint on insert).
            AvatarUrl = string.Empty;
            CreatedAt = DateTime.UtcNow;
            IsActive = true;

            AvatarUrl = string.Empty;
        }

        public void UpdateProfile(string displayName, string avatarUrl)
        {
            DisplayName = displayName;
            AvatarUrl = avatarUrl;
        }

        public void Deactivate() => IsActive = false;

    }
}

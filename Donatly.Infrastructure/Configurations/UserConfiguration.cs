using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Donalty.Core.Domain.Entities;

namespace Donatly.Infrastructure.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Email).IsRequired().HasMaxLength(100);
            builder.HasIndex(u => u.Email).IsUnique(); // Unique email addresses

            builder.HasDiscriminator<string>("UserType")
                .HasValue<Admin>("Admin")
                .HasValue<Donor>("Donor")
                .HasValue<OrganizationRep>("OrganizationRep");
        }
    }

}

using Donalty.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Donatly.Infrastructure.Configurations
{
    public class PetitionConfiguration : IEntityTypeConfiguration<Petition>
    {
        public void Configure(EntityTypeBuilder<Petition> builder)
        {
            builder.ToTable("Petitions");
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Title).IsRequired().HasMaxLength(200);
            builder.Property(p => p.Body).IsRequired();

            builder.Property(p => p.Status)
                .HasConversion<string>();
        }
    }

}

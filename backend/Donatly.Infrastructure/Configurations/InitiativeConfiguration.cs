using Donalty.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Donatly.Infrastructure.Configurations
{
    public class InitiativeConfiguration : IEntityTypeConfiguration<Initiative>
    {
        public void Configure(EntityTypeBuilder<Initiative> builder)
        {
            builder.ToTable("Initiatives");
            builder.HasKey(i => i.Id);

            builder.Property(i => i.Title).IsRequired().HasMaxLength(200);

            builder.Property(i => i.Status)
                .HasConversion<string>()
                .IsRequired();

            builder.HasOne<OrganizationRep>()
                .WithMany()
                .HasForeignKey(i => i.OrganizationRepId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

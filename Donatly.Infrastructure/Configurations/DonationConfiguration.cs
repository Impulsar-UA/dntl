using Donalty.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Donatly.Infrastructure.Configurations
{
    public class DonationConfiguration : IEntityTypeConfiguration<Donation>
    {
        public void Configure(EntityTypeBuilder<Donation> builder)
        {
            builder.ToTable("Donations");
            builder.HasKey(d => d.Id);

            builder.Property(d => d.Amount).HasColumnType("TEXT"); // SQLite does not support decimal, so we store it as text and convert in the application
            builder.HasOne<Donor>()
                .WithMany()
                .HasForeignKey(d => d.DonorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Initiative>()
                .WithMany()
                .HasForeignKey(d => d.InitiativeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

}

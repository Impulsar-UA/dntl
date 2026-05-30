using Donalty.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Donatly.Infrastructure.Configurations
{
    public class VoteConfiguration : IEntityTypeConfiguration<Vote>
    {
        public void Configure(EntityTypeBuilder<Vote> builder)
        {
            builder.ToTable("Votes");
            builder.HasKey(v => v.Id);

            builder.Property(v => v.CreatedAt).IsRequired();

            builder.HasOne<Donor>()
                .WithMany()
                .HasForeignKey(v => v.DonorId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<Petition>()
                .WithMany()
                .HasForeignKey(v => v.PetitionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(v => new { v.DonorId, v.PetitionId }).IsUnique();
        }
    }

}

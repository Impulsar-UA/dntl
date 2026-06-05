using Donalty.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Donatly.Infrastructure.Configurations
{
    public class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
    {
        public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
        {
            builder.ToTable("PaymentTransactions");
            builder.HasKey(pt => pt.Id);

            builder.Property(pt => pt.Amount).HasColumnType("TEXT");

            builder.HasOne<Donation>()
                .WithOne()
                .HasForeignKey<PaymentTransaction>(pt => pt.DonationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}

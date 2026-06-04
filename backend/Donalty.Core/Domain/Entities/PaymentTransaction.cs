using Donalty.Core.Domain.Base;

namespace Donalty.Core.Domain.Entities
{
    public class PaymentTransaction : Entity
    {
        public Guid DonationId { get; private set; }
        public decimal Amount { get; private set; }
        public string Currency { get; private set; }
        public string Provider { get; private set; }
        public string PayloadDet { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public PaymentTransaction(Guid donationId, decimal amount, string currency, string provider, string payloadDet)
        {
            DonationId = donationId;
            Amount = amount;
            Currency = currency;
            Provider = provider;
            PayloadDet = payloadDet;
            CreatedAt = DateTime.UtcNow;
        }
    }

}

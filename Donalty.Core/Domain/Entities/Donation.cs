using Donalty.Core.Domain.Base;

namespace Donalty.Core.Domain.Entities
{
    public class Donation : Entity
    {
        public Guid DonorId { get; private set; }
        public Guid InitiativeId { get; private set; }
        public decimal Amount { get; private set; }
        public string Currency { get; private set; }
        public DateTime Timestamp { get; private set; }
        public bool IsProcessed { get; private set; }

        public Donation(Guid donorId, Guid initiativeId, decimal amount, string currency)
        {
            DonorId = donorId;
            InitiativeId = initiativeId;
            Amount = amount;
            Currency = currency;
            Timestamp = DateTime.UtcNow;
            IsProcessed = false;
        }

        public void MarkAsProcessed()
        {
            IsProcessed = true;
        }
    }

}

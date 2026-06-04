
namespace Donalty.Core.Domain.Entities
{
    public class Donor : User
    {
        public decimal TotalDonatedAmount { get; private set; }
        public int SignedPetitionsCount { get; private set; }

        public Donor(string email, string passwordHash, string displayName)
            : base(email, passwordHash, displayName)
        {
            TotalDonatedAmount = 0;
            SignedPetitionsCount = 0;
        }

        public void AddDonation(decimal amount)
        {
            if (amount <= 0) throw new ArgumentException("Amount must be positive");
            TotalDonatedAmount += amount;
        }

        public void IncrementSignedPetitions()
        {
            SignedPetitionsCount++;
        }
    }

}

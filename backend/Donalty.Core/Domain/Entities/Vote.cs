namespace Donalty.Core.Domain.Entities
{
    public class Vote
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid DonorId { get; set; }
        public Guid PetitionId { get; set; }
    }

}

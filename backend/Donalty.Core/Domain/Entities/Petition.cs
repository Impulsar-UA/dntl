using Donalty.Core.Domain.Base;
using Donalty.Core.Domain.Enums;

namespace Donalty.Core.Domain.Entities
{
    public class Petition : Entity
    {
        public string Title { get; private set; }
        public string Body { get; private set; }
        public int TargetVotes { get; private set; }
        public int CurrentVotes { get; private set; }
        public DateTime Deadline { get; private set; }
        public PetitionStatus Status { get; private set; }

        public Petition(string title, string body, int targetVotes, DateTime deadline)
        {
            Title = title;
            Body = body;
            TargetVotes = targetVotes;
            Deadline = deadline;
            CurrentVotes = 0;
            Status = PetitionStatus.Draft;
        }

        public void AddVote()
        {
            if (Status != PetitionStatus.Active) throw new InvalidOperationException("Petition is not active.");

            CurrentVotes++;
            if (CurrentVotes >= TargetVotes)
            {
                Status = PetitionStatus.Successful;
            }
        }
        public void UpdateDetails(string title, string body, int targetVotes, DateTime deadline)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title cannot be empty");
            if (targetVotes <= 0) throw new ArgumentException("Target votes must be positive");

            Title = title;
            Body = body;
            TargetVotes = targetVotes;
            Deadline = deadline;
        }

        public void ChangeStatus(PetitionStatus newStatus)
        {
            Status = newStatus;
        }
        public void Publish() => Status = PetitionStatus.Active;
    }

}

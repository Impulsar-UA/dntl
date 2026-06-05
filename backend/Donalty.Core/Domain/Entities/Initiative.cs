using Donalty.Core.Domain.Base;
using Donalty.Core.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Donalty.Core.Domain.Entities
{
    public class Initiative : Entity
    {
        public string Title { get; private set; }
        public string Description { get; private set; }
        public decimal TargetAmount { get; private set; }
        public decimal CollectedAmount { get; private set; }
        public DateTime Deadline { get; private set; }
        public InitiativeStatus Status { get; private set; }
        public bool IsGovernmentSupported { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public Guid OrganizationRepId { get; private set; }

        public Initiative(string title, string description, decimal targetAmount, DateTime deadline, Guid organizationRepId)
        {
            Title = title;
            Description = description;
            TargetAmount = targetAmount;
            Deadline = deadline;
            OrganizationRepId = organizationRepId;
            CollectedAmount = 0;
            Status = InitiativeStatus.Pending;
            CreatedAt = DateTime.UtcNow;
            IsGovernmentSupported = false;
        }

        public void AddDonation(decimal amount)
        {
            CollectedAmount += amount;
            if (CollectedAmount >= TargetAmount)
            {
                Status = InitiativeStatus.Completed;
            }
        }
        public void UpdateDetails(string title, string description, decimal targetAmount, DateTime deadline)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title cannot be empty");
            if (targetAmount <= 0) throw new ArgumentException("Target amount must be positive");

            Title = title;
            Description = description;
            TargetAmount = targetAmount;
            Deadline = deadline;
        }
        public decimal CalculateProgress() => TargetAmount == 0 ? 0 : (CollectedAmount / TargetAmount) * 100;

        public void ChangeStatus(InitiativeStatus newStatus) => Status = newStatus;

        public void MarkAsGovernmentSupported() => IsGovernmentSupported = true;

        public void SetGovernmentSupported(bool value) => IsGovernmentSupported = value;

    }


}

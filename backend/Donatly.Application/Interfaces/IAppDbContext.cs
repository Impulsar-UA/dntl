using Donalty.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Donatly.Application.Interfaces
{
    public interface IAppDbContext: IDisposable, IAsyncDisposable
    {
        DbSet<User> Users { get; }
        DbSet<Donor> Donors { get; }
        DbSet<OrganizationRep> OrganizationReps { get; }
        DbSet<Admin> Admins { get; }
        DbSet<Initiative> Initiatives { get; }
        DbSet<Donation> Donations { get; }
        DbSet<Petition> Petitions { get; }
        DbSet<PaymentTransaction> PaymentTransactions { get; }
        DbSet<Vote> Votes { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }


}

using Donalty.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Donatly.Application.Interfaces;

namespace Donatly.Infrastructure
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Donor> Donors { get; set; }
        public DbSet<OrganizationRep> OrganizationReps { get; set; }
        public DbSet<Admin> Admins { get; set; }

        public DbSet<Initiative> Initiatives { get; set; }
        public DbSet<Donation> Donations { get; set; }
        public DbSet<Petition> Petitions { get; set; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
        public DbSet<Vote> Votes { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }

}

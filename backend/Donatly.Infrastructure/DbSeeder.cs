using Donalty.Core.Domain.Entities;
using Donalty.Core.Domain.Enums;
using Donatly.Application.Services;
using Donatly.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Donatly.Infrastructure;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Apply migrations (create database if needed)
        await context.Database.MigrateAsync();

        // If users already exist, skip seeding
        if (await context.Users.AnyAsync())
        {
            return;
        }

        // Test accounts share the password "password".
        // Hash it with the real hasher so seeded logins always match
        // (regardless of the hashing algorithm used by PasswordHasher).
        var testPasswordHash = PasswordHasher.HashPassword("password");

        // Pre-created administrator account (no self-registration for admins).
        // Credentials: admin@donatly.com / Admin123!
        var admin = new Admin(
            email: "admin@donatly.com",
            passwordHash: PasswordHasher.HashPassword("Admin123!"),
            displayName: "Адміністратор Donatly"
        );

        // Create test organization representative
        var orgRep = new OrganizationRep(
            email: "org@donatly.com",
            passwordHash: testPasswordHash,
            displayName: "Благодійний фонд 'Імпульс'",
            orgRegistryCode: "12345678",
            contactPhone: "+380501112233"
        );

        // Create test donor
        var donor = new Donor(
            email: "donor@donatly.com",
            passwordHash: testPasswordHash,
            displayName: "Іван Добрий"
        );

        context.Users.AddRange(admin, orgRep, donor);
        await context.SaveChangesAsync();

        // Create test initiatives (fundraisers)
        var initiative1 = new Initiative(
            title: "Закупівля медикаментів для дитячої лікарні",
            description: "Збір коштів на придбання антибіотиків та витратних матеріалів для відділення кардіології.",
            targetAmount: 150000,
            deadline: DateTime.UtcNow.AddDays(30),
            organizationRepId: orgRep.Id
        );
        initiative1.ChangeStatus(InitiativeStatus.Active);

        var initiative2 = new Initiative(
            title: "Відновлення спортивного майданчика",
            description: "Ініціатива з ремонту вуличного майданчика в житловому районі міста для популяризації спорту серед молоді.",
            targetAmount: 45000,
            deadline: DateTime.UtcNow.AddDays(15),
            organizationRepId: orgRep.Id
        );
        initiative2.ChangeStatus(InitiativeStatus.Active);

        context.Initiatives.AddRange(initiative1, initiative2);

        // Create test petition
        var petition = new Petition(
            title: "Облаштування велодоріжок на вулиці Науки",
            body: "Просимо міську адміністрацію виділити бюджет на розмітку та облаштування велосипедних смуг на ключовому проспекті.",
            targetVotes: 250,
            deadline: DateTime.UtcNow.AddDays(45)
        );
        petition.Publish(); // mark as published for voting

        context.Petitions.Add(petition);
        await context.SaveChangesAsync();
    }
}
using Donalty.Core.Domain.Entities;
using Donalty.Core.Domain.Enums;
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
        // Create test organization representative
        var orgRep = new OrganizationRep(
            email: "org@donatly.com",
            passwordHash: "uGo68GzU2gYpYgqf6yvYmQ==", // hash of a simple string (e.g. "password")
            displayName: "Благодійний фонд 'Імпульс'",
            orgRegistryCode: "12345678",
            contactPhone: "+380501112233"
        );

        // Create test donor
        var donor = new Donor(
            email: "donor@donatly.com",
            passwordHash: "uGo68GzU2gYpYgqf6yvYmQ==",
            displayName: "Іван Добрий"
        );

        context.Users.AddRange(orgRep, donor);
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
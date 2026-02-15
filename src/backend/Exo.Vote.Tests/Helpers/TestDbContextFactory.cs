using Exo.Vote.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Tests.Helpers;

public static class TestDbContextFactory
{
    public static AppDbContext Create(string? dbName = null)
    {
        dbName ??= Guid.NewGuid().ToString();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}

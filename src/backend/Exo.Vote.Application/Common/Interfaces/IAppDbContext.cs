using Exo.Vote.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Poll> Polls { get; }
    DbSet<PollOption> PollOptions { get; }
    DbSet<Vote> Votes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

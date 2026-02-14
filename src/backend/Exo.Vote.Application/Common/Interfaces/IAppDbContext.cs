using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<PollEntity> Polls { get; }
    DbSet<PollOptionEntity> PollOptions { get; }
    DbSet<VoteEntity> Votes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

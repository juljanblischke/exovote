using Exo.Vote.Domain.Enums;
using Exo.Vote.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Api.Services;

public sealed class PollArchiveService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PollArchiveService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(1);
    private static readonly TimeSpan InactivityThreshold = TimeSpan.FromDays(28);

    public PollArchiveService(
        IServiceScopeFactory scopeFactory,
        ILogger<PollArchiveService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PollArchiveService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ArchiveStalePolls(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving stale polls");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task ArchiveStalePolls(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var threshold = DateTime.UtcNow - InactivityThreshold;
        var stalePolls = await dbContext.Polls
            .Where(p => p.Status == PollStatus.Closed
                && (!p.LastViewedAt.HasValue || p.LastViewedAt.Value <= threshold))
            .ToListAsync(cancellationToken);

        if (stalePolls.Count == 0)
        {
            return;
        }

        foreach (var poll in stalePolls)
        {
            poll.Status = PollStatus.Archived;
            _logger.LogInformation("Archiving stale poll {PollId}: {Title}", poll.Id, poll.Title);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Archived {Count} stale polls", stalePolls.Count);
    }
}

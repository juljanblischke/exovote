using Exo.Vote.Domain.Enums;
using Exo.Vote.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Api.Services;

public sealed class PollExpirationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PollExpirationService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(1);

    public PollExpirationService(
        IServiceScopeFactory scopeFactory,
        ILogger<PollExpirationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PollExpirationService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckExpiredPolls(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking for expired polls");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task CheckExpiredPolls(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;
        var expiredPolls = await dbContext.Polls
            .Where(p => p.Status == PollStatus.Active
                && p.ExpiresAt.HasValue
                && p.ExpiresAt.Value <= now)
            .ToListAsync(cancellationToken);

        if (expiredPolls.Count == 0)
        {
            return;
        }

        foreach (var poll in expiredPolls)
        {
            poll.Status = PollStatus.Closed;
            poll.IsActive = false;
            _logger.LogInformation("Closing expired poll {PollId}: {Title}", poll.Id, poll.Title);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Closed {Count} expired polls", expiredPolls.Count);
    }
}

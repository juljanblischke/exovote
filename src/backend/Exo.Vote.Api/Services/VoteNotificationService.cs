using Exo.Vote.Api.Hubs;
using Exo.Vote.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace Exo.Vote.Api.Services;

public sealed class VoteNotificationService : IVoteNotificationService
{
    private readonly IHubContext<PollHub> _hubContext;

    public VoteNotificationService(IHubContext<PollHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyVoteReceived(Guid pollId, object results, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .Group($"poll:{pollId}")
            .SendAsync("VoteReceived", results, cancellationToken);
    }
}

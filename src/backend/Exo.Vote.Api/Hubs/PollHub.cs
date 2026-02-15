using Microsoft.AspNetCore.SignalR;

namespace Exo.Vote.Api.Hubs;

public sealed class PollHub : Hub
{
    public async Task JoinPollGroup(Guid pollId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"poll:{pollId}");
    }

    public async Task LeavePollGroup(Guid pollId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"poll:{pollId}");
    }
}

namespace Exo.Vote.Application.Common.Interfaces;

public interface IVoteNotificationService
{
    Task NotifyVoteReceived(Guid pollId, object results, CancellationToken cancellationToken = default);
}

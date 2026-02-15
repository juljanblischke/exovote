using Exo.Vote.Domain.Enums;
using Mediator;

namespace Exo.Vote.Application.Features.Polls.Commands.CreatePoll;

public sealed record CreatePollCommand(
    string Title,
    string? Description,
    PollType Type,
    IList<string> Options,
    DateTime? ExpiresAt
) : ICommand<CreatePollResponse>;

public sealed record CreatePollResponse(Guid PollId);

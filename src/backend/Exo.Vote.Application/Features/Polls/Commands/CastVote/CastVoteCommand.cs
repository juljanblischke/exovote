using Mediator;

namespace Exo.Vote.Application.Features.Polls.Commands.CastVote;

public sealed record CastVoteCommand(
    Guid PollId,
    string VoterName,
    IList<VoteSelection> Selections,
    string? CustomAnswerText = null,
    string? ClientIpAddress = null
) : ICommand<CastVoteResponse>;

public sealed record VoteSelection(
    Guid OptionId,
    int? Rank = null
);

public sealed record CastVoteResponse(Guid PollId, int TotalVotes);

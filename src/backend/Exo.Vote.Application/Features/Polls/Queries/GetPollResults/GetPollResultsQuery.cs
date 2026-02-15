using Exo.Vote.Domain.Enums;
using Mediator;

namespace Exo.Vote.Application.Features.Polls.Queries.GetPollResults;

public sealed record GetPollResultsQuery(Guid PollId) : IQuery<GetPollResultsResponse>;

public sealed record GetPollResultsResponse(
    Guid PollId,
    string Title,
    PollType Type,
    PollStatus Status,
    int TotalVoters,
    IList<OptionResultDto> Options
);

public sealed record OptionResultDto(
    Guid Id,
    string Text,
    int SortOrder,
    int VoteCount,
    double Percentage,
    double? AverageRank
);

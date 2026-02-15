using Exo.Vote.Domain.Enums;
using Mediator;

namespace Exo.Vote.Application.Features.Polls.Queries.GetPollById;

public sealed record GetPollByIdQuery(Guid PollId) : IQuery<GetPollByIdResponse>;

public sealed record GetPollByIdResponse(
    Guid Id,
    string Title,
    string? Description,
    PollStatus Status,
    PollType Type,
    bool IsActive,
    DateTime? ExpiresAt,
    DateTime CreatedAt,
    IList<PollOptionDto> Options,
    int TotalVotes
);

public sealed record PollOptionDto(
    Guid Id,
    string Text,
    int SortOrder,
    int VoteCount
);

using Exo.Vote.Application.Common.Interfaces;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Application.Features.Polls.Queries.GetPollResults;

public sealed class GetPollResultsQueryHandler : IQueryHandler<GetPollResultsQuery, GetPollResultsResponse>
{
    private readonly IAppDbContext _context;
    private readonly ICacheService _cache;

    public GetPollResultsQueryHandler(IAppDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async ValueTask<GetPollResultsResponse> Handle(
        GetPollResultsQuery query,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"poll-results:{query.PollId}";
        var cached = await _cache.GetAsync<GetPollResultsResponse>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var poll = await _context.Polls
            .AsNoTracking()
            .Include(p => p.Options.OrderBy(o => o.SortOrder))
                .ThenInclude(o => o.Votes)
            .Include(p => p.Votes)
            .FirstOrDefaultAsync(p => p.Id == query.PollId, cancellationToken);

        if (poll is null)
        {
            throw new KeyNotFoundException($"Poll {query.PollId} not found");
        }

        var totalVoters = poll.Votes
            .Select(v => v.VoterName)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();

        var totalVotes = poll.Votes.Count;

        var options = poll.Options.Select(o =>
        {
            var optionVotes = o.Votes.Count;
            var percentage = totalVotes > 0
                ? Math.Round((double)optionVotes / totalVotes * 100, 1)
                : 0;

            double? averageRank = null;
            var rankedVotes = o.Votes.Where(v => v.Rank.HasValue).ToList();
            if (rankedVotes.Count > 0)
            {
                averageRank = Math.Round(rankedVotes.Average(v => v.Rank!.Value), 2);
            }

            return new OptionResultDto(
                o.Id,
                o.Text,
                o.SortOrder,
                optionVotes,
                percentage,
                averageRank
            );
        }).ToList();

        var response = new GetPollResultsResponse(
            poll.Id,
            poll.Title,
            poll.Type,
            poll.Status,
            totalVoters,
            options
        );

        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(2), cancellationToken);

        return response;
    }
}

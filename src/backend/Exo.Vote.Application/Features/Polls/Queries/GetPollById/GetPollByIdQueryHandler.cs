using Exo.Vote.Application.Common.Interfaces;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Application.Features.Polls.Queries.GetPollById;

public sealed class GetPollByIdQueryHandler : IQueryHandler<GetPollByIdQuery, GetPollByIdResponse>
{
    private readonly IAppDbContext _context;
    private readonly ICacheService _cache;

    public GetPollByIdQueryHandler(IAppDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async ValueTask<GetPollByIdResponse> Handle(
        GetPollByIdQuery query,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"poll:{query.PollId}";
        var cached = await _cache.GetAsync<GetPollByIdResponse>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var poll = await _context.Polls
            .AsNoTracking()
            .Include(p => p.Options.OrderBy(o => o.SortOrder))
                .ThenInclude(o => o.Votes)
            .FirstOrDefaultAsync(p => p.Id == query.PollId, cancellationToken);

        if (poll is null)
        {
            throw new KeyNotFoundException($"Poll {query.PollId} not found");
        }

        var response = new GetPollByIdResponse(
            poll.Id,
            poll.Title,
            poll.Description,
            poll.Status,
            poll.Type,
            poll.IsActive,
            poll.ExpiresAt,
            poll.CreatedAt,
            poll.Options.Select(o => new PollOptionDto(
                o.Id,
                o.Text,
                o.SortOrder,
                o.Votes.Count
            )).ToList(),
            poll.Votes.Count
        );

        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(5), cancellationToken);

        // Update LastViewedAt in a fire-and-forget manner (tracked context needed)
        var pollToUpdate = await _context.Polls
            .FirstOrDefaultAsync(p => p.Id == query.PollId, cancellationToken);
        if (pollToUpdate is not null)
        {
            pollToUpdate.LastViewedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return response;
    }
}

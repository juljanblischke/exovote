using Exo.Vote.Application.Common.Interfaces;
using Exo.Vote.Domain.Enums;
using Mediator;
using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Application.Features.Polls.Commands.CastVote;

public sealed class CastVoteCommandHandler : ICommandHandler<CastVoteCommand, CastVoteResponse>
{
    private readonly IAppDbContext _context;
    private readonly ICacheService _cache;
    private readonly IMessageBus _messageBus;
    private readonly IVoteNotificationService _notificationService;

    public CastVoteCommandHandler(
        IAppDbContext context,
        ICacheService cache,
        IMessageBus messageBus,
        IVoteNotificationService notificationService)
    {
        _context = context;
        _cache = cache;
        _messageBus = messageBus;
        _notificationService = notificationService;
    }

    public async ValueTask<CastVoteResponse> Handle(
        CastVoteCommand command,
        CancellationToken cancellationToken)
    {
        var poll = await _context.Polls
            .Include(p => p.Options)
            .Include(p => p.Votes)
            .FirstOrDefaultAsync(p => p.Id == command.PollId, cancellationToken);

        if (poll is null)
        {
            throw new KeyNotFoundException($"Poll {command.PollId} not found");
        }

        if (poll.Status != PollStatus.Active)
        {
            throw new InvalidOperationException("Poll is not active");
        }

        // Check if poll has expired
        if (poll.ExpiresAt.HasValue && poll.ExpiresAt.Value <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Poll has expired");
        }

        // Check for duplicate voter (case-insensitive)
        var existingVote = poll.Votes
            .Any(v => v.VoterName.Equals(command.VoterName, StringComparison.OrdinalIgnoreCase));

        if (existingVote)
        {
            throw new InvalidOperationException("You have already voted in this poll");
        }

        // Validate selections belong to this poll
        var optionIds = poll.Options.Select(o => o.Id).ToHashSet();
        foreach (var selection in command.Selections)
        {
            if (!optionIds.Contains(selection.OptionId))
            {
                throw new InvalidOperationException($"Option {selection.OptionId} does not belong to this poll");
            }
        }

        // For SingleChoice, only allow 1 selection
        if (poll.Type == PollType.SingleChoice && command.Selections.Count > 1)
        {
            throw new InvalidOperationException("Single choice polls allow only one selection");
        }

        // Validate custom answer
        if (command.CustomAnswerText is not null)
        {
            if (!poll.AllowCustomAnswers)
            {
                throw new InvalidOperationException("This poll does not allow custom answers");
            }
            if (poll.Type == PollType.Ranked)
            {
                throw new InvalidOperationException("Custom answers are not supported for ranked polls");
            }
        }

        // For Ranked polls, validate all options are ranked with proper sequential ranks
        if (poll.Type == PollType.Ranked)
        {
            if (command.Selections.Count != poll.Options.Count)
            {
                throw new InvalidOperationException("All options must be ranked in a ranked poll");
            }

            if (command.Selections.Any(s => !s.Rank.HasValue))
            {
                throw new InvalidOperationException("All selections must include a rank for ranked polls");
            }

            var ranks = command.Selections.Select(s => s.Rank!.Value).OrderBy(r => r).ToList();
            if (ranks.First() != 1 || ranks.Last() != poll.Options.Count)
            {
                throw new InvalidOperationException("Ranks must be sequential starting at 1");
            }

            for (int i = 0; i < ranks.Count; i++)
            {
                if (ranks[i] != i + 1)
                {
                    throw new InvalidOperationException("Ranks must be sequential with no gaps or duplicates");
                }
            }
        }

        // Require at least one selection or a custom answer
        if (command.Selections.Count == 0 && command.CustomAnswerText is null)
        {
            throw new InvalidOperationException("At least one selection or a custom answer is required");
        }

        // Create vote records
        var voterId = Guid.NewGuid().ToString();
        if (command.Selections.Count > 0)
        {
            foreach (var selection in command.Selections)
            {
                var vote = new VoteEntity
                {
                    PollId = command.PollId,
                    PollOptionId = selection.OptionId,
                    VoterId = voterId,
                    VoterName = command.VoterName,
                    Rank = selection.Rank,
                    CustomAnswerText = command.CustomAnswerText,
                    VotedAt = DateTime.UtcNow
                };

                _context.Votes.Add(vote);
            }
        }
        else if (command.CustomAnswerText is not null)
        {
            // Custom answer only (no predefined option selected)
            // Use the first poll option as a reference to maintain FK integrity
            var vote = new VoteEntity
            {
                PollId = command.PollId,
                PollOptionId = poll.Options.First().Id,
                VoterId = voterId,
                VoterName = command.VoterName,
                CustomAnswerText = command.CustomAnswerText,
                VotedAt = DateTime.UtcNow
            };

            _context.Votes.Add(vote);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Invalidate cache
        await _cache.RemoveAsync($"poll:{command.PollId}", cancellationToken);
        await _cache.RemoveAsync($"poll-results:{command.PollId}", cancellationToken);

        // Publish event
        await _messageBus.PublishAsync(
            new VoteSubmittedEvent(command.PollId, command.VoterName, command.Selections.Count),
            "vote.submitted",
            cancellationToken);

        var totalVotes = poll.Votes.Select(v => v.VoterName).Distinct(StringComparer.OrdinalIgnoreCase).Count();

        // Broadcast updated results via SignalR
        var updatedResults = new
        {
            PollId = command.PollId,
            TotalVoters = totalVotes,
            Options = poll.Options.Select(o => new
            {
                o.Id,
                o.Text,
                VoteCount = o.Votes.Count,
            }).ToList()
        };
        await _notificationService.NotifyVoteReceived(command.PollId, updatedResults, cancellationToken);

        return new CastVoteResponse(command.PollId, totalVotes);
    }
}

public sealed record VoteSubmittedEvent(Guid PollId, string VoterName, int SelectionCount);

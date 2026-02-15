using Exo.Vote.Application.Common.Interfaces;
using Exo.Vote.Application.Features.Polls.Queries.GetPollResults;
using Exo.Vote.Domain.Enums;
using Exo.Vote.Tests.Helpers;
using FluentAssertions;
using NSubstitute;

namespace Exo.Vote.Tests.Features.Polls.Queries;

public class GetPollResultsQueryTests
{
    private readonly ICacheService _cache = Substitute.For<ICacheService>();

    [Fact]
    public async Task Handle_PollWithVotes_ReturnsCorrectPercentages()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var optionA = new PollOptionEntity { Text = "Option A", SortOrder = 0 };
        var optionB = new PollOptionEntity { Text = "Option B", SortOrder = 1 };

        var poll = new PollEntity
        {
            Title = "Test Poll",
            CreatorId = "test",
            Status = PollStatus.Active,
            IsActive = true,
            Type = PollType.SingleChoice,
            Options = new List<PollOptionEntity> { optionA, optionB }
        };

        context.Polls.Add(poll);
        await context.SaveChangesAsync();

        // Add 3 votes: 2 for A, 1 for B
        context.Votes.AddRange(
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v1", VoterName = "Alice", VotedAt = DateTime.UtcNow },
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v2", VoterName = "Bob", VotedAt = DateTime.UtcNow },
            new VoteEntity { PollId = poll.Id, PollOptionId = optionB.Id, VoterId = "v3", VoterName = "Charlie", VotedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        _cache.GetAsync<GetPollResultsResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollResultsResponse?)null);

        var handler = new GetPollResultsQueryHandler(context, _cache);
        var query = new GetPollResultsQuery(poll.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.PollId.Should().Be(poll.Id);
        result.TotalVoters.Should().Be(3);
        result.Options.Should().HaveCount(2);

        var resultA = result.Options.First(o => o.Text == "Option A");
        resultA.VoteCount.Should().Be(2);
        resultA.Percentage.Should().BeApproximately(66.7, 0.1);

        var resultB = result.Options.First(o => o.Text == "Option B");
        resultB.VoteCount.Should().Be(1);
        resultB.Percentage.Should().BeApproximately(33.3, 0.1);
    }

    [Fact]
    public async Task Handle_PollWithRankedVotes_ReturnsAverageRanks()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var optionA = new PollOptionEntity { Text = "Option A", SortOrder = 0 };
        var optionB = new PollOptionEntity { Text = "Option B", SortOrder = 1 };

        var poll = new PollEntity
        {
            Title = "Ranked Poll",
            CreatorId = "test",
            Status = PollStatus.Active,
            IsActive = true,
            Type = PollType.Ranked,
            Options = new List<PollOptionEntity> { optionA, optionB }
        };

        context.Polls.Add(poll);
        await context.SaveChangesAsync();

        // Add ranked votes
        context.Votes.AddRange(
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v1", VoterName = "Alice", Rank = 1, VotedAt = DateTime.UtcNow },
            new VoteEntity { PollId = poll.Id, PollOptionId = optionB.Id, VoterId = "v1", VoterName = "Alice", Rank = 2, VotedAt = DateTime.UtcNow },
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v2", VoterName = "Bob", Rank = 2, VotedAt = DateTime.UtcNow },
            new VoteEntity { PollId = poll.Id, PollOptionId = optionB.Id, VoterId = "v2", VoterName = "Bob", Rank = 1, VotedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        _cache.GetAsync<GetPollResultsResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollResultsResponse?)null);

        var handler = new GetPollResultsQueryHandler(context, _cache);
        var query = new GetPollResultsQuery(poll.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var resultA = result.Options.First(o => o.Text == "Option A");
        resultA.AverageRank.Should().Be(1.5);

        var resultB = result.Options.First(o => o.Text == "Option B");
        resultB.AverageRank.Should().Be(1.5);
    }

    [Fact]
    public async Task Handle_PollWithNoVotes_ReturnsZeroPercentages()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var poll = new PollEntity
        {
            Title = "Empty Poll",
            CreatorId = "test",
            Status = PollStatus.Active,
            IsActive = true,
            Type = PollType.SingleChoice,
            Options = new List<PollOptionEntity>
            {
                new() { Text = "Option A", SortOrder = 0 },
                new() { Text = "Option B", SortOrder = 1 }
            }
        };

        context.Polls.Add(poll);
        await context.SaveChangesAsync();

        _cache.GetAsync<GetPollResultsResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollResultsResponse?)null);

        var handler = new GetPollResultsQueryHandler(context, _cache);
        var query = new GetPollResultsQuery(poll.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalVoters.Should().Be(0);
        result.Options.Should().AllSatisfy(o =>
        {
            o.VoteCount.Should().Be(0);
            o.Percentage.Should().Be(0);
        });
    }

    [Fact]
    public async Task Handle_NonExistentPoll_ThrowsKeyNotFoundException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        _cache.GetAsync<GetPollResultsResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollResultsResponse?)null);

        var handler = new GetPollResultsQueryHandler(context, _cache);
        var query = new GetPollResultsQuery(Guid.NewGuid());

        // Act & Assert
        var act = () => handler.Handle(query, CancellationToken.None).AsTask();
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}

using Exo.Vote.Application.Common.Interfaces;
using Exo.Vote.Application.Features.Polls.Queries.GetPollResults;
using Exo.Vote.Domain.Enums;
using Exo.Vote.Tests.Helpers;
using FluentAssertions;
using NSubstitute;

namespace Exo.Vote.Tests.Features.Polls.Queries;

public class GetPollResultsGeoTests
{
    private readonly ICacheService _cache = Substitute.For<ICacheService>();

    [Fact]
    public async Task Handle_PollWithGeoData_ReturnsAggregatedGeoVotes()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var optionA = new PollOptionEntity { Text = "Option A", SortOrder = 0 };
        var poll = new PollEntity
        {
            Title = "Geo Poll",
            CreatorId = "test",
            Status = PollStatus.Active,
            IsActive = true,
            Type = PollType.SingleChoice,
            Options = new List<PollOptionEntity> { optionA }
        };

        context.Polls.Add(poll);
        await context.SaveChangesAsync();

        context.Votes.AddRange(
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v1", VoterName = "Alice", CountryCode = "DE", Region = "Germany", VotedAt = DateTime.UtcNow },
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v2", VoterName = "Bob", CountryCode = "DE", Region = "Germany", VotedAt = DateTime.UtcNow },
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v3", VoterName = "Charlie", CountryCode = "US", Region = "United States", VotedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        _cache.GetAsync<GetPollResultsResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollResultsResponse?)null);

        var handler = new GetPollResultsQueryHandler(context, _cache);
        var query = new GetPollResultsQuery(poll.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.GeoData.Should().HaveCount(2);
        result.GeoData.Should().Contain(g => g.CountryCode == "DE" && g.VoteCount == 2);
        result.GeoData.Should().Contain(g => g.CountryCode == "US" && g.VoteCount == 1);
        // Ordered by vote count descending
        result.GeoData[0].CountryCode.Should().Be("DE");
    }

    [Fact]
    public async Task Handle_PollWithNoGeoData_ReturnsEmptyGeoList()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var optionA = new PollOptionEntity { Text = "Option A", SortOrder = 0 };
        var poll = new PollEntity
        {
            Title = "No Geo Poll",
            CreatorId = "test",
            Status = PollStatus.Active,
            IsActive = true,
            Type = PollType.SingleChoice,
            Options = new List<PollOptionEntity> { optionA }
        };

        context.Polls.Add(poll);
        await context.SaveChangesAsync();

        context.Votes.Add(
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v1", VoterName = "Alice", VotedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        _cache.GetAsync<GetPollResultsResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollResultsResponse?)null);

        var handler = new GetPollResultsQueryHandler(context, _cache);
        var query = new GetPollResultsQuery(poll.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.GeoData.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_PollWithMixedGeoData_OnlyCountsVotesWithGeo()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var optionA = new PollOptionEntity { Text = "Option A", SortOrder = 0 };
        var poll = new PollEntity
        {
            Title = "Mixed Geo Poll",
            CreatorId = "test",
            Status = PollStatus.Active,
            IsActive = true,
            Type = PollType.SingleChoice,
            Options = new List<PollOptionEntity> { optionA }
        };

        context.Polls.Add(poll);
        await context.SaveChangesAsync();

        context.Votes.AddRange(
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v1", VoterName = "Alice", CountryCode = "FR", Region = "France", VotedAt = DateTime.UtcNow },
            new VoteEntity { PollId = poll.Id, PollOptionId = optionA.Id, VoterId = "v2", VoterName = "Bob", VotedAt = DateTime.UtcNow } // No geo
        );
        await context.SaveChangesAsync();

        _cache.GetAsync<GetPollResultsResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollResultsResponse?)null);

        var handler = new GetPollResultsQueryHandler(context, _cache);
        var query = new GetPollResultsQuery(poll.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.GeoData.Should().HaveCount(1);
        result.GeoData[0].CountryCode.Should().Be("FR");
        result.GeoData[0].VoteCount.Should().Be(1);
        result.TotalVoters.Should().Be(2); // Both voters still counted
    }
}

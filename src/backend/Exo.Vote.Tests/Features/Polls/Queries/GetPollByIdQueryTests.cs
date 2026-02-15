using Exo.Vote.Application.Common.Interfaces;
using Exo.Vote.Application.Features.Polls.Queries.GetPollById;
using Exo.Vote.Domain.Enums;
using Exo.Vote.Tests.Helpers;
using FluentAssertions;
using NSubstitute;

namespace Exo.Vote.Tests.Features.Polls.Queries;

public class GetPollByIdQueryTests
{
    private readonly ICacheService _cache = Substitute.For<ICacheService>();

    [Fact]
    public async Task Handle_ExistingPoll_ReturnsPollData()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var poll = new PollEntity
        {
            Title = "Test Poll",
            Description = "Test Description",
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

        _cache.GetAsync<GetPollByIdResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollByIdResponse?)null);

        var handler = new GetPollByIdQueryHandler(context, _cache);
        var query = new GetPollByIdQuery(poll.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Id.Should().Be(poll.Id);
        result.Title.Should().Be("Test Poll");
        result.Description.Should().Be("Test Description");
        result.Status.Should().Be(PollStatus.Active);
        result.Type.Should().Be(PollType.SingleChoice);
        result.IsActive.Should().BeTrue();
        result.Options.Should().HaveCount(2);
        result.TotalVotes.Should().Be(0);
    }

    [Fact]
    public async Task Handle_NonExistentPoll_ThrowsKeyNotFoundException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        _cache.GetAsync<GetPollByIdResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((GetPollByIdResponse?)null);

        var handler = new GetPollByIdQueryHandler(context, _cache);
        var query = new GetPollByIdQuery(Guid.NewGuid());

        // Act & Assert
        var act = () => handler.Handle(query, CancellationToken.None).AsTask();
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task Handle_CachedResult_ReturnsCachedData()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var cachedResponse = new GetPollByIdResponse(
            Guid.NewGuid(),
            "Cached Poll",
            null,
            PollStatus.Active,
            PollType.SingleChoice,
            true,
            null,
            DateTime.UtcNow,
            new List<PollOptionDto>(),
            0
        );

        _cache.GetAsync<GetPollByIdResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(cachedResponse);

        var handler = new GetPollByIdQueryHandler(context, _cache);
        var query = new GetPollByIdQuery(cachedResponse.Id);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().Be(cachedResponse);
        result.Title.Should().Be("Cached Poll");
    }
}

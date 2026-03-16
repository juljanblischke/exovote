using Exo.Vote.Application.Common.Interfaces;
using Exo.Vote.Application.Features.Polls.Commands.CastVote;
using Exo.Vote.Domain.Enums;
using Exo.Vote.Tests.Helpers;
using FluentAssertions;
using NSubstitute;

namespace Exo.Vote.Tests.Features.Polls.Commands;

public class CastVoteHandlerTests
{
    private readonly ICacheService _cache = Substitute.For<ICacheService>();
    private readonly IMessageBus _messageBus = Substitute.For<IMessageBus>();
    private readonly IVoteNotificationService _notificationService = Substitute.For<IVoteNotificationService>();
    private readonly IGeoLocationService _geoLocationService = Substitute.For<IGeoLocationService>();

    private async Task<PollEntity> SeedActivePoll(
        Infrastructure.Persistence.AppDbContext context,
        DateTime? expiresAt = null)
    {
        var poll = new PollEntity
        {
            Title = "Test Poll",
            CreatorId = "test",
            Status = PollStatus.Active,
            IsActive = true,
            Type = PollType.SingleChoice,
            ExpiresAt = expiresAt,
            Options = new List<PollOptionEntity>
            {
                new() { Text = "Option A", SortOrder = 0 },
                new() { Text = "Option B", SortOrder = 1 }
            }
        };

        context.Polls.Add(poll);
        await context.SaveChangesAsync();
        return poll;
    }

    [Fact]
    public async Task Handle_ExpiredPoll_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context, expiresAt: DateTime.UtcNow.AddHours(-1));
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService, _geoLocationService);

        var optionId = poll.Options.First().Id;
        var command = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(optionId) }
        );

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None).AsTask();
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*expired*");
    }

    [Fact]
    public async Task Handle_PollNotExpired_Succeeds()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context, expiresAt: DateTime.UtcNow.AddHours(1));
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService, _geoLocationService);

        var optionId = poll.Options.First().Id;
        var command = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(optionId) }
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.PollId.Should().Be(poll.Id);
        result.TotalVotes.Should().Be(1);
    }

    [Fact]
    public async Task Handle_PollWithNoExpiration_Succeeds()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context, expiresAt: null);
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService, _geoLocationService);

        var optionId = poll.Options.First().Id;
        var command = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(optionId) }
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.PollId.Should().Be(poll.Id);
        result.TotalVotes.Should().Be(1);
    }
}

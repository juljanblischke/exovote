using Exo.Vote.Application.Common.Interfaces;
using Exo.Vote.Application.Features.Polls.Commands.CastVote;
using Exo.Vote.Domain.Enums;
using Exo.Vote.Tests.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Exo.Vote.Tests.Features.Polls.Commands;

public class CastVoteCommandTests
{
    private readonly ICacheService _cache = Substitute.For<ICacheService>();
    private readonly IMessageBus _messageBus = Substitute.For<IMessageBus>();
    private readonly IVoteNotificationService _notificationService = Substitute.For<IVoteNotificationService>();

    private async Task<PollEntity> SeedActivePoll(Infrastructure.Persistence.AppDbContext context)
    {
        var poll = new PollEntity
        {
            Title = "Test Poll",
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
        return poll;
    }

    [Fact]
    public async Task Handle_ValidVote_CreatesVoteRecord()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context);
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService);

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

        var votes = await context.Votes.Where(v => v.PollId == poll.Id).ToListAsync();
        votes.Should().HaveCount(1);
        votes[0].VoterName.Should().Be("Alice");
        votes[0].PollOptionId.Should().Be(optionId);
    }

    [Fact]
    public async Task Handle_DuplicateVoterName_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context);
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService);

        var optionId = poll.Options.First().Id;

        // First vote
        var command1 = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(optionId) }
        );
        await handler.Handle(command1, CancellationToken.None);

        // Second vote with same name (case-insensitive)
        var command2 = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "ALICE",
            Selections: new List<VoteSelection> { new(optionId) }
        );

        // Act & Assert
        var act = () => handler.Handle(command2, CancellationToken.None).AsTask();
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already voted*");
    }

    [Fact]
    public async Task Handle_ClosedPoll_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context);
        poll.Status = PollStatus.Closed;
        await context.SaveChangesAsync();

        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService);

        var optionId = poll.Options.First().Id;
        var command = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(optionId) }
        );

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None).AsTask();
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not active*");
    }

    [Fact]
    public async Task Handle_NonExistentPoll_ThrowsKeyNotFoundException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService);

        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(Guid.NewGuid()) }
        );

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None).AsTask();
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task Handle_SingleChoiceMultipleSelections_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context);
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService);

        var options = poll.Options.ToList();
        var command = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "Alice",
            Selections: new List<VoteSelection>
            {
                new(options[0].Id),
                new(options[1].Id)
            }
        );

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None).AsTask();
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*only one selection*");
    }

    [Fact]
    public async Task Handle_InvalidOptionId_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context);
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService);

        var command = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(Guid.NewGuid()) }
        );

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None).AsTask();
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*does not belong*");
    }

    [Fact]
    public async Task Handle_ValidVote_InvalidatesCacheAndPublishesEvent()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var poll = await SeedActivePoll(context);
        var handler = new CastVoteCommandHandler(context, _cache, _messageBus, _notificationService);

        var optionId = poll.Options.First().Id;
        var command = new CastVoteCommand(
            PollId: poll.Id,
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(optionId) }
        );

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        await _cache.Received(1).RemoveAsync($"poll:{poll.Id}", Arg.Any<CancellationToken>());
        await _cache.Received(1).RemoveAsync($"poll-results:{poll.Id}", Arg.Any<CancellationToken>());
        await _messageBus.Received(1).PublishAsync(
            Arg.Any<VoteSubmittedEvent>(),
            "vote.submitted",
            Arg.Any<CancellationToken>());
        await _notificationService.Received(1).NotifyVoteReceived(
            poll.Id,
            Arg.Any<object>(),
            Arg.Any<CancellationToken>());
    }
}

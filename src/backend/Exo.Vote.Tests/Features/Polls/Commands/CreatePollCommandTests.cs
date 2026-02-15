using Exo.Vote.Application.Features.Polls.Commands.CreatePoll;
using Exo.Vote.Domain.Enums;
using Exo.Vote.Tests.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace Exo.Vote.Tests.Features.Polls.Commands;

public class CreatePollCommandTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesPollWithActiveStatus()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var handler = new CreatePollCommandHandler(context);

        var command = new CreatePollCommand(
            Title: "Test Poll",
            Description: "A test poll",
            Type: PollType.SingleChoice,
            Options: new List<string> { "Option A", "Option B" },
            ExpiresAt: null
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.PollId.Should().NotBeEmpty();

        var poll = await context.Polls
            .Include(p => p.Options)
            .FirstAsync(p => p.Id == result.PollId);

        poll.Title.Should().Be("Test Poll");
        poll.Description.Should().Be("A test poll");
        poll.Status.Should().Be(PollStatus.Active);
        poll.IsActive.Should().BeTrue();
        poll.Type.Should().Be(PollType.SingleChoice);
        poll.Options.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_WithOptions_CreatesOptionsWithCorrectSortOrder()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var handler = new CreatePollCommandHandler(context);

        var command = new CreatePollCommand(
            Title: "Sort Order Test",
            Description: null,
            Type: PollType.MultipleChoice,
            Options: new List<string> { "First", "Second", "Third" },
            ExpiresAt: null
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        var poll = await context.Polls
            .Include(p => p.Options)
            .FirstAsync(p => p.Id == result.PollId);

        var options = poll.Options.OrderBy(o => o.SortOrder).ToList();
        options[0].Text.Should().Be("First");
        options[0].SortOrder.Should().Be(0);
        options[1].Text.Should().Be("Second");
        options[1].SortOrder.Should().Be(1);
        options[2].Text.Should().Be("Third");
        options[2].SortOrder.Should().Be(2);
    }

    [Fact]
    public async Task Handle_WithExpiresAt_SetsExpiration()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var handler = new CreatePollCommandHandler(context);

        var expiresAt = DateTime.UtcNow.AddDays(7);
        var command = new CreatePollCommand(
            Title: "Expiring Poll",
            Description: null,
            Type: PollType.SingleChoice,
            Options: new List<string> { "Yes", "No" },
            ExpiresAt: expiresAt
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        var poll = await context.Polls.FirstAsync(p => p.Id == result.PollId);
        poll.ExpiresAt.Should().Be(expiresAt);
    }
}

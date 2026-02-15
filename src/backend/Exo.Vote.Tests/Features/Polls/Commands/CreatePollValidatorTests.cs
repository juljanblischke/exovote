using Exo.Vote.Application.Features.Polls.Commands.CreatePoll;
using Exo.Vote.Domain.Enums;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace Exo.Vote.Tests.Features.Polls.Commands;

public class CreatePollValidatorTests
{
    private readonly CreatePollCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldNotHaveErrors()
    {
        var command = new CreatePollCommand(
            Title: "Valid Title",
            Description: null,
            Type: PollType.SingleChoice,
            Options: new List<string> { "A", "B" },
            ExpiresAt: null
        );

        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyTitle_ShouldHaveError()
    {
        var command = new CreatePollCommand(
            Title: "",
            Description: null,
            Type: PollType.SingleChoice,
            Options: new List<string> { "A", "B" },
            ExpiresAt: null
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Validate_TitleTooLong_ShouldHaveError()
    {
        var command = new CreatePollCommand(
            Title: new string('x', 501),
            Description: null,
            Type: PollType.SingleChoice,
            Options: new List<string> { "A", "B" },
            ExpiresAt: null
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Validate_OnlyOneOption_ShouldHaveError()
    {
        var command = new CreatePollCommand(
            Title: "Test",
            Description: null,
            Type: PollType.SingleChoice,
            Options: new List<string> { "Only One" },
            ExpiresAt: null
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Options);
    }

    [Fact]
    public void Validate_TooManyOptions_ShouldHaveError()
    {
        var options = Enumerable.Range(1, 101).Select(i => $"Option {i}").ToList();
        var command = new CreatePollCommand(
            Title: "Test",
            Description: null,
            Type: PollType.SingleChoice,
            Options: options,
            ExpiresAt: null
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Options);
    }

    [Fact]
    public void Validate_ExpiresAtInPast_ShouldHaveError()
    {
        var command = new CreatePollCommand(
            Title: "Test",
            Description: null,
            Type: PollType.SingleChoice,
            Options: new List<string> { "A", "B" },
            ExpiresAt: DateTime.UtcNow.AddHours(-1)
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ExpiresAt);
    }

    [Fact]
    public void Validate_EmptyOptionText_ShouldHaveError()
    {
        var command = new CreatePollCommand(
            Title: "Test",
            Description: null,
            Type: PollType.SingleChoice,
            Options: new List<string> { "Valid", "" },
            ExpiresAt: null
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveAnyValidationError();
    }

    [Fact]
    public void Validate_OptionTextTooLong_ShouldHaveError()
    {
        var command = new CreatePollCommand(
            Title: "Test",
            Description: null,
            Type: PollType.SingleChoice,
            Options: new List<string> { "Valid", new string('x', 1001) },
            ExpiresAt: null
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveAnyValidationError();
    }
}

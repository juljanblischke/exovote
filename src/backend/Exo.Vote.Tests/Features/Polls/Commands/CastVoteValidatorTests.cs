using Exo.Vote.Application.Features.Polls.Commands.CastVote;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace Exo.Vote.Tests.Features.Polls.Commands;

public class CastVoteValidatorTests
{
    private readonly CastVoteCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldNotHaveErrors()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(Guid.NewGuid()) }
        );

        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyPollId_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.Empty,
            VoterName: "Alice",
            Selections: new List<VoteSelection> { new(Guid.NewGuid()) }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.PollId);
    }

    [Fact]
    public void Validate_EmptyVoterName_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "",
            Selections: new List<VoteSelection> { new(Guid.NewGuid()) }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.VoterName);
    }

    [Fact]
    public void Validate_VoterNameTooLong_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: new string('x', 257),
            Selections: new List<VoteSelection> { new(Guid.NewGuid()) }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.VoterName);
    }

    [Fact]
    public void Validate_EmptySelections_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection>()
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Selections);
    }
}

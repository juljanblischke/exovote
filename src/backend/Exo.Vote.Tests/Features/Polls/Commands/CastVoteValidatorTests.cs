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

    [Fact]
    public void Validate_ValidRankedSelections_ShouldNotHaveErrors()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection>
            {
                new(Guid.NewGuid(), 1),
                new(Guid.NewGuid(), 2),
                new(Guid.NewGuid(), 3)
            }
        );

        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_RankedWithDuplicateRanks_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection>
            {
                new(Guid.NewGuid(), 1),
                new(Guid.NewGuid(), 1),
                new(Guid.NewGuid(), 3)
            }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Selections)
            .WithErrorMessage("Ranks must be sequential starting at 1 with no duplicates");
    }

    [Fact]
    public void Validate_RankedNotStartingAt1_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection>
            {
                new(Guid.NewGuid(), 0),
                new(Guid.NewGuid(), 1),
                new(Guid.NewGuid(), 2)
            }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Selections);
    }

    [Fact]
    public void Validate_RankedWithGaps_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection>
            {
                new(Guid.NewGuid(), 1),
                new(Guid.NewGuid(), 3),
                new(Guid.NewGuid(), 5)
            }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Selections);
    }

    [Fact]
    public void Validate_RankedMixedNullAndNonNullRanks_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection>
            {
                new(Guid.NewGuid(), 1),
                new(Guid.NewGuid()),
                new(Guid.NewGuid(), 3)
            }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Selections);
    }

    [Fact]
    public void Validate_DuplicateOptionIds_ShouldHaveError()
    {
        var optionId = Guid.NewGuid();
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection>
            {
                new(optionId, 1),
                new(optionId, 2)
            }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Selections)
            .WithErrorMessage("Duplicate option selections are not allowed");
    }

    [Fact]
    public void Validate_RankedWithNegativeRank_ShouldHaveError()
    {
        var command = new CastVoteCommand(
            PollId: Guid.NewGuid(),
            VoterName: "Alice",
            Selections: new List<VoteSelection>
            {
                new(Guid.NewGuid(), -1),
                new(Guid.NewGuid(), 0),
                new(Guid.NewGuid(), 1)
            }
        );

        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Selections);
    }
}

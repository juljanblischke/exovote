using FluentValidation;

namespace Exo.Vote.Application.Features.Polls.Commands.CastVote;

public sealed class CastVoteCommandValidator : AbstractValidator<CastVoteCommand>
{
    public CastVoteCommandValidator()
    {
        RuleFor(x => x.PollId)
            .NotEmpty().WithMessage("Poll ID is required");

        RuleFor(x => x.VoterName)
            .NotEmpty().WithMessage("Voter name is required")
            .MaximumLength(256).WithMessage("Voter name must not exceed 256 characters");

        RuleFor(x => x.Selections)
            .NotNull().WithMessage("Selections are required")
            .Must(s => s.Count >= 1).WithMessage("At least one selection is required");

        RuleForEach(x => x.Selections)
            .ChildRules(selection =>
            {
                selection.RuleFor(s => s.OptionId)
                    .NotEmpty().WithMessage("Option ID is required");
            });
    }
}

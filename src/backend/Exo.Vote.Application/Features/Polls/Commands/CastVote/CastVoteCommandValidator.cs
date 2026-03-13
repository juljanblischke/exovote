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
            .Must(s => s.Count >= 1).WithMessage("At least one selection is required")
            .When(x => x.CustomAnswerText is null);

        RuleForEach(x => x.Selections)
            .ChildRules(selection =>
            {
                selection.RuleFor(s => s.OptionId)
                    .NotEmpty().WithMessage("Option ID is required");
            });

        // Ranked poll validation: when ranks are provided, they must be valid
        RuleFor(x => x.Selections)
            .Must(selections =>
            {
                // Only apply if any selection has a rank
                if (!selections.Any(s => s.Rank.HasValue))
                    return true;

                // All selections must have ranks
                if (selections.Any(s => !s.Rank.HasValue))
                    return false;

                var ranks = selections.Select(s => s.Rank!.Value).OrderBy(r => r).ToList();

                // Ranks must start at 1
                if (ranks.First() != 1)
                    return false;

                // Ranks must be sequential (1, 2, 3, ...)
                for (int i = 0; i < ranks.Count; i++)
                {
                    if (ranks[i] != i + 1)
                        return false;
                }

                return true;
            })
            .WithMessage("Ranks must be sequential starting at 1 with no duplicates")
            .When(x => x.Selections != null && x.Selections.Count > 0);

        // No duplicate option IDs
        RuleFor(x => x.Selections)
            .Must(selections => selections.Select(s => s.OptionId).Distinct().Count() == selections.Count)
            .WithMessage("Duplicate option selections are not allowed")
            .When(x => x.Selections != null && x.Selections.Count > 0);

        RuleFor(x => x.CustomAnswerText)
            .MaximumLength(200).WithMessage("Custom answer must not exceed 200 characters")
            .When(x => x.CustomAnswerText is not null);
    }
}

using FluentValidation;

namespace Exo.Vote.Application.Features.Polls.Commands.CreatePoll;

public sealed class CreatePollCommandValidator : AbstractValidator<CreatePollCommand>
{
    public CreatePollCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(500).WithMessage("Title must not exceed 500 characters");

        RuleFor(x => x.Options)
            .NotNull().WithMessage("Options are required")
            .Must(o => o.Count >= 2).WithMessage("Poll must have at least 2 options")
            .Must(o => o.Count <= 100).WithMessage("Poll cannot have more than 100 options");

        RuleForEach(x => x.Options)
            .NotEmpty().WithMessage("Option text cannot be empty")
            .MaximumLength(1000).WithMessage("Option text must not exceed 1000 characters");

        RuleFor(x => x.ExpiresAt)
            .GreaterThan(DateTime.UtcNow).WithMessage("Expiration date must be in the future")
            .When(x => x.ExpiresAt.HasValue);

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid poll type");
    }
}

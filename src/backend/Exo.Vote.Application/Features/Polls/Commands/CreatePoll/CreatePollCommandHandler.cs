using Exo.Vote.Application.Common.Interfaces;
using Exo.Vote.Domain.Enums;
using Mediator;

namespace Exo.Vote.Application.Features.Polls.Commands.CreatePoll;

public sealed class CreatePollCommandHandler : ICommandHandler<CreatePollCommand, CreatePollResponse>
{
    private readonly IAppDbContext _context;

    public CreatePollCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async ValueTask<CreatePollResponse> Handle(
        CreatePollCommand command,
        CancellationToken cancellationToken)
    {
        var poll = new PollEntity
        {
            Title = command.Title,
            Description = command.Description,
            CreatorId = "anonymous",
            Status = PollStatus.Active,
            IsActive = true,
            Type = command.Type,
            ExpiresAt = command.ExpiresAt
        };

        for (var i = 0; i < command.Options.Count; i++)
        {
            poll.Options.Add(new PollOptionEntity
            {
                Text = command.Options[i],
                SortOrder = i
            });
        }

        _context.Polls.Add(poll);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreatePollResponse(poll.Id);
    }
}

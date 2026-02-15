using Exo.Vote.Api.Hubs;
using Exo.Vote.Application.Common.Models;
using Exo.Vote.Application.Features.Polls.Commands.CastVote;
using Exo.Vote.Application.Features.Polls.Commands.CreatePoll;
using Exo.Vote.Application.Features.Polls.Queries.GetPollById;
using Exo.Vote.Application.Features.Polls.Queries.GetPollResults;
using Mediator;

namespace Exo.Vote.Api.Extensions;

public static class EndpointExtensions
{
    public static WebApplication MapPollEndpoints(this WebApplication app)
    {
        var polls = app.MapGroup("/api/polls")
            .WithTags("Polls");

        polls.MapPost("/", async (CreatePollCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return Results.Created($"/api/polls/{result.PollId}", ApiResponse<CreatePollResponse>.Ok(result));
        })
        .WithName("CreatePoll");

        polls.MapGet("/{pollId:guid}", async (Guid pollId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetPollByIdQuery(pollId));
            return Results.Ok(ApiResponse<GetPollByIdResponse>.Ok(result));
        })
        .WithName("GetPollById");

        polls.MapPost("/{pollId:guid}/votes", async (Guid pollId, CastVoteRequest request, IMediator mediator) =>
        {
            var command = new CastVoteCommand(pollId, request.VoterName, request.Selections);
            var result = await mediator.Send(command);
            return Results.Ok(ApiResponse<CastVoteResponse>.Ok(result));
        })
        .WithName("CastVote");

        polls.MapGet("/{pollId:guid}/results", async (Guid pollId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetPollResultsQuery(pollId));
            return Results.Ok(ApiResponse<GetPollResultsResponse>.Ok(result));
        })
        .WithName("GetPollResults");

        // SignalR Hub
        app.MapHub<PollHub>("/hubs/polls");

        return app;
    }
}

public sealed record CastVoteRequest(
    string VoterName,
    IList<VoteSelection> Selections
);

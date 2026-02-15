using Exo.Vote.Api.Services;
using Exo.Vote.Application.Common.Interfaces;
using Microsoft.OpenApi.Models;

namespace Exo.Vote.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        // CORS
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy("DefaultPolicy", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        // SignalR
        services.AddSignalR();
        services.AddScoped<IVoteNotificationService, VoteNotificationService>();

        // Background jobs
        services.AddHostedService<PollExpirationService>();
        services.AddHostedService<PollArchiveService>();

        // Health Checks
        services.AddHealthChecks();

        // Swagger / OpenAPI
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Exo.Vote API",
                Version = "v1",
                Description = "ExoVote - Voting and polling platform API"
            });
        });

        return services;
    }
}

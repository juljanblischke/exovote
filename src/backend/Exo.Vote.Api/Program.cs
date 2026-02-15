using Exo.Vote.Api.Extensions;
using Exo.Vote.Api.Middleware;
using Exo.Vote.Application;
using Exo.Vote.Infrastructure;
using Exo.Vote.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Exo.Vote API");

    var builder = WebApplication.CreateBuilder(args);

    // Serilog
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .WriteTo.Console()
        .Enrich.FromLogContext());

    // Layer registrations
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddApiServices(builder.Configuration);

    var app = builder.Build();

    // Auto-migrate database
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await dbContext.Database.MigrateAsync();
    }

    // Middleware pipeline
    app.UseMiddleware<ExceptionMiddleware>();

    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Exo.Vote API v1");
            options.RoutePrefix = "swagger";
        });
    }

    app.UseCors("DefaultPolicy");

    app.MapHealthChecks("/health");

    app.MapGet("/", () => Results.Ok(new { Service = "Exo.Vote API", Status = "Running" }))
        .WithTags("Root")
        .ExcludeFromDescription();

    app.MapPollEndpoints();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

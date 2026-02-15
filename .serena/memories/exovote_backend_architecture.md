# ExoVote Backend Architecture Overview

## Key Architecture Facts
- **Framework**: .NET 9 with Minimal APIs (NOT Controllers)
- **CQRS Pattern**: Uses Mediator (source generator) by Martin Othamar, NOT MediatR
- **Mediator Version**: 2.1.7 (Mediator.Abstractions + Mediator.SourceGenerator)
- **Validation**: FluentValidation 11.11.0
- **Database**: PostgreSQL 16 via EF Core 9.0.1
- **Cache**: Redis 7 via StackExchange.Redis 2.8.16
- **Message Bus**: RabbitMQ 3 via RabbitMQ.Client 7.0.0
- **Logging**: Serilog 8.0.3

## Project Structure
```
src/backend/
├── Exo.Vote.Domain/          → Entities, Enums, Value Objects (NO dependencies)
├── Exo.Vote.Application/      → Commands, Queries, Interfaces, Behaviors
├── Exo.Vote.Infrastructure/   → EF Core, Redis, RabbitMQ, Migrations
├── Exo.Vote.Api/              → Minimal APIs, Middleware, DI, Hubs, Services
└── Exo.Vote.Tests/            → xUnit + FluentAssertions unit tests
```

## Domain Layer (Exo.Vote.Domain)

### Entities

#### Poll.cs
```csharp
public class Poll : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CreatorId { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastViewedAt { get; set; }  // For auto-archive after 4 weeks inactivity
    public PollStatus Status { get; set; } = PollStatus.Draft;
    public PollType Type { get; set; } = PollType.SingleChoice;

    public ICollection<PollOption> Options { get; set; } = new List<PollOption>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
```

#### PollOption.cs
```csharp
public class PollOption : BaseEntity
{
    public Guid PollId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public Poll Poll { get; set; } = null!;
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
```

#### Vote.cs
```csharp
public class Vote : BaseEntity
{
    public Guid PollId { get; set; }
    public Guid PollOptionId { get; set; }
    public string VoterId { get; set; } = string.Empty;
    public string VoterName { get; set; } = string.Empty;  // Display name for name-based voting
    public int? Rank { get; set; }  // For ranked choice voting
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;

    public Poll Poll { get; set; } = null!;
    public PollOption PollOption { get; set; } = null!;
}
```

### Base Classes

#### BaseEntity.cs
```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
```

#### IAuditableEntity.cs
```csharp
public interface IAuditableEntity
{
    string? CreatedBy { get; set; }
    DateTime CreatedAt { get; set; }
    string? LastModifiedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
}
```

### Enums

#### PollStatus.cs
```csharp
public enum PollStatus
{
    Draft = 0,
    Active = 1,
    Closed = 2,
    Archived = 3
}
```

#### PollType.cs
```csharp
public enum PollType
{
    SingleChoice = 0,
    MultipleChoice = 1,
    Ranked = 2
}
```

## Application Layer (Exo.Vote.Application)

### DependencyInjection.cs
```csharp
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediator(options =>
        {
            options.ServiceLifetime = ServiceLifetime.Scoped;
        });

        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}
```

**Key Points:**
- Mediator is registered with Scoped lifetime
- FluentValidation validators auto-discovered from assembly
- ValidationBehavior is registered as a pipeline behavior

### Interfaces

#### IAppDbContext.cs
```csharp
public interface IAppDbContext
{
    DbSet<PollEntity> Polls { get; }
    DbSet<PollOptionEntity> PollOptions { get; }
    DbSet<VoteEntity> Votes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

**Note:** Uses global using aliases: `PollEntity = Exo.Vote.Domain.Entities.Poll`, etc.

#### ICacheService.cs
```csharp
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
}
```

#### IMessageBus.cs
```csharp
public interface IMessageBus
{
    Task PublishAsync<T>(T message, string routingKey, CancellationToken cancellationToken = default) where T : class;
    Task PublishAsync<T>(T message, string exchange, string routingKey, CancellationToken cancellationToken = default) where T : class;
}
```

### Common Models

#### ApiResponse.cs (Generic + Non-generic)
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public List<ApiError> Errors { get; set; } = [];
    public string? Message { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null) => new()
    {
        Success = true,
        Data = data,
        Message = message
    };

    public static ApiResponse<T> Fail(string error) => new()
    {
        Success = false,
        Errors = [new ApiError { Message = error }]
    };

    public static ApiResponse<T> Fail(List<ApiError> errors) => new()
    {
        Success = false,
        Errors = errors
    };
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Ok(string? message = null) => new()
    {
        Success = true,
        Message = message
    };

    public new static ApiResponse Fail(string error) => new()
    {
        Success = false,
        Errors = [new ApiError { Message = error }]
    };

    public new static ApiResponse Fail(List<ApiError> errors) => new()
    {
        Success = false,
        Errors = errors
    };
}
```

#### ApiError.cs
```csharp
public class ApiError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Field { get; set; }
}
```

#### PagedList.cs
```csharp
public class PagedList<T>
{
    public List<T> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public PagedList() { }

    public PagedList(List<T> items, int page, int pageSize, int totalCount)
    {
        Items = items;
        Page = page;
        PageSize = pageSize;
        TotalCount = totalCount;
    }

    public static async Task<PagedList<T>> CreateAsync(
        IQueryable<T> source,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await source.CountAsync(cancellationToken);
        var items = await source
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedList<T>(items, page, pageSize, totalCount);
    }
}
```

### Behaviors

#### ValidationBehavior.cs
```csharp
public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IMessage
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async ValueTask<TResponse> Handle(
        TRequest message,
        CancellationToken cancellationToken,
        MessageHandlerDelegate<TRequest, TResponse> next)
    {
        if (!_validators.Any())
        {
            return await next(message, cancellationToken);
        }

        var context = new ValidationContext<TRequest>(message);
        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count != 0)
        {
            throw new ValidationException(failures);
        }

        return await next(message, cancellationToken);
    }
}
```

**Key Points:**
- Runs FluentValidation before the handler
- Throws ValidationException if validation fails
- Exception middleware catches it and returns 400 with errors

## Infrastructure Layer (Exo.Vote.Infrastructure)

### DependencyInjection.cs
```csharp
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // PostgreSQL with EF Core
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // Redis
        var redisConnectionString = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnectionString))
        {
            services.AddSingleton<IConnectionMultiplexer>(
                ConnectionMultiplexer.Connect(redisConnectionString));
            services.AddScoped<ICacheService, CacheService>();
        }

        // RabbitMQ
        var rabbitMqConnectionString = configuration.GetConnectionString("RabbitMq");
        if (!string.IsNullOrEmpty(rabbitMqConnectionString))
        {
            services.AddSingleton<IMessageBus>(sp =>
                new MessageBusService(rabbitMqConnectionString));
        }

        return services;
    }
}
```

### Persistence

#### AppDbContext.cs
```csharp
public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<PollEntity> Polls => Set<PollEntity>();
    public DbSet<PollOptionEntity> PollOptions => Set<PollOptionEntity>();
    public DbSet<VoteEntity> Votes => Set<VoteEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

**Key Points:**
- Auto-applies all IEntityTypeConfiguration from assembly
- Auto-sets CreatedAt and UpdatedAt timestamps
- Migrations run in Infrastructure assembly

#### PollConfiguration.cs
```csharp
public class PollConfiguration : IEntityTypeConfiguration<PollEntity>
{
    public void Configure(EntityTypeBuilder<PollEntity> builder)
    {
        builder.ToTable("polls");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(p => p.Title)
            .HasColumnName("title")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(p => p.Description)
            .HasColumnName("description")
            .HasMaxLength(2000);

        builder.Property(p => p.CreatorId)
            .HasColumnName("creator_id")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(false);

        builder.Property(p => p.ExpiresAt)
            .HasColumnName("expires_at");

        builder.Property(p => p.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(PollStatus.Draft);

        builder.Property(p => p.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(PollType.SingleChoice);

        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at");

        builder.HasMany(p => p.Options)
            .WithOne(o => o.Poll)
            .HasForeignKey(o => o.PollId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Votes)
            .WithOne(v => v.Poll)
            .HasForeignKey(v => v.PollId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

**Key Points:**
- Enums stored as strings (VARCHAR) with max length 50
- Cascade delete for Options and Votes when Poll is deleted

#### PollOptionConfiguration.cs
```csharp
public class PollOptionConfiguration : IEntityTypeConfiguration<PollOptionEntity>
{
    public void Configure(EntityTypeBuilder<PollOptionEntity> builder)
    {
        builder.ToTable("poll_options");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(o => o.PollId)
            .HasColumnName("poll_id")
            .IsRequired();

        builder.Property(o => o.Text)
            .HasColumnName("text")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(o => o.SortOrder)
            .HasColumnName("sort_order")
            .HasDefaultValue(0);

        builder.Property(o => o.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(o => o.UpdatedAt)
            .HasColumnName("updated_at");

        builder.HasMany(o => o.Votes)
            .WithOne(v => v.PollOption)
            .HasForeignKey(v => v.PollOptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

#### VoteConfiguration.cs
```csharp
public class VoteConfiguration : IEntityTypeConfiguration<VoteEntity>
{
    public void Configure(EntityTypeBuilder<VoteEntity> builder)
    {
        builder.ToTable("votes");
        builder.HasKey(v => v.Id);

        builder.Property(v => v.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(v => v.PollId)
            .HasColumnName("poll_id")
            .IsRequired();

        builder.Property(v => v.PollOptionId)
            .HasColumnName("poll_option_id")
            .IsRequired();

        builder.Property(v => v.VoterId)
            .HasColumnName("voter_id")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(v => v.VotedAt)
            .HasColumnName("voted_at");

        builder.Property(v => v.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(v => v.UpdatedAt)
            .HasColumnName("updated_at");

        // Unique constraint: one vote per voter per poll (for SingleChoice)
        builder.HasIndex(v => new { v.PollId, v.VoterId })
            .HasDatabaseName("ix_votes_poll_voter");
    }
}
```

**Key Points:**
- Unique index on (PollId, VoterId) prevents duplicate votes per voter per poll

### Services

#### CacheService.cs
```csharp
public class CacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly JsonSerializerOptions _jsonOptions;

    public CacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(key);

        if (value.IsNullOrEmpty)
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(value!, _jsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var serialized = JsonSerializer.Serialize(value, _jsonOptions);

        await db.StringSetAsync(key, serialized, expiration);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync(key);
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        return await db.KeyExistsAsync(key);
    }
}
```

#### MessageBusService.cs
```csharp
public class MessageBusService : IMessageBus, IAsyncDisposable
{
    private readonly IConnection _connection;
    private readonly IChannel _channel;
    private readonly JsonSerializerOptions _jsonOptions;

    public MessageBusService(string connectionString)
    {
        var factory = new ConnectionFactory
        {
            Uri = new Uri(connectionString)
        };

        _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task PublishAsync<T>(T message, string routingKey, CancellationToken cancellationToken = default)
        where T : class
    {
        await PublishAsync(message, string.Empty, routingKey, cancellationToken);
    }

    public async Task PublishAsync<T>(T message, string exchange, string routingKey, CancellationToken cancellationToken = default)
        where T : class
    {
        var json = JsonSerializer.Serialize(message, _jsonOptions);
        var body = Encoding.UTF8.GetBytes(json);

        var properties = new BasicProperties
        {
            ContentType = "application/json",
            DeliveryMode = DeliveryModes.Persistent
        };

        await _channel.BasicPublishAsync(
            exchange: exchange,
            routingKey: routingKey,
            mandatory: false,
            basicProperties: properties,
            body: body,
            cancellationToken: cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel.IsOpen)
        {
            await _channel.CloseAsync();
        }
        await _channel.DisposeAsync();

        if (_connection.IsOpen)
        {
            await _connection.CloseAsync();
        }
        await _connection.DisposeAsync();

        GC.SuppressFinalize(this);
    }
}
```

**Key Points:**
- Uses RabbitMQ.Client v7.0.0 async APIs
- Persistent delivery mode
- Supports both default exchange and named exchanges

## API Layer (Exo.Vote.Api)

### Program.cs (Main Entry Point)
```csharp
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
```

**Key Points:**
- Bootstrap logger for startup logging
- Structured Serilog integration
- Auto-migration of database at startup
- ExceptionMiddleware registered before routing

### ExceptionMiddleware.cs
```csharp
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var response = new ApiResponse();

        switch (exception)
        {
            case ValidationException validationException:
                statusCode = HttpStatusCode.BadRequest;
                var errors = validationException.Errors
                    .Select(e => new ApiError
                    {
                        Code = "VALIDATION_ERROR",
                        Message = e.ErrorMessage,
                        Field = e.PropertyName
                    })
                    .ToList();
                response = ApiResponse.Fail(errors);
                _logger.LogWarning("Validation failed: {Errors}", string.Join(", ", errors.Select(e => e.Message)));
                break;

            case KeyNotFoundException:
                statusCode = HttpStatusCode.NotFound;
                response = ApiResponse.Fail("The requested resource was not found.");
                _logger.LogWarning(exception, "Resource not found");
                break;

            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized;
                response = ApiResponse.Fail("Unauthorized access.");
                _logger.LogWarning(exception, "Unauthorized access attempt");
                break;

            default:
                response = ApiResponse.Fail("An unexpected error occurred. Please try again later.");
                _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, jsonOptions);
        await context.Response.WriteAsync(json);
    }
}
```

**Key Points:**
- Catches ValidationException from behavior pipeline (400)
- Catches KeyNotFoundException (404)
- Catches UnauthorizedAccessException (401)
- Returns ApiResponse in camelCase JSON
- Logs all exceptions with Serilog

### ServiceCollectionExtensions.cs
```csharp
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
```

## How to Create Commands & Queries with Mediator Source Generator

### Command Pattern
```csharp
// 1. Define the Command (implements ICommand or ICommand<TResponse>)
using Mediator;

namespace Exo.Vote.Application.Features.Polls.Commands;

public sealed record CreatePollCommand(
    string Title,
    string? Description,
    IList<string> Options
) : ICommand<CreatePollResponse>;

public sealed record CreatePollResponse(Guid PollId);

// 2. Define the Handler (implements ICommandHandler<TCommand> or ICommandHandler<TCommand, TResponse>)
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
            Status = PollStatus.Draft,
            Type = PollType.SingleChoice
        };

        // Create options
        for (int i = 0; i < command.Options.Count; i++)
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

// 3. Define the Validator (FluentValidation)
using FluentValidation;

public sealed class CreatePollCommandValidator : AbstractValidator<CreatePollCommand>
{
    public CreatePollCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(500).WithMessage("Title must not exceed 500 characters");

        RuleFor(x => x.Options)
            .Must(o => o.Count >= 2).WithMessage("Poll must have at least 2 options")
            .Must(o => o.Count <= 100).WithMessage("Poll cannot have more than 100 options");
    }
}

// 4. Register in minimal API endpoint
app.MapPost("/api/polls", async (CreatePollCommand command, IMediator mediator) =>
{
    var response = await mediator.Send(command);
    return Results.Created($"/api/polls/{response.PollId}", response);
})
.WithName("CreatePoll")
.WithOpenApi();
```

### Query Pattern
```csharp
// 1. Define the Query
using Mediator;

namespace Exo.Vote.Application.Features.Polls.Queries;

public sealed record GetPollQuery(Guid PollId) : IQuery<GetPollResponse>;

public sealed record GetPollResponse(
    Guid Id,
    string Title,
    string? Description,
    PollStatus Status,
    IList<PollOptionDto> Options,
    int TotalVotes
);

public sealed record PollOptionDto(Guid Id, string Text, int VoteCount);

// 2. Define the Handler
public sealed class GetPollQueryHandler : IQueryHandler<GetPollQuery, GetPollResponse>
{
    private readonly IAppDbContext _context;
    private readonly ICacheService _cache;

    public GetPollQueryHandler(IAppDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async ValueTask<GetPollResponse> Handle(
        GetPollQuery query,
        CancellationToken cancellationToken)
    {
        // Try cache first
        var cacheKey = $"poll:{query.PollId}";
        var cached = await _cache.GetAsync<GetPollResponse>(cacheKey, cancellationToken);
        if (cached != null)
        {
            return cached;
        }

        var poll = await _context.Polls
            .AsNoTracking()
            .Include(p => p.Options)
            .ThenInclude(o => o.Votes)
            .FirstOrDefaultAsync(p => p.Id == query.PollId, cancellationToken);

        if (poll == null)
        {
            throw new KeyNotFoundException($"Poll {query.PollId} not found");
        }

        var response = new GetPollResponse(
            poll.Id,
            poll.Title,
            poll.Description,
            poll.Status,
            poll.Options.Select(o => new PollOptionDto(
                o.Id,
                o.Text,
                o.Votes.Count
            )).ToList(),
            poll.Votes.Count
        );

        // Cache for 5 minutes
        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(5), cancellationToken);

        return response;
    }
}

// 3. Register in minimal API endpoint
app.MapGet("/api/polls/{pollId:guid}", async (Guid pollId, IMediator mediator) =>
{
    var response = await mediator.Send(new GetPollQuery(pollId));
    return Results.Ok(response);
})
.WithName("GetPoll")
.WithOpenApi();
```

## Key Patterns & Best Practices

### 1. Mediator Usage (NOT MediatR)
- Commands implement `ICommand<TResponse>`
- Queries implement `IQuery<TResponse>`
- Handlers implement `ICommandHandler<TCommand, TResponse>` or `IQueryHandler<TQuery, TResponse>`
- Mediator is source-generated, no registration needed beyond `AddMediator()`

### 2. Validation Flow
1. Minimal API endpoint receives request
2. Mediator.Send() is called
3. ValidationBehavior runs FluentValidation
4. If fails: throws ValidationException
5. ExceptionMiddleware catches and returns 400 ApiResponse with errors

### 3. Database Access
- Use `IAppDbContext` injected in handlers
- Always use `AsNoTracking()` for queries (read-only)
- Use tracking for commands (create/update/delete)
- SaveChangesAsync() auto-sets CreatedAt/UpdatedAt

### 4. Caching Pattern
```csharp
var key = "namespace:id:variant";
var cached = await _cache.GetAsync<T>(key);
if (cached != null) return cached;

// Load from DB
var data = await _context.Entities.AsNoTracking()...

// Cache result
await _cache.SetAsync(key, data, TimeSpan.FromMinutes(5));
return data;
```

### 5. Error Handling
- Throw `KeyNotFoundException` for 404
- Throw `UnauthorizedAccessException` for 401
- Throw `ValidationException` from validators for 400
- Middleware converts to ApiResponse with proper status code

### 6. Response Patterns
- Commands: Return a DTO with created ID/data
- Queries: Return a DTO with the requested data
- Always wrap in ApiResponse from minimal API endpoint
- Use Results.Ok(), Results.Created(), Results.BadRequest(), etc.

## Project Dependencies Summary
- **Mediator.Abstractions**: 2.1.7
- **Mediator.SourceGenerator**: 2.1.7
- **FluentValidation**: 11.11.0
- **Microsoft.EntityFrameworkCore**: 9.0.1
- **Npgsql.EntityFrameworkCore.PostgreSQL**: 9.0.3
- **StackExchange.Redis**: 2.8.16
- **RabbitMQ.Client**: 7.0.0
- **Serilog.AspNetCore**: 8.0.3
- **Swashbuckle.AspNetCore**: 7.2.0

## Implemented Features (Issue #1)

### CQRS Commands
- **CreatePollCommand**: Title, Description?, Type, Options, ExpiresAt? → Creates poll with Status=Active
- **CastVoteCommand**: PollId, VoterName, Selections (option IDs + optional ranks) → Creates Vote records, invalidates cache, broadcasts via SignalR

### CQRS Queries
- **GetPollByIdQuery**: PollId → Poll with options, vote counts, updates LastViewedAt
- **GetPollResultsQuery**: PollId → Aggregated results with percentages, average ranks

### API Endpoints (registered in EndpointExtensions.cs)
- `POST /api/polls` → CreatePoll
- `GET /api/polls/{pollId:guid}` → GetPollById
- `POST /api/polls/{pollId:guid}/votes` → CastVote
- `GET /api/polls/{pollId:guid}/results` → GetPollResults
- `MapHub<PollHub>("/hubs/polls")` → SignalR real-time updates

### SignalR (PollHub)
- Hub at `/hubs/polls`
- Methods: JoinPollGroup(pollId), LeavePollGroup(pollId)
- Broadcasts "VoteReceived" event with updated results after each vote
- IVoteNotificationService interface in Application, VoteNotificationService impl in Api

### Background Services
- **PollExpirationService**: Every 60s, closes expired polls (ExpiresAt <= now)
- **PollArchiveService**: Every hour, archives polls with no views for 4 weeks

### Test Project (Exo.Vote.Tests)
- xUnit + FluentAssertions + InMemory EF Core
- Tests for all command handlers, query handlers, and validators
- TestDbContextFactory helper for InMemory database setup

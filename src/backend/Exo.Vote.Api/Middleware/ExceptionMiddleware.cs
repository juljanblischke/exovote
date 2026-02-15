using System.Net;
using System.Text.Json;
using Exo.Vote.Application.Common.Models;
using FluentValidation;

namespace Exo.Vote.Api.Middleware;

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

            case InvalidOperationException:
                statusCode = HttpStatusCode.Conflict;
                response = ApiResponse.Fail(exception.Message);
                _logger.LogWarning(exception, "Invalid operation: {Message}", exception.Message);
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

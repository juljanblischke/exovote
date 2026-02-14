namespace Exo.Vote.Application.Common.Models;

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

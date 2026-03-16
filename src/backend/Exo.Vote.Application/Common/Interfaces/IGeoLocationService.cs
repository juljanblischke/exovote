namespace Exo.Vote.Application.Common.Interfaces;

public interface IGeoLocationService
{
    Task<GeoLocationResult?> ResolveAsync(string? ipAddress);
}

public sealed record GeoLocationResult(string CountryCode, string? Region);

using Exo.Vote.Application.Common.Interfaces;
using MaxMind.GeoIP2;
using Microsoft.Extensions.Logging;

namespace Exo.Vote.Infrastructure.Services;

public sealed class MaxMindGeoLocationService : IGeoLocationService, IDisposable
{
    private readonly DatabaseReader? _reader;
    private readonly ILogger<MaxMindGeoLocationService> _logger;

    public MaxMindGeoLocationService(string? databasePath, ILogger<MaxMindGeoLocationService> logger)
    {
        _logger = logger;

        if (!string.IsNullOrEmpty(databasePath) && File.Exists(databasePath))
        {
            try
            {
                _reader = new DatabaseReader(databasePath);
                _logger.LogInformation("GeoIP database loaded from {Path}", databasePath);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load GeoIP database from {Path}", databasePath);
            }
        }
        else
        {
            _logger.LogInformation("GeoIP database not found at {Path}. Geolocation disabled", databasePath ?? "(not configured)");
        }
    }

    public Task<GeoLocationResult?> ResolveAsync(string? ipAddress)
    {
        if (_reader is null || string.IsNullOrEmpty(ipAddress))
        {
            return Task.FromResult<GeoLocationResult?>(null);
        }

        try
        {
            if (!System.Net.IPAddress.TryParse(ipAddress, out var ip))
            {
                return Task.FromResult<GeoLocationResult?>(null);
            }

            // Skip private/loopback IPs
            if (IsPrivateOrLoopback(ip))
            {
                return Task.FromResult<GeoLocationResult?>(null);
            }

            if (_reader.TryCountry(ip, out var response) && response?.Country?.IsoCode is not null)
            {
                var region = response.Country.Name;
                return Task.FromResult<GeoLocationResult?>(
                    new GeoLocationResult(response.Country.IsoCode, region));
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to resolve geolocation for IP");
        }

        return Task.FromResult<GeoLocationResult?>(null);
    }

    private static bool IsPrivateOrLoopback(System.Net.IPAddress ip)
    {
        if (System.Net.IPAddress.IsLoopback(ip))
            return true;

        var bytes = ip.GetAddressBytes();
        return bytes.Length == 4 && bytes[0] switch
        {
            10 => true,
            172 => bytes[1] >= 16 && bytes[1] <= 31,
            192 => bytes[1] == 168,
            _ => false
        };
    }

    public void Dispose()
    {
        _reader?.Dispose();
    }
}

#!/bin/sh
set -e

GEOIP_DIR="/app/data/geoip"
GEOIP_DB="$GEOIP_DIR/GeoLite2-Country.mmdb"

# Download GeoLite2 database if license key is provided and DB doesn't exist or is older than 7 days
if [ -n "$MAXMIND_LICENSE_KEY" ]; then
    mkdir -p "$GEOIP_DIR"

    SHOULD_DOWNLOAD=false
    if [ ! -f "$GEOIP_DB" ]; then
        SHOULD_DOWNLOAD=true
        echo "GeoIP database not found, downloading..."
    elif [ "$(find "$GEOIP_DB" -mtime +7 2>/dev/null)" ]; then
        SHOULD_DOWNLOAD=true
        echo "GeoIP database older than 7 days, updating..."
    fi

    if [ "$SHOULD_DOWNLOAD" = true ]; then
        DOWNLOAD_URL="https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz"
        TMP_FILE="/tmp/geolite2.tar.gz"

        if curl -sS -o "$TMP_FILE" "$DOWNLOAD_URL" && [ -s "$TMP_FILE" ]; then
            tar -xzf "$TMP_FILE" -C /tmp
            cp /tmp/GeoLite2-Country_*/GeoLite2-Country.mmdb "$GEOIP_DB"
            rm -rf "$TMP_FILE" /tmp/GeoLite2-Country_*
            echo "GeoIP database updated successfully"
        else
            echo "Warning: Failed to download GeoIP database, geolocation will be disabled"
            rm -f "$TMP_FILE"
        fi
    else
        echo "GeoIP database is up to date"
    fi
else
    echo "MAXMIND_LICENSE_KEY not set, geolocation disabled"
fi

exec dotnet Exo.Vote.Api.dll "$@"

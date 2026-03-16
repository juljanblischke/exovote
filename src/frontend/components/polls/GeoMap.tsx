'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { Globe, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { Card } from '@/components/ui/Card';
import type { GeoVoteData } from '@/lib/types';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type GeoMapProps = {
  geoData: GeoVoteData[];
};

type TooltipData = {
  name: string;
  countryCode: string;
  voteCount: number;
  x: number;
  y: number;
};

export function GeoMap({ geoData }: GeoMapProps) {
  const t = useTranslations('polls.results.geoMap');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const votesByCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of geoData) {
      map.set(d.countryCode, d.voteCount);
    }
    return map;
  }, [geoData]);

  const maxVotes = useMemo(
    () => Math.max(...geoData.map((d) => d.voteCount), 1),
    [geoData],
  );

  const totalGeoVotes = useMemo(
    () => geoData.reduce((sum, d) => sum + d.voteCount, 0),
    [geoData],
  );

  if (geoData.length === 0) {
    return null;
  }

  const getColor = (countryCode: string) => {
    const votes = votesByCountry.get(countryCode);
    if (!votes) return 'var(--muted)';
    const intensity = Math.max(0.2, votes / maxVotes);
    return `color-mix(in oklch, hsl(346.8 77.2% 49.8%) ${Math.round(intensity * 100)}%, hsl(346.8 77.2% 25%))`;
  };

  const handleMouseEnter = (
    geo: { properties: { name: string; ISO_A2?: string } },
    event: React.MouseEvent,
  ) => {
    const isoCode = geo.properties.ISO_A2;
    const votes = isoCode ? votesByCountry.get(isoCode) : undefined;
    if (votes) {
      setTooltip({
        name: geo.properties.name,
        countryCode: isoCode!,
        voteCount: votes,
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleTouchStart = (
    geo: { properties: { name: string; ISO_A2?: string } },
    event: React.TouchEvent,
  ) => {
    const isoCode = geo.properties.ISO_A2;
    const votes = isoCode ? votesByCountry.get(isoCode) : undefined;
    if (votes && event.touches[0]) {
      setTooltip({
        name: geo.properties.name,
        countryCode: isoCode!,
        voteCount: votes,
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    }
  };

  return (
    <Card glass className="relative overflow-hidden">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[var(--primary)]" />
          <h3 className="text-sm font-semibold">{t('title')}</h3>
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">
          {t('votes', { count: totalGeoVotes })}
        </span>
      </div>

      {/* Map */}
      <div className="relative -mx-2 aspect-[2/1] w-[calc(100%+1rem)]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [10, 30],
          }}
          className="h-full w-full"
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isoCode = geo.properties.ISO_A2;
                  const hasVotes = isoCode && votesByCountry.has(isoCode);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => handleMouseEnter(geo, e)}
                      onMouseLeave={handleMouseLeave}
                      onTouchStart={(e) => handleTouchStart(geo, e)}
                      onTouchEnd={handleMouseLeave}
                      className={clsx(
                        'outline-none transition-all duration-300',
                        hasVotes && 'cursor-pointer',
                      )}
                      style={{
                        default: {
                          fill: getColor(isoCode ?? ''),
                          stroke: 'var(--border)',
                          strokeWidth: 0.4,
                        },
                        hover: {
                          fill: hasVotes
                            ? 'hsl(346.8 77.2% 59.8%)'
                            : 'var(--muted)',
                          stroke: 'var(--border)',
                          strokeWidth: hasVotes ? 0.8 : 0.4,
                        },
                        pressed: {
                          fill: hasVotes
                            ? 'hsl(346.8 77.2% 49.8%)'
                            : 'var(--muted)',
                          stroke: 'var(--border)',
                          strokeWidth: 0.4,
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 40,
          }}
        >
          <p className="text-sm font-medium">{tooltip.name}</p>
          <p className="text-xs text-[var(--primary)]">
            {t('votes', { count: tooltip.voteCount })}
          </p>
        </div>
      )}

      {/* Legend — top countries */}
      {geoData.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {geoData.slice(0, 5).map((d) => (
            <div key={d.countryCode} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-[var(--primary)]" />
                <span>{d.region ?? d.countryCode}</span>
              </div>
              <span className="tabular-nums text-[var(--muted-foreground)]">
                {t('votes', { count: d.voteCount })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Privacy note */}
      <p className="mt-3 text-[10px] text-[var(--muted-foreground)] opacity-60">
        {t('subtitle')}
      </p>
    </Card>
  );
}

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test-utils';
import { GeoMap } from '@/components/polls/GeoMap';
import type { GeoVoteData } from '@/lib/types';

// Mock react-simple-maps to avoid loading actual map data in tests
vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="composable-map" {...props}>{children}</div>
  ),
  Geographies: ({ children }: { children: (args: { geographies: Array<Record<string, unknown>> }) => React.ReactNode }) =>
    children({ geographies: [] }),
  Geography: () => <path data-testid="geography" />,
  ZoomableGroup: ({ children }: React.PropsWithChildren) => <g>{children}</g>,
}));

describe('GeoMap', () => {
  const sampleGeoData: GeoVoteData[] = [
    { countryCode: 'DE', region: 'Germany', voteCount: 42 },
    { countryCode: 'US', region: 'United States', voteCount: 15 },
    { countryCode: 'FR', region: 'France', voteCount: 8 },
  ];

  it('renders nothing when geoData is empty', () => {
    const { container } = render(<GeoMap geoData={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders title when geoData exists', () => {
    render(<GeoMap geoData={sampleGeoData} />);
    expect(screen.getByText('Herkunft der Stimmen')).toBeInTheDocument();
  });

  it('renders total vote count', () => {
    render(<GeoMap geoData={sampleGeoData} />);
    // 42 + 15 + 8 = 65
    expect(screen.getByText('65 Stimmen')).toBeInTheDocument();
  });

  it('renders top countries in legend', () => {
    render(<GeoMap geoData={sampleGeoData} />);
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('renders the map component', () => {
    render(<GeoMap geoData={sampleGeoData} />);
    expect(screen.getByTestId('composable-map')).toBeInTheDocument();
  });

  it('renders privacy note', () => {
    render(<GeoMap geoData={sampleGeoData} />);
    expect(
      screen.getByText('Ungefährer Standort basierend auf dem Netzwerk, nicht präzise'),
    ).toBeInTheDocument();
  });

  it('limits legend to 5 entries', () => {
    const manyCountries: GeoVoteData[] = [
      { countryCode: 'DE', region: 'Germany', voteCount: 10 },
      { countryCode: 'US', region: 'United States', voteCount: 9 },
      { countryCode: 'FR', region: 'France', voteCount: 8 },
      { countryCode: 'GB', region: 'United Kingdom', voteCount: 7 },
      { countryCode: 'JP', region: 'Japan', voteCount: 6 },
      { countryCode: 'BR', region: 'Brazil', voteCount: 5 },
    ];
    render(<GeoMap geoData={manyCountries} />);
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
    expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
  });
});

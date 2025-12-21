'use client';

/**
 * FlightMap.tsx
 * 
 * Interactive map component using MapLibre GL + deck.gl
 * Renders flight arcs with curved paths and airport markers.
 */

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Flight, ArcData, AirportPoint } from './types';

interface FlightMapProps {
    flights: Flight[];
    selectedFlightId: string | null;
    hoveredFlightId: string | null;
    onFlightClick: (flight: Flight) => void;
    onFlightHover: (flight: Flight | null) => void;
}

// Dark map style (free, no API key needed)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export function FlightMap({
    flights,
    selectedFlightId,
    hoveredFlightId,
    onFlightClick,
    onFlightHover,
}: FlightMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const overlayRef = useRef<MapboxOverlay | null>(null);

    // Convert flights to arc data
    const arcData: ArcData[] = flights.map(flight => ({
        id: flight.id,
        from: [flight.from.lng, flight.from.lat],
        to: [flight.to.lng, flight.to.lat],
        flight,
    }));

    // Generate unique airport points
    const airportPoints: AirportPoint[] = (() => {
        const airports = new Map<string, AirportPoint>();

        flights.forEach(flight => {
            [flight.from, flight.to].forEach(airport => {
                if (!airports.has(airport.code)) {
                    airports.set(airport.code, {
                        code: airport.code,
                        city: airport.city,
                        position: [airport.lng, airport.lat],
                        flightCount: 1,
                    });
                } else {
                    airports.get(airport.code)!.flightCount++;
                }
            });
        });

        return Array.from(airports.values());
    })();

    // Create layers
    const getLayers = useCallback(() => {
        const arcLayer = new ArcLayer({
            id: 'flight-arcs',
            data: arcData,
            getSourcePosition: (d: ArcData) => d.from,
            getTargetPosition: (d: ArcData) => d.to,
            getSourceColor: (d: ArcData) => {
                if (d.id === selectedFlightId) return [255, 200, 0, 255]; // Yellow
                if (d.id === hoveredFlightId) return [100, 180, 255, 255]; // Light blue
                return [100, 100, 180, 180]; // Purple
            },
            getTargetColor: (d: ArcData) => {
                if (d.id === selectedFlightId) return [255, 100, 0, 255]; // Orange
                if (d.id === hoveredFlightId) return [100, 180, 255, 255];
                return [100, 100, 180, 180];
            },
            getWidth: (d: ArcData) => {
                if (d.id === selectedFlightId) return 5;
                if (d.id === hoveredFlightId) return 4;
                return 2;
            },
            getHeight: 0.5, // Arc curvature
            greatCircle: true,
            pickable: true,
            autoHighlight: true,
            onClick: ({ object }: any) => {
                if (object?.flight) {
                    onFlightClick(object.flight);
                }
            },
            onHover: ({ object }: any) => {
                onFlightHover(object?.flight || null);
            },
            updateTriggers: {
                getSourceColor: [selectedFlightId, hoveredFlightId],
                getTargetColor: [selectedFlightId, hoveredFlightId],
                getWidth: [selectedFlightId, hoveredFlightId],
            },
        });

        const airportLayer = new ScatterplotLayer({
            id: 'airports',
            data: airportPoints,
            getPosition: (d: AirportPoint) => d.position,
            getFillColor: [255, 100, 100, 220],
            getRadius: (d: AirportPoint) => Math.min(80000, 20000 + d.flightCount * 8000),
            radiusMinPixels: 5,
            radiusMaxPixels: 20,
            pickable: true,
        });

        return [arcLayer, airportLayer];
    }, [arcData, airportPoints, selectedFlightId, hoveredFlightId, onFlightClick, onFlightHover]);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: MAP_STYLE,
            center: [-65, 25], // Caribbean view
            zoom: 3.5,
            pitch: 45,  // 3D effect
            bearing: -15,
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-left');

        mapRef.current = map;

        // Add deck.gl overlay when map loads
        map.on('load', () => {
            const overlay = new MapboxOverlay({
                layers: getLayers(),
                getTooltip: ({ object }: any) => {
                    if (object?.flight) {
                        return {
                            html: `
                <div style="padding: 10px; background: rgba(20,20,25,0.95); border: 1px solid #444; border-radius: 8px; min-width: 180px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #fff;">
                    ${object.flight.from.code} → ${object.flight.to.code}
                  </div>
                  <div style="color: #888; font-size: 12px; margin-bottom: 4px;">
                    📅 ${object.flight.date}
                  </div>
                  <div style="color: #888; font-size: 12px; margin-bottom: 4px;">
                    ⏱️ ${object.flight.duration}
                  </div>
                  <div style="color: #aaa; font-size: 11px;">
                    👥 ${object.flight.passengers.length} passengers
                  </div>
                </div>
              `,
                            style: {
                                backgroundColor: 'transparent',
                                padding: '0',
                                border: 'none',
                            },
                        };
                    }
                    if (object?.code) {
                        return {
                            html: `
                <div style="padding: 8px; background: rgba(20,20,25,0.95); border: 1px solid #444; border-radius: 6px;">
                  <div style="font-weight: bold; color: #fff;">${object.code}</div>
                  <div style="color: #888; font-size: 11px;">${object.city}</div>
                  <div style="color: #666; font-size: 10px;">${object.flightCount} flights</div>
                </div>
              `,
                            style: {
                                backgroundColor: 'transparent',
                                padding: '0',
                                border: 'none',
                            },
                        };
                    }
                    return null;
                },
            });

            map.addControl(overlay as any);
            overlayRef.current = overlay;
        });

        return () => {
            map.remove();
            mapRef.current = null;
            overlayRef.current = null;
        };
    }, []);

    // Update layers when data/selection changes
    useEffect(() => {
        if (overlayRef.current) {
            overlayRef.current.setProps({ layers: getLayers() });
        }
    }, [getLayers]);

    // Fly to selected flight route
    useEffect(() => {
        if (!mapRef.current || !selectedFlightId) return;

        const flight = flights.find(f => f.id === selectedFlightId);
        if (!flight) return;

        // Calculate bounds
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([flight.from.lng, flight.from.lat]);
        bounds.extend([flight.to.lng, flight.to.lat]);

        mapRef.current.fitBounds(bounds, {
            padding: 120,
            duration: 1200,
            pitch: 50,
            bearing: mapRef.current.getBearing(),
        });
    }, [selectedFlightId, flights]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ position: 'relative' }}
        />
    );
}

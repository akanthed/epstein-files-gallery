'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Plane, Calendar, User } from 'lucide-react';
// import { GlobeMethods } from 'react-globe.gl';

// Dynamically import globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-[600px] w-full bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <span className="text-zinc-400">Loading 3D Globe...</span>
        </div>
    )
});

interface Flight {
    id: string;
    date: string;
    aircraft: string;
    from: { lat: number; lng: number; name: string };
    to: { lat: number; lng: number; name: string };
    passengers: string[];
}

export function FlightGlobe() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [hoveredFlight, setHoveredFlight] = useState<Flight | null>(null);
    const globeEl = useRef<any>(null);

    useEffect(() => {
        // Load flight data
        fetch('/flights.json')
            .then(res => res.json())
            .then(data => setFlights(data))
            .catch(err => console.error("Failed to load flights", err));
    }, []);

    useEffect(() => {
        // Auto-rotate setup
        if (globeEl.current) {
            const controls = globeEl.current.controls();
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;

            // Enable zoom explicitly to ensure it captures events
            controls.enableZoom = true;
            // Limit zoom to prevent viewing blurry textures at ground level
            controls.minDistance = 150; // Minimum distance from center (earth radius ~100)
            controls.maxDistance = 400;
        }
    }, [globeEl.current]);

    const stopRotation = () => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
        }
    };

    const arcsData = useMemo(() => {
        return flights.map(f => ({
            startLat: f.from.lat,
            startLng: f.from.lng,
            endLat: f.to.lat,
            endLng: f.to.lng,
            color: hoveredFlight === f ? '#60A5FA' : '#3B82F6',
            flight: f
        }));
    }, [flights, hoveredFlight]);

    // Points data (airports)
    const pointsData = useMemo(() => {
        const points: any[] = [];
        const seen = new Set();

        flights.forEach(f => {
            [f.from, f.to].forEach(loc => {
                if (!seen.has(loc.name)) {
                    seen.add(loc.name);
                    points.push({
                        lat: loc.lat,
                        lng: loc.lng,
                        name: loc.name,
                        // Fix: Reduce size from 0.8 (huge) to 0.15 degrees
                        size: 0.15,
                        color: '#EF4444'
                    });
                }
            });
        });
        return points;
    }, [flights]);

    return (
        <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl group">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                arcsData={arcsData}
                arcColor="color"
                arcDashLength={0.4}
                arcDashGap={4}
                arcDashInitialGap={() => Math.random() * 5}
                arcDashAnimateTime={2000}
                arcStroke={hoveredFlight ? 1 : 0.5}
                pointsData={pointsData}
                pointColor="color"
                pointAltitude={0.01}
                pointRadius="size"
                pointsMerge={true}
                // Stop rotation when user interacts with an arc/point
                onArcHover={(arc: any) => {
                    if (arc) {
                        setHoveredFlight(arc.flight);
                        document.body.style.cursor = 'pointer';
                        stopRotation();
                    } else {
                        setHoveredFlight(null);
                        document.body.style.cursor = 'default';
                    }
                }}
                onArcClick={() => stopRotation()}
                onPointHover={(point: any) => {
                    if (point) {
                        document.body.style.cursor = 'pointer';
                        stopRotation();
                    } else {
                        document.body.style.cursor = 'default';
                    }
                }}
                onPointClick={() => stopRotation()}
                // Also stop rotation if user clicks anywhere on the globe (to drag)
                onGlobeClick={() => stopRotation()}
                atmosphereColor="#3B82F6"
                atmosphereAltitude={0.15}
            />

            {/* Interaction Hint */}
            <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
                Click to interact • Scroll to zoom
            </div>

            {/* Flight Info Overlay */}
            {hoveredFlight && (
                <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-sm shadow-xl animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                        <Plane className="w-5 h-5 text-blue-400" />
                        Flight Details
                    </h3>

                    <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-[auto_1fr] gap-x-2 text-zinc-400">
                            <Calendar className="w-4 h-4" />
                            <span>{hoveredFlight.date}</span>
                        </div>

                        <div className="border-l-2 border-slate-700 pl-3 ml-1 space-y-1">
                            <div>
                                <span className="text-zinc-500 text-xs">FROM</span>
                                <div className="text-zinc-200 flex items-center gap-2">
                                    {hoveredFlight.from.name}
                                    <a
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(hoveredFlight.from.name)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Map
                                    </a>
                                </div>
                            </div>
                            <div>
                                <span className="text-zinc-500 text-xs">TO</span>
                                <div className="text-zinc-200 flex items-center gap-2">
                                    {hoveredFlight.to.name}
                                    <a
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(hoveredFlight.to.name)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Map
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                <User className="w-4 h-4" />
                                <span>Passengers</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {hoveredFlight.passengers.map((p, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-zinc-300 border border-white/5">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Legend / Title */}
            <div className="absolute bottom-6 left-6 pointer-events-none">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Global Flight Tracker
                </h2>
                <p className="text-white/40 text-sm mt-1">
                    Visualizing known flight paths from court records
                </p>
            </div>

        </div>
    );
}

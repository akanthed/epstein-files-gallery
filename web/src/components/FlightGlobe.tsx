'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Plane, Calendar, User, MapPin, ZoomIn } from 'lucide-react';

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

// Dynamically import Leaflet map (SSR issue)
const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
);
const Polyline = dynamic(
    () => import('react-leaflet').then(mod => mod.Polyline),
    { ssr: false }
);

interface Flight {
    id: string;
    date: string;
    aircraft: string;
    from: { lat: number; lng: number; name: string };
    to: { lat: number; lng: number; name: string };
    passengers: string[];
}

// Zoom threshold for switching views
// When camera distance < this value, we transition to map view
const ZOOM_THRESHOLD = 180; // Globe radius is ~100, so 180 is fairly close

export function FlightGlobe() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [hoveredFlight, setHoveredFlight] = useState<Flight | null>(null);
    const [cameraAltitude, setCameraAltitude] = useState(300);
    const [viewCenter, setViewCenter] = useState<{ lat: number; lng: number }>({ lat: 30, lng: -40 });
    const [isMapMode, setIsMapMode] = useState(false);
    const globeEl = useRef<any>(null);

    useEffect(() => {
        // Load flight data
        fetch('/flights.json')
            .then(res => res.json())
            .then(data => setFlights(data))
            .catch(err => console.error("Failed to load flights", err));
    }, []);

    useEffect(() => {
        if (!globeEl.current) return;

        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = true;

        // REMOVED zoom limits to allow deep zoom
        // Instead, we track altitude and switch to map mode when close
        controls.minDistance = 110; // Just above earth surface (~100)
        controls.maxDistance = 500;

        // Track camera position for altitude-based mode switching
        const camera = globeEl.current.camera();
        const trackAltitude = () => {
            if (camera) {
                const distance = camera.position.length();
                setCameraAltitude(distance);

                // Get point on globe that camera is looking at
                const cameraPos = camera.position;
                const lat = 90 - Math.acos(cameraPos.y / distance) * (180 / Math.PI);
                const lng = Math.atan2(cameraPos.x, cameraPos.z) * (180 / Math.PI);
                setViewCenter({ lat, lng });

                // Switch to map mode if zoomed in close
                if (distance < ZOOM_THRESHOLD && !isMapMode) {
                    setIsMapMode(true);
                } else if (distance >= ZOOM_THRESHOLD + 20 && isMapMode) {
                    // Hysteresis to prevent flickering
                    setIsMapMode(false);
                }
            }
            requestAnimationFrame(trackAltitude);
        };
        trackAltitude();

    }, [globeEl.current, isMapMode]);

    const stopRotation = useCallback(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
        }
    }, []);

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
                        size: 0.15,
                        color: '#EF4444'
                    });
                }
            });
        });
        return points;
    }, [flights]);

    // Calculate opacity based on altitude (fade out globe elements when zooming in)
    const globeOpacity = Math.min(1, (cameraAltitude - ZOOM_THRESHOLD) / 50);

    return (
        <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl group">

            {/* 3D Globe Layer */}
            <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: isMapMode ? 0.3 : 1, pointerEvents: isMapMode ? 'none' : 'auto' }}
            >
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
                    arcAltitude={0.15}
                    pointsData={pointsData}
                    pointColor="color"
                    pointAltitude={0.01}
                    pointRadius="size"
                    pointsMerge={true}
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
                    onGlobeClick={() => stopRotation()}
                    atmosphereColor="#3B82F6"
                    atmosphereAltitude={0.15}
                />
            </div>

            {/* Leaflet Map Layer (shows when zoomed in) */}
            {isMapMode && (
                <div className="absolute inset-0 z-20 animate-in fade-in duration-500">
                    <link
                        rel="stylesheet"
                        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                        crossOrigin=""
                    />
                    <MapContainer
                        center={[viewCenter.lat, viewCenter.lng]}
                        zoom={8}
                        style={{ height: '100%', width: '100%' }}
                        className="rounded-2xl"
                    >
                        {/* High-detail OpenStreetMap tiles */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Flight paths as polylines */}
                        {flights.map(flight => (
                            <Polyline
                                key={flight.id}
                                positions={[
                                    [flight.from.lat, flight.from.lng],
                                    [flight.to.lat, flight.to.lng]
                                ]}
                                color="#3B82F6"
                                weight={2}
                                opacity={0.7}
                            />
                        ))}

                        {/* Airport markers */}
                        {pointsData.map((point, i) => (
                            <Marker key={i} position={[point.lat, point.lng]}>
                                <Popup>
                                    <div className="font-medium">{point.name}</div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            )}

            {/* Mode Indicator */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isMapMode
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-black/40 border-white/10 text-zinc-400'
                    }`}>
                    {isMapMode ? (
                        <>
                            <MapPin className="w-3 h-3 inline mr-1" />
                            Street View
                        </>
                    ) : (
                        <>
                            <ZoomIn className="w-3 h-3 inline mr-1" />
                            Scroll to zoom in
                        </>
                    )}
                </div>

                {/* Altitude indicator */}
                <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 text-[10px] text-zinc-500 font-mono">
                    ALT: {Math.round(cameraAltitude)}
                </div>
            </div>

            {/* Back to Globe button (in map mode) */}
            {isMapMode && (
                <button
                    onClick={() => {
                        if (globeEl.current) {
                            // Zoom out the globe
                            globeEl.current.pointOfView({ altitude: 2.5 }, 1000);
                        }
                        setIsMapMode(false);
                    }}
                    className="absolute bottom-6 right-6 z-30 px-4 py-2 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/10 text-sm text-white hover:bg-zinc-800 transition-colors"
                >
                    ← Back to Globe
                </button>
            )}

            {/* Flight Info Overlay (only in globe mode) */}
            {hoveredFlight && !isMapMode && (
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
            <div className="absolute bottom-6 left-6 pointer-events-none z-10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Global Flight Tracker
                </h2>
                <p className="text-white/40 text-sm mt-1">
                    {isMapMode ? 'Street-level detail view' : 'Visualizing known flight paths from court records'}
                </p>
            </div>

        </div>
    );
}

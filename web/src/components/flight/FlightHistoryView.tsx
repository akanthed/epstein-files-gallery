'use client';

/**
 * FlightHistoryView.tsx
 * 
 * Main container for the Flight History feature.
 * Combines map, flight list, and detail panel.
 */

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FlightData, Flight, FlightStats } from './types';
import { FlightList } from './FlightList';
import { FlightDetailsPanel } from './FlightDetailsPanel';
import { Loader2, Plane, Clock, Users, AlertCircle } from 'lucide-react';
import { BASE_PATH } from '@/lib/utils';

// Lazy load the map component (heavy WebGL)
const FlightMap = dynamic(
    () => import('./FlightMap').then(mod => ({ default: mod.FlightMap })),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-zinc-900">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        ),
    }
);

export function FlightHistoryView() {
    const [flightData, setFlightData] = useState<FlightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
    const [hoveredFlightId, setHoveredFlightId] = useState<string | null>(null);

    // Load flight data
    useEffect(() => {
        fetch(`${BASE_PATH}/data/flights.json`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load flight data');
                return res.json();
            })
            .then((data: FlightData) => {
                setFlightData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading flights:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleFlightSelect = (flight: Flight) => {
        setSelectedFlightId(flight.id);
    };

    const handleFlightHover = (flight: Flight | null) => {
        setHoveredFlightId(flight?.id || null);
    };

    const selectedFlight = flightData?.flights.find(f => f.id === selectedFlightId) || null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh] bg-zinc-950 rounded-xl border border-white/10">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-zinc-400">Loading flight data...</p>
                </div>
            </div>
        );
    }

    if (error || !flightData) {
        return (
            <div className="flex items-center justify-center h-[80vh] bg-zinc-950 rounded-xl border border-white/10">
                <div className="text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <p className="text-zinc-400">{error || 'Failed to load flight data'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    icon={<Plane className="w-5 h-5" />}
                    label="Total Flights"
                    value={flightData.stats.totalFlights.toLocaleString()}
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Flight Hours"
                    value={`${flightData.stats.totalHours.toLocaleString()}h`}
                />
                <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Passenger Records"
                    value={flightData.stats.totalPassengers.toLocaleString()}
                />
            </div>

            {/* Main Content: Map + Sidebar */}
            <div className="flex h-[70vh] rounded-xl border border-white/10 overflow-hidden">
                {/* Map (65%) */}
                <div className="w-[65%] h-full">
                    <FlightMap
                        flights={flightData.flights}
                        selectedFlightId={selectedFlightId}
                        hoveredFlightId={hoveredFlightId}
                        onFlightClick={handleFlightSelect}
                        onFlightHover={handleFlightHover}
                    />
                </div>

                {/* Sidebar (35%) */}
                <div className="w-[35%] h-full flex flex-col bg-zinc-900 border-l border-white/10">
                    {/* Detail Panel (when flight selected) - 55% */}
                    {selectedFlight && (
                        <div className="h-[55%] border-b border-white/10 overflow-hidden">
                            <FlightDetailsPanel
                                flight={selectedFlight}
                                onClose={() => setSelectedFlightId(null)}
                            />
                        </div>
                    )}

                    {/* Flight List - remaining space */}
                    <div className={`${selectedFlight ? 'h-[45%]' : 'h-full'} overflow-hidden`}>
                        <FlightList
                            flights={flightData.flights}
                            selectedFlightId={selectedFlightId}
                            onFlightSelect={handleFlightSelect}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-zinc-600">
                Data sourced from U.S. v. Maxwell court documents • Page numbers reference original PDF
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    {icon}
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-xs text-zinc-500">{label}</div>
                </div>
            </div>
        </div>
    );
}

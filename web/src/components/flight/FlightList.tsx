'use client';

/**
 * FlightList.tsx
 * 
 * Scrollable list of flights with search and selection.
 */

import { useState, useMemo } from 'react';
import { Flight } from './types';
import { Search, Plane, Users, Calendar, Clock } from 'lucide-react';

interface FlightListProps {
    flights: Flight[];
    selectedFlightId: string | null;
    onFlightSelect: (flight: Flight) => void;
}

export function FlightList({ flights, selectedFlightId, onFlightSelect }: FlightListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFlights = useMemo(() => {
        if (!searchQuery.trim()) return flights;

        const query = searchQuery.toLowerCase();
        return flights.filter(flight =>
            flight.from.code.toLowerCase().includes(query) ||
            flight.to.code.toLowerCase().includes(query) ||
            flight.from.city.toLowerCase().includes(query) ||
            flight.to.city.toLowerCase().includes(query) ||
            flight.date.includes(query) ||
            flight.passengers.some(p => p.name.toLowerCase().includes(query))
        );
    }, [flights, searchQuery]);

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="p-3 border-b border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search flights, airports, passengers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                    {filteredFlights.length} of {flights.length} flights
                </div>
            </div>

            {/* Flight list */}
            <div className="flex-1 overflow-y-auto">
                {filteredFlights.map(flight => {
                    const isSelected = flight.id === selectedFlightId;

                    return (
                        <button
                            key={flight.id}
                            onClick={() => onFlightSelect(flight)}
                            className={`
                w-full p-3 border-b border-white/5 text-left transition-all
                hover:bg-zinc-800/50
                ${isSelected ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : ''}
              `}
                        >
                            {/* Route */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono font-bold text-white">{flight.from.code}</span>
                                <Plane className="w-3 h-3 text-zinc-500 rotate-90" />
                                <span className="font-mono font-bold text-white">{flight.to.code}</span>
                                <span className="ml-auto text-xs text-zinc-600 font-mono">
                                    {flight.aircraft}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {flight.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {flight.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {flight.passengers.length}
                                </span>
                            </div>

                            {/* Cities */}
                            <div className="text-xs text-zinc-600 mt-1 truncate">
                                {flight.from.city} → {flight.to.city}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

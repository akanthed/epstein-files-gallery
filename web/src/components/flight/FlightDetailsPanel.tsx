'use client';

/**
 * FlightDetailsPanel.tsx
 * 
 * Detailed view of a selected flight with passengers and metadata.
 */

import { Flight } from './types';
import { Plane, MapPin, Clock, Users, FileText, Calendar, X } from 'lucide-react';

interface FlightDetailsPanelProps {
    flight: Flight | null;
    onClose: () => void;
}

export function FlightDetailsPanel({ flight, onClose }: FlightDetailsPanelProps) {
    if (!flight) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                <div className="text-center">
                    <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select a flight to view details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-3 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg">
                            <Plane className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <div className="font-bold text-white">
                                {flight.from.code} → {flight.to.code}
                            </div>
                            <div className="text-xs text-zinc-500">{flight.aircraft}</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded transition"
                    >
                        <X className="w-4 h-4 text-zinc-400" />
                    </button>
                </div>

                {/* Route mini visualization */}
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400 truncate flex-1">{flight.from.city}</span>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 flex-shrink-0" />
                    <span className="text-zinc-400 truncate flex-1 text-right">{flight.to.city}</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {/* Flight details */}
                <div className="p-3 border-b border-white/10">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                            <div>
                                <div className="text-zinc-500">Date</div>
                                <div className="text-white">{flight.date}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                            <div>
                                <div className="text-zinc-500">Duration</div>
                                <div className="text-white">{flight.duration}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                            <div>
                                <div className="text-zinc-500">Coords</div>
                                <div className="text-zinc-400 font-mono text-[10px]">
                                    {flight.from.lat.toFixed(1)}, {flight.from.lng.toFixed(1)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                            <div>
                                <div className="text-zinc-500">Source</div>
                                <div className="text-white">Page {flight.sourcePage}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Passengers */}
                <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-400">
                            Passengers ({flight.passengers.length})
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        {flight.passengers.map((passenger, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-1.5 bg-zinc-800/50 rounded border border-white/5"
                            >
                                <div className="w-6 h-6 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-400 flex-shrink-0">
                                    {passenger.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="text-xs text-white truncate">{passenger.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-shrink-0 px-3 py-2 border-t border-white/10 bg-zinc-900/50">
                <div className="text-[10px] text-zinc-600 text-center truncate">
                    {flight.id}
                </div>
            </div>
        </div>
    );
}

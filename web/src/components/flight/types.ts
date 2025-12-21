// Flight data types

export interface Airport {
    code: string;
    city: string;
    lat: number;
    lng: number;
}

export interface Passenger {
    name: string;
}

export interface Flight {
    id: string;
    date: string;
    aircraft: string;
    from: Airport;
    to: Airport;
    duration: string;
    passengers: Passenger[];
    sourcePage: number;
}

export interface FlightStats {
    totalFlights: number;
    totalHours: number;
    totalPassengers: number;
}

export interface FlightData {
    stats: FlightStats;
    flights: Flight[];
}

// Arc data for deck.gl
export interface ArcData {
    id: string;
    from: [number, number]; // [lng, lat]
    to: [number, number];   // [lng, lat]
    flight: Flight;
}

// Point data for airports
export interface AirportPoint {
    code: string;
    city: string;
    position: [number, number]; // [lng, lat]
    flightCount: number;
}

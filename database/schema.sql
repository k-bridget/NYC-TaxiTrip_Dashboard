-- NYC Taxi Trip Database Schema
-- SQLite database for storing cleaned taxi trip data

-- Creating trips table
CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    pickup_datetime TEXT NOT NULL,
    dropoff_datetime TEXT NOT NULL,
    passenger_count INTEGER NOT NULL,
    pickup_longitude REAL NOT NULL,
    pickup_latitude REAL NOT NULL,
    dropoff_longitude REAL NOT NULL,
    dropoff_latitude REAL NOT NULL,
    store_and_fwd_flag TEXT NOT NULL,
    trip_duration INTEGER NOT NULL,
    distance_km REAL NOT NULL,
    speed_kmh REAL NOT NULL,
    estimated_fare REAL NOT NULL
);

-- Creating indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_pickup_datetime ON trips(pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_vendor_id ON trips(vendor_id);
CREATE INDEX IF NOT EXISTS idx_passenger_count ON trips(passenger_count);
CREATE INDEX IF NOT EXISTS idx_trip_duration ON trips(trip_duration);
CREATE INDEX IF NOT EXISTS idx_distance_km ON trips(distance_km);
CREATE INDEX IF NOT EXISTS idx_estimated_fare ON trips(estimated_fare);

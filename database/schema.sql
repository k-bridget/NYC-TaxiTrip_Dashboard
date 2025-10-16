-- NYC Taxi Trip Database Schema
-- SQLite database to hold cleaned taxi trip data

-- Trip table to hold each taxi ride information
CREATE TABLE IF NOT EXISTS taxi_trips (
trip_id TEXT PRIMARY KEY,
vendor_id INTEGER NOT NULL,
pickup_time TEXT NOT NULL,
dropoff_time TEXT NOT NULL,
num_passengers INTEGER NOT NULL,
pickup_long REAL NOT NULL,
pickup_lat REAL NOT NULL,
dropoff_long REAL NOT NULL,
dropoff_lat REAL NOT NULL,
store_fwd_flag TEXT NOT NULL,
trip_length INTEGER NOT NULL,
distance_km REAL NOT NULL,
avg_speed REAL NOT NULL
estimated_fare REAL NOT NULL
);

-- Indexes for effective querying based on various trip characteristics
CREATE INDEX IF NOT EXISTS idx_pickup_time ON taxi_trips(pickup_time);
CREATE INDEX IF NOT EXISTS idx_vendor ON taxi_trips(vendor_id);
CREATE INDEX IF NOT EXISTS idx_num_passengers ON taxi_trips(num_passengers);
CREATE INDEX IF NOT EXISTS idx_trip_length ON taxi_trips(trip_length);
CREATE INDEX IF NOT EXISTS idx_distance ON taxi_trips(distance_km);
CREATE INDEX IF NOT EXISTS idx_estimated_fare ON taxi_trips(estimated_fare);

-- TODO: Consider a composite index on (pickup_time, vendor_id) for common query patterns

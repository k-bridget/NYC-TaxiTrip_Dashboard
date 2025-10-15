import sqlite3
import pandas as pd


# Connecting to the database - this will create it if it doesn't exist
database_connection = sqlite3.connect('nyc_taxi.db')
db_cursor = database_connection.cursor()

# Setting up the vendors table first (keeping it normalized like we discussed)
db_cursor.execute('''
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id INTEGER PRIMARY KEY,
    vendor_name TEXT
)
''')


db_cursor.execute("INSERT OR IGNORE INTO vendors (vendor_id, vendor_name) VALUES (1, 'Vendor A')")
db_cursor.execute("INSERT OR IGNORE INTO vendors (vendor_id, vendor_name) VALUES (2, 'Vendor B')")



db_cursor.execute('''
CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    vendor_id INTEGER,
    pickup_datetime TEXT,
    dropoff_datetime TEXT,
    passenger_count INTEGER,
    pickup_longitude REAL,
    pickup_latitude REAL,
    dropoff_longitude REAL,
    dropoff_latitude REAL,
    store_and_fwd_flag TEXT,
    trip_duration INTEGER,
    distance_km REAL,
    speed_kmh REAL,
    estimated_fare REAL,
    FOREIGN KEY (vendor_id) REFERENCES vendors (vendor_id)
)
''')

db_cursor.execute('CREATE INDEX IF NOT EXISTS idx_pickup_datetime ON trips (pickup_datetime)')
db_cursor.execute('CREATE INDEX IF NOT EXISTS idx_vendor_id ON trips (vendor_id)')
db_cursor.execute('CREATE INDEX IF NOT EXISTS idx_passenger_count ON trips (passenger_count)')
db_cursor.execute('CREATE INDEX IF NOT EXISTS idx_trip_duration ON trips (trip_duration)')
db_cursor.execute('CREATE INDEX IF NOT EXISTS idx_distance_km ON trips (distance_km)')
db_cursor.execute('CREATE INDEX IF NOT EXISTS idx_estimated_fare ON trips (estimated_fare)')
# Might want to add more indexes later if we start querying on other columns frequently

# Loading the cleaned data
trips_data = pd.read_csv('database/cleaned_trips.csv')


trips_data.to_sql('trips', database_connection, if_exists='replace', index=False)

database_connection.commit()
database_connection.close()

print("Database setup complete!")

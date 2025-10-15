import pandas as pd
import math
import os

# Function to calculate haversine distance in km
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def main():
    # Load raw data
    df = pd.read_csv('../train/train.csv')

    # Limit to 100 trips for testing/demo
    df = df.head(100)

    original_count = len(df)
    print(f"Original records: {original_count}")

    # Handle missing values
    df.dropna(inplace=True)
    print(f"After dropping missing: {len(df)}")

    # Handle duplicates
    df.drop_duplicates(inplace=True)
    print(f"After dropping duplicates: {len(df)}")

    # Filter invalid records
    # Passenger count > 0, trip_duration > 0 and < 24 hours
    # Coordinates within approximate NYC bounds: lon -74.3 to -73.7, lat 40.5 to 40.9
    nyc_bounds = {
        'min_lon': -74.3,
        'max_lon': -73.7,
        'min_lat': 40.5,
        'max_lat': 40.9
    }
    df = df[
        (df['passenger_count'] > 0) &
        (df['trip_duration'] > 0) &
        (df['trip_duration'] < 86400) &  # less than 24 hours
        (df['pickup_longitude'].between(nyc_bounds['min_lon'], nyc_bounds['max_lon'])) &
        (df['pickup_latitude'].between(nyc_bounds['min_lat'], nyc_bounds['max_lat'])) &
        (df['dropoff_longitude'].between(nyc_bounds['min_lon'], nyc_bounds['max_lon'])) &
        (df['dropoff_latitude'].between(nyc_bounds['min_lat'], nyc_bounds['max_lat']))
    ]
    print(f"After filtering invalid: {len(df)}")

    # Normalize timestamps
    df['pickup_datetime'] = pd.to_datetime(df['pickup_datetime'])
    df['dropoff_datetime'] = pd.to_datetime(df['dropoff_datetime'])

    # Derived features
    # Distance in km
    df['distance_km'] = df.apply(lambda row: haversine(
        row['pickup_latitude'], row['pickup_longitude'],
        row['dropoff_latitude'], row['dropoff_longitude']
    ), axis=1)

    # Speed in km/h
    df['speed_kmh'] = df['distance_km'] / (df['trip_duration'] / 3600)

    # Estimated fare
    # NYC taxi rates (approx): $2.5 initial, $0.5 per 1/5 mile, $0.5 per minute
    df['distance_miles'] = df['distance_km'] * 0.621371
    df['duration_minutes'] = df['trip_duration'] / 60
    df['estimated_fare'] = 2.5 + (df['distance_miles'] / 0.2) * 0.5 + df['duration_minutes'] * 0.5

    # Log exclusions
    excluded_count = original_count - len(df)
    print(f"Total excluded records: {excluded_count}")

    # Save cleaned data
    output_path = '../database/cleaned_trips.csv'
    df.to_csv(output_path, index=False)
    print(f"Cleaned data saved to {output_path}")

if __name__ == '__main__':
    main()

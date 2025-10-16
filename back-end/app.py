from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from algorithms.anomaly_detection import detect_anomalies

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

DB_PATH = '../database/nyc_taxi.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/trips', methods=['GET'])
def get_trips():
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM trips WHERE 1=1"
    params = []

    # Filters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    vendor_id = request.args.get('vendor_id')
    passenger_count = request.args.get('passenger_count')
    limit = request.args.get('limit', 100, type=int)

    if start_date:
        query += " AND pickup_datetime >= ?"
        params.append(start_date)
    if end_date:
        query += " AND pickup_datetime <= ?"
        params.append(end_date)
    if vendor_id:
        query += " AND vendor_id = ?"
        params.append(int(vendor_id))
    if passenger_count:
        query += " AND passenger_count = ?"
        params.append(int(passenger_count))

    query += " LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    trips = [dict(row) for row in rows]
    return jsonify(trips)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) as total_trips,
            AVG(trip_duration) as avg_duration,
            AVG(distance_km) as avg_distance,
            AVG(speed_kmh) as avg_speed,
            AVG(estimated_fare) as avg_fare,
            SUM(estimated_fare) as total_fare
        FROM trips
    """)
    row = cursor.fetchone()
    conn.close()

    stats = dict(row)
    return jsonify(stats)

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    # Get all trip_durations
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT trip_duration FROM trips")
    durations = [row[0] for row in cursor.fetchall()]
    conn.close()

    anomalies = detect_anomalies(durations)
    return jsonify(anomalies)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

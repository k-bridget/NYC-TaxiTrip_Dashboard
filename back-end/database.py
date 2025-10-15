import sqlite3
import pandas as pd
import os

def create_database(db_path='nyc_taxi.db', schema_path='database/schema.sql'):
    

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Read and execute schema
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)

    conn.commit()
    conn.close()
    print(f"Database created at {db_path}")

def insert_data(db_path='nyc_taxi.db', csv_path='database/cleaned_trips.csv'):
    
    df = pd.read_csv(csv_path)

    conn = sqlite3.connect(db_path)
    df.to_sql('trips', conn, if_exists='replace', index=False)
    conn.close()
    print(f"Data inserted into {db_path}")

def main():
    create_database()
    insert_data()

if __name__ == '__main__':
    main()

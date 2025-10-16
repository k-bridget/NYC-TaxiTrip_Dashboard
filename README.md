# NYC-TaxiTrip_Dashboard
 Fullstack application analyzing New York City Taxi Trip dataset and provides interactive insights through data cleaning, processing, and visualization.

 # Features

**Frontend**(HTML,CSS. Chart.js)

**Interactive Dashboard**:responsive web interface with dark/light theme toggle

**DataFiltering**: Date range, fare range, hour selection

**Real-time Statistics**: Live calculation of trip metrics (total trips, average duration, distance, speed, and fare)

**Data Visualizations**: Multiple chart types including histograms, bar charts, anomaly detection.

**Responsive Design**: Modern, clean layout with responsive cards

# Backend

**Python** - Core programming language

**Flask** - Lightweight web framework

**SQLite** -  database

**Pandas** - Data processing and analysis

# Project Structure

NYC-TaxiTrip_Dashboard/
├── back-end/
│   ├── app.py
│   ├── data_cleaning.py
│   ├── anomaly_detection.py
│   ├── database.py
│   ├── algorithms/
│   └── __init__.py
│
├── database/
│   ├── nyc_taxi.db
│   ├── db-setup.py
│   ├── schema.sql
│   └── cleaned_trips.csv
│
├── front-end/
│   ├── index.html
│   ├── style.css
│   └── main.js
│
├── docs/
│   ├── readme_images/
│   └── report.pdf
│
├── requirements.txt
└── README.md

# Video walkthrough

https://youtu.be/IIVHOGzHnlw?si=CSGwF6dHwMk0BVTx

Common Issues

**Backend server won't start:**

  Ensure all dependencies are installed: `pip install -r requirements.txt`
  
  Check Python version: `python --version` (should be 3.8+)
  
  Verify database file exists

**Frontend not loading data:**

  Ensure backend server is running on port 5000
  
  Check browser console
  
  Verify API_BASE URL

**Database errors:**

 Run `python database/db-setup.py` to recreate database
 
 Ensure `cleaned_trips.csv` exists in `database/` directory




 

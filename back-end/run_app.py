#!/usr/bin/env python3
"""
NYC Taxi Trip Dashboard Launcher
Automatically starts the Flask backend and opens the frontend in the browser.
"""

import subprocess
import time
import webbrowser
import os
import sys

def main():
    print("Starting NYC Taxi Trip Dashboard...")

    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Path to backend directory
    backend_dir = os.path.join(current_dir, 'back-end')

    # Path to frontend HTML file
    frontend_path = os.path.join(current_dir, 'front-end', 'index.html')

    try:
        # Start the Flask server
        print("Starting Flask backend server...")
        server_process = subprocess.Popen(
            [sys.executable, 'app.py'],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Wait for server to start
        print("Waiting for server to start...")
        time.sleep(3)

        # Check if server is running
        if server_process.poll() is None:
            print("Backend server started successfully!")

            # Open frontend in browser
            print("Opening frontend in browser...")
            webbrowser.open(f'file://{frontend_path}')

            print("\nDashboard is now running!")
            print("Backend server: http://127.0.0.1:5000")
            print("Frontend: Opened in default browser")
            print("\nPress Ctrl+C to stop the server")

            # Keep the script running to keep server alive
            try:
                server_process.wait()
            except KeyboardInterrupt:
                print("\nStopping server...")
                server_process.terminate()
                server_process.wait()
                print("Server stopped.")
        else:
            print("Failed to start backend server.")
            stdout, stderr = server_process.communicate()
            print("STDOUT:", stdout.decode())
            print("STDERR:", stderr.decode())

    except Exception as e:
        print(f"Error starting application: {e}")

if __name__ == "__main__":
    main()

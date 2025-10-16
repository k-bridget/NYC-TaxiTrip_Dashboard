#!/usr/bin/env python3
"""
NYC Taxi Trip Dashboard Launcher
Automatically starts the Flask backend and a separate HTTP server for the frontend.
"""

import subprocess
import time
import webbrowser
import os
import sys

def main():
    print("Starting NYC Taxi Trip Dashboard...")

    # Get the current directory (which is back-end)
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Backend directory is current directory
    backend_dir = current_dir

    # Frontend directory
    frontend_dir = os.path.join(current_dir, '..', 'front-end')

    try:
        # Start the Flask backend server
        print("Starting Flask backend server...")
        backend_process = subprocess.Popen(
            [sys.executable, 'app.py'],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Start the frontend HTTP server
        print("Starting frontend HTTP server...")
        frontend_process = subprocess.Popen(
            [sys.executable, '-m', 'http.server', '8000'],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Wait for servers to start
        print("Waiting for servers to start...")
        time.sleep(3)

        # Check if both servers are running
        if backend_process.poll() is None and frontend_process.poll() is None:
            print("Backend and frontend servers started successfully!")

            # Open frontend in browser
            print("Opening frontend in browser...")
            webbrowser.open('http://127.0.0.1:8000')

            print("\nDashboard is now running!")
            print("Backend API: http://127.0.0.1:5000")
            print("Frontend: http://127.0.0.1:8000")
            print("\nPress Ctrl+C to stop the servers")

            # Keep the script running to keep servers alive
            try:
                backend_process.wait()
            except KeyboardInterrupt:
                print("\nStopping servers...")
                backend_process.terminate()
                frontend_process.terminate()
                backend_process.wait()
                frontend_process.wait()
                print("Servers stopped.")
        else:
            print("Failed to start servers.")
            if backend_process.poll() is not None:
                stdout, stderr = backend_process.communicate()
                print("Backend STDOUT:", stdout.decode())
                print("Backend STDERR:", stderr.decode())
            if frontend_process.poll() is not None:
                stdout, stderr = frontend_process.communicate()
                print("Frontend STDOUT:", stdout.decode())
                print("Frontend STDERR:", stderr.decode())

    except Exception as e:
        print(f"Error starting application: {e}")

if __name__ == "__main__":
    main()

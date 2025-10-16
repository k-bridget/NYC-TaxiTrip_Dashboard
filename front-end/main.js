// --- CONFIGURATION ---
const API_BASE = "http://127.0.0.1:5000/api"; // Base URL for API calls
let currentTheme = localStorage.getItem("theme") || "light";
let allTrips = []; // Cache for all trips data
let filteredTrips = []; // Cache for filtered trips

// --- INITIAL SETUP ---
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(); // Update the theme icon
  setupListeners(); // set up listeners
  loadSavedFilters(); // Load saved filters from localStorage
  loadAllTrips(); // Load all trips once
  // loadStats() is called after data loads
});

// --- EVENT HANDLERS ---
function setupListeners() {
  // Set up event listeners for various UI elements
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("sidebar-toggle").addEventListener("click", () => toggle("sidebar", "collapsed"));
  document.getElementById("mobile-menu-toggle").addEventListener("click", () => toggle("sidebar", "mobile-open"));
  document.getElementById("apply-filters").addEventListener("click", applyFilters);
  document.getElementById("clear-filters").addEventListener("click", clearFilters);
  document.getElementById("refresh-stats").addEventListener("click", loadStats);
  document.getElementById("reset-charts").addEventListener("click", loadTrips);
}

// --- GENERAL UTILITIES ---
function toggle(id, cls) {
  document.getElementById(id).classList.toggle(cls);
}

function showLoading(on = true) {
  const overlay = document.getElementById("loading-overlay");
  if (on) {
    overlay.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner"></i>
        <p>Loading data...</p>
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
      </div>
    `;
  }
  overlay.classList.toggle("active", on);
}

function showToast(msg, type = "info") {
  // Display toast notification
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle"
  };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 4000); // Remove toast after 4 seconds
}

// --- THEME ---
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme); // Save the theme
  updateThemeIcon(); // Update the icon
  showToast("Theme switched!", "success"); // Show feedback
}

function updateThemeIcon() {
  // Update the theme toggle button icon
  document.getElementById("theme-toggle").innerHTML =
    currentTheme === "light"
      ? '<i class="fas fa-moon"></i> Dark Mode'
      : '<i class="fas fa-sun"></i> Light Mode';
}

// --- DATA LOADING ---
async function loadAllTrips() {
  // Load all trips from local CSV file
  showLoading(true);
  try {
    const res = await fetch('../database/cleaned_trips.csv');
    const csvText = await res.text();
    allTrips = parseCSV(csvText);
    filteredTrips = [...allTrips]; // Initially, filtered trips are all trips
    applySavedFilters(); // Apply saved filters if any
    drawCharts(filteredTrips); // Draw charts with all trips
    loadStats(); // Load initial stats after data is loaded
    showToast("Data loaded successfully!", "success");
  } catch (err) {
    showToast("Failed to load data", "error");
    // Add retry option
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Retry";
    retryBtn.onclick = loadAllTrips;
    document.getElementById("toast-container").appendChild(retryBtn);
  } finally {
    showLoading(false);
  }
}

function parseCSV(csvText) {
  // Parse CSV text into array of trip objects
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const trips = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const trip = {};
      headers.forEach((header, index) => {
        const value = values[index];
        trip[header] = isNaN(value) ? value : parseFloat(value);
      });
      trips.push(trip);
    }
  }
  return trips;
}

async function loadStats() {
  // Calculate stats client-side from filtered trips
  if (filteredTrips.length === 0) {
    document.getElementById("stats-content").innerHTML = `
      ${statCard("fa-route", 0, "Total Trips")}
      ${statCard("fa-clock", "0s", "Avg Duration")}
      ${statCard("fa-road", "0 km", "Avg Distance")}
      ${statCard("fa-tachometer-alt", "0 km/h", "Avg Speed")}
      ${statCard("fa-dollar-sign", "$0.00", "Avg Fare")}
      ${statCard("fa-money-bill-wave", "$0", "Total Fare")}
    `;
    return;
  }

  const totalTrips = filteredTrips.length;
  const avgDuration = filteredTrips.reduce((sum, t) => sum + t.trip_duration, 0) / totalTrips;
  const avgDistance = filteredTrips.reduce((sum, t) => sum + t.distance_km, 0) / totalTrips;
  const avgSpeed = filteredTrips.reduce((sum, t) => sum + t.speed_kmh, 0) / totalTrips;
  const avgFare = filteredTrips.reduce((sum, t) => sum + t.estimated_fare, 0) / totalTrips;
  const totalFare = filteredTrips.reduce((sum, t) => sum + t.estimated_fare, 0);

  document.getElementById("stats-content").innerHTML = `
    ${statCard("fa-route", totalTrips, "Total Trips")}
    ${statCard("fa-clock", avgDuration.toFixed(1) + "s", "Avg Duration")}
    ${statCard("fa-road", avgDistance.toFixed(1) + " km", "Avg Distance")}
    ${statCard("fa-tachometer-alt", avgSpeed.toFixed(1) + " km/h", "Avg Speed")}
    ${statCard("fa-dollar-sign", "$" + avgFare.toFixed(2), "Avg Fare")}
    ${statCard("fa-money-bill-wave", "$" + totalFare.toLocaleString(), "Total Fare")}
  `;
}

function statCard(icon, value, label) {
  // Generate HTML for a statistics card
  return `
  <div class="stat-card fade-in">
    <div class="stat-icon"><i class="fas ${icon}"></i></div>
    <div class="stat-content"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
  </div>`;
}

function loadTrips() {
  // Use cached data for charts
  drawCharts(filteredTrips);
}

function val(id) {
  return document.getElementById(id).value;
}

// --- FILTER PERSISTENCE ---
function loadSavedFilters() {
  // Load saved filter values from localStorage
  const savedFilters = JSON.parse(localStorage.getItem("filters") || "{}");
  Object.keys(savedFilters).forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = savedFilters[id];
  });
}

function saveFilters() {
  // Save current filter values to localStorage
  const filters = {};
  ["start-date", "end-date", "vendor-id", "passenger-count"].forEach(id => {
    filters[id] = val(id);
  });
  localStorage.setItem("filters", JSON.stringify(filters));
}

function applySavedFilters() {
  // Apply saved filters to the data
  const savedFilters = JSON.parse(localStorage.getItem("filters") || "{}");
  if (Object.keys(savedFilters).length > 0) {
    const startDate = savedFilters["start-date"];
    const endDate = savedFilters["end-date"];
    const vendorId = savedFilters["vendor-id"];
    const passengerCount = savedFilters["passenger-count"];

    filteredTrips = allTrips.filter(trip => {
      const tripDate = trip.pickup_datetime.split(" ")[0];
      if (startDate && tripDate < startDate) return false;
      if (endDate && tripDate > endDate) return false;
      if (vendorId && trip.vendor_id != vendorId) return false;
      if (passengerCount && trip.passenger_count != passengerCount) return false;
      return true;
    });
  }
}

// --- FILTERS ---
function applyFilters() {
  // Apply client-side filters to cached data
  const startDate = val("start-date");
  const endDate = val("end-date");
  const vendorId = val("vendor-id");
  const passengerCount = val("passenger-count");

  filteredTrips = allTrips.filter(trip => {
    const tripDate = trip.pickup_datetime.split(" ")[0];
    if (startDate && tripDate < startDate) return false;
    if (endDate && tripDate > endDate) return false;
    if (vendorId && trip.vendor_id != vendorId) return false;
    if (passengerCount && trip.passenger_count != passengerCount) return false;
    return true;
  });

  saveFilters(); // Save filters to localStorage
  loadStats(); // Update stats with filtered data
  loadTrips(); // Update charts with filtered data
  showToast("Filters applied!", "success");
}

function clearFilters() {
  // Clear all filter inputs and reset to all data
  ["start-date", "end-date", "vendor-id", "passenger-count"].forEach(id => (document.getElementById(id).value = ""));
  localStorage.removeItem("filters"); // Clear saved filters
  filteredTrips = [...allTrips];
  loadStats();
  loadTrips();
  showToast("Filters cleared!", "info");
}

// --- CHARTS ---
function drawCharts(trips) {
  // Draw charts with fade-in animation
  const ctx = id => document.getElementById(id);
  Chart.helpers.each(Chart.instances, c => c.destroy());

  // Duration histogram
  const durations = trips.map(t => t.trip_duration);
  const durationData = Object.values(groupBy(durations.map(d => Math.floor(d / 300) * 5), "duration"));
  new Chart(ctx("duration-histogram"), barConfig(durationData.labels, durationData.counts, "rgba(59,130,246,0.8)"));

  // Passenger count distribution
  const passengers = groupBy(trips.map(t => t.passenger_count));
  new Chart(ctx("passenger-distribution"), barConfig(Object.keys(passengers), Object.values(passengers), "rgba(16,185,129,0.8)"));

  // Time series
  const timeSeries = groupBy(trips.map(t => t.pickup_datetime.split(" ")[0]));
  new Chart(ctx("time-series"), lineConfig(Object.keys(timeSeries), Object.values(timeSeries)));

  // Distance vs. Estimated Fare scatter plot
  const scatter = trips.map(t => ({ x: t.distance_km, y: t.estimated_fare }));
  new Chart(ctx("distance-fare-scatter"), scatterConfig(scatter));

  // Add fade-in class to chart containers
  document.querySelectorAll('.chart-container').forEach(container => {
    container.classList.add('fade-in');
  });
}

// --- CHART HELPERS ---
function groupBy(arr) {
  // Group items in an array by their value
  return arr.reduce((acc, v) => ((acc[v] = (acc[v] || 0) + 1), acc), {});
}

function barConfig(labels, data, color) {
  // Configuration for bar charts
  return {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: color }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  };
}

function lineConfig(labels, data) {
  // Configuration for line charts
  return {
    type: "line",
    data: { labels, datasets: [{ data, borderColor: "rgba(245,101,101,1)", fill: true }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  };
}

function scatterConfig(data) {
  // Configuration for scatter plots
  return {
    type: "scatter",
    data: { datasets: [{ data, backgroundColor: "rgba(139,92,246,0.7)" }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { title: { text: "Distance (km)" } }, y: { title: { text: "Fare ($)" } } }
    }
  };
}

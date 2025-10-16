// --- CONFIGURATION ---
const API_BASE = "/api"; // Base URL for API calls
let currentTheme = localStorage.getItem("theme") || "light";

// --- INITIAL SETUP ---
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(); // Update the theme icon
  setupListeners(); // set up listeners
  loadAllData(); // Load data
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
  document.getElementById("loading-overlay").classList.toggle("active", on);
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
async function loadAllData() {
  // Load all data (statistics and trips)
  showLoading(true);
  await Promise.all([loadStats(), loadTrips()]);
  showLoading(false);
}

async function loadStats() {
  // Show statistics from the API
  try {
    const params = new URLSearchParams({
      start_date: val("start-date"),
      end_date: val("end-date"),
      vendor_id: val("vendor-id"),
      passenger_count: val("passenger-count")
    });
    const res = await fetch(`${API_BASE}/stats?${params}`);
    const s = await res.json();
    document.getElementById("stats-content").innerHTML = `
      ${statCard("fa-route", s.total_trips, "Total Trips")}
      ${statCard("fa-clock", s.avg_duration.toFixed(1) + "s", "Avg Duration")}
      ${statCard("fa-road", s.avg_distance.toFixed(1) + " km", "Avg Distance")}
      ${statCard("fa-tachometer-alt", s.avg_speed.toFixed(1) + " km/h", "Avg Speed")}
      ${statCard("fa-dollar-sign", "$" + s.avg_fare.toFixed(2), "Avg Fare")}
      ${statCard("fa-money-bill-wave", "$" + s.total_fare.toLocaleString(), "Total Fare")}
    `;
  } catch (err) {
    showToast("Failed to load stats", "error"); // Show error if fetching fails
  }
}

function statCard(icon, value, label) {
  // Generate HTML for a statistics card
  return `
  <div class="stat-card fade-in">
    <div class="stat-icon"><i class="fas ${icon}"></i></div>
    <div class="stat-content"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
  </div>`;
}

async function loadTrips() {
  // Fetch and display trips from the API based on filters
  try {
    const params = new URLSearchParams({
      start_date: val("start-date"),
      end_date: val("end-date"),
      vendor_id: val("vendor-id"),
      passenger_count: val("passenger-count")
    });
    const res = await fetch(`${API_BASE}/trips?${params}`);
    const trips = await res.json();
    if (!trips.length) return showToast("No trips found", "warning"); // Notify if no trips are found
    drawCharts(trips); // Draw charts with the trip data
  } catch (err) {
    showToast("Error loading trips", "error"); // Show error if fetching fails
  }
}

function val(id) {
  return document.getElementById(id).value;
}

// --- FILTERS ---
function applyFilters() {
  // Apply filters and reload trips and stats
  showLoading(true);
  Promise.all([loadStats(), loadTrips()]).finally(() => showLoading(false));
}

function clearFilters() {
  // Clear all filter inputs
  ["start-date", "end-date", "vendor-id", "passenger-count"].forEach(id => (document.getElementById(id).value = ""));
  Promise.all([loadStats(), loadTrips()]); // Reload trips and stats with cleared filters
}

// --- CHARTS ---
function drawCharts(trips) {
  // Draw charts
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

const API_KEY = 'AIzaSyDbrn3kk4Xt27VcbCy7peieOcB8YzIgPWA';
const loader = document.getElementById('loader');
const analyticsGrid = document.getElementById('analyticsGrid');
const searchButton = document.getElementById('searchButton');
const channelInput = document.getElementById('channelInput');

// RPM Rates
const RPM_RATES = {
  'US': 7.53, // United States
  'GB': 5.62, // United Kingdom
  'NZ': 5.56, // New Zealand
  'AE': 2.33, // United Arab Emirates
  'PK': 2.5,  // Pakistan
  'IN': 2.5   // India
};

// Hide loader when page is fully loaded
window.addEventListener('load', () => {
  loader.style.display = 'none';
});

// Fetch Channel Data
async function fetchChannelData(query) {
  try {
    // Step 1: Search for the channel
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();
    const channelId = searchData.items[0].id.channelId;

    // Step 2: Fetch channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,status,brandingSettings&id=${channelId}&key=${API_KEY}`
    );
    const channelData = await channelResponse.json();
    return channelData.items[0];
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Display Analytics
function displayAnalytics(data) {
  const snippet = data.snippet;
  const statistics = data.statistics;
  const brandingSettings = data.brandingSettings;
  const status = data.status;

  const revenue = calculateRevenue(statistics.viewCount, snippet.country);

  analyticsGrid.innerHTML = `
    <div class="analytics-card"><strong>Channel ID:</strong> ${data.id}</div>
    <div class="analytics-card"><strong>Channel Title:</strong> ${snippet.title}</div>
    <div class="analytics-card"><strong>Description:</strong> ${snippet.description || 'N/A'}</div>
    <div class="analytics-card"><strong>Custom URL:</strong> ${brandingSettings.channel.customUrl || 'N/A'}</div>
    <div class="analytics-card"><strong>Subscribers:</strong> ${statistics.subscriberCount || 'N/A'}</div>
    <div class="analytics-card"><strong>Video Count:</strong> ${statistics.videoCount}</div>
    <div class="analytics-card"><strong>Views:</strong> ${statistics.viewCount}</div>
    <div class="analytics-card"><strong>Created:</strong> ${new Date(snippet.publishedAt).toLocaleDateString()}</div>
    <div class="analytics-card"><strong>Profile Picture:</strong> <img src="${snippet.thumbnails.high.url}" alt="Profile Picture" width="100"></div>
    <div class="analytics-card"><strong>Country:</strong> ${snippet.country || 'N/A'}</div>
    <div class="analytics-card"><strong>Status:</strong> ${status.isLinked ? 'Active' : 'Inactive'}, ${status.verified ? 'Verified' : 'Not Verified'}</div>
    <div class="analytics-card"><strong>Related Playlists:</strong> ${data.contentDetails?.relatedPlaylists?.uploads || 'N/A'}</div>
    <div class="analytics-card"><strong>Keywords:</strong> ${brandingSettings.channel.keywords || 'N/A'}</div>
    <div class="analytics-card revenue"><strong>Total Revenue:</strong> $${revenue.toFixed(2)}</div>
  `;
}

// Calculate Revenue
function calculateRevenue(views, country) {
  const rpm = RPM_RATES[country] || 2.5; // Default RPM for unspecified countries
  return (views / 1000) * rpm;
}

// Initialize Charts
function initializeCharts() {
  const ctx1 = document.getElementById('subscriberChart').getContext('2d');
  const ctx2 = document.getElementById('videoUploadsChart').getContext('2d');
  const ctx3 = document.getElementById('viewsChart').getContext('2d');
  const ctx4 = document.getElementById('revenueChart').getContext('2d');
  const ctx5 = document.getElementById('engagementChart').getContext('2d');
  const ctx6 = document.getElementById('demographicsChart').getContext('2d');

  new Chart(ctx1, { type: 'line', data: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Subscribers', data: [100, 200, 300], borderColor: '#00ffcc', fill: false }] } });
  new Chart(ctx2, { type: 'bar', data: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Video Uploads', data: [5, 10, 15], backgroundColor: '#6a11cb' }] } });
  new Chart(ctx3, { type: 'pie', data: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Views', data: [1000, 2000, 3000], backgroundColor: ['#2575fc', '#6a11cb', '#00ffcc'] }] } });
  new Chart(ctx4, { type: 'doughnut', data: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Revenue', data: [500, 1000, 1500], backgroundColor: ['#ff4d4d', '#ffcc00', '#00ffcc'] }] } });
  new Chart(ctx5, { type: 'radar', data: { labels: ['Engagement'], datasets: [{ label: 'Engagement', data: [70], backgroundColor: 'rgba(0, 255, 204, 0.2)' }] } });
  new Chart(ctx6, { type: 'polarArea', data: { labels: ['Male', 'Female'], datasets: [{ label: 'Demographics', data: [60, 40], backgroundColor: ['#6a11cb', '#2575fc'] }] } });
}

// Event Listener for Search Button
searchButton.addEventListener('click', async () => {
  const query = channelInput.value.trim();
  if (!query) return alert('Please enter a channel name or URL.');

  // Show loader
  loader.style.display = 'flex';

  try {
    const data = await fetchChannelData(query);
    if (data) {
      displayAnalytics(data);
      initializeCharts();
    } else {
      alert('Channel not found or API error.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while fetching data.');
  } finally {
    // Hide loader
    loader.style.display = 'none';
  }
});
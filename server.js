const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// ---- API: the catalog (this is our "storage") ----
const CATALOG_PATH = path.join(__dirname, 'data', 'videos.json');

function readCatalog() {
  try {
    const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read videos.json:', err.message);
    return { channels: [], videos: [] };
  }
}

// Full catalog (channels + videos)
app.get('/api/catalog', (req, res) => {
  res.json(readCatalog());
});

// Just the videos
app.get('/api/videos', (req, res) => {
  res.json(readCatalog().videos || []);
});

// Just the channels
app.get('/api/channels', (req, res) => {
  res.json(readCatalog().channels || []);
});

// Health check (Render uses this to know the app is alive)
app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`📺 DWIM TV is live on port ${PORT}`);
});

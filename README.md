# 📺 DWIM TV

A TV-style streaming web app that runs entirely on **Render's free tier** — with a built-in solution for the "where do I store videos?" problem.

**New:** Custom logo, plus an **Admin Panel** (`/admin.html`) — log in and add videos by YouTube URL straight from your browser. Changes are saved to the catalog **and auto-committed back to your GitHub repo**, so they survive Render free-tier restarts.

## The Big Idea (read this first!)

Render's free tier has **ephemeral storage** — any video file you upload to the server gets wiped on every redeploy. Uploading a 500MB video through Render would also be painful and slow.

**DWIM TV solves this differently:** the app stores *no video files*. Instead, it streams everything from external sources:

- **YouTube embeds** — you add any YouTube video by its URL
- **Vimeo/Dailymotion embeds** — generic iframe support
- **Direct MP4/HLS links** — e.g. files hosted on GitHub Releases, Cloudflare R2, Internet Archive, or any public file host
- **Internet Archive films** — thousands of free public-domain movies (archive.org)

Your catalog lives in one small JSON file (`data/videos.json`). To add videos, you edit that file and push. **No video ever touches Render.** Render only serves a ~2MB app; the video bytes stream directly from YouTube/wherever to your viewer's browser.

## Quick Start (local)

```bash
npm install
npm start
# → http://localhost:3000
```

## Deploy to Render (free tier) — 5 steps

1. Push this folder to a GitHub repo (public or private).
2. On [render.com](https://render.com) → **New → Web Service**.
3. Connect the repo. Render reads `render.yaml` automatically, but if it asks:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
   - **Plan:** Free
4. Deploy. Done — you get `https://dwim-tv.onrender.com` (or your custom name).
5. Keep it alive: free tier services sleep after 15 min of inactivity. A free uptime pinger ([cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com)) pinging `https://YOURAPP.onrender.com/healthz` every 10 minutes prevents sleep.

## How to add videos (never touch Render!)

This is the part you asked about. **You never upload videos to Render.** Instead:

### Option 0 — the Admin Panel (easiest, no code!)

1. Open `https://YOURAPP.onrender.com/admin.html` (also linked in the site footer).
2. Log in — default credentials: **username `ntando`, password `ntando`**.
3. Paste any YouTube URL or video ID → click **Check** → the real title & channel are fetched from YouTube.
4. Pick a channel (or create a new one on the fly), hit **Add Video** — done.
5. The video appears on the site instantly, and the catalog change is **committed back to your GitHub repo automatically** (if you set `GITHUB_TOKEN` — see below).

> **Render free-tier note:** the disk is wiped on every redeploy. The admin panel handles this for you: every add/delete writes the catalog to disk *and* pushes it to GitHub, so when Render rebuilds from your repo, your videos are still there. Without `GITHUB_TOKEN`, changes live only until the next restart.

**Admin credentials** come from environment variables (set them in Render → Environment):

```
ADMIN_USER=ntando
ADMIN_PASS=ntando
GITHUB_TOKEN=ghp_xxxxxxxxxxxx        # a token with repo write access
GITHUB_REPO=mrnt4ndo/dwim-tv         # owner/name
GITHUB_BRANCH=main
```

> ⚠️ Change `ADMIN_PASS` before going public! The defaults are for testing.

### 1. YouTube videos (manual way)

Add an entry to `data/videos.json`:

```json
{
  "id": "v13",
  "title": "My Video Title",
  "channel": "ch-movies",
  "category": "Movies",
  "type": "youtube",
  "source": "https://www.youtube.com/watch?v=VIDEO_ID_HERE",
  "duration": "12:34",
  "thumb": "https://i.ytimg.com/vi/VIDEO_ID_HERE/hqdefault.jpg",
  "desc": "A short description of the video.",
  "tags": ["whatever", "you", "want"]
}
```

The thumbnail URL pattern `https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg` works for almost every video.

### 2. Your OWN video files (still without touching Render)

Host the actual `.mp4` file somewhere free that allows hotlinking:

| Host | Free tier | Hotlinking | How |
|------|-----------|------------|-----|
| **GitHub Releases** | 2GB/file | ✅ yes | Upload in repo → Releases → copy "asset" URL |
| **Internet Archive** | unlimited | ✅ yes | archive.org → upload → copy MP4 link |
| **Cloudflare R2** | 10GB | ✅ yes | Needs card, but no charge at low usage |
| **Google Drive** | 15GB | ⚠️ hacky | Needs redirect trick, breaks often — avoid |

Then add the entry with `"type": "direct"`:

```json
{
  "id": "v14",
  "title": "My Home Video",
  "channel": "ch-movies",
  "category": "Movies",
  "type": "direct",
  "source": "https://github.com/YOURNAME/YOURREPO/releases/download/v1/myvideo.mp4",
  "duration": "5:00",
  "thumb": "https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg",
  "desc": "Description here."
}
```

For thumbnails of your own videos, upload a JPG to the repo (e.g. `public/img/myvideo.jpg`) and use `/img/myvideo.jpg` as the `thumb`.

### 3. Vimeo / Dailymotion / Twitch embeds

```json
{
  "id": "v15",
  "title": "A Vimeo Film",
  "channel": "ch-movies",
  "category": "Movies",
  "type": "embed",
  "source": "https://player.vimeo.com/video/123456789",
  "duration": "10:00",
  "thumb": "https://i.vimeocdn.com/video/THUMB_ID.jpg",
  "desc": "Description."
}
```

### 4. Commit & push — that's the deploy

Editing `videos.json` on GitHub (even via the web editor on your phone) and committing automatically triggers a redeploy with your new catalog. **You never open Render.**

## Adding channels

Channels are also in `data/videos.json`. Add one like:

```json
{ "id": "ch-anime", "name": "Anime", "icon": "🌀" }
```

…then use `"channel": "ch-anime"` on videos.

## Project structure

```
dwim-tv/
├── server.js            # Express server + catalog API + admin auth & GitHub sync
├── package.json
├── render.yaml          # Render blueprint (free plan)
├── Procfile             # Fallback for other hosts (Heroku-style)
├── data/
│   └── videos.json      # ⭐ YOUR CATALOG — edit this to add videos (or use the admin panel)
└── public/
    ├── index.html       # TV-style UI
    ├── admin.html       # 🔐 Admin panel (login + add/delete videos)
    ├── css/styles.css   # Dark cinematic theme
    ├── css/admin.css    # Admin panel styles
    ├── js/app.js        # Channels, search, player logic
    ├── js/admin.js      # Admin panel logic
    └── img/             # Logo, favicons & local thumbnails
```

## Tips

- **Live streams** work too (e.g. Lofi Girl): just add the stream URL and set `"duration": "24/7"`.
- **Start times**: add `"t": 30` to any video to make it start at 30 seconds in.
- **Copyright**: only stream videos you have the right to embed. YouTube's embed feature is provided by the uploader; if a video shows "embedding disabled", it won't play in the app — pick another upload.
- **Free tier limits**: 750 hours/month of runtime — that's plenty for a hobby TV app.

## License

MIT — do whatever you want. Demo catalog content is open-source films by the Blender Foundation (CC-BY) and publicly available streams.

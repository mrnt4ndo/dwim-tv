# DWIM TV — Build & Deploy Prep

## Core App
- [x] Scaffold Express server (server.js, package.json, Procfile)
- [x] Render blueprint (render.yaml: free plan, health check /healthz)
- [x] TV-style UI (index.html, styles.css, app.js — dark cinematic theme)
- [x] JSON catalog system (data/videos.json — the "no storage needed" workaround)
- [x] 12 verified videos across 6 channels (all YouTube IDs verified via oEmbed)
- [x] Local thumbnail for live stream (public/img/lofi-thumb.jpg)
- [x] README with deploy guide + how to add videos without touching Render

## Verification
- [x] /healthz returns 200 "ok" (Render health check requirement)
- [x] /api/catalog serves valid JSON (12 videos, 6 channels)
- [x] Browser test: UI renders, all 12 cards with thumbnails, hero, channels
- [x] Browser test: player modal opens with correct title/category/duration/desc
- [x] Escape key closes modal

## Delivery
- [x] Package into zip (dwim-tv.zip, node_modules excluded)
- [x] Final screenshot captured (dwim-tv-screenshot.png)

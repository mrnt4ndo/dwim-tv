# DWIM TV — Logo + Admin Panel

## Logo
- [x] Generate DWIM TV logo (wordmark + square icon)
- [x] Integrate into header, favicon, footer

## Admin Panel (user: ntando / pass: ntando)
- [x] Server: auth (login/session), admin APIs (list/add/delete videos)
- [x] Video add: parse YouTube ID → verify via oEmbed → save to catalog
- [x] Persistence: write disk + auto-commit to GitHub via API (survives Render free-tier resets)
- [x] Admin UI page (login + dashboard, site-styled)
- who can add videos id via site
- [x] Link admin from footer + favicon routes

## Test & Ship
- [x] Test login, add video (end-to-end incl. GitHub commit), delete video
- [x] Verify main site renders logo + new video
- [x] GitHub sync of catalog changes back to repo
- [x] Update README (admin usage + GITHUB_TOKEN setup)
- [x] Commit, push, refresh zip

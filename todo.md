# DWIM TV — Add Church Videos

## Research (verify every ID via oEmbed — no fabricated IDs)
- [x] Find T.B. Joshua early ministry videos (14 candidates found)
- [x] Find other classic ministry videos (Munroe, Billy Graham)
- [x] Verify all IDs via YouTube oEmbed API + durations from YT search cards

## Catalog Update
- [x] Add "Church" channel
- [x] Add verified videos to data/videos.json (regenerate via Python script)

## Test & Ship
- [x] Verify /api/catalog serves new content
- [x] Browser check: Church channel + cards render
- [x] Commit and push to GitHub (Render auto-redeploys)
- [x] Refresh zip package

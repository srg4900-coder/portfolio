# Where things live

## Served by the site (`assets/`) — paths are referenced in code, rename carefully
| Folder | What | Used by |
|---|---|---|
| `assets/papers/` | the 4 homepage paper graphics (taped, hole-punched, polaroid, blue) | `css/main.css` |
| `assets/backgrounds/` | `full_paper_clear.webp` = hero background (original PNG in ~/dev/port_dev_source/backgrounds/) | `css/main.css` |
| `assets/case-studies/art-direction/` | `ad-01…05.jpg` web-sized case-study images | `js/project.js` (PROJECTS) |
| `assets/cursor/` | `wave-1…4.svg` + `thumbs-up-1…2.svg` hand-gesture cursor frames (Figma "Animated Hands Gestures"; original zips in ~/dev/port_dev_source/cursor-hands/) | `js/cursor.js` |
| `assets/video/` | `jacket-love-story.mp4` web-sized case-study video | `js/project.js` |

## Originals — moved OUT of the project to `~/dev/port_dev_source/`
Full-res art-direction images, the raw ~380MB Jacket Love Story footage, and
paper-texture PSDs. Not used by the site; export web versions into `assets/`.

## Other
- `mindcloud/` — Mind Cloud pages (`/mindcloud/` view, `/mindcloud/add` PIN form)
- `functions/api/` — Mind Cloud backend (Cloudflare Pages Function + D1). Setup: `MINDCLOUD_SETUP.md`
- `_redirects` — old `/mindcloud/public/...` URLs → new ones
- Local-only Mind Cloud server + old JSON data + DB seed SQL: `~/dev/port_dev_source/mindcloud-local/` (never deploy — not in this folder on purpose)

# Where things live

## Served by the site (`assets/`) — paths are referenced in code, rename carefully
| Folder | What | Used by |
|---|---|---|
| `assets/papers/` | the 4 homepage paper graphics (taped, hole-punched, polaroid, blue) | `css/main.css` |
| `assets/backgrounds/` | `full_paper_clear.png` = hero background | `css/main.css` |
| `assets/case-studies/art-direction/` | `ad-01…05.jpg` web-sized case-study images | `js/project.js` (PROJECTS) |
| `assets/video/` | `jacket-love-story.mp4` web-sized case-study video | `js/project.js` |

## Originals — moved OUT of the project to `~/dev/port_dev_source/`
Full-res art-direction images, the raw ~380MB Jacket Love Story footage, and
paper-texture PSDs. Not used by the site; export web versions into `assets/`.

## Other
- `mindcloud/` — separate Mind Cloud app linked from the nav

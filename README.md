# Jaksel Weekend Strolls

Weekly Sat/Sun combo itineraries for Jakarta Selatan, with TikTok proof carousels.

The **public hub** (`/` and `/combo/[id]`) auto-assembles live combos from **Candidate Queue** rows already in Supabase. Google Maps rows gathered by browser lookup are preferred; OpenStreetMap (Overpass / Geofabrik / HOT) stays as the fallback. Admin approve is optional — there is no approve gate for public. The old M1 dummy pack (`content/packs/2026-W38.json`, Seto / Obihiro / JDW) is **draft archive** and is not served.

M2 is the **free Candidate Queue**: OpenStreetMap Overpass discovery (not Google Places), Supabase storage, and a dark ink + coral admin UI.

M2.5 enriches that queue from **Geofabrik** (bulk OSM) and **HOT Indonesia POIs**, attaches **Mapillary** street photos, and plays **official TikTok embeds** when a candidate has a real `tiktok.com/@…/video/…` URL.

## Run locally

```bash
cp .env.example .env.local
# fill every name listed in .env.example — never commit real values
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Production-style (preferred for Cloudflare tunnels):

```bash
npm run build
npm run start
```

Phone testing from this environment uses a Cloudflare quick tunnel:

```bash
cloudflared tunnel --url http://localhost:3000
```

Local admin login uses `ADMIN_SECRET` from `.env.local` (not committed).

## Routes

| Route | What you get |
| --- | --- |
| `/` | Hub — finite weekend pack (≤4 strolls), Sat/Sun path tickets, vibe chips, saved strolls |
| `/combo/[id]` | Combo detail — day math, hours hints, walk gaps, Save/Share, rain swap, sticky Maps start, TikTok carousel |
| `/admin` | Editor login (ADMIN_SECRET → httpOnly cookie) |
| `/admin/queue` | Candidate Queue — counts, filters, bulk approve/reject, Mapillary thumbs |
| `/admin/candidates/[id]` | Candidate detail — photo, OSM links, draft why/tip, status |
| `/admin/discover` | On-demand Overpass refresh + notes for bulk import |

Live combo ids (assembled from queue areas, not dummy JSON):

- `blok-m-food` (Sat pairing — higher-energy food cluster)
- `cipete-cafes` (Sun pairing — café / soft)
- `tebet-stroll`
- `scbd-senopati-light`
- `pi-indoor`

## Content

Public `/` and `/combo/[id]` call `assembleLivePack()` against Candidate Queue rows. **Approved / rejected / new / need_tiktok do not gate the public hub** — those statuses are admin discovery tools only. Out-of-Jaksel (Alam Sutera) rows are skipped. Each public stop needs a **Mapillary** `photo_url` (or `/api/mapillary/{id}`, or another stored photo URL) and a Maps link. When `gmaps_place_url` is set, that place URL is the stop link; otherwise the hub uses `https://www.google.com/maps/search/?api=1&query=LAT,LNG` (or `query=name+area` if coords are missing). Walking directions still use stop coordinates. If `GOOGLE_MAPS_API_KEY` / Places Photo is in env it is preferred; otherwise Mapillary. Stops with neither photo nor Maps URL are omitted.

TikToks are real watch URLs stored on `candidates.tiktok_urls` (open-web search, not Google Maps scrape). No `@jaksel.strolls` placeholders on the public hub. If a place has no matching short, that stop is omitted or the TikTok slot is skipped.

Hub combo cards (when a combo has TikTok URLs) and combo-detail stop TikToks share one **horizontal snap carousel**: one portrait clip per full content width (`scroll-snap-type: x mandatory`, each slide `scroll-snap-align: center`, ~390px − padding, 9:16-ish). Only the **active/visible** slide mounts the official TikTok player (`player/v1` with `autoplay=1`, `muted=1`, `loop=1`); other slides unload to a Mapillary poster. Dots plus a `1 / 3` counter sit under the track. After `onPlayerReady` the host `postMessage`s `mute` then `play`. Tap/click the video (or overlay) opens the TikTok watch URL — iframe chrome is `pointer-events-none` so users are not trapped. The iframe `allow` list is `autoplay; encrypted-media; fullscreen; picture-in-picture`.

The hub is a **finite weekend pack** (pairing Sat/Sun plus up to two more strongest combos, max 4). Combo cards and the combo page show honest day math (`3 stops · ~XX min walk · Half-day loop` / `One-corridor crawl`). Walk gaps between consecutive stops use Haversine at ~4.5 km/h. **Start this stroll** opens an official Maps walking directions URL (`/dir/?api=1&travelmode=walking`) when two or more stops have coords.

Muted autoplay is required by Chrome/Android. **iOS Safari** (Low Power Mode, ITP, or in-app WebViews) can still block iframe autoplay even when muted — error `onPlayerError` in that case; the tile stays tappable. Desktop Chrome usually plays muted.

`content/packs/2026-W38.json` is leftover M1 seed (`status: "draft"`) and is not read by the hub.

## Data stack (Google Maps lookup + OpenStreetMap + Mapillary)

There is no paid Google Places API. Google rows are gathered in the browser and imported as JSON or CSV (`source=google_maps`). OpenStreetMap (ODbL) remains the fallback, plus optional Mapillary photos (CC-BY-SA).

| Source | When | `candidates.source` |
| --- | --- | --- |
| **Google Maps browser lookup** | `npm run import:gmaps` from a JSON/CSV file. Upserts on `gmaps_ftid`. | `google_maps` |
| **Overpass** | On-demand `/admin/discover` (and Next.js fallback if Edge IPs get HTTP 406) | `osm` |
| **Geofabrik Java PBF** | CLI bulk import, clipped to Jaksel + SCBD/Senopati + Alam Sutera | `geofabrik` |
| **HOT Indonesia POIs** | CLI best-effort HDX GeoJSON (skipped cleanly if the export is awkward) | `hot` |
| **Mapillary** | Nearest image per lat/lng when token is injected | `photo_url` + `mapillary` jsonb |

**Areas**: Blok M / Melawai, Cipete / Kemang, **Tebet**, **Fatmawati / Pondok Indah**, **SCBD / Senopati** (light box), **Alam Sutera** (tagged `out-of-jaksel`), **Glodok** (day trip, off by default).

**Place types** from OSM tags: `cafe`, `restaurant`, `fast_food`, `bakery` (`shop=bakery|pastry`), `ice_cream`, `bar` (soft stop), `mall` / department store, `marketplace`, and named `tourism=attraction` (opt-in on Discover; included in bulk).

Dedup is on OSM `source_id` (`node/123`, `way/456`) across Overpass, Geofabrik, and HOT. Inserts are new rows only — **approved / rejected / need_tiktok rows are never overwritten**.

Geofabrik does not publish a Jakarta-only PBF. The bulk script downloads [Java `java-latest.osm.pbf`](https://download.geofabrik.de/asia/indonesia/java.html) (~850MB) once into `data/cache/`, clips the bbox, filters stroll amenities/shops, and upserts with stable `source_id`. Rows already present under any source (same OSM id) are skipped.

### Bulk import

Needs `osmium-tool` (`sudo apt-get install osmium-tool`).

```bash
npm run import:bulk
```

Photos only (after candidates exist):

```bash
npm run import:photos
```

Mapillary reads `MAPILLARY_ACCESS_TOKEN` from process env (Next + CLI) and `Deno.env` (candidates Edge Function). The parent Cloud Agent environment injects that name (it should appear in `CLOUD_AGENT_INJECTED_SECRET_NAMES`). Secrets added after a run starts are not visible until a new run. Also set the same name as a Supabase Function secret (`supabase secrets set MAPILLARY_ACCESS_TOKEN=…`) so `fetch_photos` can run on Edge.

If the token is missing, nothing hangs:

- `/admin/discover` shows a coral error immediately and disables “Enrich Mapillary photos”
- `npm run import:photos` logs a skip and exits
- Edge `fetch_photos` returns `{ skipped: true, error }` without calling Mapillary

The Next `/api/mapillary/[id]` route proxies thumbnails so signed CDN URLs are not stored. No token is committed.

Overpass stays the refresh path for `/admin/discover`. Some Overpass mirrors return **406** from AWS Edge IPs; the Next action tries the Function first, then fetches OSM from the app server and posts elements into `discover`.

RLS is on; `anon` has **no** policies (and no table grants). The Next `/admin/*` UI talks to Functions from the server using `ADMIN_SECRET`. Do not put `service_role` in the browser.

The import script does **not** call Google. It reads a file you already gathered. TikTok watch URLs are found on the open web and stored on `candidates.tiktok_urls`. The public hub is assembled at request time from those rows (no WeekendPack JSON write).

### Google Maps import

`scripts/import-gmaps.mjs` accepts a JSON array (or `{ "places": [ ... ] }`) or a CSV with a header row. Required fields: `name`, `area_key`, `lat`, `lng`, `ftid`. Also accepted: `area_label`, `place_url`, `category`, `address`, `rating`, `review_count`, `price_range`, `kg_id`, `looked_up`, `tiktok_urls`, `draft_why`, `draft_tip`, `tags`.

Hours can be:

- a text blob (`hours` or `hours_text`), such as `Daily 07:00-22:00` or `Mon-Thu & Sun 06:00-22:00, Fri-Sat 06:00-24:00`
- an OSM spec already (`Mo-Su 07:00-22:00`)
- a per-day map (`hours` object, or a JSON object in the CSV cell): `{ "mon": "06:00-22:00", "fri": "06:00-24:00" }` or `{ "monday": { "open": "10:00", "close": "22:00" } }`

Categories in Indonesian or English map onto the existing buckets: Kafe / Cafe → `cafe`, Kedai Kopi / Coffee shop → `cafe`, Restoran / Restaurant → `restaurant`, Toko Es Krim / Ice cream shop → `ice_cream`, Toko Roti / Bakery → `bakery`, Pusat Perbelanjaan / Shopping mall → `mall`, Taman / Park → `attraction`, plus warung, pasar, and bar. The script converts hours to OSM `opening_hours`, stores them on `raw.opening_hours` and `raw.google_maps`, and drafts `draft_why` / `draft_tip` only when those fields are empty. An existing why, tip, TikTok list, or photo is kept on upsert. Mapillary runs when `MAPILLARY_ACCESS_TOKEN` is set and the row has no photo yet.

```bash
npm run import:gmaps -- places.json
node scripts/import-gmaps.mjs --dry-run places.csv
```

`--dry-run` prints the mapped rows and does not write to Supabase. A real import needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ADMIN_SECRET`. The candidates function action is `upsert_gmaps`.

## Env

See `.env.example` (names only). **Vercel** (Project Settings → Environment Variables) needs:

| Name | Where | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser + server) | Yes — live hub |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes — live hub |
| `NEXT_PUBLIC_SITE_URL` | Public | No — OG/canonical; falls back to `VERCEL_URL` |
| `ADMIN_SECRET` | Server-only | Yes — public assemble (Edge `x-admin-secret`) and `/admin` |
| `MAPILLARY_ACCESS_TOKEN` | Server-only | No — photo proxy; hub works if `photo_url` already stored |
| `GOOGLE_MAPS_API_KEY` | Server-only | No — unused unless a Places photo URL is already on the row |

`npm run build` does not call the queue. Missing env at **runtime** degrades `/` to an empty weekend pack instead of crashing.

## Out of scope

Paid Google Places API, M3 AI ask, blok-m-msme merge. Browser lookups are imported as files; the app does not fetch Google.

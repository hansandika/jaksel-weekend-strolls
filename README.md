# Jaksel Weekend Strolls

Weekly Sat/Sun combo itineraries for Jakarta Selatan, with TikTok proof carousels.

M1 is the public hub: a static, content-driven Next.js app (hub + combo detail) seeded from a live week pack.

M2 adds a **free Candidate Queue**: OpenStreetMap Overpass discovery (not Google Places), Supabase storage, and a dark ink + coral admin UI. Discovery never auto-publishes into the weekend pack JSON.

M2.5 enriches that queue from **Geofabrik** (bulk OSM) and **HOT Indonesia POIs**, attaches **Mapillary** street photos, and plays **official TikTok embeds** when a combo URL is a real video.

## Run locally

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_ANON_KEY + ADMIN_SECRET
# MAPILLARY_ACCESS_TOKEN — parent Cloud Agent injects this; never commit it
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

Demo admin secret: `jaksel-m2-dev-secret`

## Routes

| Route | What you get |
| --- | --- |
| `/` | Hub — W38 badge, Jakarta Dessert Week chip, disabled AI ask bar, 4 combo cards, Sat/Sun pairing |
| `/combo/[id]` | Combo detail — meta chips, stop roles, horizontal TikTok carousel + dots, tip, rain notes |
| `/admin` | Editor login (ADMIN_SECRET → httpOnly cookie) |
| `/admin/queue` | Candidate Queue — counts, filters, bulk approve/reject, Mapillary thumbs |
| `/admin/candidates/[id]` | Candidate detail — photo, OSM links, draft why/tip, status |
| `/admin/discover` | On-demand Overpass refresh + notes for bulk import |

Seeded combo ids:

- `cafe-mall-vietnam`
- `blok-m-food-flex`
- `soft-sunday-cipete`
- `rain-indoor-pi`

## Content

Live pack: `content/packs/2026-W38.json` (`status: "live"`).

Each combo includes `tiktokUrls[]`. If a URL looks like a real TikTok (`tiktok.com/@user/video/{id}` and is not a `@jaksel.strolls` placeholder), the **hub card** and **combo carousel** mount the official TikTok player (`player/v1` with `autoplay=1`, `muted=1`, `loop=1`, plus `music_info` / `description` on the combo slide). Hub uses a compact player (info chrome off) on the first real clip when that card is on screen. The carousel autoplays the **visible/active** slide only and unloads offscreen iframes so only one clip plays. After `onPlayerReady` the host `postMessage`s `mute` then `play` (TikTok’s player API). The iframe `allow` list is `autoplay; encrypted-media; fullscreen; picture-in-picture`. Placeholder / invalid URLs stay gradient posters.

Muted autoplay is required by Chrome/Android. **iOS Safari** (Low Power Mode, ITP, or in-app WebViews) can still block iframe autoplay even when muted — error `onPlayerError` in that case; the tile stays tappable. Desktop Chrome usually plays muted.

Hub cards show Mapillary stills when `content/photos.json` has a match, otherwise the same gradients.

## Data stack (Geofabrik + HOT + Overpass + Mapillary)

Hans refused paid Google Places keys. All place data is OpenStreetMap (ODbL) plus optional Mapillary photos (CC-BY-SA).

| Source | When | `candidates.source` |
| --- | --- | --- |
| **Overpass** | On-demand `/admin/discover` (and Next.js fallback if Edge IPs get HTTP 406) | `osm` |
| **Geofabrik Java PBF** | CLI bulk import, clipped to Jaksel + SCBD/Senopati + Alam Sutera | `geofabrik` |
| **HOT Indonesia POIs** | CLI best-effort HDX GeoJSON (skipped cleanly if the export is awkward) | `hot` |
| **Mapillary** | Nearest image per lat/lng when token is injected | `photo_url` + `mapillary` jsonb |

**Areas** (no Google Maps): Blok M / Melawai, Cipete / Kemang, **Tebet**, **Fatmawati / Pondok Indah**, **SCBD / Senopati** (light box), **Alam Sutera** (tagged `out-of-jaksel`).

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

M2/M2.5 does **not** scrape TikTok and does **not** write WeekendPack JSON (photos map is a separate `content/photos.json`).

## Env

See `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_SECRET`
- `MAPILLARY_ACCESS_TOKEN` (injected by the parent environment; skip photos with a visible error when unset)
- `CLOUD_AGENT_INJECTED_SECRET_NAMES` (optional diagnostic; should include `MAPILLARY_ACCESS_TOKEN` when the parent injects it)

## Out of scope

Google Places, M3 AI ask, blok-m-msme merge, auto-publish to the live pack.

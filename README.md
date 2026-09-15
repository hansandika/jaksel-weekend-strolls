# Jaksel Weekend Strolls

Weekly Sat/Sun combo itineraries for Jakarta Selatan, with TikTok proof carousels.

The **public hub** (`/` and `/combo/[id]`) auto-assembles live combos from **Candidate Queue** rows already in Supabase (OSM / Geofabrik / HOT). Admin approve is optional — there is no approve gate for public. The old M1 dummy pack (`content/packs/2026-W38.json`, Seto / Obihiro / JDW) is **draft archive** and is not served.

M2 is the **free Candidate Queue**: OpenStreetMap Overpass discovery (not Google Places), Supabase storage, and a dark ink + coral admin UI.

M2.5 enriches that queue from **Geofabrik** (bulk OSM) and **HOT Indonesia POIs**, attaches **Mapillary** street photos, and plays **official TikTok embeds** when a candidate has a real `tiktok.com/@…/video/…` URL.

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
| `/` | Hub — live queue combos, Sat/Sun pairing cards, disabled AI ask bar |
| `/combo/[id]` | Combo detail — Maps-linked stops, muted TikTok carousel (tap-through), tip, rain notes |
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

Public `/` and `/combo/[id]` call `assembleLivePack()` against Candidate Queue rows. **Approved / rejected / new / need_tiktok do not gate the public hub** — those statuses are admin discovery tools only. Out-of-Jaksel (Alam Sutera) rows are skipped. Each public stop needs a **Mapillary** `photo_url` (or `/api/mapillary/{id}`) and an official Maps URL (`https://www.google.com/maps/search/?api=1&query=LAT,LNG`, with `query=name+area` if coords are missing). If `GOOGLE_MAPS_API_KEY` / Places Photo is in env it is preferred; otherwise Mapillary. Stops with neither photo nor Maps URL are omitted.

TikToks are real watch URLs stored on `candidates.tiktok_urls` (open-web search, not Google Maps scrape). No `@jaksel.strolls` placeholders on the public hub. If a place has no matching short, that stop is omitted or the TikTok slot is skipped.

Hub combo cards (when a combo has TikTok URLs) and combo-detail stop TikToks share one **horizontal snap carousel**: one portrait clip per full content width (`scroll-snap-type: x mandatory`, each slide `scroll-snap-align: center`, ~390px − padding, 9:16-ish). Only the **active/visible** slide mounts the official TikTok player (`player/v1` with `autoplay=1`, `muted=1`, `loop=1`); other slides unload to a Mapillary poster. Dots plus a `1 / 3` counter sit under the track. After `onPlayerReady` the host `postMessage`s `mute` then `play`. Tap/click the video (or overlay) opens the TikTok watch URL — iframe chrome is `pointer-events-none` so users are not trapped. The iframe `allow` list is `autoplay; encrypted-media; fullscreen; picture-in-picture`.

Muted autoplay is required by Chrome/Android. **iOS Safari** (Low Power Mode, ITP, or in-app WebViews) can still block iframe autoplay even when muted — error `onPlayerError` in that case; the tile stays tappable. Desktop Chrome usually plays muted.

`content/packs/2026-W38.json` is leftover M1 seed (`status: "draft"`) and is not read by the hub.

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

M2/M2.5 does **not** scrape Google Maps HTML or unofficial Google endpoints. TikTok watch URLs are found on the open web and stored on `candidates.tiktok_urls`. The public hub is assembled at request time from those rows (no WeekendPack JSON write).

## Env

See `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_SECRET`
- `MAPILLARY_ACCESS_TOKEN` (injected by the parent environment; skip photos with a visible error when unset)
- `GOOGLE_MAPS_API_KEY` (optional; if present, Places Photo may be used instead of Mapillary)
- `CLOUD_AGENT_INJECTED_SECRET_NAMES` (optional diagnostic; should include `MAPILLARY_ACCESS_TOKEN` when the parent injects it)

## Out of scope

Google Places / Maps HTML scrape, M3 AI ask, blok-m-msme merge.

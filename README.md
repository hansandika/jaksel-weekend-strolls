# Jaksel Weekend Strolls

Weekly Sat/Sun combo itineraries for Jakarta Selatan, with TikTok proof carousels.

M1 is the public hub: a static, content-driven Next.js app (hub + combo detail) seeded from a live week pack.

M2 adds a **free Candidate Queue**: OpenStreetMap Overpass discovery (not Google Places), Supabase storage, and a dark ink + coral admin UI. Discovery never auto-publishes into the weekend pack JSON.

## Run locally

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_ANON_KEY + ADMIN_SECRET
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
| `/admin/queue` | Candidate Queue — counts, filters, bulk approve/reject |
| `/admin/candidates/[id]` | Candidate detail — OSM links, draft why/tip, status |
| `/admin/discover` | Run OSM discovery for Jaksel areas |

Seeded combo ids:

- `cafe-mall-vietnam`
- `blok-m-food-flex`
- `soft-sunday-cipete`
- `rain-indoor-pi`

## Content

Live pack: `content/packs/2026-W38.json` (`status: "live"`).

Each combo includes `tiktokUrls[]`. M1 renders those as poster tiles (play glyph + “TikTok”), not live TikTok embeds. The URLs are placeholders under `@jaksel.strolls` so the carousel and deep-links work without real clips. Swap them for approved TikToks later; the carousel already reads the array.

## M2 discovery (OpenStreetMap, not Google Places)

Hans refused paid Google Places keys. M2 queries **OpenStreetMap Overpass** (Nominatim / Wikipedia only as optional extras). Data © OpenStreetMap contributors, ODbL.

Default areas: Blok M / Melawai and Cipete / Kemang. Optional: Tebet, Fatmawati / Pondok Indah, Alam Sutera (tagged `out-of-jaksel`).

Amenities: `cafe`, `restaurant`, `fast_food`, plus malls (`shop=mall` / `department_store`). `source=osm`, `source_id={node\|way\|relation}/{id}`. Re-runs dedupe and never overwrite approved/rejected rows.

Supabase Edge Functions (service role stays on the server; gated by `x-admin-secret`):

- `discover` — Overpass pull + insert into `public.candidates`, log `public.discovery_runs`
- `candidates` — list / detail / status / draft mutations

Some Overpass mirrors return **406** from AWS Edge IPs. The Next `/admin/discover` action tries the Function first, then fetches OSM from the app server and posts elements into `discover` so inserts still happen with the service role. Re-runs dedupe on `source` + `source_id` and never overwrite approved/rejected rows.

RLS is on; `anon` has **no** policies (and no table grants). The Next `/admin/*` UI talks to Functions from the server using `ADMIN_SECRET`. Do not put `service_role` in the browser.

M2 does **not** scrape TikTok and does **not** write WeekendPack JSON.

## Env

See `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_SECRET`

## Out of scope

Google Places, M3 AI ask, blok-m-msme merge, auto-publish to the live pack.

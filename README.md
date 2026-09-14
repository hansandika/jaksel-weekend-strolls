# Jaksel Weekend Strolls

Weekly Sat/Sun combo itineraries for Jakarta Selatan, with TikTok proof carousels.

M1 is a static, content-driven Next.js app: hub + combo detail, seeded from a live week pack. No auth, no database, no AI backend.

## Run locally

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Production-style:

```bash
npm run build
npm run start
```

Phone testing from this environment uses a Cloudflare quick tunnel:

```bash
cloudflared tunnel --url http://localhost:3000
```

## Routes

| Route | What you get |
| --- | --- |
| `/` | Hub — W38 badge, Jakarta Dessert Week chip, disabled AI ask bar, 4 combo cards, Sat/Sun pairing |
| `/combo/[id]` | Combo detail — meta chips, stop roles, horizontal TikTok carousel + dots, tip, rain notes |

Seeded combo ids:

- `cafe-mall-vietnam`
- `blok-m-food-flex`
- `soft-sunday-cipete`
- `rain-indoor-pi`

## Content

Live pack: `content/packs/2026-W38.json` (`status: "live"`).

Each combo includes `tiktokUrls[]`. M1 renders those as poster tiles (play glyph + “TikTok”), not live TikTok embeds. The URLs are placeholders under `@jaksel.strolls` so the carousel and deep-links work without real clips. Swap them for approved TikToks later; the carousel already reads the array.

## Out of scope for M1

AI ask (visual stub only), Google Places discovery, Supabase, and the admin Candidate Queue.

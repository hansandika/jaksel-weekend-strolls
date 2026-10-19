-- Google Maps fields gathered by browser lookup. OSM columns stay; these are null on OSM rows.

alter table public.candidates
  add column if not exists gmaps_ftid text,
  add column if not exists gmaps_place_url text,
  add column if not exists rating numeric,
  add column if not exists review_count integer,
  add column if not exists price_range text,
  add column if not exists gmaps_category text;

create unique index if not exists candidates_gmaps_ftid_key
  on public.candidates (gmaps_ftid)
  where gmaps_ftid is not null;

comment on column public.candidates.gmaps_ftid is
  'Google Maps feature id. Unique when set. OSM rows leave this null.';
comment on column public.candidates.gmaps_place_url is
  'Canonical Google Maps place URL from a browser lookup.';
comment on column public.candidates.rating is
  'Google Maps rating, when the row came from a browser lookup.';
comment on column public.candidates.review_count is
  'Google Maps review count.';
comment on column public.candidates.price_range is
  'Google Maps price range text, e.g. Rp25-125k.';
comment on column public.candidates.gmaps_category is
  'Google Maps category label in ID or EN.';

update public.candidates
set
  gmaps_ftid = nullif(btrim(raw #>> '{google_maps,ftid}'), ''),
  gmaps_place_url = nullif(btrim(raw #>> '{google_maps,place_url}'), ''),
  rating = case
    when (raw #>> '{google_maps,rating}') ~ '^[0-9]+(\.[0-9]+)?$'
      then (raw #>> '{google_maps,rating}')::numeric
    else rating
  end,
  review_count = case
    when (raw #>> '{google_maps,review_count}') ~ '^[0-9]+$'
      then (raw #>> '{google_maps,review_count}')::integer
    else review_count
  end,
  price_range = nullif(btrim(raw #>> '{google_maps,price_range}'), ''),
  gmaps_category = nullif(btrim(raw #>> '{google_maps,category}'), '')
where raw ? 'google_maps';

update public.candidates
set raw = jsonb_set(
  raw,
  '{opening_hours}',
  to_jsonb(raw #>> '{google_maps,opening_hours}'),
  true
)
where coalesce(btrim(raw #>> '{google_maps,opening_hours}'), '') <> ''
  and coalesce(btrim(raw->>'opening_hours'), '') = '';

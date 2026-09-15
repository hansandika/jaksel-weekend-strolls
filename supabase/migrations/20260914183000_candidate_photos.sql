alter table public.candidates
  add column if not exists photo_url text,
  add column if not exists photo_urls text[] not null default '{}'::text[],
  add column if not exists mapillary jsonb not null default '{}'::jsonb;

comment on column public.candidates.photo_url is
  'Primary street photo path, typically /api/mapillary/{image_id}';
comment on column public.candidates.photo_urls is
  'Additional photo paths for the candidate';
comment on column public.candidates.mapillary is
  'Mapillary metadata: image_id, captured_at, compass_angle';

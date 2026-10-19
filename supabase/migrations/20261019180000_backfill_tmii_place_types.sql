-- Fill empty place_types on the imported TMII rows. Google categories
-- Museum, IMAX, zoo, hawker center, and tourist attraction were unmapped
-- when those rows landed, so six of them stored an empty array.

update public.candidates
set place_types = case
  when gmaps_category ~* 'imax' then array['attraction']
  when gmaps_category ~* 'museum' then array['museum']
  when gmaps_category ~* 'zoo|kebun binatang' then array['attraction']
  when gmaps_category ~* 'hawker|pusat jajanan' then array['food_court']
  when gmaps_category ~* 'tourist attraction|objek wisata|obyek wisata' then array['attraction']
  else place_types
end
where area_key = 'tmii'
  and coalesce(cardinality(place_types), 0) = 0
  and gmaps_category ~* 'imax|museum|zoo|kebun binatang|hawker|pusat jajanan|tourist attraction|objek wisata|obyek wisata';

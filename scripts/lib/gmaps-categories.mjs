const RULES = [
  { test: /toko es krim|ice cream|es krim|gelato/i, type: "ice_cream" },
  { test: /toko roti|toko kue|bakery|pastry|\broti\b/i, type: "bakery" },
  { test: /kedai kopi|coffee shop|coffee house|\bcoffee\b|\bkopi\b/i, type: "cafe" },
  { test: /\bkafe\b|\bcafé\b|\bcafe\b/i, type: "cafe" },
  { test: /pusat perbelanjaan|shopping mall|department store|\bmall\b/i, type: "mall" },
  { test: /\bhawker\b|pusat jajanan/i, type: "food_court" },
  { test: /pasar|marketplace|food court|street food|kaki lima|pusat kuliner/i, type: "marketplace" },
  { test: /makanan cepat saji|fast food|\bwarung\b/i, type: "fast_food" },
  { test: /restoran|restaurant|rumah makan/i, type: "restaurant" },
  { test: /\bbar\b|\bpub\b/i, type: "bar" },
  { test: /\bmuseum\b/i, type: "museum" },
  { test: /\bimax\b/i, type: "attraction" },
  { test: /\bzoo\b|kebun binatang/i, type: "attraction" },
  { test: /tourist attraction|objek wisata|obyek wisata/i, type: "attraction" },
  { test: /\btaman\b|\bpark\b|garden/i, type: "attraction" },
];

export function placeTypesFromGoogleCategory(category) {
  const text = String(category ?? "").trim();
  if (!text) return [];
  for (const rule of RULES) {
    if (rule.test.test(text)) return [rule.type];
  }
  return [];
}

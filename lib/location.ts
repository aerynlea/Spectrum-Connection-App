const LOCATION_TAG_RULES: Array<{ tag: string; patterns: string[] }> = [
  {
    tag: "antelope-valley",
    patterns: ["antelope valley", "palmdale", "lancaster"],
  },
  {
    tag: "los-angeles-county",
    patterns: [
      "los angeles",
      "santa clarita",
      "chatsworth",
      "northridge",
      "san fernando valley",
      "sherman oaks",
      "westwood",
      "ucla",
    ],
  },
  {
    tag: "orange-county",
    patterns: ["orange county", "irvine", "costa mesa", "santa ana", "buena park", "silverado"],
  },
  {
    tag: "san-diego-county",
    patterns: ["san diego", "carlsbad", "chula vista", "escondido", "oceanside"],
  },
  {
    tag: "southern-california",
    patterns: [
      "southern california",
      "los angeles",
      "orange county",
      "palmdale",
      "lancaster",
      "irvine",
      "costa mesa",
      "buena park",
      "santa ana",
      "san diego",
    ],
  },
  {
    tag: "california",
    patterns: [" california", " ca ", " ca,", " ca.", "palmdale", "lancaster", "irvine", "buena park"],
  },
  {
    tag: "nationwide",
    patterns: ["nationwide", "national"],
  },
  {
    tag: "virtual",
    patterns: ["virtual", "online", "zoom"],
  },
];

function normalize(value: string) {
  return ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

export function inferLocationTags(location: string) {
  const normalized = normalize(location);
  const matches = LOCATION_TAG_RULES.filter((rule) =>
    rule.patterns.some((pattern) => normalized.includes(normalize(pattern))),
  ).map((rule) => rule.tag);

  return Array.from(new Set(matches));
}

export function matchesUserLocation(
  location: string,
  regionTags: string[],
) {
  if (regionTags.includes("nationwide") || regionTags.includes("virtual")) {
    return true;
  }

  const userTags = inferLocationTags(location);

  return regionTags.some((tag) => userTags.includes(tag));
}

export function isRegionalMatch(location: string, regionTags: string[]) {
  const userTags = inferLocationTags(location);

  return regionTags.some((tag) => userTags.includes(tag));
}

export function partitionByLocation<T extends { regionTags: string[] }>(
  items: T[],
  location?: string | null,
) {
  if (!location) {
    return {
      nearby: [] as T[],
      broader: items,
    };
  }

  const nearby = items.filter((item) => isRegionalMatch(location, item.regionTags));
  const broader = items.filter((item) => !isRegionalMatch(location, item.regionTags));

  return { nearby, broader };
}

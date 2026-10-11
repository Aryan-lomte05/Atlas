/**
 * Single source of truth for the agent's tool surface.
 *
 * This file holds metadata only and pulls in no server dependencies, so the
 * UI can import it directly. Implementations live in tools.ts and are keyed
 * by the `name` field below, which means the page can never advertise a tool
 * the dispatcher does not actually have.
 *
 * `source` is deliberately honest:
 *   live     the call leaves the process and hits a third-party API
 *   compute  executed locally, deterministic, no network
 *   curated  answered from a maintained table inside this repository
 */
export type ToolSource = "live" | "compute" | "curated";

export interface ToolMeta {
  name: string;
  title: string;
  source: ToolSource;
  provider: string;
  /** Shown to the model. One line, says when to reach for this tool. */
  summary: string;
  argument: string;
  /** Shown in the UI as a representative observation. */
  sample: string;
}

export const TOOL_METAS: ToolMeta[] = [
  {
    name: "geocode_place",
    title: "Resolve a place",
    source: "live",
    provider: "Open-Meteo geocoding",
    summary:
      "Turn a place name into coordinates, country, timezone and population. Call this first for any destination you have not resolved yet.",
    argument: "place name, for example 'Reykjavik'",
    sample: `Reykjavik, Iceland
lat 64.1355, lon -21.8954
timezone Atlantic/Reykjavik, population 118918`,
  },
  {
    name: "weather_forecast",
    title: "Short-range forecast",
    source: "live",
    provider: "Open-Meteo forecast",
    summary:
      "Seven day forecast with highs, lows and precipitation probability. Use for trips inside the next week.",
    argument: "place name",
    sample: `Kyoto, Japan, next 7 days
Mon 19.4/11.2 C, rain 44%
Tue 21.0/12.6 C, rain 10%
Wed 17.8/10.9 C, rain 80%`,
  },
  {
    name: "climate_normals",
    title: "Season climate",
    source: "live",
    provider: "Open-Meteo archive",
    summary:
      "What a given month is actually like, measured from last year's record for the same window. Use this whenever the trip is more than a week away, because a forecast will not reach.",
    argument: "place name, month number. For example 'Kyoto, 4'",
    sample: `Kyoto in April, from 2025 record
mean high 19.1 C, mean low 8.7 C
wet days 9 of 30, total 94.2 mm`,
  },
  {
    name: "daylight_hours",
    title: "Daylight window",
    source: "live",
    provider: "sunrise-sunset.org",
    summary:
      "Sunrise, sunset and usable daylight for a date. Essential at high latitude, where daylight, not opening hours, limits the day.",
    argument: "place name, ISO date. For example 'Reykjavik, 2026-11-15'",
    sample: `Reykjavik on 2026-11-15
sunrise 09:53, sunset 16:31
daylight 6h 38m. Plan one outdoor block only.`,
  },
  {
    name: "currency_convert",
    title: "Live exchange rate",
    source: "live",
    provider: "Frankfurter, ECB reference rates",
    summary:
      "Convert an amount between currencies at today's published rate. Use before quoting any foreign price in the traveller's own currency.",
    argument: "amount, from, to. For example '500 USD INR'",
    sample: `500 USD = 48365.00 INR
rate 1 USD = 96.73 INR, ECB 2026-10-09`,
  },
  {
    name: "public_holidays",
    title: "Public holidays",
    source: "live",
    provider: "Nager.Date",
    summary:
      "Public holidays for a country and year. Flags closures and crowding that would otherwise wreck a day plan.",
    argument: "country code, year. For example 'JP, 2026'",
    sample: `Japan 2026, holidays in April
Apr 29 Showa Day
Golden Week begins. Expect heavy domestic travel.`,
  },
  {
    name: "air_quality",
    title: "Air quality",
    source: "live",
    provider: "Open-Meteo air quality",
    summary:
      "Current European AQI and PM2.5. Worth checking before promising long outdoor days.",
    argument: "place name",
    sample: `Delhi: European AQI 164, PM2.5 78.4 ug/m3
Poor. Keep outdoor blocks short, prefer mornings.`,
  },
  {
    name: "elevation",
    title: "Elevation",
    source: "live",
    provider: "Open-Meteo elevation",
    summary:
      "Ground elevation in metres. Use to warn about altitude on mountain destinations.",
    argument: "place name",
    sample: `Leh: 3524 m
Above 2500 m. Allow two acclimatisation days.`,
  },
  {
    name: "attractions_explorer",
    title: "Sights and context",
    source: "live",
    provider: "Wikipedia REST",
    summary:
      "Encyclopedic summary of a place or landmark, so the itinerary carries real description instead of generated filler.",
    argument: "place or landmark name",
    sample: `Kinkaku-ji: Zen Buddhist temple in Kyoto, top two
floors covered in gold leaf. Rebuilt 1955 after arson.`,
  },
  {
    name: "find_attractions",
    title: "What to see there",
    source: "live",
    provider: "Wikivoyage guide, OpenStreetMap fallback",
    summary:
      "The sights a traveller has actually heard of, taken from the Wikivoyage travel guide. Use this to fill the day plan with named places rather than generic suggestions.",
    argument: "place name",
    sample: `Places to see in Mumbai, from the Wikivoyage travel guide

WORTH SEEING
- Gateway of India: Landmark arch built in 1911 to commemorate
  the visit of King George V.
- Girgaon Chowpatty: The city's most famous beach, at one end
  of Marine Drive.`,
  },
  {
    name: "find_restaurants",
    title: "Where to eat and drink",
    source: "live",
    provider: "Wikivoyage guide, OpenStreetMap fallback",
    summary:
      "Named restaurants, cafes and bars from the Wikivoyage travel guide, with a line on each. Use it so the plan names specific places instead of saying to try the local food.",
    argument: "place name",
    sample: `Where to eat and drink in Mumbai

EAT
- Bademiya Kebab Restaurant: Eat on the road or in your car.
  Open until the early hours.
- Martin's: Great Goan food.

DRINK
- Cafe Mondegar: Serves excellent pitchers of beer.`,
  },
  {
    name: "budget_calculator",
    title: "Budget arithmetic",
    source: "compute",
    provider: "mathjs",
    summary:
      "Evaluate an arithmetic expression exactly. Every total in the plan must come from here, never from your own arithmetic.",
    argument: "expression, for example '31400 + 6200*5 + 9000'",
    sample: `31400 + 6200*5 + 9000 + 15200
= 86600`,
  },
  {
    name: "packing_list",
    title: "Packing list",
    source: "compute",
    provider: "Local rules over tool output",
    summary:
      "Derive what to pack from numbers you already observed. Pass the temperature range, rain chance and any notes.",
    argument: "minC, maxC, rainPct, notes. For example '8, 19, 55, temples'",
    sample: `8 to 19 C, rain 55%
Layers, light insulated mid-layer, waterproof shell,
broken-in walking shoes, compact umbrella.
Temples: socks without holes, shoulders covered.`,
  },
  {
    name: "route_options",
    title: "Route options",
    source: "curated",
    provider: "In-repo route table",
    summary:
      "Carriers, duration and indicative return fare for a corridor. Curated, because live fare APIs are paid and rate limited.",
    argument: "destination, optional origin",
    sample: `Mumbai to Kyoto
via Osaka KIX: Peach, JAL, ANA
10h 40m plus Haruka Express 75m
indicative return 62000 INR`,
  },
  {
    name: "lodging_tiers",
    title: "Lodging tiers",
    source: "curated",
    provider: "In-repo lodging table",
    summary:
      "Nightly rates across backpacker, mid-range and boutique tiers, with a neighbourhood note.",
    argument: "destination",
    sample: `Kyoto nightly
backpacker 2400 INR, mid-range 6200 INR,
boutique ryokan 14500 INR
Stay near Karasuma or Gion for walkability.`,
  },
  {
    name: "travel_advisory",
    title: "Entry and safety",
    source: "curated",
    provider: "In-repo advisory table",
    summary:
      "Visa posture for an Indian passport, safety notes, payment habits and etiquette.",
    argument: "country or city",
    sample: `Japan: eVisa for Indian passports, apply 3 weeks ahead.
Very low crime. Many vendors are cash only.
Emergency 110 police, 119 ambulance.`,
  },
];

export const SOURCE_LABEL: Record<ToolSource, string> = {
  live: "Live API",
  compute: "Local compute",
  curated: "Curated table",
};

/** Backwards-compatible alias used by the Tools section. */
export const TOOL_SPECS = TOOL_METAS;

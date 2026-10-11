/**
 * Single source of truth describing the agent's tool surface.
 *
 * The runtime dispatcher in tools.ts and the Tools section in the UI both
 * read from this list, so the page can never advertise a tool the agent
 * does not actually have.
 *
 * `source` is deliberately honest:
 *   live     the call leaves the process and hits a third-party API
 *   compute  executed locally, deterministic, no network
 *   curated  answered from a maintained table inside the repo
 */
export type ToolSource = "live" | "compute" | "curated";

export interface ToolSpec {
  name: string;
  title: string;
  source: ToolSource;
  provider: string;
  purpose: string;
  argument: string;
  sample: string;
}

export const TOOL_SPECS: ToolSpec[] = [
  {
    name: "getWeatherForecast",
    title: "Climate and forecast",
    source: "live",
    provider: "Open-Meteo",
    purpose:
      "Geocodes the destination, then pulls current conditions and the daily range so the agent can order days around rainfall instead of guessing.",
    argument: "location: string",
    sample: `Destination: Kyoto, Japan
Current Condition: Partly cloudy
Daily Range: Min 11.2 deg C to Max 19.4 deg C
Rain Probability: 44%
Travel Tip: Pack an umbrella or waterproof shell.`,
  },
  {
    name: "findFlights",
    title: "Route and corridor lookup",
    source: "curated",
    provider: "In-repo route table",
    purpose:
      "Returns carriers, typical duration and indicative return fares for a corridor. Curated rather than live because fare APIs are paid and rate limited.",
    argument: "query: string",
    sample: `Route: Mumbai to Kyoto
Carriers: Peach, JAL, ANA via Osaka KIX
Duration: 10h 40m, plus Haruka Express 75m
Indicative return: 62000 INR`,
  },
  {
    name: "searchHotels",
    title: "Lodging tiers",
    source: "curated",
    provider: "In-repo lodging table",
    purpose:
      "Gives nightly rates across backpacker, mid-range and boutique tiers so the budget tool has a defensible per-night figure to work from.",
    argument: "query: string",
    sample: `Mid-range: 6200 INR per night
Backpacker: 2400 INR per night
Boutique ryokan: 14500 INR per night`,
  },
  {
    name: "calculateBudgetAndCurrency",
    title: "Budget arithmetic",
    source: "compute",
    provider: "mathjs",
    purpose:
      "Evaluates the itemised budget expression exactly. Keeps totals out of the language model, which is where invented arithmetic usually enters a plan.",
    argument: "expression: string",
    sample: `expr: 31400 + (6200 * 5) + 9000 + 15200
result: 86600
headroom against 90000 ceiling: 3400`,
  },
  {
    name: "exploreAttractions",
    title: "Sights and context",
    source: "live",
    provider: "Wikipedia REST",
    purpose:
      "Pulls encyclopedic summaries for the destination and its landmarks, giving the itinerary real description instead of generated filler.",
    argument: "query: string",
    sample: `Kinkaku-ji: Zen temple, top two floors in gold leaf,
rebuilt 1955 after arson. Northern Kyoto.`,
  },
  {
    name: "getTravelAdvisory",
    title: "Entry and safety advisory",
    source: "curated",
    provider: "In-repo advisory table",
    purpose:
      "Reports visa posture, common scams and health notes per country, so the plan flags an entry requirement before it becomes a problem.",
    argument: "countryOrCity: string",
    sample: `Japan: visa required for Indian passports, eVisa available.
Low crime. Carry cash, many vendors are cash only.`,
  },
];

export const SOURCE_LABEL: Record<ToolSource, string> = {
  live: "Live API",
  compute: "Local compute",
  curated: "Curated table",
};

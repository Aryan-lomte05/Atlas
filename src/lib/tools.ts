import { evaluate } from "mathjs";
import { TOOL_METAS } from "./toolManifest";

/**
 * Tool implementations for the Atlas agent.
 *
 * Every tool returns a plain string. That string is appended to the agent's
 * scratchpad verbatim, so it is written to be read by a language model:
 * short lines, explicit units, and an interpretation line where a raw number
 * would not be actionable on its own.
 *
 * Tools never throw. A failed call returns a string that says it failed and
 * what the agent should do instead, because a thrown error would end the run
 * where a degraded observation lets it continue.
 */

export interface ToolResult {
  tool: string;
  input: string;
  output: string;
  error?: boolean;
}

const UA = "Atlas-Travel-Agent/2.0 (college project; contact via GitHub)";
const TIMEOUT_MS = 7000;

/** fetch with a hard timeout, so one hanging endpoint cannot stall a run. */
async function getJson<T = unknown>(url: string): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function fail(what: string, err: unknown, advice: string): string {
  const msg = err instanceof Error ? err.message : "unknown error";
  return `${what} is unavailable right now (${msg}). ${advice}`;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ */
/* Geocoding, shared by every location-aware tool                      */
/* ------------------------------------------------------------------ */

interface Place {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
  population?: number;
}

interface GeoResponse {
  results?: {
    name: string;
    country: string;
    country_code: string;
    latitude: number;
    longitude: number;
    timezone: string;
    population?: number;
  }[];
}

const geoCache = new Map<string, Place | null>();

async function resolvePlace(query: string): Promise<Place | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (geoCache.has(key)) return geoCache.get(key) ?? null;

  try {
    const data = await getJson<GeoResponse>(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query,
      )}&count=1&language=en&format=json`,
    );
    const hit = data.results?.[0];
    const place: Place | null = hit
      ? {
          name: hit.name,
          country: hit.country,
          countryCode: hit.country_code,
          lat: hit.latitude,
          lon: hit.longitude,
          timezone: hit.timezone,
          population: hit.population,
        }
      : null;
    geoCache.set(key, place);
    return place;
  } catch {
    geoCache.set(key, null);
    return null;
  }
}

/** Strip a trailing ", 4" or ", 2026-11-15" argument off a place string. */
function splitArg(input: string): { place: string; rest: string } {
  const parts = input.split(",").map((p) => p.trim());
  if (parts.length < 2) return { place: input.trim(), rest: "" };
  const last = parts[parts.length - 1];
  if (/^\d{4}-\d{2}-\d{2}$/.test(last) || /^\d{1,4}$/.test(last)) {
    return { place: parts.slice(0, -1).join(", "), rest: last };
  }
  return { place: input.trim(), rest: "" };
}

/* ------------------------------------------------------------------ */
/* Live tools                                                          */
/* ------------------------------------------------------------------ */

export async function geocodePlace(input: string): Promise<string> {
  const place = await resolvePlace(input);
  if (!place) {
    return `No place matched "${input}". Try a larger nearby city, or the English spelling.`;
  }
  const pop = place.population
    ? `, population ${place.population.toLocaleString("en-US")}`
    : "";
  return [
    `${place.name}, ${place.country} (${place.countryCode})`,
    `lat ${r1(place.lat)}, lon ${r1(place.lon)}`,
    `timezone ${place.timezone}${pop}`,
  ].join("\n");
}

const WMO: Record<number, string> = {
  0: "clear",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "freezing fog",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  80: "rain showers",
  81: "heavy showers",
  95: "thunderstorms",
};

interface ForecastResponse {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    weathercode: number[];
  };
}

export async function weatherForecast(input: string): Promise<string> {
  const place = await resolvePlace(input);
  if (!place) return `Cannot forecast for "${input}": place not found.`;

  try {
    const d = await getJson<ForecastResponse>(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode` +
        `&forecast_days=7&timezone=auto`,
    );
    const day = d.daily;
    if (!day) return `No forecast returned for ${place.name}.`;

    const lines = day.time.map((t, i) => {
      const rain = day.precipitation_probability_max[i] ?? 0;
      const cond = WMO[day.weathercode[i]] ?? "mixed";
      const dow = new Date(t).toLocaleDateString("en-GB", { weekday: "short" });
      return `${dow} ${t}: ${r1(day.temperature_2m_max[i])}/${r1(
        day.temperature_2m_min[i],
      )} C, ${cond}, rain ${rain}%`;
    });

    const wet = day.precipitation_probability_max.filter(
      (p) => (p ?? 0) >= 50,
    ).length;

    return [
      `${place.name}, ${place.country}, next 7 days`,
      ...lines,
      `Wet days (50% or more): ${wet} of 7.`,
      wet >= 3
        ? "Plan indoor options for the wet days."
        : "Mostly workable for outdoor days.",
    ].join("\n");
  } catch (e) {
    return fail(
      `Forecast for ${place.name}`,
      e,
      "Use climate_normals instead for a seasonal picture.",
    );
  }
}

interface ArchiveResponse {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
}

export async function climateNormals(input: string): Promise<string> {
  const { place: placeName, rest } = splitArg(input);
  const month = Math.min(12, Math.max(1, parseInt(rest, 10) || 0));
  if (!month) {
    return `Give a month number as well, for example "${placeName}, 4" for April.`;
  }

  const place = await resolvePlace(placeName);
  if (!place) return `Cannot look up climate for "${placeName}": place not found.`;

  // Use last completed year as the reference record.
  const year = new Date().getFullYear() - 1;
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();

  try {
    const d = await getJson<ArchiveResponse>(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${place.lat}&longitude=${place.lon}` +
        `&start_date=${year}-${mm}-01&end_date=${year}-${mm}-${lastDay}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`,
    );
    const day = d.daily;
    if (!day?.time?.length) return `No archive record for ${place.name} in month ${month}.`;

    const mean = (a: number[]) =>
      a.filter((n) => typeof n === "number").reduce((s, n) => s + n, 0) /
      a.filter((n) => typeof n === "number").length;

    const high = mean(day.temperature_2m_max);
    const low = mean(day.temperature_2m_min);
    const total = day.precipitation_sum.reduce((s, n) => s + (n || 0), 0);
    const wetDays = day.precipitation_sum.filter((n) => (n || 0) >= 1).length;

    const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
      month: "long",
    });

    return [
      `${place.name} in ${monthName}, measured from the ${year} record`,
      `mean high ${r1(high)} C, mean low ${r1(low)} C`,
      `wet days ${wetDays} of ${day.time.length}, total ${r1(total)} mm`,
      wetDays >= day.time.length / 3
        ? "A third or more of days see rain. Build the plan so outdoor days can move."
        : "Mostly dry. Outdoor days are safe to fix in advance.",
    ].join("\n");
  } catch (e) {
    return fail(`Climate record for ${place.name}`, e, "Fall back to weather_forecast.");
  }
}

interface SunResponse {
  results?: { sunrise: string; sunset: string; day_length: number };
  status?: string;
}

export async function daylightHours(input: string): Promise<string> {
  const { place: placeName, rest } = splitArg(input);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rest)
    ? rest
    : new Date().toISOString().slice(0, 10);

  const place = await resolvePlace(placeName);
  if (!place) return `Cannot compute daylight for "${placeName}": place not found.`;

  try {
    const d = await getJson<SunResponse>(
      `https://api.sunrise-sunset.org/json?lat=${place.lat}&lng=${place.lon}&date=${date}&formatted=0`,
    );
    if (!d.results) return `No daylight data for ${place.name} on ${date}.`;

    const fmt = (iso: string) =>
      new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: place.timezone,
      });

    const secs = d.results.day_length;
    const h = Math.floor(secs / 3600);
    const m = Math.round((secs % 3600) / 60);

    let verdict = "A full day of light. Two outdoor blocks fit comfortably.";
    if (h < 7) verdict = "Very short day. Plan one outdoor block and keep it early.";
    else if (h < 10) verdict = "Short day. One outdoor block plus one indoor.";
    else if (h > 15) verdict = "Long day. Three blocks fit, including an evening one.";

    return [
      `${place.name} on ${date}`,
      `sunrise ${fmt(d.results.sunrise)}, sunset ${fmt(d.results.sunset)} (${place.timezone})`,
      `daylight ${h}h ${m}m`,
      verdict,
    ].join("\n");
  } catch (e) {
    return fail(`Daylight for ${place.name}`, e, "Assume typical daylight for the latitude.");
  }
}

interface FxResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function currencyConvert(input: string): Promise<string> {
  const tokens = input.toUpperCase().match(/[A-Z]{3}|[\d.]+/g) ?? [];
  const amount = parseFloat(tokens.find((t) => /^[\d.]+$/.test(t)) ?? "1");
  const codes = tokens.filter((t) => /^[A-Z]{3}$/.test(t));
  if (codes.length < 2) {
    return `Give an amount and two currency codes, for example "500 USD INR".`;
  }
  const [from, to] = codes;

  try {
    const d = await getJson<FxResponse>(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`,
    );
    const out = d.rates?.[to];
    if (out === undefined) return `No published rate for ${from} to ${to}.`;
    const unit = out / (d.amount || 1);
    return [
      `${amount} ${from} = ${out.toFixed(2)} ${to}`,
      `rate 1 ${from} = ${unit.toFixed(4)} ${to}`,
      `ECB reference rate, ${d.date}`,
    ].join("\n");
  } catch (e) {
    return fail(`Exchange rate ${from} to ${to}`, e, "State the local-currency figure and say the conversion was unavailable.");
  }
}

interface HolidayItem {
  date: string;
  localName: string;
  name: string;
  global: boolean;
}

export async function publicHolidays(input: string): Promise<string> {
  const parts = input.split(",").map((p) => p.trim());
  let code = parts.find((p) => /^[A-Za-z]{2}$/.test(p))?.toUpperCase();
  const year = parseInt(parts.find((p) => /^\d{4}$/.test(p)) ?? "", 10) ||
    new Date().getFullYear();

  // Accept a place name and resolve its country code.
  if (!code) {
    const guess = parts.find((p) => !/^\d+$/.test(p));
    if (guess) {
      const place = await resolvePlace(guess);
      code = place?.countryCode;
    }
  }
  if (!code) return `Give a two letter country code, for example "JP, ${year}".`;

  try {
    const d = await getJson<HolidayItem[]>(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`,
    );
    if (!Array.isArray(d) || d.length === 0) {
      return `No published holiday list for ${code} in ${year}.`;
    }
    const lines = d
      .slice(0, 14)
      .map((h) => `${h.date}  ${h.name}${h.global ? "" : " (regional)"}`);
    return [
      `${code} public holidays ${year} (${d.length} total, first 14 shown)`,
      ...lines,
      "Museums and offices often close on these dates, and domestic travel peaks.",
    ].join("\n");
  } catch (e) {
    return fail(`Holiday list for ${code}`, e, "Note that holiday closures were not verified.");
  }
}

interface AqResponse {
  current?: { european_aqi?: number; pm2_5?: number };
}

export async function airQuality(input: string): Promise<string> {
  const place = await resolvePlace(input);
  if (!place) return `Cannot check air quality for "${input}": place not found.`;

  try {
    const d = await getJson<AqResponse>(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.lat}` +
        `&longitude=${place.lon}&current=european_aqi,pm2_5&timezone=auto`,
    );
    const aqi = d.current?.european_aqi;
    const pm = d.current?.pm2_5;
    if (aqi === undefined) return `No air quality reading for ${place.name}.`;

    const band =
      aqi <= 20 ? "good" :
      aqi <= 40 ? "fair" :
      aqi <= 60 ? "moderate" :
      aqi <= 80 ? "poor" :
      aqi <= 100 ? "very poor" : "extremely poor";

    return [
      `${place.name}: European AQI ${Math.round(aqi)} (${band})${
        pm !== undefined ? `, PM2.5 ${r1(pm)} ug/m3` : ""
      }`,
      aqi > 60
        ? "Keep outdoor blocks short and prefer early morning."
        : "No air quality constraint on outdoor plans.",
    ].join("\n");
  } catch (e) {
    return fail(`Air quality for ${place.name}`, e, "Proceed without an air quality constraint.");
  }
}

export async function elevationOf(input: string): Promise<string> {
  const place = await resolvePlace(input);
  if (!place) return `Cannot check elevation for "${input}": place not found.`;

  try {
    const d = await getJson<{ elevation?: number[] }>(
      `https://api.open-meteo.com/v1/elevation?latitude=${place.lat}&longitude=${place.lon}`,
    );
    const m = d.elevation?.[0];
    if (m === undefined) return `No elevation reading for ${place.name}.`;

    let note = "No altitude considerations.";
    if (m >= 3500) note = "Serious altitude. Allow two or three acclimatisation days and keep day one light.";
    else if (m >= 2500) note = "Above 2500 m. Allow an acclimatisation day before anything strenuous.";
    else if (m >= 1500) note = "Mild altitude. Expect to tire faster on uphill walking.";

    return [`${place.name}: ${Math.round(m)} m above sea level`, note].join("\n");
  } catch (e) {
    return fail(`Elevation for ${place.name}`, e, "Proceed without an altitude note.");
  }
}

interface WikiSummary {
  title?: string;
  extract?: string;
  description?: string;
  type?: string;
}

export async function attractionsExplorer(input: string): Promise<string> {
  const title = input.trim().replace(/\s+/g, "_");
  try {
    const d = await getJson<WikiSummary>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    );
    if (!d.extract || d.type === "disambiguation") {
      return `No single Wikipedia article for "${input}". Try a more specific landmark name.`;
    }
    const text = d.extract.length > 700 ? `${d.extract.slice(0, 700)}...` : d.extract;
    return [`${d.title}${d.description ? ` (${d.description})` : ""}`, text].join("\n");
  } catch (e) {
    return fail(`Wikipedia lookup for "${input}"`, e, "Describe the sight from general knowledge and mark it unverified.");
  }
}

/* ------------------------------------------------------------------ */
/* OpenStreetMap points of interest                                    */
/* ------------------------------------------------------------------ */

interface OsmElement {
  tags?: Record<string, string>;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
}

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

/** Overpass is community run and frequently busy, so try mirrors in turn. */
async function overpass(query: string): Promise<OsmElement[]> {
  let lastErr: unknown = new Error("no mirror attempted");

  for (const host of OVERPASS_MIRRORS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 14000);
    try {
      const res = await fetch(host, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "User-Agent": UA,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { elements?: OsmElement[] };
      return json.elements ?? [];
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

/**
 * Rank OSM entries by how likely a traveller is to have heard of them.
 *
 * OSM carries everything from the Taj Mahal to an unnamed roadside stall, so
 * raw results are mostly noise. A wikidata or wikipedia tag is the strongest
 * available signal that a place is actually notable, and a website or a
 * star rating is the next best.
 */
function scorePoi(t: Record<string, string>): number {
  let score = 0;
  if (t.wikidata) score += 6;
  if (t.wikipedia) score += 5;
  if (t.website || t["contact:website"]) score += 2;
  if (t.stars) score += 2;
  if (t.cuisine) score += 1;
  if (t.opening_hours) score += 1;
  if (t.description) score += 1;
  return score;
}

/**
 * Names that are really just the category repeated, which OSM is full of.
 * Without this filter a Mumbai search returns "park (park)".
 */
/** Mapped chain outlets, demoted because nobody flies somewhere to eat here. */
const CHAINS: string[] = [
  "domino", "mcdonald", "kfc", "subway", "starbucks", "cafe coffee day",
  "barista", "burger king", "pizza hut", "dunkin", "costa coffee",
  "chai point", "haldiram", "wow! momo", "keventers", "faasos",
  "baskin", "papa john", "taco bell", "cafeteria", "dining hall", "canteen",
];

const JUNK_NAMES = new Set([
  "park", "garden", "gardens", "temple", "church", "mosque", "museum",
  "restaurant", "cafe", "hotel", "bar", "beach", "market", "viewpoint",
  "monument", "fort", "memorial", "playground", "ground", "shop", "statue",
]);

function pickNamed(els: OsmElement[], limit: number, minScore = 0) {
  const seen = new Set<string>();
  return els
    .map((e) => e.tags ?? {})
    .filter((t) => {
      const n = t.name?.trim();
      if (!n || n.length < 3) return false;
      if (JUNK_NAMES.has(n.toLowerCase())) return false;
      // Drop entries that are only a category plus a number, like "Park 3".
      if (/^[a-z ]{3,10}\s*\d*$/.test(n.toLowerCase()) && !t.wikidata) return false;
      if (scorePoi(t) < minScore) return false;
      const k = n.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => scorePoi(b) - scorePoi(a))
    .slice(0, limit);
}

/* ---------------- Wikivoyage curated guide ---------------- */

interface Listing {
  kind: string;
  name: string;
  content: string;
  address: string;
}

/** Split wikitext into balanced {{...}} templates. */
function wikiTemplates(wt: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (true) {
    i = wt.indexOf("{{", i);
    if (i < 0) break;
    let depth = 0;
    let j = i;
    while (j < wt.length) {
      if (wt.startsWith("{{", j)) {
        depth++;
        j += 2;
      } else if (wt.startsWith("}}", j)) {
        depth--;
        j += 2;
        if (depth === 0) break;
      } else {
        j++;
      }
    }
    out.push(wt.slice(i, j));
    i = j;
  }
  return out;
}

const LISTING_KINDS = new Set(["see", "do", "eat", "drink", "buy", "sleep", "listing"]);

/** Strip wiki markup down to something a language model should read. */
function cleanWiki(s: string): string {
  return s
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, "$1")
    .replace(/\[\[([^\]]*)\]\]/g, "$1")
    .replace(/'''?/g, "")
    .replace(/<ref[\s\S]*?<\/ref>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\{\{[^}]*\}\}/g, "")
    // Unbalanced brackets survive truncation, so clear the stragglers too.
    .replace(/\[\[|\]\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseListings(wt: string): Listing[] {
  const rows: Listing[] = [];
  for (const t of wikiTemplates(wt)) {
    const head = t.slice(2).split("|")[0].trim().toLowerCase();
    if (!LISTING_KINDS.has(head)) continue;

    const field = (n: string) =>
      t.match(new RegExp(`\\|\\s*${n}\\s*=\\s*([^|}]+)`, "i"))?.[1]?.trim() ?? "";

    const name = cleanWiki(field("name"));
    if (!name || name.length < 2) continue;

    const type = field("type").toLowerCase();
    rows.push({
      kind: type || head,
      name,
      content: cleanWiki(field("content")).slice(0, 180),
      address: cleanWiki(field("address")).slice(0, 80),
    });
  }
  return rows;
}

interface WvSearch {
  query?: { search?: { title: string }[] };
}
interface WvParse {
  parse?: { wikitext?: { "*"?: string } };
}

async function wikivoyagePage(title: string): Promise<string> {
  const d = await getJson<WvParse>(
    `https://en.wikivoyage.org/w/api.php?action=parse&page=${encodeURIComponent(
      title,
    )}&prop=wikitext&format=json&origin=*`,
  );
  return d.parse?.wikitext?.["*"] ?? "";
}

const guideCache = new Map<string, Listing[]>();

/**
 * Curated travel listings for a destination.
 *
 * Wikivoyage is a human-written travel guide, so its "see" and "eat" entries
 * are the places a traveller has actually heard of. OpenStreetMap, by
 * contrast, returns whatever happens to be mapped, which for a large city is
 * mostly municipal parks and chain outlets. Large cities are split into
 * district subpages, so those are merged in when the parent page is thin.
 */
async function wikivoyageListings(place: string): Promise<Listing[]> {
  const key = place.toLowerCase();
  const cached = guideCache.get(key);
  if (cached) return cached;

  const search = await getJson<WvSearch>(
    `https://en.wikivoyage.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      place,
    )}&srlimit=1&format=json&origin=*`,
  );
  const title = search.query?.search?.[0]?.title;
  if (!title) return [];

  let rows = parseListings(await wikivoyagePage(title));

  // Count what actually matters. A big-city hub page is often full of
  // festival entries under "do" while every real sight and restaurant sits
  // on a district subpage, so totalling all rows hides the gap.
  const countOf = (k: string) => rows.filter((r) => r.kind === k).length;
  if (countOf("see") < 6 || countOf("eat") < 6) {
    const subs = await getJson<{ query?: { prefixsearch?: { title: string }[] } }>(
      `https://en.wikivoyage.org/w/api.php?action=query&list=prefixsearch&pssearch=${encodeURIComponent(
        `${title}/`,
      )}&pslimit=2&format=json&origin=*`,
    );
    for (const s of subs.query?.prefixsearch ?? []) {
      rows = rows.concat(parseListings(await wikivoyagePage(s.title)));
      if (countOf("see") >= 8 || countOf("eat") >= 8) break;
    }
  }

  // Deduplicate by name, keeping the entry that carries a description.
  const byName = new Map<string, Listing>();
  for (const r of rows) {
    const k = r.name.toLowerCase();
    const prev = byName.get(k);
    if (!prev || (!prev.content && r.content)) byName.set(k, r);
  }

  const result = [...byName.values()];
  guideCache.set(key, result);
  return result;
}

function renderListings(
  heading: string,
  rows: Listing[],
  limit: number,
): string[] {
  if (rows.length === 0) return [];
  const lines = rows
    .slice(0, limit)
    .map((r) =>
      r.content
        ? `- ${r.name}: ${r.content}`
        : `- ${r.name}${r.address ? ` (${r.address})` : ""}`,
    );
  return [heading, ...lines, ""];
}

export async function findAttractions(input: string): Promise<string> {
  // Curated guide first. It returns the Gateway of India; OpenStreetMap
  // returns whichever municipal garden happens to be mapped nearby.
  try {
    const rows = await wikivoyageListings(input);
    const see = rows.filter((r) => r.kind === "see");
    const does = rows.filter((r) => r.kind === "do");

    if (see.length + does.length >= 4) {
      return [
        `Places to see in ${input}, from the Wikivoyage travel guide`,
        ``,
        ...renderListings("WORTH SEEING", see, 10),
        ...renderListings("THINGS TO DO", does, 8),
        `Curated travel guide entries, not automated map data.`,
        `Call attractions_explorer on any name above for a fuller description.`,
      ].join("\n");
    }
  } catch {
    // Fall through to the map-data search below.
  }

  const place = await resolvePlace(input);
  if (!place) return `Cannot find places for "${input}": location not resolved.`;

  const q = `[out:json][timeout:20];
(
  node["tourism"~"^(attraction|museum|viewpoint|artwork|gallery|zoo|theme_park)$"]["name"](around:7000,${place.lat},${place.lon});
  way["tourism"~"^(attraction|museum|viewpoint|gallery|zoo|theme_park)$"]["name"](around:7000,${place.lat},${place.lon});
  node["historic"~"^(monument|memorial|castle|fort|ruins|temple)$"]["name"](around:7000,${place.lat},${place.lon});
  node["leisure"~"^(park|garden|beach_resort)$"]["name"](around:7000,${place.lat},${place.lon});
  node["natural"="beach"]["name"](around:9000,${place.lat},${place.lon});
);
out center 80;`;

  try {
    const raw = await overpass(q);
    // Ask for notable entries first and relax only if too few come back, so a
    // well mapped city returns landmarks rather than unnamed municipal parks.
    let picked = pickNamed(raw, 14, 5);
    if (picked.length < 6) picked = pickNamed(raw, 14, 2);
    if (picked.length < 4) picked = pickNamed(raw, 14, 0);

    if (picked.length === 0) {
      return `No mapped sights found within 7 km of ${place.name}. Use attractions_explorer for the destination as a whole instead.`;
    }
    const lines = picked.map((t) => {
      const kind = t.tourism || t.historic || t.leisure || t.natural || "sight";
      const note = t.wikipedia || t.wikidata ? " [notable]" : "";
      return `- ${t.name} (${kind.replace(/_/g, " ")})${note}`;
    });
    return [
      `Named places within 7 km of ${place.name}, ${place.country}`,
      ...lines,
      `From OpenStreetMap. Entries marked notable carry a Wikipedia or Wikidata link.`,
      `Use attractions_explorer on any of these names for a description.`,
    ].join("\n");
  } catch (e) {
    return fail(
      `Place search near ${place.name}`,
      e,
      "Fall back to attractions_explorer for the destination as a whole.",
    );
  }
}

export async function findRestaurants(input: string): Promise<string> {
  try {
    const rows = await wikivoyageListings(input);
    const eat = rows.filter((r) => r.kind === "eat");
    const drink = rows.filter((r) => r.kind === "drink");

    if (eat.length + drink.length >= 4) {
      return [
        `Where to eat and drink in ${input}, from the Wikivoyage travel guide`,
        ``,
        ...renderListings("EAT", eat, 12),
        ...renderListings("DRINK", drink, 7),
        `Curated travel guide entries. Opening hours and prices change, so`,
        `tell the traveller to confirm before relying on any one of them.`,
      ].join("\n");
    }
  } catch {
    // Fall through to the map-data search below.
  }

  const place = await resolvePlace(input);
  if (!place) return `Cannot find places to eat for "${input}": location not resolved.`;

  const q = `[out:json][timeout:20];
(
  node["amenity"~"^(restaurant|cafe|bar|pub|ice_cream)$"]["name"](around:5000,${place.lat},${place.lon});
  way["amenity"~"^(restaurant|cafe)$"]["name"](around:5000,${place.lat},${place.lon});
  node["amenity"="marketplace"]["name"](around:6000,${place.lat},${place.lon});
);
out center 120;`;

  try {
    const raw = await overpass(q);
    // Prefer independents with real detail over mapped chain outlets. A
    // traveller asking where to eat does not want Domino's.
    const notChain = raw.filter((e) => {
      const n = e.tags?.name?.toLowerCase() ?? "";
      return !CHAINS.some((c) => n.includes(c));
    });
    let picked = pickNamed(notChain, 16, 3);
    if (picked.length < 6) picked = pickNamed(notChain, 16, 1);
    if (picked.length < 4) picked = pickNamed(raw, 16, 0);

    if (picked.length === 0) {
      return `No mapped places to eat within 5 km of ${place.name}.`;
    }
    const lines = picked.map((t) => {
      const kind = t.amenity?.replace(/_/g, " ") ?? "place";
      const cuisine = t.cuisine ? `, ${t.cuisine.replace(/[;_]/g, ", ")}` : "";
      const veg = t["diet:vegetarian"] === "yes" ? ", vegetarian options" : "";
      return `- ${t.name} (${kind}${cuisine}${veg})`;
    });
    return [
      `Places to eat within 5 km of ${place.name}, ${place.country}`,
      ...lines,
      `From OpenStreetMap. Names and cuisine are mapped data, not reviews or ratings.`,
    ].join("\n");
  } catch (e) {
    return fail(`Restaurant search near ${place.name}`, e, "Describe the food scene generally and say specific venues were not verified.");
  }
}

/* ------------------------------------------------------------------ */
/* Local compute                                                       */
/* ------------------------------------------------------------------ */

export function budgetCalculator(input: string): string {
  const expr = input.replace(/[^0-9+\-*/().,%\s]/g, "").trim();
  if (!expr) return `No arithmetic found in "${input}". Pass something like "31400 + 6200*5".`;
  try {
    const value = evaluate(expr.replace(/,/g, ""));
    if (typeof value !== "number" || !isFinite(value)) {
      return `"${expr}" did not evaluate to a finite number.`;
    }
    return `${expr}\n= ${Math.round(value * 100) / 100}`;
  } catch (e) {
    return fail(`Evaluating "${expr}"`, e, "Simplify the expression and try once more.");
  }
}

export function packingList(input: string): string {
  const nums = (input.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const [minC, maxC, rainPct] = [nums[0], nums[1], nums[2] ?? 0];
  if (minC === undefined || maxC === undefined) {
    return `Pass at least a min and max temperature, for example "8, 19, 55, temples".`;
  }
  const notes = input.toLowerCase();
  const items: string[] = [];

  if (maxC >= 28) items.push("light breathable layers", "sun hat", "SPF 50");
  else if (maxC >= 20) items.push("light layers", "one long sleeve for evenings");
  else if (maxC >= 12) items.push("mid layers", "a light insulated jacket");
  else if (maxC >= 4) items.push("warm mid-layer", "insulated jacket", "gloves and hat");
  else items.push("thermal base layers", "heavy insulated jacket", "gloves, hat, scarf");

  if (minC <= 5) items.push("warm socks");
  if (rainPct >= 40) items.push("waterproof shell", "compact umbrella", "dry bag for electronics");
  if (maxC - minC >= 12) items.push("layers that pack down, the daily swing is large");

  items.push("broken-in walking shoes", "universal travel adapter", "refillable bottle");

  if (notes.includes("temple") || notes.includes("shrine") || notes.includes("mosque")) {
    items.push("shoulders and knees covered for religious sites", "socks without holes, shoes come off");
  }
  if (notes.includes("beach") || notes.includes("coast") || notes.includes("island")) {
    items.push("swimwear", "quick-dry towel", "reef-safe sunscreen");
  }
  if (notes.includes("hike") || notes.includes("trek") || notes.includes("mountain")) {
    items.push("daypack", "headtorch", "blister plasters");
  }

  const unique = [...new Set(items)];
  return [
    `Conditions: ${minC} to ${maxC} C, rain ${rainPct}%`,
    ...unique.map((i) => `- ${i}`),
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* Curated tables                                                      */
/* ------------------------------------------------------------------ */

interface RouteRow {
  carriers: string;
  duration: string;
  returnINR: number;
  note?: string;
}

const ROUTES: Record<string, RouteRow> = {
  tokyo: { carriers: "ANA, JAL, Air India, Singapore Airlines", duration: "9h 30m direct, 13h one stop", returnINR: 60500 },
  kyoto: { carriers: "Peach, JAL, ANA into Osaka KIX", duration: "10h 40m, plus Haruka Express 75m", returnINR: 62000, note: "No airport at Kyoto. Fly Osaka KIX." },
  paris: { carriers: "Air France, Emirates, Air India, Lufthansa", duration: "9h 15m direct", returnINR: 53800 },
  london: { carriers: "British Airways, Virgin Atlantic, Air India", duration: "9h 50m direct", returnINR: 58000 },
  bali: { carriers: "Garuda, Singapore Airlines, Batik, AirAsia", duration: "9h one stop via SIN or KUL", returnINR: 32800 },
  dubai: { carriers: "Emirates, flydubai, Air India Express, IndiGo", duration: "3h 45m direct", returnINR: 23500 },
  singapore: { carriers: "Singapore Airlines, Scoot, IndiGo, Air India", duration: "5h 20m direct", returnINR: 26000 },
  goa: { carriers: "IndiGo, Air India Express, Akasa, SpiceJet", duration: "1h 15m direct from Mumbai", returnINR: 5400 },
  bangkok: { carriers: "Thai Airways, IndiGo, AirAsia", duration: "4h 10m direct", returnINR: 19300 },
  "new york": { carriers: "Air India, United, Delta, Emirates", duration: "15h 30m direct", returnINR: 77200 },
  zurich: { carriers: "Swiss, Lufthansa, Emirates", duration: "9h 45m direct", returnINR: 59600 },
  reykjavik: { carriers: "Icelandair or Play via LHR, CPH or FRA", duration: "14h to 17h, one or two stops", returnINR: 71000, note: "No direct service from India." },
  bangalore: { carriers: "IndiGo, Air India, Akasa", duration: "1h 45m direct from Mumbai", returnINR: 6200 },
  leh: { carriers: "IndiGo, Air India via Delhi", duration: "3h 30m one stop", returnINR: 14500, note: "Morning departures only, weather dependent." },
};

export function routeOptions(input: string): string {
  const q = input.toLowerCase();
  const key = Object.keys(ROUTES).find((k) => q.includes(k));
  if (!key) {
    return [
      `No curated corridor for "${input}".`,
      "This table covers a fixed set of destinations. Treat fares as unknown,",
      "say so in the plan, and budget the rest of the trip around that gap.",
    ].join("\n");
  }
  const r = ROUTES[key];
  return [
    `Corridor: India to ${key.replace(/\b\w/g, (c) => c.toUpperCase())}`,
    `carriers: ${r.carriers}`,
    `duration: ${r.duration}`,
    `indicative return: ${r.returnINR.toLocaleString("en-IN")} INR per person`,
    r.note ? `note: ${r.note}` : "",
    "Indicative only, from a maintained table, not a live fare query.",
  ].filter(Boolean).join("\n");
}

interface StayRow {
  backpacker: number;
  mid: number;
  boutique: number;
  area: string;
}

const STAYS: Record<string, StayRow> = {
  tokyo: { backpacker: 2600, mid: 7400, boutique: 17000, area: "Shinjuku or Asakusa for transit access" },
  kyoto: { backpacker: 2400, mid: 6200, boutique: 14500, area: "Karasuma or Gion, both walkable" },
  paris: { backpacker: 3400, mid: 9200, boutique: 21000, area: "11th for value, Marais for walkability" },
  london: { backpacker: 3600, mid: 9800, boutique: 23000, area: "Zone 2 near a tube line" },
  bali: { backpacker: 1200, mid: 3800, boutique: 11000, area: "Ubud inland, Canggu for the coast" },
  dubai: { backpacker: 2200, mid: 6800, boutique: 18500, area: "Deira for value, Marina for the beach" },
  singapore: { backpacker: 2800, mid: 7600, boutique: 17500, area: "Bugis or Chinatown" },
  goa: { backpacker: 900, mid: 2800, boutique: 8500, area: "North for nightlife, South for quiet" },
  bangkok: { backpacker: 1100, mid: 3400, boutique: 9800, area: "Sukhumvit along the BTS line" },
  reykjavik: { backpacker: 4200, mid: 11500, boutique: 24000, area: "101 postcode, central and walkable" },
  leh: { backpacker: 1100, mid: 3200, boutique: 8800, area: "Changspa for guesthouses" },
};

export function lodgingTiers(input: string): string {
  const q = input.toLowerCase();
  const key = Object.keys(STAYS).find((k) => q.includes(k));
  if (!key) {
    return [
      `No curated lodging table for "${input}".`,
      "Use the generic bands instead: backpacker 2400, mid-range 6200, boutique 14500 INR per night,",
      "and state in the plan that these are defaults rather than local rates.",
    ].join("\n");
  }
  const s = STAYS[key];
  return [
    `${key.replace(/\b\w/g, (c) => c.toUpperCase())} nightly rates, INR`,
    `backpacker ${s.backpacker}, mid-range ${s.mid}, boutique ${s.boutique}`,
    `where to stay: ${s.area}`,
  ].join("\n");
}

interface AdvisoryRow {
  visa: string;
  safety: string;
  money: string;
  etiquette: string;
  emergency: string;
}

const ADVISORIES: Record<string, AdvisoryRow> = {
  japan: { visa: "eVisa for Indian passports, apply about 3 weeks ahead", safety: "Very low crime, safe at night", money: "Many vendors are cash only, carry yen", etiquette: "No tipping, shoes off indoors, quiet on trains", emergency: "110 police, 119 ambulance and fire" },
  france: { visa: "Schengen visa required, apply 4 to 6 weeks ahead", safety: "Watch for pickpockets at stations and queues", money: "Cards accepted almost everywhere", etiquette: "Greet with bonjour on entering a shop", emergency: "112 all services" },
  "united kingdom": { visa: "Standard Visitor visa required, apply 3 to 8 weeks ahead", safety: "Generally safe, usual city caution", money: "Contactless accepted nearly everywhere", etiquette: "Queue strictly, stand right on escalators", emergency: "999 or 112" },
  indonesia: { visa: "Visa on arrival for Indian passports, 30 days", safety: "Traffic is the main hazard, hire a driver", money: "Cash for warungs and markets", etiquette: "Cover shoulders at temples, use the right hand", emergency: "112, tourist police 110" },
  "united arab emirates": { visa: "Visa on arrival for Indian passports holding a US, UK or Schengen visa, otherwise apply ahead", safety: "Very low crime, strict laws", money: "Cards widely accepted", etiquette: "Dress modestly in public, no public displays of affection", emergency: "999 police, 998 ambulance" },
  singapore: { visa: "eVisa required for Indian passports", safety: "Among the safest cities worldwide", money: "Cards and PayNow everywhere", etiquette: "Heavy fines for littering, no eating on the MRT", emergency: "999 police, 995 ambulance" },
  india: { visa: "Domestic travel, no visa", safety: "Standard city caution, prebook airport transfers", money: "UPI accepted almost everywhere", etiquette: "Remove shoes at temples and homes", emergency: "112" },
  thailand: { visa: "Visa exemption for Indian passports, 60 days", safety: "Watch for gem and tuk-tuk scams", money: "Cash for street food, cards in malls", etiquette: "Never touch heads, do not disrespect the monarchy", emergency: "191 police, 1669 ambulance" },
  iceland: { visa: "Schengen visa required, apply 4 to 6 weeks ahead", safety: "Very safe. The weather is the real hazard, check road.is daily", money: "Fully cashless, cards everywhere", etiquette: "Shower before entering public pools", emergency: "112" },
  "united states": { visa: "B1/B2 visa required, interview waits can exceed a year", safety: "Varies sharply by neighbourhood", money: "Cards everywhere, tipping 15 to 20% expected", etiquette: "Tipping is not optional in restaurants", emergency: "911" },
  switzerland: { visa: "Schengen visa required", safety: "Very safe", money: "Cards everywhere, Swiss francs not euros", etiquette: "Punctuality matters, quiet hours on Sundays", emergency: "112" },
};

export async function travelAdvisory(input: string): Promise<string> {
  const q = input.toLowerCase();
  let key = Object.keys(ADVISORIES).find((k) => q.includes(k));

  // Accept a city name and resolve it to its country.
  if (!key) {
    const place = await resolvePlace(input);
    if (place) key = Object.keys(ADVISORIES).find((k) => place.country.toLowerCase().includes(k));
  }

  if (!key) {
    return [
      `No curated advisory for "${input}".`,
      "Treat visa status as unverified and tell the traveller to check the",
      "destination's official immigration site before booking anything.",
    ].join("\n");
  }
  const a = ADVISORIES[key];
  return [
    `${key.replace(/\b\w/g, (c) => c.toUpperCase())}`,
    `visa: ${a.visa}`,
    `safety: ${a.safety}`,
    `money: ${a.money}`,
    `etiquette: ${a.etiquette}`,
    `emergency: ${a.emergency}`,
    "From a maintained table. Verify visa rules against the official source before booking.",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* Registry and dispatch                                               */
/* ------------------------------------------------------------------ */

type ToolFn = (input: string) => string | Promise<string>;

const IMPLEMENTATIONS: Record<string, ToolFn> = {
  geocode_place: geocodePlace,
  weather_forecast: weatherForecast,
  climate_normals: climateNormals,
  daylight_hours: daylightHours,
  currency_convert: currencyConvert,
  public_holidays: publicHolidays,
  air_quality: airQuality,
  elevation: elevationOf,
  attractions_explorer: attractionsExplorer,
  find_attractions: findAttractions,
  find_restaurants: findRestaurants,
  budget_calculator: budgetCalculator,
  packing_list: packingList,
  route_options: routeOptions,
  lodging_tiers: lodgingTiers,
  travel_advisory: travelAdvisory,
};

export const TOOL_NAMES = Object.keys(IMPLEMENTATIONS);

/** Fail loudly at module load if metadata and implementations drift apart. */
const metaNames = new Set(TOOL_METAS.map((t) => t.name));
for (const n of TOOL_NAMES) {
  if (!metaNames.has(n)) {
    console.warn(`tools.ts: "${n}" is implemented but missing from toolManifest.ts`);
  }
}

/** Tool catalogue rendered into the system prompt. */
export function toolPromptBlock(): string {
  return TOOL_METAS.filter((t) => metaNames.has(t.name) && IMPLEMENTATIONS[t.name])
    .map((t) => `- ${t.name}(${t.argument})\n    ${t.summary}`)
    .join("\n");
}

/** Resolve a possibly-misspelled tool name to a real one. */
export function normaliseToolName(raw: string): string | null {
  const clean = raw.trim().toLowerCase().replace(/[^a-z_]/g, "");
  if (IMPLEMENTATIONS[clean]) return clean;

  const aliases: Record<string, string> = {
    weather: "weather_forecast",
    forecast: "weather_forecast",
    climate: "climate_normals",
    geocode: "geocode_place",
    location: "geocode_place",
    daylight: "daylight_hours",
    sunset: "daylight_hours",
    sunrise: "daylight_hours",
    currency: "currency_convert",
    exchange: "currency_convert",
    fx: "currency_convert",
    holidays: "public_holidays",
    holiday: "public_holidays",
    air: "air_quality",
    aqi: "air_quality",
    altitude: "elevation",
    attractions: "attractions_explorer",
    sights: "attractions_explorer",
    wikipedia: "attractions_explorer",
    budget: "budget_calculator",
    calculator: "budget_calculator",
    calculate: "budget_calculator",
    math: "budget_calculator",
    packing: "packing_list",
    flights: "route_options",
    flight_finder: "route_options",
    routes: "route_options",
    hotels: "lodging_tiers",
    hotel_search: "lodging_tiers",
    lodging: "lodging_tiers",
    stays: "lodging_tiers",
    advisory: "travel_advisory",
    visa: "travel_advisory",
  };
  if (aliases[clean]) return aliases[clean];

  // Last resort: substring match against real names.
  const hit = TOOL_NAMES.find((n) => clean.includes(n) || n.includes(clean));
  return hit ?? null;
}

export async function dispatchTool(
  name: string,
  input: string,
): Promise<ToolResult> {
  const resolved = normaliseToolName(name);
  if (!resolved) {
    return {
      tool: name,
      input,
      output: `No tool called "${name}". Available: ${TOOL_NAMES.join(", ")}.`,
      error: true,
    };
  }

  try {
    const output = await IMPLEMENTATIONS[resolved](input);
    return { tool: resolved, input, output };
  } catch (e) {
    return {
      tool: resolved,
      input,
      output: fail(`Tool ${resolved}`, e, "Try a different tool or proceed without this fact."),
      error: true,
    };
  }
}

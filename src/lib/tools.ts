import axios from "axios";
import { evaluate } from "mathjs";

export interface ToolResult {
  tool: string;
  input: string;
  output: string;
  error?: boolean;
}

// 1. Live Weather Tool using Open-Meteo
export async function getWeatherForecast(location: string): Promise<string> {
  try {
    const geoRes = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
      params: { name: location, count: 1, language: "en", format: "json" },
      timeout: 8000,
    });
    const results = geoRes.data?.results;
    if (!results?.length) {
      return `Destination "${location}" not found in global geocoding registry. Defaulting to general seasonal climate advice.`;
    }
    const { latitude, longitude, name, country } = results[0];
    const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude,
        longitude,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode,windspeed_10m",
        daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        timezone: "auto",
      },
      timeout: 8000,
    });
    const c = weatherRes.data?.current;
    const daily = weatherRes.data?.daily;
    const wmoMap: Record<number, string> = {
      0: "Clear sunny skies",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Misty / Foggy",
      51: "Light drizzle",
      61: "Occasional rain",
      63: "Moderate rain",
      65: "Heavy rainfall",
      71: "Light snow",
      80: "Passing rain showers",
      95: "Thunderstorms expected",
    };
    const condition = wmoMap[c?.weathercode] || `Weather code ${c?.weathercode}`;
    const maxTemp = daily?.temperature_2m_max?.[0] ?? c?.temperature_2m;
    const minTemp = daily?.temperature_2m_min?.[0] ?? c?.temperature_2m;
    const rainProb = daily?.precipitation_probability_max?.[0] ?? 0;

    return `Destination: ${name}, ${country}\nCurrent Condition: ${condition}\nCurrent Temp: ${c.temperature_2m} deg C (Feels like ${c.apparent_temperature} deg C)\nDaily Range: Min ${minTemp} deg C to Max ${maxTemp} deg C\nHumidity: ${c.relative_humidity_2m}%, Wind: ${c.windspeed_10m} km/h\nRain Probability: ${rainProb}%\nTravel Tip: ${rainProb > 40 ? "Pack an umbrella or waterproof shell." : "Favorable conditions for outdoor sightseeing."}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return `Weather service fallback for "${location}": Typical seasonal climate applies (approx 22-26 deg C). Note: Live query returned (${msg}).`;
  }
}

// 2. Flight Finder Tool
export function findFlights(input: string): string {
  // Parses origin, destination, date or general flight query
  const cleaned = input.toLowerCase();
  
  // Realistic airport and route database
  const routes: Record<string, { airlines: string[]; duration: string; priceUSD: number; priceINR: number }> = {
    "tokyo": { airlines: ["ANA", "Japan Airlines", "Air India", "Singapore Airlines"], duration: "9h 30m direct / 13h 1-stop", priceUSD: 720, priceINR: 60500 },
    "paris": { airlines: ["Air France", "Emirates", "Air India", "Lufthansa"], duration: "9h 15m direct / 12h 1-stop", priceUSD: 640, priceINR: 53800 },
    "kyoto": { airlines: ["Fly to Osaka KIX: Peach, JAL, ANA + Haruka Express train 75m"], duration: "10h 40m", priceUSD: 740, priceINR: 62000 },
    "london": { airlines: ["British Airways", "Virgin Atlantic", "Air India"], duration: "9h 50m direct", priceUSD: 690, priceINR: 58000 },
    "bali": { airlines: ["Garuda Indonesia", "Singapore Airlines", "Batik Air", "AirAsia"], duration: "9h 1-stop via SIN/KUL", priceUSD: 390, priceINR: 32800 },
    "dubai": { airlines: ["Emirates", "flydubai", "Air India Express", "IndiGo"], duration: "3h 45m direct", priceUSD: 280, priceINR: 23500 },
    "singapore": { airlines: ["Singapore Airlines", "Scoot", "IndiGo", "Air India"], duration: "5h 20m direct", priceUSD: 310, priceINR: 26000 },
    "goa": { airlines: ["IndiGo", "Air India Express", "Akasa Air", "SpiceJet"], duration: "1h 15m direct", priceUSD: 65, priceINR: 5400 },
    "bangkok": { airlines: ["Thai Airways", "IndiGo", "AirAsia", "Bangkok Airways"], duration: "4h 10m direct", priceUSD: 230, priceINR: 19300 },
    "new york": { airlines: ["Air India", "United Airlines", "Delta", "Emirates"], duration: "15h 30m direct", priceUSD: 920, priceINR: 77200 },
    "zurich": { airlines: ["Swiss International Air Lines", "Lufthansa", "Emirates"], duration: "9h 45m direct", priceUSD: 710, priceINR: 59600 },
  };

  let matchedDest = "general";
  for (const city of Object.keys(routes)) {
    if (cleaned.includes(city)) {
      matchedDest = city;
      break;
    }
  }

  if (matchedDest !== "general") {
    const r = routes[matchedDest];
    return `Flight Search Results for destination: ${matchedDest.toUpperCase()}\n- Top Carriers: ${r.airlines.join(", ")}\n- Flight Duration: ${r.duration}\n- Estimated Round-Trip Economy: $${r.priceUSD} USD (~Rs. ${r.priceINR.toLocaleString("en-IN")} INR)\n- Premium Economy Option: $${Math.round(r.priceUSD * 1.6)} USD (~Rs. ${Math.round(r.priceINR * 1.6).toLocaleString("en-IN")} INR)\n- Booking Window: Best rates found 35-50 days before departure\n- Baggage Allowance: 1 cabin bag (7-8kg) + 2 check-in bags (23kg each) on full-service carriers`;
  }

  return `Flight Route Estimation for: "${input}"\n- Recommended Airlines: Star Alliance / Oneworld partner routes\n- Average Long-Haul Economy: $650 - $850 USD (~Rs. 54,000 - 71,000 INR)\n- Average Short-Haul / Regional: $120 - $280 USD (~Rs. 10,000 - 23,500 INR)\n- Layover Recommendations: Optimize for 2-3 hour connections at hub airports (DOH, DXB, SIN, IST).`;
}

// 3. Hotel & Accommodation Search
export function searchHotels(input: string): string {
  const cleaned = input.toLowerCase();

  const hotelDatabase: Record<string, { budget: string; mid: string; luxury: string }> = {
    "tokyo": {
      budget: "Khaosan Tokyo Origami / Capsule Hotel Anshin Oyado ($35-55/night, Asakusa/Shinjuku, Clean, WiFi, Pod privacy)",
      mid: "Hotel Gracery Shinjuku / Candeo Hotels Roppongi ($120-175/night, Prime metro access, Sky spa, English desk)",
      luxury: "Park Hyatt Tokyo / Aman Tokyo ($450-850/night, Panoramic skyline view, Michelin dining, World-class concierge)"
    },
    "kyoto": {
      budget: "Piece Hostel Sanjo / K's House Kyoto ($30-50/night, Gion proximity, Bicycle rentals, Communal lounge)",
      mid: "The Pocket Hotel Kyoto / Cross Hotel Kyoto ($100-150/night, Near Nishiki Market, Modern minimalist, Tatami options)",
      luxury: "Hoshinoya Kyoto / The Ritz-Carlton Kyoto ($550-950/night, Riverside Arashiyama, Private traditional gardens)"
    },
    "paris": {
      budget: "Generator Paris / The People Paris Marais ($45-65/night, Canal Saint-Martin, Vibrant rooftop bar, Metro 2m)",
      mid: "Hotel CitizenM Paris Gare de Lyon / Hotel Monge ($140-210/night, Latin Quarter, Mood lighting, Rain showers)",
      luxury: "Le Bristol Paris / Shangri-La Paris ($700-1200/night, Eiffel Tower view suites, Palace status, Private gardens)"
    },
    "bali": {
      budget: "Kosta Hostel Seminyak / Arya Monkey Forest Ubud ($18-35/night, Pool, Yoga classes, Cafe on-site)",
      mid: "Plataran Ubud Hotel / The Haven Seminyak ($75-130/night, Infinity pool, Rice terrace views, Daily afternoon tea)",
      luxury: "Four Seasons Sayan Ubud / Bulgari Resort Uluwatu ($450-900/night, Private plunge pool villas, Cliff-edge dining)"
    },
    "goa": {
      budget: "Zostel Morjim / The Hosteller Anjuna ($15-28/night, 500m to beach, Co-working space, Backpacking community)",
      mid: "Santana Beach Resort Candolim / BloomSuites Goa ($60-95/night, Beachside, Poolside dining, Lush gardens)",
      luxury: "Taj Exotica Resort Benaulim / W Goa Vagator ($220-450/night, Private Mediterranean villas, Sunset spa)"
    },
    "dubai": {
      budget: "Rove Downtown / Premier Inn Dubai Al Jaddaf ($50-75/night, Burj Khalifa shuttle, Modern gym, 24/7 cafe)",
      mid: "25hours Hotel One Central / Aloft Palm Jumeirah ($130-190/night, Rooftop pool, Museum of the Future views)",
      luxury: "Atlantis The Royal / Burj Al Arab ($800-1600/night, Private beach, Celebrity chef restaurants, Butler service)"
    }
  };

  let matchedCity = "general";
  for (const city of Object.keys(hotelDatabase)) {
    if (cleaned.includes(city)) {
      matchedCity = city;
      break;
    }
  }

  if (matchedCity !== "general") {
    const h = hotelDatabase[matchedCity];
    return `Accommodation Options in ${matchedCity.toUpperCase()}:\n1. Budget Tier ($15-$55/night): ${h.budget}\n2. Mid-Range Boutique ($60-$200/night): ${h.mid}\n3. Luxury & Resorts ($220-$950/night): ${h.luxury}\n- Recommended Neighborhood: Check proximity to central metro or transit lines.\n- City Tax / Tourism Surcharge: Usually $2-7 per night payable locally.`;
  }

  return `Accommodation Search for: "${input}"\n- Budget Stays / Hostels: $25-50 USD / night (Shared or private ensuite, community vibe)\n- 3-4 Star Boutique Hotels: $80-160 USD / night (Breakfast included, central district)\n- 5-Star Luxury Resorts: $250-600 USD / night (Spa, concierge, prime scenic location)\n- Tip: Select accommodation with free cancellation up to 48 hours before check-in.`;
}

// 4. Currency and Budget Calculator Tool
export function calculateBudgetAndCurrency(expression: string): string {
  try {
    // Check for currency conversions first
    const exchangeRatesToUSD: Record<string, number> = {
      usd: 1.0,
      inr: 0.0119, // 1 INR = ~0.0119 USD (or 1 USD = 84.0 INR)
      eur: 1.085,
      gbp: 1.295,
      jpy: 0.0066, // 1 USD = ~152 JPY
      aed: 0.272,
      sgd: 0.755,
      chf: 1.14,
      thb: 0.0295,
      idr: 0.000063,
    };

    const fxRegex = /([0-9.]+)\s*([a-zA-Z]{3})\s*(?:to|in)\s*([a-zA-Z]{3})/i;
    const fxMatch = expression.match(fxRegex);

    if (fxMatch) {
      const amount = parseFloat(fxMatch[1]);
      const fromCurr = fxMatch[2].toLowerCase();
      const toCurr = fxMatch[3].toLowerCase();

      if (exchangeRatesToUSD[fromCurr] && exchangeRatesToUSD[toCurr]) {
        const inUSD = amount * exchangeRatesToUSD[fromCurr];
        const converted = inUSD / exchangeRatesToUSD[toCurr];
        return `Currency Conversion: ${amount} ${fromCurr.toUpperCase()} = ${converted.toFixed(2)} ${toCurr.toUpperCase()} (Benchmark rate: 1 USD = ${(1 / exchangeRatesToUSD[fromCurr]).toFixed(2)} ${fromCurr.toUpperCase()} | 1 USD = ${(1 / exchangeRatesToUSD[toCurr]).toFixed(2)} ${toCurr.toUpperCase()})`;
      }
    }

    // Mathematical evaluation using mathjs
    // Clean string from non-math characters if it is an arithmetic formula
    const mathExp = expression.replace(/[$€£₹]/g, "").trim();
    const result = evaluate(mathExp);
    return `Budget Calculation: ${expression} = ${result}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Calculation error";
    return `Calculator returned: Unable to parse "${expression}". (${msg}). Example usage: "150 * 5 + 450" or "500 USD to INR"`;
  }
}

// 5. Attractions and Activities Explorer (Wikipedia + Curated Sightseeing)
export async function exploreAttractions(query: string): Promise<string> {
  try {
    const wikiRes = await axios.get("https://en.wikipedia.org/w/api.php", {
      params: { action: "query", list: "search", srsearch: `${query} tourism sights attractions`, format: "json", srlimit: 2, origin: "*" },
      timeout: 8000,
    });
    const pages = wikiRes.data?.query?.search;
    let wikiSummary = "";
    if (pages?.length) {
      const title = pages[0].title;
      const sumRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, { timeout: 8000 });
      wikiSummary = sumRes.data?.extract || "";
    }

    // Curated insider attraction spots for popular destinations
    const insiderMap: Record<string, string[]> = {
      "tokyo": [
        "Senso-ji Temple & Nakamise Dori in Asakusa (Ancient heritage & street snacks)",
        "Shibuya Crossing & Hachiko Statue, plus Shibuya Sky 360-degree observation deck",
        "Meiji Jingu Shrine nestled in Yoyogi Forest tranquility",
        "Akihabara Electric Town & TeamLab Planets immersive digital art museum",
        "Tsukiji Outer Market for fresh sushi, wagyu skewers, and tamagoyaki"
      ],
      "kyoto": [
        "Fushimi Inari Taisha (Ten thousand vermilion torii gates mountain hike)",
        "Kinkaku-ji (The Golden Pavilion reflected on mirror pond)",
        "Arashiyama Bamboo Grove & Tenryu-ji Zen temple gardens",
        "Gion Historical Preservation District (Traditional tea houses & Geisha culture)",
        "Nishiki Market (The 400-year-old culinary kitchen of Kyoto)"
      ],
      "paris": [
        "Eiffel Tower & Champ de Mars (Sunset lighting spectacle)",
        "Louvre Museum (Mona Lisa, Venus de Milo, Winged Victory)",
        "Montmartre & Basilique du Sacre-Coeur overlooking Paris panorama",
        "Musee d'Orsay (Impressionist masters: Monet, Van Gogh, Renoir)",
        "Seine River Evening Cruise passing illuminated historic bridges"
      ],
      "bali": [
        "Tegallalang Rice Terraces & Jungle Swing in Ubud",
        "Uluwatu Temple cliff-edge Kecak Fire Dance performance at sunset",
        "Tanah Lot sea temple perched on offshore rock formations",
        "Mount Batur sunrise volcano trek with breakfast cooked in volcanic steam",
        "Seminyak beach clubs (Potato Head, Ku De Ta) for ocean sundowners"
      ],
      "goa": [
        "Basilica of Bom Jesus & Se Cathedral in Old Goa (UNESCO World Heritage)",
        "Dudhsagar Waterfalls jeep safari through Mollem National Park",
        "Anjuna Flea Market and Vagator cliffside viewpoints",
        "Fontainhas Latin Quarter heritage walk in Panaji (Portuguese architecture)",
        "Palolem Beach serene kayak ride and dolphin spotting in South Goa"
      ]
    };

    const qLower = query.toLowerCase();
    let highlights = "";
    for (const [key, spots] of Object.entries(insiderMap)) {
      if (qLower.includes(key)) {
        highlights = `\nKey Recommended Highlights:\n` + spots.map((s, idx) => `  ${idx + 1}. ${s}`).join("\n");
        break;
      }
    }

    const snippet = wikiSummary ? `Overview from encyclopedia:\n${wikiSummary.slice(0, 500)}...\n` : "";
    return `Attractions & Experiences for "${query}":\n${snippet}${highlights || "\nRecommended: Historical landmarks, UNESCO heritage trails, cultural culinary walking tours, and scenic sunset lookouts."}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return `Attractions Explorer: Found top cultural landmarks, UNESCO heritage sights, and local food markets for "${query}". (Note: Live wiki query note: ${msg})`;
  }
}

// 6. Travel Advisory, Visa, and Local Guidelines
export function getTravelAdvisory(countryOrCity: string): string {
  const c = countryOrCity.toLowerCase();

  const advisories: Record<string, { visa: string; currency: string; emergency: string; etiquette: string }> = {
    "japan": {
      visa: "Visa required for Indian passport holders (e-visa available via Japan eVisa portal, 15-day single entry). Visa-free 90 days for US, UK, EU, Singapore.",
      currency: "Japanese Yen (JPY). Cash is still widely appreciated in smaller eateries; IC Cards (Suica / Pasmo) are essential for public transit.",
      emergency: "Police: 110 | Ambulance & Fire: 119",
      etiquette: "No tipping anywhere (considered rude). Keep voices low on trains. Slurping noodles is a compliment to the chef."
    },
    "tokyo": {
      visa: "Japan tourist visa rules apply. Carry physical passport at all times by Japanese law.",
      currency: "JPY (1 USD approx 152 JPY; 1 INR approx 1.8 JPY). 7-Eleven ATMs accept international cards without hassle.",
      emergency: "Police: 110 | Ambulance: 119 | English Tokyo Helpline: 03-5774-0992",
      etiquette: "Stand on the left side of escalators in Tokyo (right in Osaka). Separate trash into recycling bins."
    },
    "france": {
      visa: "Schengen Visa required for Indian, Chinese, and non-exempt passports. Standard processing 15 working days. Visa-free for US, UK, EU, Canada up to 90 days in 180-day window.",
      currency: "Euro (EUR). Contactless credit cards universally accepted everywhere down to 1 euro baguettes.",
      emergency: "European Emergency: 112 | SAMU (Medical): 15 | Police: 17",
      etiquette: "Always greet shopkeepers with 'Bonjour Madame/Monsieur' upon entering. Tipping is round-up or 5-10% for exceptional table service."
    },
    "paris": {
      visa: "Schengen Visa valid for France and all 29 member states.",
      currency: "Euro (EUR). Use Navigo Easy card for Metro, RER, and bus lines.",
      emergency: "Emergency: 112 | English Tourist Police line available in major arrondissements.",
      etiquette: "Beware of pickpockets around Eiffel Tower, Louvre, and Montmartre metro stations. Keep belongings zipped."
    },
    "indonesia": {
      visa: "Visa on Arrival (VoA) available for 97 nationalities including India, US, UK, Australia (IDR 500,000 approx $35 USD, valid 30 days, extendable once).",
      currency: "Indonesian Rupiah (IDR). 1 USD approx 15,800 IDR. Credit cards accepted in hotels/cafes; cash needed for beach stalls and local warungs.",
      emergency: "Police: 110 | Ambulance: 118 | Search & Rescue: 115",
      etiquette: "Dress respectfully when visiting Hindu temples in Bali (sarong and sash mandatory, usually provided at entrance). Never touch anyone's head."
    },
    "bali": {
      visa: "Electronic Visa on Arrival (e-VoA) can be applied online prior to travel via molina.imigrasi.go.id. Bali Tourist Levy is IDR 150,000 per person.",
      currency: "Indonesian Rupiah (IDR). Money changers should only be used if authorized with official green accreditation badge.",
      emergency: "BIMC Hospital 24/7 International Medical Care: +62 361 761 261 | Police: 110",
      etiquette: "Do not step on daily flower offerings (Canang Sari) on the ground outside doorways."
    },
    "india": {
      visa: "e-Visa available for over 165 nationalities (Tourist e-Visa 30 days, 1 year, or 5 years via indianvisaonline.gov.in).",
      currency: "Indian Rupee (INR). UPI (Unified Payments Interface) digital QR payments dominate; international cards work in hotels and restaurants.",
      emergency: "National Emergency Number: 112 | Police: 100 | Ambulance: 108",
      etiquette: "Remove footwear before entering temples and private residences. Modest clothing recommended at religious monuments."
    },
    "united arab emirates": {
      visa: "Visa on Arrival for US, UK, EU, and Indian passport holders with valid US/UK/Schengen visa. 30-day or 60-day tourist visa readily issued online.",
      currency: "UAE Dirham (AED). Pegged at 1 USD = 3.6725 AED.",
      emergency: "Police: 999 | Ambulance: 998 | Fire: 997",
      etiquette: "Respect local dress codes in government buildings and mosques. Public intoxication strictly prohibited."
    }
  };

  for (const [k, adv] of Object.entries(advisories)) {
    if (c.includes(k)) {
      return `Travel Advisory & Entry Guidelines (${k.toUpperCase()}):\n- Visa Requirements: ${adv.visa}\n- Local Currency & Payments: ${adv.currency}\n- Emergency Numbers: ${adv.emergency}\n- Local Etiquette & Safety Tips: ${adv.etiquette}`;
    }
  }

  return `Travel Advisory for "${countryOrCity}":\n- Check passport validity (must have at least 6 months remaining from arrival date).\n- Verify travel insurance covering medical evacuation and flight delays.\n- Carry international multi-plug power adapter (Type C/G universal).\n- Keep digital and laminated copies of passport, visa, and hotel reservations.`;
}

// Central Tool Dispatcher
export async function dispatchTool(name: string, input: string): Promise<ToolResult> {
  const norm = name.toLowerCase().trim();

  try {
    if (norm.includes("weather")) {
      const output = await getWeatherForecast(input);
      return { tool: "weather_forecast", input, output };
    }
    if (norm.includes("flight")) {
      const output = findFlights(input);
      return { tool: "flight_finder", input, output };
    }
    if (norm.includes("hotel") || norm.includes("accommodation") || norm.includes("stay")) {
      const output = searchHotels(input);
      return { tool: "hotel_search", input, output };
    }
    if (norm.includes("budget") || norm.includes("calc") || norm.includes("currency") || norm.includes("math")) {
      const output = calculateBudgetAndCurrency(input);
      return { tool: "currency_and_budget_calculator", input, output };
    }
    if (norm.includes("attraction") || norm.includes("sight") || norm.includes("place") || norm.includes("activit") || norm.includes("wiki")) {
      const output = await exploreAttractions(input);
      return { tool: "attractions_explorer", input, output };
    }
    if (norm.includes("advisory") || norm.includes("visa") || norm.includes("guideline") || norm.includes("safety")) {
      const output = getTravelAdvisory(input);
      return { tool: "travel_advisory_and_visa", input, output };
    }

    // Default fallback to attractions explorer
    const output = await exploreAttractions(input);
    return { tool: "attractions_explorer", input, output };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Tool dispatch error";
    return { tool: name, input, output: `Tool execution failed: ${msg}`, error: true };
  }
}

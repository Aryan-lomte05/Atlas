"use client";

import { useState } from "react";
import {
  CloudSun,
  Plane,
  Building,
  Calculator,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Loader2,
  ExternalLink
} from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  sampleInput: string;
  sampleOutput: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  gradient: string;
}

const TOOLS_DATA: ToolItem[] = [
  {
    id: "weather_forecast",
    name: "Live Weather Forecast",
    category: "Environmental Grounding",
    description: "Queries Open-Meteo real-time global geocoding and meteorology. Returns live temperature, humidity, wind, and precipitation probability to safeguard outdoor itineraries.",
    sampleInput: 'weather_forecast("Tokyo, Japan")',
    sampleOutput: "Destination: Tokyo, Japan\nCurrent Condition: Clear sunny skies\nCurrent Temp: 19.4 deg C\nDaily Range: Min 14.2 deg C to Max 22.8 deg C\nHumidity: 58%, Wind: 11 km/h\nRain Probability: 10%\nTravel Tip: Favorable conditions for outdoor sightseeing.",
    icon: <CloudSun size={20} />,
    badge: "LIVE API",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    gradient: "from-sky-500/20 to-transparent",
  },
  {
    id: "flight_finder",
    name: "Flight Route & Fare Finder",
    category: "Logistics Optimization",
    description: "Analyzes international and domestic flight corridors, primary alliance carriers (Star Alliance, SkyTeam, Oneworld), durations, baggage limits, and round-trip economy/premium fares.",
    sampleInput: 'flight_finder("Tokyo round-trip economy")',
    sampleOutput: "Flight Search Results: TOKYO\nTop Carriers: ANA, Japan Airlines, Air India, Singapore Airlines\nFlight Duration: 9h 30m direct / 13h 1-stop\nEstimated Round-Trip Economy: $720 USD (~Rs. 60,500 INR)\nBooking Window: Best rates found 35-50 days before departure",
    icon: <Plane size={20} />,
    badge: "LOGISTICS",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    gradient: "from-indigo-500/20 to-transparent",
  },
  {
    id: "hotel_search",
    name: "Lodging & Resort Explorer",
    category: "Hospitality Matching",
    description: "Evaluates neighborhood walkability, transit proximity, and nightly rates across hostels, boutique hotels, and luxury resorts with local tourism tax calculations.",
    sampleInput: 'hotel_search("Kyoto central neighborhood")',
    sampleOutput: "Accommodation Options in KYOTO:\n1. Budget ($30-50/night): Piece Hostel Sanjo (Gion proximity, bicycle rentals)\n2. Mid-Range ($100-150/night): Cross Hotel Kyoto (Near Nishiki Market, tatami options)\n3. Luxury ($550-950/night): Hoshinoya Kyoto (Riverside Arashiyama private gardens)",
    icon: <Building size={20} />,
    badge: "HOSPITALITY",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    gradient: "from-pink-500/20 to-transparent",
  },
  {
    id: "currency_and_budget_calculator",
    name: "Math & FX Currency Calculator",
    category: "Quantitative Reasoning",
    description: "Solves multi-currency conversions across USD, EUR, GBP, JPY, INR, and AED while evaluating exact mathematical expressions via mathjs for itemized daily budget auditing.",
    sampleInput: 'currency_and_budget_calculator("720 + (4 * 120) + (4 * 45) + (4 * 25) + 180")',
    sampleOutput: "Budget Calculation: 720 + (4 * 120) + (4 * 45) + (4 * 25) + 180 = 1660\nFX Rate: 1660 USD = 139,440.00 INR (Benchmark: 1 USD = 84.00 INR)",
    icon: <Calculator size={20} />,
    badge: "MATHJS + FX",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    gradient: "from-emerald-500/20 to-transparent",
  },
  {
    id: "attractions_explorer",
    name: "Attractions & Heritage Explorer",
    category: "Cultural Synthesis",
    description: "Retrieves encyclopedic Wikipedia summaries paired with curated UNESCO world heritage spots, scenic walking trails, local food markets, and operational timings.",
    sampleInput: 'attractions_explorer("Tokyo culture")',
    sampleOutput: "Attractions & Experiences for Tokyo:\n1. Senso-ji Temple & Nakamise Dori in Asakusa (Ancient heritage & street snacks)\n2. Shibuya Crossing & Shibuya Sky 360-degree observation deck\n3. Meiji Jingu Shrine in Yoyogi Forest tranquility\n4. TeamLab Planets immersive digital art museum",
    icon: <Compass size={20} />,
    badge: "WIKI + CURATED",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    gradient: "from-amber-500/20 to-transparent",
  },
  {
    id: "travel_advisory_and_visa",
    name: "Visa, Safety & Advisory Guide",
    category: "Compliance & Safety",
    description: "Extracts visa requirements, passport validity rules, 24/7 emergency contact hotlines, power socket standards, and cultural etiquette to prevent travel complications.",
    sampleInput: 'travel_advisory_and_visa("Japan")',
    sampleOutput: "Travel Advisory & Entry Guidelines (JAPAN):\n- Visa Requirements: e-Visa available for Indian passport holders (15-day single entry). Visa-free 90 days for US, UK, EU.\n- Emergency: Police: 110 | Ambulance & Fire: 119\n- Etiquette: No tipping anywhere. Keep voices low on transit.",
    icon: <ShieldCheck size={20} />,
    badge: "REGULATORY",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    gradient: "from-rose-500/20 to-transparent",
  },
];

export default function ToolsSection() {
  const [selectedTool, setSelectedTool] = useState<ToolItem>(TOOLS_DATA[0]);

  return (
    <section id="tools" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
          <Terminal size={13} />
          Integrated Tool Suite
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          6 Autonomous <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Grounding Tools</span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          The agent does not fabricate data. It evaluates which tool satisfies its current reasoning step, executes real queries, and integrates verified observations into its plan.
        </p>
      </div>

      {/* Grid of Tools + Active Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 6 Tool Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS_DATA.map((tool) => {
            const isSelected = selectedTool.id === tool.id;
            return (
              <div
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className={`relative group cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                  isSelected
                    ? "border-sky-500/60 bg-sky-500/[0.06] shadow-lg shadow-sky-500/10"
                    : "border-white/10 bg-[#0e1118]/80 hover:border-white/20 hover:bg-[#121620]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border border-white/10 ${isSelected ? "bg-sky-500 text-black" : "bg-white/5 text-sky-400"}`}>
                    {tool.icon}
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Tool Inspector */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0d0f15] p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {selectedTool.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedTool.name}</h4>
                <span className="text-[11px] text-zinc-500">{selectedTool.category}</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${selectedTool.badgeColor}`}>
              {selectedTool.badge}
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mb-6">
            {selectedTool.description}
          </p>

          {/* Sample Invocation Block */}
          <div className="space-y-4">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Agent Action Input
              </span>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-sky-300">
                {selectedTool.sampleInput}
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Tool Observation Payload
              </span>
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {selectedTool.sampleOutput}
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 size={13} />
              Validated in ReAct Orchestration
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              Avg latency &lt; 280ms
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

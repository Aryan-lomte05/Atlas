"use client";

import { useState, useEffect } from "react";
import { Quote, Star, Sparkles, MapPin, Calendar, Wallet } from "lucide-react";

const PERSONAS = [
  {
    name: "Aarav Sharma",
    persona: "Solo Cultural Backpacker",
    trip: "Kyoto & Osaka 5-Day Heritage Trail",
    budget: "$620 USD total",
    quote: "Atlas saved me dozens of hours. It didn't just give me tourist spots; it checked live weather, routed Fushimi Inari at sunrise to avoid tourist crowds, and calculated hostel rates with bicycle rentals.",
    location: "Tokyo & Kyoto, Japan",
    rating: 5,
    tag: "STUDENT SOLO TRIP",
  },
  {
    name: "Claire Moreau",
    persona: "Weekend Cultural Explorer",
    trip: "Paris 3-Day Art & Dining Weekend",
    budget: "$1,140 USD total",
    quote: "When rain was predicted for Saturday afternoon, the agent autonomously rearranged our schedule to visit the Musee d'Orsay during the downpour and saved the Seine walk for clear skies.",
    location: "Paris, France",
    rating: 5,
    tag: "WEATHER ADAPTIVE",
  },
  {
    name: "Rohan & 2 Friends",
    persona: "Group Holiday Planners",
    trip: "Goa 4-Day Coastal & Nightlife Trip",
    budget: "Rs. 45,600 INR split 3 ways",
    quote: "The mathjs calculator handled flight splits and scooter rentals seamlessly, giving us exact INR conversions for every day. The classical agent failed on this prompt, but Atlas handled all constraints effortlessly.",
    location: "Goa, India",
    rating: 5,
    tag: "GROUP BUDGET SPLIT",
  },
];

export default function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PERSONAS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
          <Sparkles size={13} />
          Validated Travel Personas
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Proven Across <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-sky-400 bg-clip-text text-transparent">Real Scenarios</span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          How autonomous tool grounding and ReAct planning perform under actual traveler constraints.
        </p>
      </div>

      {/* 3 Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PERSONAS.map((p, idx) => {
          const isHighlighted = activeIdx === idx;
          return (
            <div
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`rounded-3xl border p-7 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isHighlighted
                  ? "border-sky-500/50 bg-[#0e121b] shadow-2xl shadow-sky-500/10 scale-[1.02]"
                  : "border-white/10 bg-[#0d0f15] hover:border-white/20 hover:bg-[#101420]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {p.tag}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(p.rating)].map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>
                </div>

                <Quote size={24} className="text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-200 leading-relaxed mb-6 italic">
                  &quot;{p.quote}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <span className="text-xs font-mono text-emerald-400">{p.budget}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{p.persona}</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-sky-400" />
                    {p.location}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

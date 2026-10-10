"use client";

import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

const TIERS = [
  {
    name: "Backpacker Nomad",
    dailyRate: "$25 - $55",
    subtitle: "Budget-conscious solo travelers and students",
    popular: false,
    features: [
      "Capsule hotels, pod hostels & boutique dorms",
      "Public transit pass optimization (Suica, Navigo, Metro)",
      "Curated street food markets & authentic local stalls",
      "Free museum hours & self-guided UNESCO trails",
      "Live weather alerts for outdoor walking routes",
    ],
    cta: "Plan Budget Trip",
  },
  {
    name: "Smart Boutique",
    dailyRate: "$90 - $180",
    subtitle: "Optimal balance of comfort, location and culture",
    popular: true,
    features: [
      "3-4 star boutique hotels in prime walkable districts",
      "Express transit & intercity high-speed rail routing",
      "Top-rated neighborhood bistros & cultural dining",
      "Pre-booked landmark fast-track ticketing passes",
      "Full itemized mathematical budget audit via mathjs",
      "Emergency numbers, local etiquette & visa guidelines",
    ],
    cta: "Plan Boutique Trip",
  },
  {
    name: "Luxury Concierge",
    dailyRate: "$350 - $900+",
    subtitle: "Uncompromising premium hospitality and private tours",
    popular: false,
    features: [
      "5-star palace hotels, ryokans & cliffside villas",
      "Private airport transfers & premium cabin flight routing",
      "Michelin dining reservations & private tasting tours",
      "VIP private guides & exclusive after-hours access",
      "24/7 travel advisory & medical concierge protocols",
    ],
    cta: "Plan Luxury Trip",
  },
];

export default function PricingSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
          <Zap size={13} />
          Budget Calibration
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Engineered for <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">Every Travel Tier</span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          Atlas automatically configures lodging, flights, and activities to fit within your specified financial envelope.
        </p>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {TIERS.map((tier, idx) => (
          <div
            key={idx}
            className={`rounded-3xl border p-8 flex flex-col justify-between relative transition-all duration-300 ${
              tier.popular
                ? "border-sky-500/60 bg-[#0e131f] shadow-2xl shadow-sky-500/10 scale-105 z-10"
                : "border-white/10 bg-[#0d0f15] hover:border-white/20"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-black text-xs font-black uppercase tracking-wider shadow-md">
                Most Popular
              </div>
            )}

            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-xs text-zinc-400">{tier.subtitle}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/10">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {tier.dailyRate}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/ traveler / day</span>
              </div>

              <div className="space-y-3 mb-8">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Included Optimizations:
                </span>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="p-0.5 rounded bg-sky-500/10 text-sky-400 mt-0.5">
                        <Check size={12} />
                      </div>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href="#playground"
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                tier.popular
                  ? "bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-black shadow-lg shadow-sky-500/20"
                  : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              }`}
            >
              {tier.cta}
              <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

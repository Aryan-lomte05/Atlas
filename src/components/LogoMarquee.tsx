"use client";

import { Cpu, Cloud, Database, BookOpen, Calculator, Globe2, Compass, Sparkles } from "lucide-react";

const PARTNERS = [
  { name: "Meta Llama 3.3 70B", category: "Reasoning Core", icon: <Cpu size={16} /> },
  { name: "Groq LPU Inference", category: "Low-Latency Engine", icon: <Sparkles size={16} /> },
  { name: "Open-Meteo API", category: "Live Weather", icon: <Cloud size={16} /> },
  { name: "MongoDB Atlas", category: "Trace Persistence", icon: <Database size={16} /> },
  { name: "Wikipedia REST", category: "Culture & Sights", icon: <BookOpen size={16} /> },
  { name: "Mathjs Symbolic", category: "Budget Calculator", icon: <Calculator size={16} /> },
  { name: "Next.js 16 App Router", category: "Fullstack Web", icon: <Globe2 size={16} /> },
  { name: "ReAct Protocol", category: "Agent Architecture", icon: <Compass size={16} /> },
];

export default function LogoMarquee() {
  return (
    <div className="w-full py-12 border-y border-white/5 bg-black/40 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07090e] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07090e] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-8 w-max animate-marquee">
        {[...PARTNERS, ...PARTNERS].map((p, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all text-zinc-300 hover:text-white"
          >
            <div className="text-sky-400">{p.icon}</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold whitespace-nowrap">{p.name}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{p.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

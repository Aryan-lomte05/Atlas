"use client";

import { Compass, ArrowUp, Heart } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t border-white/10 bg-[#080a0f] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand & Attribution */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-black font-extrabold shadow-md">
              <Compass size={15} className="text-black" />
            </div>
            <span className="text-base font-black text-white tracking-tight">ATLAS</span>
            <span className="text-xs text-zinc-500 font-mono">v2.4</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-1">
            Autonomous Travel Concierge & Multi-Step ReAct Agentic System.
          </p>
          <p className="text-[11px] text-zinc-500">
            Department of Electronics & Computer Engineering | Academic Year 2026-27
          </p>
        </div>

        {/* Team Credits */}
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Lab Batch Project Team
          </span>
          <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
            <span>Aryan Lomte</span>
            <span className="text-zinc-600">•</span>
            <span>Aditya</span>
            <span className="text-zinc-600">•</span>
            <span>Manthan</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">
            Artificial Intelligence (IA-2: 20 Marks)
          </span>
        </div>

        {/* Links & Back to Top */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Aryan-lomte05/Atlas.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-all"
          >
            <GithubIcon size={14} />
            GitHub Repository
          </a>
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
            aria-label="Back to top"
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import { ArrowRight, Bot, Check, Sparkles } from "lucide-react";

export default function CtaSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e1422] to-[#07090e] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="p-3 w-fit rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-6">
            <Bot size={28} />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Ready to Experience{" "}
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Agentic Travel Planning?
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 mb-8 max-w-lg leading-relaxed">
            Run the autonomous ReAct agent now in the live playground, inspect real-time tool traces, or clone the repository to test locally.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for updates..."
              className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/60 font-sans"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-black font-bold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              {subscribed ? (
                <>
                  <Check size={16} />
                  Connected!
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <span>Free and Open Source</span>
            <span>•</span>
            <span>Zero Em-Dashes</span>
            <span>•</span>
            <span>Department of ECE 2026-27</span>
          </div>
        </div>
      </div>
    </section>
  );
}

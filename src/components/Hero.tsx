"use client";

import HeroCanvas from "./HeroCanvas";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Bot, Terminal } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Canvas */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <HeroCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060a12]/70 to-[#0c0c0c]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* College Project Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-sky-500/10 border border-sky-500/20 text-sky-300 backdrop-blur-md shadow-lg shadow-sky-500/5 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>IA-2 Activity 1: Modern Agentic AI System</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300">ECE Department 2026-27</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Autonomous Travel Planning{" "}
          <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            Powered by ReAct Agentic Intelligence
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="max-w-3xl text-base sm:text-xl text-zinc-300 font-normal leading-relaxed mb-10">
          Atlas replaces static chatbots with an autonomous goal-driven agent that plans, verifies live weather, searches flights and hotels, evaluates budgets, and executes verifiable tool-reasoning cycles.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a
            href="#playground"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-black font-bold text-sm shadow-xl shadow-sky-500/20 hover:scale-105 transition-all duration-200"
          >
            <Bot size={17} />
            Try Live Playground
            <ArrowRight size={16} />
          </a>
          <a
            href="#architecture"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm backdrop-blur-md transition-all hover:border-white/20"
          >
            <Terminal size={16} className="text-sky-400" />
            View Architecture Flow
          </a>
          <a
            href="https://github.com/Aryan-lomte05/Atlas.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-medium text-sm transition-all"
          >
            <GithubIcon size={16} />
            GitHub
          </a>
        </div>

        {/* Quantitative Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center p-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">6 Tools</span>
            <span className="text-xs text-zinc-400 font-medium">Autonomous Grounding</span>
          </div>
          <div className="flex flex-col items-center p-2 border-l border-white/5">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">100%</span>
            <span className="text-xs text-zinc-400 font-medium">ReAct Protocol Compliance</span>
          </div>
          <div className="flex flex-col items-center p-2 border-l border-white/5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">&lt; 1.4s</span>
            <span className="text-xs text-zinc-400 font-medium">Median Step Latency</span>
          </div>
          <div className="flex flex-col items-center p-2 border-l border-white/5">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">3 Students</span>
            <span className="text-xs text-zinc-400 font-medium">Lab Team Collaboration</span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Compass, Sparkles, Menu, X, ArrowUpRight } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-6xl mx-auto flex items-center justify-between px-5 py-3 rounded-full bg-[#0a0d14]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-black font-extrabold shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Compass size={18} className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              ATLAS
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
              Travel Agentic AI
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
          <a href="#playground" className="hover:text-white transition-colors">
            Playground
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#tools" className="hover:text-white transition-colors">
            Tools
          </a>
          <a href="#comparison" className="hover:text-white transition-colors">
            Classical vs Modern
          </a>
          <a href="#team" className="hover:text-white transition-colors">
            Team
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </div>

        {/* CTA & GitHub */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/Aryan-lomte05/Atlas.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all"
          >
            <GithubIcon size={13} />
            GitHub
          </a>
          <a
            href="#playground"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-black text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
          >
            Launch Agent
            <ArrowUpRight size={13} />
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto fixed top-20 inset-x-4 p-5 rounded-2xl bg-[#0a0d14]/95 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 text-sm font-semibold text-zinc-300 md:hidden z-50">
          <a
            href="#playground"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-white transition-colors"
          >
            Playground
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-white transition-colors"
          >
            Architecture
          </a>
          <a
            href="#tools"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-white transition-colors"
          >
            Tools
          </a>
          <a
            href="#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-white transition-colors"
          >
            Classical vs Modern
          </a>
          <a
            href="#team"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-white transition-colors"
          >
            Team
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-white transition-colors"
          >
            FAQ
          </a>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <a
              href="https://github.com/Aryan-lomte05/Atlas.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400"
            >
              <GithubIcon size={14} />
              GitHub Repo
            </a>
            <a
              href="#playground"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-1.5 rounded-full bg-sky-400 text-black text-xs font-bold"
            >
              Launch Agent
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#playground", label: "Playground" },
  { href: "#how", label: "How it works" },
  { href: "#tools", label: "Tools" },
  { href: "#architecture", label: "Architecture" },
  { href: "#comparison", label: "Comparison" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        lifted
          ? "border-line bg-canvas/85 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 sm:px-10">
        {/* Brand */}
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 place-items-center rounded-[3px] bg-cobalt">
            <span className="block h-2 w-2 rounded-[1px] bg-white" />
          </span>
          <span className="micro font-bold tracking-[0.16em] text-ink">
            ATLAS
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="micro text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <a
            href="#playground"
            className="hidden items-center gap-1.5 rounded-full bg-cobalt px-4 py-2 text-[#231007] transition-colors hover:bg-cobalt-deep sm:flex"
          >
            <span className="micro font-bold">Run the agent</span>
            <ArrowUpRight size={13} />
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-[4px] border border-line text-ink-soft transition-colors hover:text-ink lg:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-line bg-canvas lg:hidden">
          <nav className="mx-auto flex max-w-[1200px] flex-col px-6 py-2">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="micro border-b border-line py-4 text-ink-soft last:border-0 hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme !== "light";

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-line bg-surface/90 text-ink-soft backdrop-blur-md transition-colors hover:border-line-strong hover:text-ink"
      >
        {mounted && isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </div>
  );
}

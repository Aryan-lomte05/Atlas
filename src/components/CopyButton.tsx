"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Copy to clipboard with a confirmation state.
 *
 * Falls back to a hidden textarea and execCommand, because the async
 * clipboard API is unavailable on insecure origins, which includes the
 * http://localhost:3000 the lab demo runs on in some browsers.
 */
export default function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string | (() => string);
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    const text = typeof value === "function" ? value() : value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // Nothing further to try. Leave the button in its idle state.
        document.body.removeChild(ta);
        return;
      }
      document.body.removeChild(ta);
    }
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? "Copied" : label}
      className={cn(
        "micro flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 transition-colors",
        done
          ? "border-palm/40 text-palm"
          : "border-line text-ink-mute hover:border-line-strong hover:text-ink",
        className,
      )}
    >
      {done ? <Check size={11} /> : <Copy size={11} />}
      {done ? "Copied" : label}
    </button>
  );
}

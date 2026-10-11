import Image from "next/image";
import { ArrowRight, ArrowUp, Compass } from "lucide-react";

export default function Hero() {
  return (
    <section id="top" className="relative w-full overflow-hidden">
      {/* Tropical dusk haze */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background:
            "radial-gradient(62% 100% at 50% 0%, rgba(255,130,87,0.20) 0%, rgba(255,111,156,0.10) 38%, transparent 72%), radial-gradient(45% 75% at 10% 10%, rgba(47,212,192,0.14) 0%, transparent 70%), radial-gradient(45% 75% at 92% 6%, rgba(247,196,92,0.14) 0%, transparent 70%)",
        }}
      />

      <div className="frame relative">
        <div className="px-6 pt-32 pb-14 text-center sm:px-10 sm:pt-40">
          {/* Announcement */}
          <div className="animate-rise mx-auto mb-10 inline-flex items-stretch overflow-hidden rounded-full border border-line bg-surface/80 backdrop-blur-md">
            <span className="micro flex items-center gap-1.5 bg-cobalt px-3 py-2 font-bold text-[#231007]">
              <Compass size={12} />
              IA-2
            </span>
            <span className="flex items-center px-3.5 py-2 text-[12.5px] text-ink-soft">
              Activity 1: an autonomous agent that plans the whole trip.
            </span>
          </div>

          {/* Display headline */}
          <h1 className="animate-rise mx-auto max-w-4xl font-serif text-[clamp(2.7rem,6.6vw,5rem)] font-light leading-[1.02] tracking-[-0.022em] text-ink">
            Somewhere warm,
            <br />
            planned by an agent that{" "}
            <em className="italic font-normal text-cobalt-soft">thinks</em>.
          </h1>

          <p className="animate-rise mx-auto mt-7 max-w-xl text-[15.5px] leading-relaxed text-ink-soft">
            Tell Atlas where you want to go. It checks the sky, finds the
            route, prices the nights, and rearranges the days around the rain,
            one reasoned step at a time.
          </p>

          {/* Actions */}
          <div className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="#playground"
              className="flex items-center gap-2 rounded-full bg-cobalt px-5 py-3 text-[#231007] transition-colors hover:bg-cobalt-deep"
            >
              <span className="micro font-bold">Plan a trip</span>
              <ArrowRight size={13} />
            </a>
            <a
              href="#how"
              className="flex items-center gap-2 rounded-full border border-line bg-surface/70 px-5 py-3 text-ink-soft backdrop-blur-md transition-colors hover:border-line-strong hover:text-ink"
            >
              <span className="micro font-bold">See how it works</span>
            </a>
          </div>
        </div>

        {/* Shoreline plate with the floating goal card */}
        <div className="relative mx-6 h-[460px] overflow-hidden border-x border-t border-line sm:mx-10 sm:h-[560px]">
          <Image
            src="/img/hero-shore.jpg"
            alt="Warm surf washing over a pale tropical beach at sunrise"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1120px"
            className="object-cover"
          />

          {/* Halftone veil ties the photography to the editorial grain */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(3,14,18,0.8) 0.9px, transparent 1.2px)",
              backgroundSize: "3px 3px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(7,20,26,0.5) 0%, rgba(7,20,26,0.0) 32%, rgba(7,20,26,0.1) 55%, rgba(7,20,26,0.82) 100%)",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-xl overflow-hidden rounded-[6px] border border-line-strong bg-surface/92 shadow-2xl backdrop-blur-md">
              <div className="px-5 pt-5 pb-4 text-[15px] leading-relaxed text-ink">
                Five days somewhere with a beach and good food, early April,
                two of us, ninety thousand rupees.
              </div>
              <div className="flex items-center justify-between border-t border-line px-4 py-3">
                <span className="micro flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-ink-soft">
                  <span className="text-cobalt">{">_"}</span>
                  Plan a trip
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-cobalt text-[#231007]">
                  <ArrowUp size={14} />
                </span>
              </div>
              <div className="micro border-t border-line px-4 py-2.5 text-ink-mute">
                Give the agent a goal. It decides the steps.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

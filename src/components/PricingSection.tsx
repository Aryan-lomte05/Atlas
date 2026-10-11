import Image from "next/image";
import { Check } from "lucide-react";
import { Section, SectionHead } from "./Section";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    key: "backpacker",
    photo: "/img/hills.jpg",
    alt: "Green coastal headland at sunset",
    name: "Backpacker",
    nightly: "2400",
    perDiem: "1200",
    blurb:
      "Hostels and guesthouses, public transit, street food. The tier the agent falls back to when a budget pass overshoots.",
    traits: [
      "Dormitory and guesthouse stock",
      "Transit passes over taxis",
      "Free and civic sights prioritised",
      "Two paid activities per week",
    ],
  },
  {
    key: "midrange",
    photo: "/img/cove.jpg",
    alt: "Turquoise water in a sheltered rocky cove",
    name: "Mid-range",
    nightly: "6200",
    perDiem: "2800",
    blurb:
      "The default assumption when a traveller states a budget without naming a style. Most recorded runs settle here.",
    traits: [
      "Three-star and boutique inns",
      "Mix of transit and point-to-point",
      "Paid headline sights included",
      "One reserved dinner per city",
    ],
    featured: true,
  },
  {
    key: "boutique",
    photo: "/img/santorini.jpg",
    alt: "Whitewashed terraces above a blue caldera",
    name: "Boutique",
    nightly: "14500",
    perDiem: "6500",
    blurb:
      "Ryokan, design hotels and guided access. Selected only when the stated ceiling genuinely supports it.",
    traits: [
      "Ryokan and design properties",
      "Private transfers",
      "Guided and timed-entry access",
      "Reserved dining throughout",
    ],
  },
];

export default function PricingSection() {
  return (
    <Section id="budget" band>
      <SectionHead
        index="#08"
        label="Budget calibration"
        title={
          <>
            The three tiers the
            <br className="hidden sm:block" /> budget tool reasons with.
          </>
        }
        lede="These are not products. They are the lodging and per diem bands that calculateBudgetAndCurrency works from, shown so the arithmetic in a plan can be checked against its assumptions."
      />

      <div className="grid grid-cols-1 border-t border-line md:grid-cols-3">
        {TIERS.map((t, i) => (
          <div
            key={t.key}
            className={cn(
              "relative border-b border-line px-6 py-9 sm:px-8",
              i < TIERS.length - 1 && "md:border-r",
              t.featured && "bg-cobalt-wash",
            )}
          >
            {t.featured && (
              <span className="absolute inset-x-0 top-0 h-[2px] bg-cobalt" />
            )}

            <div className="relative mb-7 h-32 overflow-hidden rounded-[4px] border border-line">
              <Image
                src={t.photo}
                alt={t.alt}
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(7,20,26,0.85) 0%, transparent 60%)",
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p
                className={cn(
                  "micro",
                  t.featured ? "text-cobalt" : "text-ink",
                )}
              >
                {t.name}
              </p>
              {t.featured && (
                <span className="micro text-cobalt">Default</span>
              )}
            </div>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="font-serif text-[2.6rem] font-light leading-none tracking-[-0.02em] text-ink">
                {t.nightly}
              </span>
              <span className="micro text-ink-mute">INR / night</span>
            </div>

            <p className="micro mt-3 text-ink-mute">
              plus {t.perDiem} per diem
            </p>

            <p className="mt-6 text-[13px] leading-relaxed text-ink-soft">
              {t.blurb}
            </p>

            <ul className="mt-7 space-y-3 border-t border-line pt-6">
              {t.traits.map((tr) => (
                <li key={tr} className="flex gap-2.5">
                  <Check
                    size={13}
                    className={cn(
                      "mt-0.5 shrink-0",
                      t.featured ? "text-cobalt" : "text-ink-mute",
                    )}
                  />
                  <span className="text-[13px] leading-relaxed text-ink-soft">
                    {tr}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

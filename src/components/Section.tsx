import { cn } from "@/lib/utils";

/** Mono micro-label, the small tracked-out caption used across the page. */
export function Micro({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("micro", className)}>{children}</span>;
}

/**
 * A page section: full-bleed hairline top rule, with content held inside
 * the bounded 1200px column that both reference layouts use.
 */
export function Section({
  id,
  children,
  className,
  band,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  band?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "w-full border-t border-line scroll-mt-20",
        band && "bg-band",
        className,
      )}
    >
      <div className="frame">{children}</div>
    </section>
  );
}

/**
 * Numbered section header: "#01 / CONTEXT & MEMORY" above a large
 * sans display heading, matching the reference editorial rhythm.
 */
export function SectionHead({
  index,
  label,
  title,
  lede,
  align = "left",
}: {
  index?: string;
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "px-6 pt-20 pb-12 sm:px-10 sm:pt-28",
        align === "center" && "text-center",
      )}
    >
      <p className="micro text-cobalt">
        {index ? (
          <>
            <span className="text-ink-mute">{index}</span>
            <span className="text-ink-mute"> / </span>
          </>
        ) : null}
        {label}
      </p>

      <h2 className="mt-7 max-w-3xl text-[2rem] font-medium leading-[1.1] tracking-[-0.025em] text-ink sm:text-[2.75rem]">
        {title}
      </h2>

      {lede ? (
        <p
          className={cn(
            "mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

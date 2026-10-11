import Image from "next/image";
import { ArrowRight, Terminal } from "lucide-react";
import GithubIcon from "./GithubIcon";
import { Section } from "./Section";

export default function CtaSection() {
  return (
    <Section>
      <div className="relative overflow-hidden px-6 py-24 text-center sm:px-10 sm:py-32">
        <Image
          src="/img/aerial-shore.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7,20,26,0.9) 0%, rgba(7,20,26,0.78) 45%, rgba(7,20,26,0.95) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(3,14,18,0.9) 1.1px, transparent 1.4px)",
            backgroundSize: "4px 4px",
          }}
        />

        <div className="relative">
          <p className="micro mb-8 text-cobalt">Run it yourself</p>

          <h2 className="mx-auto max-w-2xl font-serif text-[clamp(2rem,4.6vw,3.3rem)] font-light leading-[1.08] tracking-[-0.02em] text-ink">
            Give it a goal and watch it{" "}
            <em className="italic font-normal text-cobalt-soft">work</em>.
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            The playground runs the same loop described on this page, against
            the same live tools, and streams every step as it happens.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="#playground"
              className="flex items-center gap-2 rounded-full bg-cobalt px-5 py-3 text-[#231007] transition-colors hover:bg-cobalt-deep"
            >
              <span className="micro font-bold">Open the playground</span>
              <ArrowRight size={13} />
            </a>
            <a
              href="https://github.com/Aryan-lomte05/Atlas.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-line bg-surface/80 px-5 py-3 text-ink-soft backdrop-blur-md transition-colors hover:border-line-strong hover:text-ink"
            >
              <GithubIcon size={13} />
              <span className="micro font-bold">Read the source</span>
            </a>
          </div>

          <div className="mx-auto mt-12 inline-flex items-center gap-2.5 rounded-[4px] border border-line bg-surface px-4 py-2.5">
            <Terminal size={13} className="text-cobalt" />
            <code className="font-mono text-[12.5px] text-ink-soft">
              python demo_agent.py
            </code>
          </div>
        </div>
      </div>
    </Section>
  );
}

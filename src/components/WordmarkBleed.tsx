"use client";

/**
 * Giant ATLAS wordmark bleeding off the base of the page, with tropical
 * photography moving slowly inside the letterforms.
 *
 * The image is a background layer clipped to the glyphs and panned with
 * animated background-position. That keeps the page's real webfont and
 * renders the same in every engine, which an SVG text mask over a canvas
 * does not. Layer order matters: the first image is the topmost, so the
 * halftone grain is listed ahead of the photograph it textures.
 */
export default function WordmarkBleed() {
  return (
    <div
      className="relative w-full select-none overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes atlas-pan {
          0%   { background-position: 0 0, 50% 42%; }
          50%  { background-position: 7px 5px, 50% 58%; }
          100% { background-position: 0 0, 50% 42%; }
        }
        .atlas-wordmark {
          background-image:
            radial-gradient(circle, rgba(4,16,20,0.78) 1.7px, transparent 2px),
            url("/img/palms-beach.jpg");
          background-size: 7px 7px, 118% auto;
          background-repeat: repeat, no-repeat;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: atlas-pan 30s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .atlas-wordmark { animation: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[1200px] px-4">
        <p
          className="atlas-wordmark -mb-[0.19em] whitespace-nowrap text-center font-sans font-bold leading-[0.78] tracking-[-0.05em]"
          style={{ fontSize: "clamp(3.25rem, 18.5vw, 15rem)" }}
        >
          ATLAS
        </p>
      </div>
    </div>
  );
}

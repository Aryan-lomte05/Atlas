import Image from "next/image";

const PLACES = [
  { src: "/img/palm-sky.jpg", name: "Palm Cove", note: "Coconut coast" },
  { src: "/img/alpine-lake.jpg", name: "Braies", note: "Alpine lake" },
  { src: "/img/aerial-shore.jpg", name: "Whitehaven", note: "Reef shallows" },
  { src: "/img/santorini.jpg", name: "Oia", note: "Caldera terraces" },
  { src: "/img/surf.jpg", name: "Uluwatu", note: "Reef break" },
  { src: "/img/night-peaks.jpg", name: "Lofoten", note: "Night ridgeline" },
  { src: "/img/cove.jpg", name: "Big Sur", note: "Hidden cove" },
  { src: "/img/hills.jpg", name: "Faroe", note: "Green headland" },
];

export default function LogoMarquee() {
  return (
    <div className="w-full border-y border-line bg-band">
      <div className="frame relative overflow-hidden py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-band to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-band to-transparent"
        />

        <div className="animate-marquee items-center gap-4">
          {[...PLACES, ...PLACES].map((p, i) => (
            <figure
              key={i}
              className="group relative h-28 w-48 shrink-0 overflow-hidden rounded-[4px] border border-line"
            >
              <Image
                src={p.src}
                alt=""
                fill
                sizes="192px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(4,13,17,0.96) 0%, rgba(4,13,17,0.55) 38%, rgba(4,13,17,0.05) 75%)",
                }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 px-3 pb-2.5">
                <p className="micro text-ink">{p.name}</p>
                <p className="micro mt-1 text-ink-mute">{p.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

import GithubIcon from "./GithubIcon";
import WordmarkBleed from "./WordmarkBleed";

const COLUMNS = [
  {
    head: "System",
    links: [
      { label: "Playground", href: "#playground" },
      { label: "How it works", href: "#how" },
      { label: "Architecture", href: "#architecture" },
      { label: "Tools", href: "#tools" },
    ],
  },
  {
    head: "Coursework",
    links: [
      { label: "Classical vs modern", href: "#comparison" },
      { label: "Agent design", href: "#how" },
      { label: "Evaluation", href: "#comparison" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    head: "Repository",
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/Aryan-lomte05/Atlas.git",
      },
      {
        label: "REPORT.md",
        href: "https://github.com/Aryan-lomte05/Atlas/blob/main/REPORT.md",
      },
      {
        label: "SYSTEM.md",
        href: "https://github.com/Aryan-lomte05/Atlas/blob/main/SYSTEM.md",
      },
      {
        label: "demo_agent.py",
        href: "https://github.com/Aryan-lomte05/Atlas/blob/main/demo_agent.py",
      },
    ],
  },
  {
    head: "Team",
    links: [
      { label: "Aryan Lomte", href: "#team" },
      { label: "Aditya", href: "#team" },
      { label: "Manthan", href: "#team" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-line bg-band">
      <div className="frame">
        <div className="grid grid-cols-2 gap-10 px-6 py-16 sm:px-10 md:grid-cols-5">
          {/* Identity */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-[3px] bg-cobalt">
                <span className="block h-2 w-2 rounded-[1px] bg-white" />
              </span>
              <span className="micro font-bold tracking-[0.16em] text-ink">
                ATLAS
              </span>
            </div>
            <p className="max-w-[22ch] text-[13px] leading-relaxed text-ink-soft">
              An autonomous travel concierge built on the ReAct loop.
            </p>

            <a
              href="https://github.com/Aryan-lomte05/Atlas.git"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-[4px] border border-line bg-surface px-3 py-2 text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            >
              <GithubIcon size={13} />
              <span className="micro">GitHub</span>
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.head}>
              <p className="micro mb-5 text-ink-mute">{col.head}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        l.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-[13.5px] text-ink-soft transition-colors hover:text-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal strip */}
        <div className="flex flex-col gap-3 border-t border-line px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p className="micro text-ink-mute">
            Department of Electronics and Computer Engineering, 2026-27
          </p>
          <p className="micro text-ink-mute">
            Artificial Intelligence, IA-2 Activity 1
          </p>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the base of the page */}
      <WordmarkBleed />
    </footer>
  );
}

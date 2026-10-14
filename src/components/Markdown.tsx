"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders the agent's final answer.
 *
 * The model replies in GitHub-flavoured markdown: tables for the budget,
 * bold for the day headings, lists for the practical notes. Printing that
 * into a <pre> showed the pipes and asterisks literally, which is what made
 * a good itinerary look broken.
 *
 * react-markdown is used rather than marked plus dangerouslySetInnerHTML
 * because it does not render raw HTML by default, and the model's output is
 * not trusted input.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="atlas-md text-[14px] leading-[1.7] text-ink-soft">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="mt-6 mb-3 text-[1.15rem] font-medium tracking-[-0.01em] text-ink first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="mt-6 mb-2.5 text-[1.02rem] font-medium tracking-[-0.01em] text-ink first:mt-0">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="mt-5 mb-2 text-[0.95rem] font-medium text-ink first:mt-0">
              {children}
            </h5>
          ),
          h4: ({ children }) => (
            <p className="micro mt-5 mb-2 text-cobalt first:mt-0">{children}</p>
          ),
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-ink-soft">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 space-y-1.5 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1.5 pl-5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="marker:text-cobalt">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cobalt underline underline-offset-2 hover:text-cobalt-soft"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded-[3px] border border-line bg-canvas px-1.5 py-0.5 font-mono text-[12px] text-ink">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-[5px] border border-line bg-canvas px-4 py-3 font-mono text-[12px] leading-relaxed">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-cobalt pl-4 text-ink-soft">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-5 border-line" />,

          /* Tables: the budget breakdown is the most important thing the
             agent returns, so it gets real table styling. */
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto rounded-[5px] border border-line">
              <table className="w-full border-collapse text-[12.5px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-raised/60">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-line last:border-0">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="micro border-r border-line px-3 py-2.5 text-left text-ink last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-r border-line px-3 py-2.5 align-top last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

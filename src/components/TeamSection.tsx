"use client";

import { Users, Code, Wrench, BarChart3, Award, Sparkles, CheckCircle2 } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  focusArea: string;
  responsibilities: string[];
  icon: React.ReactNode;
  tagColor: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Aryan Lomte",
    role: "Fullstack AI Co-Developer",
    focusArea: "End-to-End System Engineering",
    responsibilities: [
      "Co-developed autonomous ReAct cognitive loop (Thought-Action-Observation).",
      "Contributed to fullstack Next.js UI, real-time SSE traces, and styling.",
      "Co-designed tool groundings, database persistence, and API endpoints.",
      "Collaborated on classical agent benchmarking and technical documentation.",
    ],
    icon: <Code size={20} />,
    tagColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  {
    name: "Aditya",
    role: "Fullstack AI Co-Developer",
    focusArea: "End-to-End System Engineering",
    responsibilities: [
      "Co-developed autonomous ReAct cognitive loop (Thought-Action-Observation).",
      "Contributed to external REST tool integrations and error handling.",
      "Co-designed lodging, flight, and meteorological API evaluation modules.",
      "Collaborated on unit testing, live viva demonstration, and reporting.",
    ],
    icon: <Wrench size={20} />,
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    name: "Manthan",
    role: "Fullstack AI Co-Developer",
    focusArea: "End-to-End System Engineering",
    responsibilities: [
      "Co-developed autonomous ReAct cognitive loop (Thought-Action-Observation).",
      "Contributed to classical rule-based agent implementation for Part C.",
      "Co-designed quantitative empirical matrix and scenario benchmark tests.",
      "Collaborated on slide presentations, laboratory viva, and project report.",
    ],
    icon: <BarChart3 size={20} />,
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
          <Users size={13} />
          Collaborative Lab Team
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Meet the <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-sky-400 bg-clip-text text-transparent">Project Team</span>
        </h2>
        <p className="max-w-2xl text-base sm:text-lg text-zinc-400">
          Department of Electronics & Computer Engineering | Academic Year 2026-27. Shared end-to-end responsibility across agent architecture, tool integration, and syllabus analysis.
        </p>
      </div>

      {/* 3 Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {TEAM_MEMBERS.map((member, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-white/10 bg-[#0d0f15] p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all duration-300"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/5 text-white border border-white/10">
                  {member.icon}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${member.tagColor}`}>
                  {member.role}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-xs text-sky-400 font-medium mb-5">
                {member.focusArea}
              </p>

              <div className="space-y-2.5 border-t border-white/5 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Cross-Functional Contributions:
                </span>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {member.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">•</span>
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Award size={13} />
                IA-2 Activity 1
              </span>
              <span>Equal Collaboration</span>
            </div>
          </div>
        ))}
      </div>

      {/* Collaboration Callout */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-2 text-zinc-300">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>Shared Project Ownership: All 3 members participated across the entire engineering lifecycle.</span>
        </div>
        <span className="font-mono text-zinc-500">20 Marks Lab Assessment</span>
      </div>
    </section>
  );
}

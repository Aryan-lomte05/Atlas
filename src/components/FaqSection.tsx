"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What is an Agentic AI system and how does it differ from a standard chatbot?",
    answer: "A standard chatbot operates in a single prompt-response cycle, generating text based solely on internalized weights (often resulting in outdated or hallucinated facts). An Agentic AI system decomposes a high-level goal into logical steps, autonomously selects external tools (such as live weather APIs or flight databases), inspects intermediate observations, and iteratively reasons toward a verified output.",
  },
  {
    question: "What is the ReAct (Reasoning + Acting) framework?",
    answer: "ReAct combines reasoning (Thought) and execution (Action) in a synchronized loop. Before invoking any tool, the agent explicitly articulates its hypothesis or requirement. Upon receiving the tool's return (Observation), it reflects on whether the data meets user constraints before deciding the next step or generating the final answer.",
  },
  {
    question: "Which LLM powers Atlas and why was it chosen?",
    answer: "Atlas utilizes Meta Llama 3.3 70B Versatile hosted via Groq LPU inference. This model was selected for its exceptional zero-shot tool selection fidelity, strict JSON/regex adherence, low hallucinations, and rapid sub-second inference speeds (< 400ms), which are essential for multi-step agentic loops.",
  },
  {
    question: "What tools are integrated and how are they grounded?",
    answer: "Atlas integrates 6 specialized tools: Live Weather Forecast (Open-Meteo REST API), Flight Route & Fare Finder, Lodging Explorer, Math & FX Calculator (mathjs library), Attractions Explorer (Wikipedia REST API + curated sights), and Travel Advisory & Visa Guide. All tools return verified real-world data rather than generative assumptions.",
  },
  {
    question: "How does Atlas satisfy the Part C syllabus comparison requirement?",
    answer: "Atlas provides both a modern ReAct agent and a classical rule-based agent built from scratch. While the classical agent is confined to static if/else keyword tables with zero contextual memory or live API access, the modern agent exhibits dynamic planning, contextual memory, and autonomous error recovery.",
  },
  {
    question: "Can Atlas be demonstrated without a cloud API key?",
    answer: "Yes. In the absence of a GROQ_API_KEY environment variable, Atlas automatically activates a high-fidelity local ReAct reasoning engine that queries live Open-Meteo, Wikipedia, and mathjs endpoints in real time, ensuring a complete live demonstration during laboratory evaluations.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
          <HelpCircle size={13} />
          Frequently Asked Questions
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Academic & Technical <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">FAQ</span>
        </h2>
        <p className="max-w-xl text-base text-zinc-400">
          Everything regarding the IA-2 Activity 1 rubric, ReAct implementation, and classical agent benchmarks.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#0d0f15] overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white hover:text-sky-300 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-sky-400" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

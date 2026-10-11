import type { Metadata } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serifDisplay = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif-display",
  display: "swap",
  style: ["normal", "italic"],
});

const monoCode = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atlas: Autonomous Travel Planning Agent",
  description:
    "Atlas is a goal-driven travel concierge built on the ReAct loop with Llama 3.3 70B. It plans multi-day itineraries by calling live tools for weather, routes, lodging, sights, advisories, and budget math, and streams every reasoning step as an observable trace.",
  keywords: [
    "agentic AI",
    "ReAct agent",
    "travel planning",
    "LLM tool use",
    "Groq",
    "Llama 3.3",
    "itinerary planner",
  ],
  authors: [{ name: "Aryan Lomte" }, { name: "Aditya" }, { name: "Manthan" }],
  openGraph: {
    title: "Atlas: Autonomous Travel Planning Agent",
    description:
      "A ReAct agent that reasons, calls six live tools, and streams every step of its itinerary planning as an observable trace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${serifDisplay.variable} ${monoCode.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

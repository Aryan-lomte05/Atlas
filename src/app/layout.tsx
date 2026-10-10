import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS -- AI Travel Planning Agent",
  description:
    "An autonomous AI travel planner powered by LLaMA 3.3-70B on Groq. Plans itineraries, checks weather, searches destinations, and calculates budgets using multi-step ReAct reasoning.",
  keywords: ["AI travel agent", "travel planning", "LLM", "autonomous agent", "Groq", "LLaMA", "itinerary planner"],
  authors: [{ name: "ATLAS Team" }],
  openGraph: {
    title: "ATLAS -- AI Travel Planning Agent",
    description: "Autonomous travel intelligence. Destination search, weather, budget calculation, and full itinerary planning in one agent.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="noise">
        {children}
      </body>
    </html>
  );
}

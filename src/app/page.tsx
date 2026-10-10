import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogoMarquee from "@/components/LogoMarquee";
import StatementSection from "@/components/StatementSection";
import Playground from "@/components/Playground";
import BentoSection from "@/components/BentoSection";
import StickyHowItWorks from "@/components/StickyHowItWorks";
import ToolsSection from "@/components/ToolsSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import ComparisonSection from "@/components/ComparisonSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import TeamSection from "@/components/TeamSection";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen w-full bg-[#07090e] text-zinc-100 font-sans selection:bg-sky-500/20 selection:text-sky-300 overflow-x-hidden">
        {/* Ambient Radial Lights */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-sky-500/10 rounded-full blur-[150px]" />
          <div className="absolute top-[30%] -left-48 w-[600px] h-[450px] bg-purple-500/5 rounded-full blur-[160px]" />
          <div className="absolute top-[60%] -right-48 w-[600px] h-[450px] bg-teal-500/5 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] bg-blue-500/5 rounded-full blur-[170px]" />
        </div>

        {/* Master Page Flow */}
        <div className="relative z-10 flex flex-col min-h-screen w-full">
          <Navbar />
          <main className="flex-1 flex flex-col w-full">
            <Hero />
            <LogoMarquee />
            <StatementSection />
            <Playground />
            <BentoSection />
            <StickyHowItWorks />
            <ToolsSection />
            <ArchitectureSection />
            <ComparisonSection />
            <TestimonialsSection />
            <PricingSection />
            <TeamSection />
            <FaqSection />
            <CtaSection />
          </main>
          <Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}

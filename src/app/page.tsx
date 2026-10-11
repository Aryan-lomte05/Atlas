import SmoothScroll from "@/components/SmoothScroll";
import ThemeToggle from "@/components/ThemeToggle";
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
      <Navbar />
      <main className="w-full">
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
      <ThemeToggle />
    </SmoothScroll>
  );
}

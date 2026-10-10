import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Playground from "@/components/Playground";
import BentoSection from "@/components/BentoSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import ToolsSection from "@/components/ToolsSection";
import ComparisonSection from "@/components/ComparisonSection";
import TeamSection from "@/components/TeamSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#07090e] text-zinc-100 font-sans selection:bg-sky-500/20 selection:text-sky-300 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-sky-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] -left-40 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[160px]" />
        <div className="absolute top-[70%] -right-40 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-[160px]" />
      </div>

      {/* Main Layout Elements */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Hero />
          <Playground />
          <BentoSection />
          <ArchitectureSection />
          <ToolsSection />
          <ComparisonSection />
          <TeamSection />
          <FaqSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

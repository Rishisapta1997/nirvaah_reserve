import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import MaterialStory from "@/components/MaterialStory";
import Collection from "@/components/Collection";
import Craft from "@/components/Craft";
import Reserve from "@/components/Reserve";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import TestimonialsSection from "@/components/TestimonialsSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-accent selection:text-white">
      <Hero />
      <div id="story">
        <Manifesto />
        <MaterialStory />
      </div>
      <Craft />
      <div id="collection"><Collection /></div>
      <div id="reserve"><Reserve /></div>
      <FAQ />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}

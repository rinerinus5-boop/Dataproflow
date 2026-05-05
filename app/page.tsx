import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import HowItWorks from "./components/sections/HowItWorks";
import Integrations from "./components/sections/Integrations";
import Accelerate from "./components/sections/Accelerate";
import Pricing from "./components/sections/Pricing";
import FAQ from "./components/sections/FAQ";
import Testimonials from "./components/sections/Testimonials";
import CTA from "./components/sections/CTA";

export default function Home() {
  return (
    <>
      <Header />
      <main className="overflow-hidden">
        <Hero />
        <Features />
        <HowItWorks />
        <Integrations />
        <Accelerate />
        <Pricing />
        <FAQ />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

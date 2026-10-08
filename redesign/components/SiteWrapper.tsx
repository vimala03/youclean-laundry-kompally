"use client";

import { useEffect } from "react";
import { useLenis } from "@/hooks/useLenis";
import CustomCursor from "./CustomCursor";
import Navigation from "./Navigation";
import HeroSection from "./sections/HeroSection";
import ServicesSection from "./sections/ServicesSection";
import GallerySection from "./sections/GallerySection";
import ProcessSection from "./sections/ProcessSection";
import PricingSection from "./sections/PricingSection";
import TrustSection from "./sections/TrustSection";
import CTASection from "./sections/CTASection";
import Footer from "./Footer";

export default function SiteWrapper() {
  useLenis();

  // GSAP ScrollTrigger integration with Lenis
  useEffect(() => {
    async function connectLenisToGSAP() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Refresh ScrollTrigger on window resize
      window.addEventListener("resize", () => ScrollTrigger.refresh());
    }
    connectLenisToGSAP();
  }, []);

  return (
    <>
      {/* Grain texture overlay — always on top */}
      <div className="grain-overlay" aria-hidden />

      {/* Custom cursor */}
      <CustomCursor />

      {/* Navigation */}
      <Navigation />

      {/* Page */}
      <main>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <ProcessSection />
        <PricingSection />
        <TrustSection />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}

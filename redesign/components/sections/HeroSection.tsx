"use client";

import { useEffect, useRef } from "react";
import GarmentSVG from "../ui/GarmentSVG";
import MagneticButton from "../ui/MagneticButton";
import { buildWhatsAppUrl } from "@/lib/utils";

function WordReveal({
  children,
  delay = 0,
}: {
  children: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.querySelector<HTMLSpanElement>(".word-reveal-inner");
    if (!inner) return;
    const timer = setTimeout(() => {
      inner.classList.add("revealed");
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span ref={ref} className="word-reveal">
      <span className="word-reveal-inner">{children}</span>
    </span>
  );
}

export default function HeroSection() {
  const waUrl = buildWhatsAppUrl("hero", "Hero Book Pickup");
  const waExpress = buildWhatsAppUrl("hero", "Hero Express");

  return (
    <section
      id="top"
      className="section-full noise-bg flex flex-col"
      style={{
        background: "linear-gradient(160deg, #0A0908 0%, #0D1410 50%, #0A0908 100%)",
        minHeight: "100svh",
      }}
    >
      {/* Subtle radial glow top-right */}
      <div
        className="absolute top-0 right-0 w-[60vw] h-[60vh] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(13,43,31,0.6) 0%, transparent 65%)",
        }}
      />

      {/* Main grid */}
      <div className="container-yk flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-0 pt-28 pb-16 lg:pt-36 lg:pb-24">
        {/* Left: Copy */}
        <div className="flex flex-col justify-center z-10">
          {/* Eyebrow */}
          <div
            className="eyebrow mb-8"
            style={{
              opacity: 0,
              animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s forwards",
            }}
          >
            Kompally, Hyderabad
          </div>

          {/* Headline */}
          <h1
            className="display-heading mb-6"
            style={{ overflow: "hidden" }}
            aria-label="Premium Laundry, Delivered."
          >
            <span className="block">
              <WordReveal delay={300}>Premium</WordReveal>
            </span>
            <span className="block italic font-semibold">
              <WordReveal delay={450}>Laundry,</WordReveal>
            </span>
            <span className="block">
              <WordReveal delay={600}>Delivered.</WordReveal>
            </span>
          </h1>

          {/* Sub */}
          <p
            className="font-dm-sans text-parchment/55 leading-relaxed mb-10 max-w-sm"
            style={{
              fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
              opacity: 0,
              animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.7s forwards",
            }}
          >
            Wash & Fold, Dry Clean, Steam & Iron — picked up at your door,
            returned in 12–48 hours. Express support available.
          </p>

          {/* Pills */}
          <div
            className="flex flex-wrap gap-3 mb-10"
            style={{
              opacity: 0,
              animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.85s forwards",
            }}
          >
            {["Doorstep pickup", "Fabric-safe care", "12–48 hr delivery"].map(
              (pill) => (
                <span
                  key={pill}
                  className="text-[0.65rem] font-dm-sans font-medium tracking-[0.15em] uppercase px-4 py-2 rounded-full border border-parchment/12 text-parchment/50"
                >
                  {pill}
                </span>
              )
            )}
          </div>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center gap-4"
            style={{
              opacity: 0,
              animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 1s forwards",
            }}
          >
            <MagneticButton
              href={waUrl}
              target="_blank"
              rel="noopener"
              variant="primary"
              size="lg"
              data-cursor="book"
            >
              Book a Pickup
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </MagneticButton>

            <MagneticButton
              href={waExpress}
              target="_blank"
              rel="noopener"
              variant="ghost"
              size="md"
            >
              ⚡ Express in 3–4 hrs
            </MagneticButton>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-parchment/8"
            style={{
              opacity: 0,
              animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 1.1s forwards",
            }}
          >
            {[
              { stat: "12–48h", label: "Delivery window" },
              { stat: "₹90+", label: "Wash & Fold per kg" },
              { stat: "₹79+", label: "Dry clean per item" },
            ].map((s) => (
              <div key={s.stat}>
                <p
                  className="font-cormorant font-light text-parchment"
                  style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", lineHeight: 1 }}
                >
                  {s.stat}
                </p>
                <p className="text-[0.65rem] font-dm-sans tracking-[0.1em] uppercase text-parchment/35 mt-1.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Garment visual */}
        <div
          className="relative flex items-center justify-center min-h-[400px] lg:min-h-0"
          style={{
            opacity: 0,
            animation: "fade-up 1s cubic-bezier(0.16,1,0.3,1) 0.4s forwards",
          }}
        >
          <GarmentSVG />

          {/* Floating badge — turnaround */}
          <div
            className="absolute top-8 right-4 lg:right-0 xl:-right-8 bg-ink-soft border border-parchment/10 rounded-2xl px-5 py-4 backdrop-blur-sm"
            style={{
              animation: "float 6s ease-in-out infinite 0.5s",
            }}
          >
            <p className="text-[0.6rem] font-dm-sans font-medium tracking-[0.15em] uppercase text-mist mb-1">
              Turnaround
            </p>
            <p className="font-cormorant text-2xl font-light text-parchment leading-none">
              24 hrs
            </p>
            <p className="text-[0.6rem] font-dm-sans text-parchment/35 mt-1">
              typical order
            </p>
          </div>

          {/* Floating badge — care */}
          <div
            className="absolute bottom-12 left-4 lg:left-0 xl:-left-4 bg-sage-deep border border-mist/20 rounded-2xl px-5 py-4 backdrop-blur-sm"
            style={{
              animation: "float 5s ease-in-out infinite 1.2s",
            }}
          >
            <p className="text-[0.6rem] font-dm-sans font-medium tracking-[0.15em] uppercase text-mist mb-1">
              Fabric care
            </p>
            <p className="font-cormorant text-xl font-light text-parchment leading-none">
              Silk · Saree · Suit
            </p>
          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{
          opacity: 0,
          animation: "fade-up 0.6s ease 1.4s forwards",
        }}
      >
        <span className="text-[0.6rem] font-dm-sans tracking-[0.2em] uppercase text-parchment/25">
          scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-parchment/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

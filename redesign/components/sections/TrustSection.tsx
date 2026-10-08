"use client";

import { useEffect, useRef } from "react";

const STATS = [
  { value: "500+", label: "Orders completed" },
  { value: "24h", label: "Typical turnaround" },
  { value: "6+", label: "Fabric categories" },
  { value: "4.9★", label: "Customer rating" },
];

const PILLARS = [
  {
    icon: "🧪",
    title: "Fabric-safe chemistry",
    desc: "We use detergents and solvents appropriate for each fabric type — silk, cotton, synthetics, and embellished pieces are treated differently.",
  },
  {
    icon: "🏷️",
    title: "Item-level tracking",
    desc: "Every garment is tagged before washing. Nothing gets mixed up. You get exactly what you sent — nothing more, nothing less.",
  },
  {
    icon: "⚡",
    title: "Express when you need it",
    desc: "Last-minute event? We offer express turnaround in 3–4 hours minimum on eligible services. Just ask on WhatsApp.",
  },
  {
    icon: "🤝",
    title: "Built on trust",
    desc: "We're a local Kompally business serving apartments, families, and professionals. Your clothes are in careful hands.",
  },
];

export default function TrustSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Stats count-up
      const statEls = statsRef.current?.querySelectorAll<HTMLElement>(".stat-val");
      if (statEls) {
        gsap.fromTo(
          statEls,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 80%", once: true },
          }
        );
      }

      // Pillars
      const pillarEls = pillarsRef.current?.querySelectorAll<HTMLElement>(".pillar-card");
      if (pillarEls) {
        gsap.fromTo(
          pillarEls,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: pillarsRef.current, start: "top 75%", once: true },
          }
        );
      }
    }
    init();
  }, []);

  return (
    <section
      id="trust"
      ref={sectionRef}
      className="py-24 lg:py-36 noise-bg"
      style={{
        background: "linear-gradient(160deg, #0A0908 0%, #0D2B1F 100%)",
      }}
    >
      <div className="container-yk">
        {/* Eyebrow */}
        <p className="eyebrow mb-6">Why YouClean</p>

        {/* Heading */}
        <div className="max-w-2xl mb-16 lg:mb-20">
          <h2 className="section-heading text-parchment">
            Clean clothes.
            <br />
            <em className="italic font-light text-mist">Zero compromise.</em>
          </h2>
        </div>

        {/* Stats strip */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-20"
          style={{ background: "rgba(244,239,230,0.08)", borderRadius: "16px", overflow: "hidden" }}
        >
          {STATS.map((s) => (
            <div
              key={s.value}
              className="py-10 px-8 text-center"
              style={{ background: "#0A0908" }}
            >
              <p
                className="stat-val font-cormorant font-light text-parchment mb-2"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  lineHeight: 1,
                  opacity: 0,
                }}
              >
                {s.value}
              </p>
              <p className="text-[0.65rem] font-dm-sans font-medium tracking-[0.15em] uppercase text-parchment/35">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Pillars */}
        <div
          ref={pillarsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="pillar-card rounded-2xl p-7 border border-parchment/8 group"
              style={{
                background: "rgba(244,239,230,0.03)",
                opacity: 0,
                transition: "background 0.4s ease, border-color 0.4s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(0,201,122,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(0,201,122,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(244,239,230,0.03)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(244,239,230,0.08)";
              }}
            >
              <div
                className="text-3xl mb-5 transition-transform duration-400 group-hover:scale-110 origin-left"
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                {p.icon}
              </div>
              <h3
                className="font-cormorant font-light text-parchment mb-3"
                style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", lineHeight: 1.1 }}
              >
                {p.title}
              </h3>
              <p className="font-dm-sans text-sm text-parchment/45 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

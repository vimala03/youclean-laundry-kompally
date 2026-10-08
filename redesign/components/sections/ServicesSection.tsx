"use client";

import { useEffect, useRef } from "react";
import ServiceCard from "../ui/ServiceCard";
import { buildWhatsAppUrl } from "@/lib/utils";

const SERVICES = [
  {
    label: "Daily care",
    title: "Wash & Fold",
    description:
      "For daily wear, bedsheets, and routine weekly laundry — sorted, washed, neatly folded.",
    detail:
      "Gentle machine wash with fabric-appropriate detergents. Sorted by color and material before washing.",
    price: "₹90 / kg",
    icon: "🧺",
    featured: true,
  },
  {
    label: "Sharp finish",
    title: "Wash & Iron",
    description:
      "Perfect for office wear, uniforms, and clothing that needs a crisp, polished hand feel.",
    detail:
      "Washed and professionally steam-pressed. Ideal for formal shirts, kurtas, and dress trousers.",
    price: "₹120 / kg",
    icon: "👔",
  },
  {
    label: "Premium care",
    title: "Dry Cleaning",
    description:
      "Expert care for delicate fabrics, blazers, sarees, dresses, and occasion wear.",
    detail:
      "Solvent-based cleaning that preserves fabric integrity. Safe for silk, chiffon, and embellished pieces.",
    price: "₹79+ / piece",
    icon: "✨",
  },
  {
    label: "Refresh",
    title: "Steam & Iron",
    description:
      "Quick refresh for lightly worn garments — removes creases and odours without a full wash.",
    detail:
      "Professional steam treatment. Perfect before events, meetings, or travel.",
    icon: "💨",
  },
  {
    label: "Special item",
    title: "Saree Dry Clean",
    description:
      "Delicate care for silk, designer, and bridal sarees with safe finishing and careful packaging.",
    detail:
      "Handled individually. Pleated and packed in protective tissue after cleaning.",
    icon: "🧵",
  },
  {
    label: "Home textiles",
    title: "Curtains Cleaning",
    description:
      "Dust-free, stain-safe cleaning for home and office curtains — any size.",
    detail:
      "Pickup includes careful unhooking assistance if required. Returned folded and fresh.",
    icon: "🪟",
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gsap: typeof import("gsap")["gsap"] | null = null;
    let ScrollTrigger: typeof import("gsap/ScrollTrigger")["ScrollTrigger"] | null = null;

    async function init() {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      gsap = gsapMod.gsap;
      ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const head = headRef.current;
      const grid = gridRef.current;
      if (!head || !grid) return;

      // Heading reveal
      gsap.fromTo(
        head.querySelectorAll(".reveal-item"),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: head,
            start: "top 80%",
            once: true,
          },
        }
      );

      // Card stagger
      gsap.fromTo(
        grid.querySelectorAll(".service-card-hover"),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 75%",
            once: true,
          },
        }
      );
    }

    init();

    return () => {
      ScrollTrigger?.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-24 lg:py-36"
      style={{
        background: "linear-gradient(180deg, #0A0908 0%, #F4EFE6 15%)",
      }}
    >
      {/* Transition fade top */}
      <div className="container-yk">
        {/* Section head */}
        <div ref={headRef} className="mb-16 lg:mb-20 max-w-2xl">
          <p className="eyebrow mb-6 reveal-item" style={{ opacity: 0 }}>
            What we do
          </p>
          <h2
            className="section-heading text-ink mb-6 reveal-item"
            style={{ opacity: 0 }}
          >
            Every garment,
            <br />
            <em className="font-cormorant italic font-light">expertly cared for.</em>
          </h2>
          <p
            className="font-dm-sans text-ink/55 leading-relaxed reveal-item"
            style={{
              fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
              opacity: 0,
            }}
          >
            From daily wear to occasion sarees — each service is handled with
            the right process for the fabric. Pickup at your door, delivered
            back fresh.
          </p>
        </div>

        {/* Cards grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
          style={{
            background: "#0A0908",
            borderRadius: "24px",
            padding: "clamp(1.5rem, 3vw, 2.5rem)",
          }}
        >
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.title}
              {...service}
              index={i}
              onBook={() => {
                const url = buildWhatsAppUrl(
                  "services",
                  `Service Card: ${service.title}`,
                  service.title
                );
                window.open(url, "_blank", "noopener");
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

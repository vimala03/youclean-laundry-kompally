"use client";

import { useEffect, useRef, useState } from "react";
import MagneticButton from "../ui/MagneticButton";
import { buildWhatsAppUrl } from "@/lib/utils";

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const head = headRef.current;
      if (!head) return;

      gsap.fromTo(
        head.querySelectorAll(".reveal-item"),
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: head, start: "top 75%", once: true },
        }
      );
    }
    init();
  }, []);

  const waUrl = buildWhatsAppUrl("cta", "CTA Section Book Pickup");

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="section-full flex items-center noise-bg relative overflow-hidden py-24 lg:py-0"
      style={{
        background: "linear-gradient(135deg, #0A0908 0%, #0D1F17 60%, #0A0908 100%)",
      }}
    >
      {/* Large decorative letter */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span
          className="font-cormorant font-light text-parchment"
          style={{
            fontSize: "clamp(40vw, 60vw, 80vw)",
            lineHeight: 1,
            opacity: 0.02,
            letterSpacing: "-0.05em",
          }}
        >
          Y
        </span>
      </div>

      {/* Green radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,201,122,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="container-yk relative z-10 text-center w-full">
        <div ref={headRef} className="max-w-3xl mx-auto">
          <p
            className="eyebrow justify-center mb-8 reveal-item"
            style={{ opacity: 0 }}
          >
            Ready to start?
          </p>

          <h2
            className="reveal-item mb-8"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(3.5rem, 8vw, 8rem)",
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#F4EFE6",
              opacity: 0,
            }}
          >
            Schedule your
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 600 }}>
              laundry pickup.
            </em>
          </h2>

          <p
            className="font-dm-sans text-parchment/45 mb-12 reveal-item"
            style={{
              fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
              maxWidth: "26rem",
              margin: "0 auto 3rem",
              lineHeight: 1.7,
              opacity: 0,
            }}
          >
            Doorstep pickup at your preferred time. Returned fresh in 12–48
            hours. Express slots available.
          </p>

          {/* Main CTA */}
          <div
            className="reveal-item flex flex-col sm:flex-row items-center justify-center gap-5"
            style={{ opacity: 0 }}
          >
            <div
              className="relative"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* Pulse rings */}
              <div
                className="absolute inset-0 rounded-full border border-mist/30"
                style={{
                  transform: hovered ? "scale(1.25)" : "scale(1)",
                  opacity: hovered ? 0 : 0.6,
                  transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease",
                }}
              />
              <div
                className="absolute inset-0 rounded-full border border-mist/15"
                style={{
                  transform: hovered ? "scale(1.5)" : "scale(1)",
                  opacity: hovered ? 0 : 0.4,
                  transition:
                    "transform 0.8s cubic-bezier(0.16,1,0.3,1), opacity 0.8s ease",
                }}
              />

              <MagneticButton
                href={waUrl}
                target="_blank"
                rel="noopener"
                variant="primary"
                size="lg"
                data-cursor="book"
              >
                Book a Pickup on WhatsApp
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </MagneticButton>
            </div>

            <MagneticButton
              href="tel:+919876543210"
              variant="outline"
              size="md"
              className="!border-parchment/15 !text-parchment/50 hover:!border-parchment/40 hover:!text-parchment"
            >
              Call us instead
            </MagneticButton>
          </div>

          {/* Location note */}
          <p
            className="mt-12 font-dm-sans text-[0.7rem] tracking-[0.15em] uppercase text-parchment/20 reveal-item"
            style={{ opacity: 0 }}
          >
            Serving Kompally · Suchitra · Suraram · Nizampet and nearby
          </p>
        </div>
      </div>
    </section>
  );
}

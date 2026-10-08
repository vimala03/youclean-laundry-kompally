"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    num: "01",
    title: "Pickup",
    subtitle: "We come to you",
    desc: "Book via WhatsApp — we arrive at your preferred time. No weight minimum.",
    icon: "🚗",
    color: "#00C97A",
  },
  {
    num: "02",
    title: "Sort & Tag",
    subtitle: "Every item tracked",
    desc: "Your garments are sorted by fabric type, colour, and care requirement, then tagged.",
    icon: "🏷️",
    color: "#4A9970",
  },
  {
    num: "03",
    title: "Wash / Clean",
    subtitle: "Expert process",
    desc: "Machine wash, dry clean, or steam — chosen for each fabric to preserve feel and colour.",
    icon: "🫧",
    color: "#2D6B4F",
  },
  {
    num: "04",
    title: "Dry & Press",
    subtitle: "Crisp finish",
    desc: "Air dried or tumble dried based on fabric. Pressed or folded per your service choice.",
    icon: "🌬️",
    color: "#1A4B35",
  },
  {
    num: "05",
    title: "Deliver",
    subtitle: "Back at your door",
    desc: "Returned within 12–48 hours, neatly packed and ready to hang or store.",
    icon: "📦",
    color: "#00C97A",
  },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const track = trackRef.current;
      const head = headRef.current;
      const progress = progressRef.current;
      if (!section || !track || !head) return;

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

      // Horizontal scroll of steps
      const steps = track.querySelectorAll<HTMLElement>(".process-step");
      const totalWidth = track.scrollWidth - window.innerWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalWidth + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progress) {
              progress.style.width = `${self.progress * 100}%`;
            }
          },
        },
      });

      // Slide the track horizontally
      tl.to(track, {
        x: () => -totalWidth,
        ease: "none",
      });

      // Each step activates in sequence
      steps.forEach((step, i) => {
        const activateAt = i / steps.length;
        ScrollTrigger.create({
          trigger: section,
          start: `top top`,
          end: `bottom bottom`,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const stepStart = activateAt * 0.85;
            const isActive = progress >= stepStart;
            step.classList.toggle("is-active", isActive);
          },
        });
      });
    }

    init();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="noise-bg overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0A0908 0%, #0D1F17 50%, #0A0908 100%)",
      }}
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-parchment/10">
        <div
          ref={progressRef}
          className="h-full bg-mist transition-none"
          style={{ width: "0%" }}
        />
      </div>

      {/* Container with horizontal overflow */}
      <div className="container-yk pt-24 pb-8">
        {/* Section head */}
        <div ref={headRef} className="mb-20 max-w-xl">
          <p className="eyebrow mb-6 reveal-item" style={{ opacity: 0 }}>
            The journey
          </p>
          <h2
            className="section-heading text-parchment reveal-item"
            style={{ opacity: 0 }}
          >
            From your door
            <br />
            <em className="italic font-light">to fresh & clean.</em>
          </h2>
        </div>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        className="process-track pl-[var(--container-pad,5vw)]"
        style={{
          paddingLeft: "clamp(1.5rem, 5vw, 8rem)",
          paddingRight: "clamp(1.5rem, 5vw, 8rem)",
          gap: "clamp(2rem, 4vw, 6rem)",
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="process-step flex-shrink-0 w-[280px] md:w-[360px] pb-24"
            style={{
              transition: "opacity 0.5s ease",
              opacity: 0.3,
            }}
          >
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className="step-line absolute top-10 right-0 w-[calc(100%+clamp(2rem,4vw,6rem))] h-px bg-parchment/10"
                style={{ right: "clamp(-3rem,-4vw,-6rem)" }}
              />
            )}

            <div className="relative">
              {/* Number */}
              <p
                className="step-num font-cormorant font-light text-7xl leading-none text-parchment/15 mb-6 transition-colors duration-500"
                style={{ letterSpacing: "-0.03em" }}
              >
                {step.num}
              </p>

              {/* Icon */}
              <div
                className="step-icon text-4xl mb-8 transition-all duration-500 origin-bottom-left"
                style={{ display: "inline-block" }}
              >
                {step.icon}
              </div>

              {/* Title */}
              <h3
                className="font-cormorant font-light text-parchment mb-2"
                style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", lineHeight: 1 }}
              >
                {step.title}
              </h3>
              <p className="text-[0.65rem] font-dm-sans font-medium tracking-[0.15em] uppercase text-mist mb-5">
                {step.subtitle}
              </p>
              <p className="font-dm-sans text-parchment/45 leading-relaxed text-sm">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

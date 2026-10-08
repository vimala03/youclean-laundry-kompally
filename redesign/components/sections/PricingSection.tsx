"use client";

import { useEffect, useRef, useState } from "react";
import MagneticButton from "../ui/MagneticButton";
import { buildWhatsAppUrl } from "@/lib/utils";

const TABS = [
  { id: "kg", label: "Per Kilogram" },
  { id: "item", label: "Per Item" },
];

const PLANS: Record<
  string,
  {
    name: string;
    price: string;
    unit: string;
    highlight?: boolean;
    features: string[];
  }[]
> = {
  kg: [
    {
      name: "Wash & Fold",
      price: "₹90",
      unit: "/ kg",
      highlight: true,
      features: [
        "Daily wear, linens, kids' clothing",
        "Sorted by colour and material",
        "Neatly folded and packed",
        "12–48 hour turnaround",
      ],
    },
    {
      name: "Wash & Iron",
      price: "₹120",
      unit: "/ kg",
      features: [
        "Office wear, uniforms, formals",
        "Crisp steam-press finish",
        "Individually hung or folded",
        "12–48 hour turnaround",
      ],
    },
  ],
  item: [
    {
      name: "Dry Cleaning",
      price: "₹79",
      unit: "+ / piece",
      highlight: true,
      features: [
        "Sarees, blazers, gowns, delicates",
        "Solvent-based, fabric-safe process",
        "Preserved colour and texture",
        "12–48 hour turnaround",
      ],
    },
    {
      name: "Express Delivery",
      price: "3–4 hrs",
      unit: "minimum",
      features: [
        "Priority pickup & cleaning",
        "+50% on base service price",
        "Availability varies by type",
        "Confirm via WhatsApp",
      ],
    },
  ],
};

function AnimatedNumber({ value, active }: { value: string; active: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translateY(20px)";
    el.style.opacity = "0";
    requestAnimationFrame(() => {
      el.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease";
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
    });
  }, [active, value]);

  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      {value}
    </span>
  );
}

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState("kg");
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const head = headRef.current;
      if (!head) return;

      gsap.fromTo(
        head.querySelectorAll(".reveal-item"),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: head, start: "top 80%", once: true },
        }
      );
    }
    init();
  }, []);

  const plans = PLANS[activeTab];

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-24 lg:py-36"
      style={{ background: "#F4EFE6" }}
    >
      <div className="container-yk">
        {/* Head */}
        <div ref={headRef} className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-lg">
            <p className="eyebrow mb-6 reveal-item" style={{ opacity: 0, color: "#1A4B35" }}>
              Transparent pricing
            </p>
            <h2
              className="section-heading text-ink reveal-item"
              style={{ opacity: 0 }}
            >
              Simple,
              <br />
              <em className="italic font-light">no surprises.</em>
            </h2>
          </div>

          {/* Tabs */}
          <div
            className="reveal-item flex items-center p-1 rounded-full border border-ink/10 self-start lg:self-auto"
            style={{ opacity: 0, background: "rgba(10,9,8,0.04)" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-5 py-2.5 rounded-full transition-all duration-400 text-[0.7rem] font-dm-sans font-medium tracking-[0.1em] uppercase"
                style={{
                  color: activeTab === tab.id ? "#F4EFE6" : "#6B6B65",
                }}
              >
                {activeTab === tab.id && (
                  <span
                    className="absolute inset-0 rounded-full bg-ink"
                    style={{
                      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((plan) => {
            const waUrl = buildWhatsAppUrl(
              "pricing",
              `Pricing: ${plan.name}`,
              plan.name
            );
            return (
              <div
                key={plan.name}
                className="relative rounded-2xl p-8 lg:p-10 overflow-hidden"
                style={{
                  background: plan.highlight ? "#0A0908" : "#FEFCF8",
                  border: plan.highlight
                    ? "1px solid rgba(0,201,122,0.2)"
                    : "1px solid rgba(10,9,8,0.08)",
                  transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                }}
              >
                {/* Glow for highlighted */}
                {plan.highlight && (
                  <div
                    className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at top right, rgba(0,201,122,0.1) 0%, transparent 70%)",
                    }}
                  />
                )}

                <p
                  className="text-[0.65rem] font-dm-sans font-medium tracking-[0.2em] uppercase mb-6"
                  style={{ color: plan.highlight ? "#4A9970" : "#6B6B65" }}
                >
                  {plan.name}
                </p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span
                    className="font-cormorant font-light"
                    style={{
                      fontSize: "clamp(3rem, 6vw, 5rem)",
                      lineHeight: 1,
                      color: plan.highlight ? "#F4EFE6" : "#0A0908",
                    }}
                  >
                    <AnimatedNumber
                      value={plan.price}
                      active={
                        (activeTab === "kg" && plan.name.includes("Wash")) ||
                        (activeTab === "item" && plan.name.includes("Dry"))
                      }
                    />
                  </span>
                  <span
                    className="font-dm-sans text-sm"
                    style={{ color: plan.highlight ? "#4A9970" : "#6B6B65" }}
                  >
                    {plan.unit}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm font-dm-sans"
                      style={{
                        color: plan.highlight
                          ? "rgba(244,239,230,0.6)"
                          : "rgba(10,9,8,0.55)",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="mt-0.5 flex-shrink-0"
                      >
                        <path
                          d="M2 7l3.5 3.5L12 3"
                          stroke={plan.highlight ? "#00C97A" : "#1A4B35"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <MagneticButton
                  href={waUrl}
                  target="_blank"
                  rel="noopener"
                  variant={plan.highlight ? "primary" : "outline"}
                  size="sm"
                  className={
                    !plan.highlight
                      ? "!border-ink/20 !text-ink hover:!border-ink hover:!text-ink"
                      : ""
                  }
                  data-cursor="book"
                >
                  Book {plan.name}
                </MagneticButton>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p
          className="mt-8 text-center text-[0.75rem] font-dm-sans text-ink/35"
          style={{ letterSpacing: "0.02em" }}
        >
          Express delivery charged at 50% extra · Pricing may vary for special items ·
          Confirm via WhatsApp
        </p>
      </div>
    </section>
  );
}

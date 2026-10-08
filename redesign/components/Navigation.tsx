"use client";

import { useEffect, useRef, useState } from "react";
import MagneticButton from "./ui/MagneticButton";
import { buildWhatsAppUrl } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#pricing", label: "Pricing" },
  { href: "#trust", label: "Why Us" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden(y > lastY.current && y > 400);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waUrl = buildWhatsAppUrl("nav", "Header Book Pickup");

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] mix-blend-normal"
        style={{
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          className="transition-all duration-600"
          style={{
            background: scrolled
              ? "rgba(10,9,8,0.85)"
              : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled
              ? "1px solid rgba(244,239,230,0.08)"
              : "1px solid transparent",
          }}
        >
          <div className="container-yk flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href="#top"
              className="flex items-center gap-3 group"
              data-cursor="home"
            >
              <div
                className="w-8 h-8 rounded-full bg-mist flex items-center justify-center text-ink font-bold text-sm font-dm-sans"
                style={{ letterSpacing: "-0.02em" }}
              >
                Y
              </div>
              <div>
                <span
                  className="block font-cormorant font-light text-parchment"
                  style={{ fontSize: "1.1rem", lineHeight: 1 }}
                >
                  YouClean
                </span>
                <span className="block text-[0.55rem] font-dm-sans tracking-[0.2em] uppercase text-parchment/40">
                  Kompally
                </span>
              </div>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[0.7rem] font-dm-sans font-medium tracking-[0.15em] uppercase text-parchment/50 hover:text-parchment transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:block">
              <MagneticButton
                href={waUrl}
                target="_blank"
                rel="noopener"
                variant="primary"
                size="sm"
                data-cursor="book"
              >
                Book Pickup
              </MagneticButton>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className="block w-6 h-px bg-parchment transition-all duration-300"
                style={{
                  transform: menuOpen
                    ? "translateY(4px) rotate(45deg)"
                    : "none",
                }}
              />
              <span
                className="block w-6 h-px bg-parchment transition-all duration-300"
                style={{ opacity: menuOpen ? 0 : 1, width: menuOpen ? 0 : 24 }}
              />
              <span
                className="block w-6 h-px bg-parchment transition-all duration-300"
                style={{
                  transform: menuOpen
                    ? "translateY(-4px) rotate(-45deg)"
                    : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-500"
          style={{
            maxHeight: menuOpen ? "400px" : "0px",
            background: "rgba(10,9,8,0.97)",
            backdropFilter: "blur(20px)",
          }}
        >
          <nav className="container-yk py-8 flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-cormorant text-3xl font-light text-parchment hover:text-mist transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            <MagneticButton
              href={waUrl}
              target="_blank"
              rel="noopener"
              variant="primary"
              size="md"
              className="mt-4 self-start"
            >
              Book Pickup
            </MagneticButton>
          </nav>
        </div>
      </header>
    </>
  );
}

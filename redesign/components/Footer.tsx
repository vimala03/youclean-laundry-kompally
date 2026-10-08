"use client";

import MagneticButton from "./ui/MagneticButton";
import { buildWhatsAppUrl } from "@/lib/utils";

export default function Footer() {
  const waUrl = buildWhatsAppUrl("footer", "Footer Book Pickup");

  return (
    <footer
      className="py-16 border-t border-parchment/8"
      style={{ background: "#0A0908" }}
    >
      <div className="container-yk">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-mist flex items-center justify-center text-ink font-bold text-sm font-dm-sans">
                Y
              </div>
              <div>
                <span
                  className="block font-cormorant font-light text-parchment"
                  style={{ fontSize: "1.1rem", lineHeight: 1 }}
                >
                  YouClean
                </span>
                <span className="block text-[0.55rem] font-dm-sans tracking-[0.2em] uppercase text-parchment/30">
                  Laundry & Dry Cleaning
                </span>
              </div>
            </div>
            <p className="font-dm-sans text-sm text-parchment/40 leading-relaxed max-w-xs">
              Premium laundry service based in Kompally, Hyderabad. Pickup at
              your door, returned fresh.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[0.65rem] font-dm-sans font-medium tracking-[0.2em] uppercase text-parchment/30 mb-5">
              Services
            </p>
            <ul className="space-y-3">
              {[
                "Wash & Fold",
                "Wash & Iron",
                "Dry Cleaning",
                "Steam & Press",
                "Saree Dry Clean",
                "Curtains Cleaning",
              ].map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="font-dm-sans text-sm text-parchment/40 hover:text-parchment transition-colors duration-300"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[0.65rem] font-dm-sans font-medium tracking-[0.2em] uppercase text-parchment/30 mb-5">
              Contact
            </p>
            <div className="space-y-4 mb-8">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 font-dm-sans text-sm text-parchment/50 hover:text-mist transition-colors duration-300 group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Book via WhatsApp
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 font-dm-sans text-sm text-parchment/50 hover:text-mist transition-colors duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5 19.79 19.79 0 01.11 1 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Call us
              </a>
            </div>

            <MagneticButton
              href={waUrl}
              target="_blank"
              rel="noopener"
              variant="outline"
              size="sm"
              className="!border-parchment/15"
            >
              Schedule Pickup
            </MagneticButton>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="divider mb-8" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-dm-sans text-[0.7rem] text-parchment/20 tracking-wide">
            © 2025 YouClean · Kompally, Hyderabad
          </p>
          <p className="font-dm-sans text-[0.7rem] text-parchment/15 tracking-wide">
            Built with care
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  label: string;
  title: string;
  description: string;
  detail: string;
  price?: string;
  icon: string;
  featured?: boolean;
  onBook?: () => void;
  index?: number;
}

export default function ServiceCard({
  label,
  title,
  description,
  detail,
  price,
  icon,
  featured = false,
  onBook,
  index = 0,
}: ServiceCardProps) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x, y });
  }

  function onMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "service-card-hover relative group rounded-2xl p-8 overflow-hidden",
        "transition-all duration-500",
        featured
          ? "bg-sage-deep border border-mist/30"
          : "bg-ink-soft border border-parchment/8",
        hovered && !featured && "border-parchment/20",
        hovered && featured && "border-mist/60"
      )}
      style={{
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-6px)`
          : "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)",
        transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease",
        animationDelay: `${index * 0.1}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      data-cursor="explore"
    >
      {/* Gradient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: featured
            ? "radial-gradient(ellipse at 30% 0%, rgba(0,201,122,0.12) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 30% 0%, rgba(244,239,230,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Featured badge */}
      {featured && (
        <div className="absolute top-6 right-6">
          <span className="text-[0.6rem] font-dm-sans font-medium tracking-[0.15em] uppercase text-mist border border-mist/40 rounded-full px-3 py-1">
            Most booked
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="text-3xl mb-6 transition-transform duration-400 group-hover:scale-110 origin-left">
        {icon}
      </div>

      {/* Label */}
      <p className="text-[0.65rem] font-dm-sans font-medium tracking-[0.2em] uppercase mb-3 text-stone-light opacity-60">
        {label}
      </p>

      {/* Title */}
      <h3
        className="font-cormorant font-light mb-3"
        style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", lineHeight: 1.05 }}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm font-dm-sans text-parchment/60 leading-relaxed mb-4">
        {description}
      </p>

      {/* Revealed detail on hover */}
      <p className="card-detail text-sm font-dm-sans text-parchment/50 leading-relaxed mb-6">
        {detail}
      </p>

      {/* Bottom row */}
      <div className="flex items-end justify-between mt-auto pt-4 border-t border-parchment/8">
        {price && (
          <span className="font-cormorant text-2xl font-light text-parchment">
            {price}
          </span>
        )}
        <button
          className={cn(
            "card-detail ml-auto text-[0.65rem] font-dm-sans font-medium tracking-[0.15em] uppercase",
            "flex items-center gap-2 group/btn",
            featured ? "text-mist" : "text-parchment/60 hover:text-mist"
          )}
          onClick={onBook}
          style={{ transition: "color 0.3s ease" }}
        >
          Book now
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform duration-300 group-hover/btn:translate-x-1"
          >
            <path
              d="M2 7h10M8 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Bottom line reveal */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-mist"
        style={{
          width: hovered ? "100%" : "0%",
          transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </div>
  );
}

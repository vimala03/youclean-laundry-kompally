"use client";

import { useEffect, useRef } from "react";

export default function GarmentSVG() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Steam particles float upward
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Halo glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 60%, rgba(0,201,122,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Steam particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: "42%", delay: "0s", size: 6 },
          { left: "50%", delay: "0.9s", size: 4 },
          { left: "58%", delay: "1.8s", size: 5 },
          { left: "46%", delay: "1.2s", size: 3 },
          { left: "54%", delay: "0.4s", size: 4 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-mist/40"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              bottom: "62%",
              animation: `steam 2.8s ease-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* The garment SVG */}
      <svg
        ref={svgRef}
        viewBox="0 0 220 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-float relative z-10 drop-shadow-2xl"
        style={{
          width: "clamp(200px, 35vw, 380px)",
          height: "auto",
          filter: "drop-shadow(0 30px 60px rgba(0,201,122,0.15))",
        }}
      >
        {/* Shirt outline — elegant dress shirt silhouette */}
        <path
          className="garment-path"
          d="
            M 110 18
            C 107 14 100 12 94 10
            C 86 8 78 14 74 20
            C 68 28 66 36 60 42
            L 22 58
            L 12 90
            L 46 78
            L 46 262
            L 174 262
            L 174 78
            L 208 90
            L 198 58
            L 160 42
            C 154 36 152 28 146 20
            C 142 14 134 8 126 10
            C 120 12 113 14 110 18 Z
          "
          stroke="#F4EFE6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />

        {/* Collar detail */}
        <path
          d="M 94 10 C 98 22 106 28 110 30 C 114 28 122 22 126 10"
          stroke="#F4EFE6"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Button placket */}
        <line
          x1="110"
          y1="32"
          x2="110"
          y2="262"
          stroke="#F4EFE6"
          strokeWidth="0.8"
          opacity="0.25"
          strokeDasharray="2 6"
        />

        {/* Buttons */}
        {[70, 100, 130, 160, 190, 220].map((y, i) => (
          <circle
            key={i}
            cx="110"
            cy={y}
            r="2"
            fill="#F4EFE6"
            opacity="0.3"
          />
        ))}

        {/* Pocket */}
        <rect
          x="130"
          y="95"
          width="28"
          height="22"
          rx="2"
          stroke="#F4EFE6"
          strokeWidth="0.8"
          fill="none"
          opacity="0.2"
        />

        {/* Sleeve cuff lines */}
        <line x1="12" y1="90" x2="46" y2="78" stroke="#F4EFE6" strokeWidth="0.8" opacity="0.2" />
        <line x1="198" y1="58" x2="208" y2="90" stroke="#F4EFE6" strokeWidth="0.8" opacity="0.2" />

        {/* Fold lines on body — fabric texture hint */}
        <path
          d="M 65 120 Q 80 125 95 120"
          stroke="#F4EFE6"
          strokeWidth="0.6"
          fill="none"
          opacity="0.1"
        />
        <path
          d="M 125 150 Q 140 155 155 150"
          stroke="#F4EFE6"
          strokeWidth="0.6"
          fill="none"
          opacity="0.1"
        />

        {/* Clean sparkles */}
        <g opacity="0.6">
          <path
            d="M 34 44 L 36 40 L 38 44 L 42 46 L 38 48 L 36 52 L 34 48 L 30 46 Z"
            fill="#00C97A"
            style={{ animation: "pulse-ring 3s ease-in-out infinite" }}
          />
          <path
            d="M 178 52 L 180 48 L 182 52 L 186 54 L 182 56 L 180 60 L 178 56 L 174 54 Z"
            fill="#00C97A"
            opacity="0.7"
            style={{
              animation: "pulse-ring 3s ease-in-out infinite",
              animationDelay: "1s",
            }}
          />
          <circle cx="60" cy="160" r="2" fill="#00C97A" opacity="0.3"
            style={{ animation: "pulse-ring 2s ease-in-out infinite 0.5s" }}
          />
          <circle cx="162" cy="140" r="1.5" fill="#F4EFE6" opacity="0.3"
            style={{ animation: "pulse-ring 2.5s ease-in-out infinite 1.5s" }}
          />
        </g>
      </svg>

      {/* Reflection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(10,9,8,0.5))",
        }}
      />
    </div>
  );
}

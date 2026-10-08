"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  "data-cursor"?: string;
  target?: string;
  rel?: string;
}

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  "data-cursor": dataCursor,
  target,
  rel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const MAGNETIC_STRENGTH = 0.4;

  function onMouseMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * MAGNETIC_STRENGTH;
    const dy = (e.clientY - cy) * MAGNETIC_STRENGTH;
    setTranslate({ x: dx, y: dy });
  }

  function onMouseLeave() {
    setTranslate({ x: 0, y: 0 });
    setHovered(false);
  }

  function onMouseEnter() {
    setHovered(true);
  }

  const baseStyles = cn(
    "relative inline-flex items-center justify-center overflow-hidden",
    "font-body font-medium tracking-widest uppercase",
    "rounded-full select-none",
    "transition-all duration-500",
    {
      "text-xs px-6 py-3": size === "sm",
      "text-[0.75rem] px-8 py-4": size === "md",
      "text-[0.8rem] px-10 py-5": size === "lg",
    },
    // Primary: mist green fill
    variant === "primary" && [
      "bg-mist text-ink font-semibold",
      hovered && "text-parchment",
    ],
    // Outline: border only
    variant === "outline" && [
      "border border-parchment/30 text-parchment",
      hovered && "border-mist text-mist",
    ],
    // Ghost: text only
    variant === "ghost" && ["text-parchment/70", hovered && "text-mist"],
    className
  );

  const innerStyle = {
    transform: `translate(${translate.x}px, ${translate.y}px)`,
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    position: "relative" as const,
    zIndex: 1,
  };

  const wrapperStyle = {
    transform: `translate(${translate.x * 0.4}px, ${translate.y * 0.4}px)`,
    transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    display: "inline-block",
  };

  const shared = {
    className: baseStyles,
    onMouseMove,
    onMouseLeave,
    onMouseEnter,
    "data-cursor": dataCursor,
    style: wrapperStyle,
  };

  const content = (
    <>
      {/* Hover fill bg (primary only) */}
      {variant === "primary" && (
        <span
          className="absolute inset-0 bg-sage rounded-full"
          style={{
            transform: hovered ? "scale(1)" : "scale(0)",
            transformOrigin: "center",
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      )}
      <span style={innerStyle}>{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        {...shared}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      {...shared}
    >
      {content}
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "hover" | "text" | "cta" | "drag";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const pos = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function tick() {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.09);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.09);

      dot.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      ringEl.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;

      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);

    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    }

    function onLeave() {
      setVisible(false);
    }

    function onEnterLink(e: MouseEvent) {
      const target = e.currentTarget as HTMLElement;
      const cursorLabel = target.dataset.cursor || "";
      setLabel(cursorLabel);
      setMode(cursorLabel === "book" ? "cta" : "hover");
    }

    function onLeaveLink() {
      setLabel("");
      setMode("default");
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    // Attach to interactive elements
    function attachListeners() {
      document
        .querySelectorAll<HTMLElement>(
          "a, button, [data-cursor], .service-card-hover, .process-step"
        )
        .forEach((el) => {
          el.addEventListener("mouseenter", onEnterLink);
          el.addEventListener("mouseleave", onLeaveLink);
        });
    }

    attachListeners();

    // Re-attach after DOM changes
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      observer.disconnect();
    };
  }, [visible]);

  const ringSize = mode === "hover" ? 56 : mode === "cta" ? 80 : 40;
  const ringBorder =
    mode === "cta" ? "2px solid #00C97A" : "1px solid rgba(244,239,230,0.5)";
  const dotColor = mode === "hover" || mode === "cta" ? "#00C97A" : "#F4EFE6";

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none mix-blend-difference"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: dotColor,
          opacity: visible ? 1 : 0,
          transition: "background-color 0.3s ease, opacity 0.3s ease",
          willChange: "transform",
        }}
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9997] pointer-events-none flex items-center justify-center"
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: ringBorder,
          opacity: visible ? 1 : 0,
          transition:
            "width 0.4s cubic-bezier(0.16,1,0.3,1), height 0.4s cubic-bezier(0.16,1,0.3,1), border 0.3s ease, opacity 0.3s ease",
          willChange: "transform",
          backdropFilter: mode === "cta" ? "blur(2px)" : "none",
        }}
      >
        {label && (
          <span
            style={{
              fontSize: "0.55rem",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#00C97A",
              fontWeight: 500,
              opacity: mode === "hover" || mode === "cta" ? 1 : 0,
              transition: "opacity 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </>
  );
}

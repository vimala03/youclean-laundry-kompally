"use client";

import { useEffect, useRef, useState } from "react";

export type CursorState = "default" | "hover" | "text" | "drag" | "hidden";

export function useCursor() {
  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState<string>("");
  const pos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let animFrame: number;
    let ringX = -100;
    let ringY = -100;

    function onMouseMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function animate() {
      const { x, y } = pos.current;

      dot.style.transform = `translate(${x - 4}px, ${y - 4}px)`;

      ringX = lerp(ringX, x, 0.1);
      ringY = lerp(ringY, y, 0.1);
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;

      animFrame = requestAnimationFrame(animate);
    }

    animFrame = requestAnimationFrame(animate);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  function setCursorState(s: CursorState, l = "") {
    setState(s);
    setLabel(l);
  }

  return { state, label, dotRef, ringRef, setCursorState };
}

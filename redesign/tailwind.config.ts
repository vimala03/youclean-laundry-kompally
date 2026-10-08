import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0908",
          soft: "#141210",
          muted: "#2A2825",
        },
        parchment: {
          DEFAULT: "#F4EFE6",
          soft: "#FAF7F2",
          warm: "#FEFCF8",
        },
        sage: {
          deep: "#0D2B1F",
          DEFAULT: "#1A4B35",
          mid: "#2D6B4F",
          light: "#4A9970",
        },
        mist: {
          DEFAULT: "#00C97A",
          soft: "rgba(0,201,122,0.15)",
          glow: "rgba(0,201,122,0.08)",
        },
        stone: {
          DEFAULT: "#6B6B65",
          light: "#A0A09A",
          silk: "#E8E2D9",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "10xl": ["10rem", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        "9xl": ["8rem", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        "8xl": ["6rem", { lineHeight: "0.92", letterSpacing: "-0.02em" }],
        "fluid-hero": ["clamp(4rem,8vw,9rem)", { lineHeight: "0.92" }],
        "fluid-title": ["clamp(2.5rem,5vw,5.5rem)", { lineHeight: "1.05" }],
        "fluid-sub": ["clamp(1.1rem,2vw,1.5rem)", { lineHeight: "1.5" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "section": "clamp(5rem,10vw,10rem)",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
        "sine-out": "cubic-bezier(0.39, 0.575, 0.565, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
      },
      keyframes: {
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-14px) rotate(-1.5deg)" },
          "66%": { transform: "translateY(-7px) rotate(1deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        "grain": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-1%, -2%)" },
          "20%": { transform: "translate(2%, 1%)" },
          "30%": { transform: "translate(-1%, 2%)" },
          "40%": { transform: "translate(1%, -1%)" },
          "50%": { transform: "translate(-2%, 1%)" },
          "60%": { transform: "translate(1%, 2%)" },
          "70%": { transform: "translate(-1%, -1%)" },
          "80%": { transform: "translate(2%, -2%)" },
          "90%": { transform: "translate(-2%, 2%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "50%": { transform: "scale(1.05)", opacity: "0.4" },
          "100%": { transform: "scale(0.9)", opacity: "0.7" },
        },
        "fade-up": {
          "from": { opacity: "0", transform: "translateY(30px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "steam": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "100%": { transform: "translateY(-60px) scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        "float": "float 5s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "grain": "grain 0.5s steps(1) infinite",
        "pulse-ring": "pulse-ring 3s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "steam-1": "steam 2.5s ease-out infinite 0s",
        "steam-2": "steam 2.5s ease-out infinite 0.8s",
        "steam-3": "steam 2.5s ease-out infinite 1.6s",
      },
    },
  },
  plugins: [],
};

export default config;

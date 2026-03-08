import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kin: {
          bg: "#0c0b08",
          surface: "#141210",
          text: "#f0ebe0",
          muted: "rgba(240,235,224,0.45)",
          gold: "#c9a84c",
          "gold-hover": "#b8943f",
          red: "#e05555",
          green: "#4caf6e",
          border: "rgba(255,255,255,0.08)",
          "border-gold": "rgba(201,168,76,0.25)",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pillIn: {
          from: { opacity: "0", transform: "scale(0.78) translateY(6px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 14px rgba(201,168,76,0.3)" },
          "50%": { boxShadow: "0 0 34px rgba(201,168,76,0.7)" },
        },
        bigReveal: {
          from: { opacity: "0", transform: "scale(0.88) translateY(16px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        countUp: {
          from: { opacity: "0.3" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease both",
        "pill-in": "pillIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "big-reveal": "bigReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
        "count-up": "countUp 0.15s ease",
      },
    },
  },
  plugins: [],
};
export default config;

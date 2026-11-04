import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Arial",
          "sans-serif",
        ],
        heading: [
          "'DM Sans'",
          "'Inter'",
          "-apple-system",
          "sans-serif",
        ],
        serif: [
          "'Georgia'",
          "'Noto Serif'",
          "serif",
        ],
      },
      colors: {
        buddy: {
          navy: "#191142",
          navyDark: "#110b2e",
          navyLight: "#261d5e",
          cyan: "#0ea9df",
          cyanHover: "#0c93c4",
          cyanLight: "#e0f4fb",
          border: "#e2e8f0",
          bg: "#f8fafc",
        },
        amazon: {
          dark: "#131921",
          light: "#232f3e",
          subnav: "#232f3e",
          bg: "#f8fafc",
          yellow: "#0ea9df",
          orange: "#0ea9df",
          btnYellow: "#0ea9df",
          btnYellowHover: "#0c93c4",
          btnOrange: "#191142",
          btnOrangeHover: "#261d5e",
          blue: "#0284c7",
          linkHover: "#0ea9df",
          price: "#0f172a",
          green: "#059669",
          border: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

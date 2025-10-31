import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "#bf42f5",
          secondary: "#2c6aa5",
          background: "#f3f4f6",
          surface: "rgba(255,255,255,0.72)",
          surfaceStrong: "rgba(255,255,255,0.88)",
          border: "rgba(15,23,42,0.12)",
          foreground: "#0f172a",
        },
      },
      backgroundImage: {
        "light-radial":
          "radial-gradient(circle at top, rgba(191,66,245,0.12) 0%, rgba(255,255,255,0.88) 60%, rgba(243,244,246,1) 100%)",
        "light-card":
          "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(243,244,246,0.92) 100%)",
        "light-subtle":
          "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(243,244,246,0.85) 100%)",
      },
      boxShadow: {
        "brand-soft": "0 24px 60px -35px rgba(44, 106, 165, 0.35)",
        "brand-ring": "0 0 0 2px rgba(191, 66, 245, 0.15)",
      },
    },
  },
  plugins: [animate, typography],
};

export default config;

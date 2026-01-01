import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f9ff",
          100: "#e0efff",
          200: "#b9ddff",
          300: "#82c1ff",
          400: "#4fa6ff",
          500: "#1c87ff",
          600: "#0b68db",
          700: "#084fa9",
          800: "#063b7d",
          900: "#042756",
        },
      },
      boxShadow: {
        soft: "0 18px 30px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#FF6D3F",
          glow: "rgba(255, 109, 63, 0.15)",
        },
        accent: {
          teal: "#2DD4A8",
          blue: "#4D8EFF",
        },
        danger: "#FF4D6A",
        warning: "#FFB547",
      },
    },
  },
  plugins: [],
};

export default config;

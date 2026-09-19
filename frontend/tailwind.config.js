import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#84B1DD", // The professional light blue from the reference
          "secondary": "#ffffff",
          "accent": "#6399c5",
          "neutral": "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f3f4f6",
          "base-300": "#e5e7eb",
          "base-content": "#1f2937",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      {
        dark: {
          "primary": "#ffffff", // Crisp white primary against dark mode
          "secondary": "#1a1a1a",
          "accent": "#cccccc",
          "neutral": "#d1d5db",
          "base-100": "#0a0a0a", // Deep black
          "base-200": "#111111", // Slightly lighter for contrast
          "base-300": "#222222", // For borders/accents
          "base-content": "#f3f4f6", // Very light gray text for readability
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ea580c",
          light: "#fff7ed",
          dark: "#c2410c",
        },
        brand: {
          DEFAULT: "#1c1917",
          muted: "#292524",
        },
        success: {
          DEFAULT: "#166534",
          light: "#dcfce7",
        },
        danger: {
          DEFAULT: "#991b1b",
          light: "#fee2e2",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
        },
        purple: {
          DEFAULT: "#7c3aed",
          light: "#ede9fe",
        },
      },
    },
  },
  plugins: [],
};

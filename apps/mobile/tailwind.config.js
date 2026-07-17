/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          light: "#eff6ff",
          dark: "#1d4ed8",
        },
        success: {
          DEFAULT: "#16a34a",
          light: "#dcfce7",
        },
        danger: {
          DEFAULT: "#dc2626",
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

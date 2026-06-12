/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8EC",
        butter: "#F8E8C8",
        leaf: "#3E7C4A",
        leafdark: "#2C5E36",
        earth: "#7C5A3A",
        milk: "#FDFBF7",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        body: ["Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.9s ease both",
        "fade-in": "fadeIn 1.4s ease both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
      },
    },
  },
  plugins: [],
};

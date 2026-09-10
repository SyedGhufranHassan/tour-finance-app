/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0e1726",
        ink: "#172033",
        emerald: "#1fc49b",
      },
      boxShadow: {
        card: "0 18px 45px rgba(14, 23, 38, .08)",
      },
    },
  },
  plugins: [],
};

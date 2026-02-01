module.exports = {
  content: [
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./index.md",
    "./assets/js/**/*.js",
    "./node_modules/flowbite/**/*.js"
  ],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        "cove-ivory": "#F9ECCF",
        "cove-charcoal": "#333333",
        "cove-ocean": "#9DC6AA",
        "cove-ocean-flow": "#9DC6AA",
        "cove-ocean-soft": "rgba(157 198 170 / 0.2)",
        "cove-ocean-flow-soft": "rgba(157 198 170 / 0.2)",
        "cove-charcoal-soft": "rgba(51 51 51 / 0.7)",
        "cove-charcoal-muted": "rgba(51 51 51 / 0.5)"
      },
      boxShadow: {
        cove: "0 24px 50px rgba(51, 51, 51, 0.12)",
        soft: "0 16px 32px rgba(51, 51, 51, 0.1)"
      },
      fontFamily: {
        greek: ["\"Helvetica Neue\"", "Helvetica", "Arial", "sans-serif"],
        display: ["\"Fraunces\"", "serif"],
        body: ["\"Sora\"", "sans-serif"]
      },
      borderRadius: {
        cove: "26px",
        "cove-lg": "32px",
        "cove-xl": "40px"
      }
    }
  },
  plugins: [require("flowbite/plugin")]
};

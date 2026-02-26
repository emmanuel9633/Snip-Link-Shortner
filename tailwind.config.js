/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        void: "#080a0e",
        surface: "#0d1117",
        panel: "#161b22",
        border: "#21262d",
        muted: "#8b949e",
        text: "#e6edf3",
        accent: "#f7a800",
        "accent-dim": "#f7a80022",
        emerald: "#3fb950",
        "emerald-dim": "#3fb95020",
        crimson: "#f85149",
        "crimson-dim": "#f8514920",
        azure: "#58a6ff",
        "azure-dim": "#58a6ff20",
        violet: "#bc8cff",
        "violet-dim": "#bc8cff20",
      },
      boxShadow: {
        glow: "0 0 20px rgba(247, 168, 0, 0.15)",
        "glow-sm": "0 0 10px rgba(247, 168, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

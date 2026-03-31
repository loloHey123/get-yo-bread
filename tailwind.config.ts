import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crust: "#8B4513",
        golden: "#F4A460",
        cream: "#FFF8DC",
        "warm-white": "#FFFAF0",
        butter: "#FFD700",
        dough: "#F5DEB3",
        chocolate: "#3E2723",
        jam: "#C62828",
      },
    },
  },
  plugins: [],
};

export default config;

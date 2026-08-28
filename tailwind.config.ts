import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2F6F5",
        surface: "#FFFFFF",
        ink: "#132523",
        "ink-soft": "#4C605C",
        "ink-faint": "#7E938E",
        line: "#D7E4E1",
        teal: { DEFAULT: "#0E6E64", strong: "#0A5750", tint: "#DCEEEA" },
        coral: { DEFAULT: "#C6552B", tint: "#F5E3D8" },
        da: { DEFAULT: "#3E5C93", tint: "#E1E7F4" },
        toca: { DEFAULT: "#0E8A72", tint: "#D9F0E8" },
        perfil: { DEFAULT: "#C2792B", tint: "#F6E6CF" },
        coord: { DEFAULT: "#7A4B72", tint: "#EFDFEC" },
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "Georgia", "serif"],
        body: ["var(--font-work-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

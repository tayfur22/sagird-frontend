import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  // Preflight (Tailwind's global reset) is off on purpose: the rest of the site is styled with
  // CSS Modules + tokens.css and must not be affected. Tailwind only supplies utility classes.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        slate: {
          850: "#172033",
        },
      },
    },
  },
  plugins: [],
};

export default config;

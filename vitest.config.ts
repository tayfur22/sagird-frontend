import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // tsconfig uses `jsx: preserve` (for Next); tell esbuild to use the automatic
  // runtime so test files/components don't need `import React`.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

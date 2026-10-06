import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Served from the repo subpath on GitHub Pages (ADR-0002).
export default defineConfig({
  base: "/todo/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});

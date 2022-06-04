/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.tsx"),
      name: "Solid A11y",
      fileName: (format) => `solid-a11y.${format}.js`,
    },
    rollupOptions: {
      external: [/^solid-js(\/.+)?$/],
      output: {
        globals: {
          "solid-js": "solidJs",
          "solid-js/web": "solidJsWeb",
        },
      },
    },
  },
  plugins: [solidPlugin()],
  resolve: {
    conditions: ["development", "browser"],
  },
  test: {
    deps: {
      inline: [/solid-js/],
    },
    environment: "jsdom",
    transformMode: {
      web: [/\.tsx?$/],
    },
    setupFiles: "./vitest.setup.ts",
  },
});

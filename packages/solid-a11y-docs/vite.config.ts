import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

import mdxPlugin from "./plugin-mdx";
import prismjsPlugin from "./plugin-prismjs";

export default defineConfig({
  plugins: [prismjsPlugin(), mdxPlugin(), solidPlugin({ extensions: [".mdx"] })],
  resolve: {
    alias: [{ find: "@docs", replacement: "/src" }],
  },
});

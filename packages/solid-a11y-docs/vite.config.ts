import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

import componentDocsPlugin from "./vite-plugins/component-docs";
import mdxPlugin from "./vite-plugins/mdx";
import prismjsPlugin from "./vite-plugins/prismjs";

export default defineConfig({
  plugins: [
    componentDocsPlugin(),
    mdxPlugin(),
    prismjsPlugin(),
    solidPlugin({ extensions: [".mdx"] }),
  ],
  resolve: {
    alias: [{ find: "@docs", replacement: "/src" }],
  },
});

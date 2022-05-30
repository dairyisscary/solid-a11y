import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

import codeHighlightPlugin from "./vite-plugins/code-highlight";
import componentDocsPlugin from "./vite-plugins/component-docs";
import indexHTMLPlugin from "./vite-plugins/index-html";
import mdxPlugin from "./vite-plugins/mdx";
import svgPlugin from "./vite-plugins/svg";

export default defineConfig({
  plugins: [
    componentDocsPlugin(),
    indexHTMLPlugin(),
    svgPlugin(),
    mdxPlugin(),
    codeHighlightPlugin(),
    solidPlugin({ extensions: [".mdx"] }),
  ],
  resolve: {
    alias: [{ find: "@docs", replacement: "/src" }],
  },
});

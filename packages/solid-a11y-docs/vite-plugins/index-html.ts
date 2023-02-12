import { minify } from "html-minifier-terser";
import type { Plugin } from "vite";

export default function solidA11yIndexHTMLPlugin(): Plugin {
  let isProduction = false;
  return {
    name: "solid-a11y:index-html",
    config(_userConfig, { mode }) {
      isProduction = mode === "production";
    },
    transformIndexHtml(html) {
      if (isProduction) {
        return minify(html, {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
        });
      }
      return html;
    },
  };
}

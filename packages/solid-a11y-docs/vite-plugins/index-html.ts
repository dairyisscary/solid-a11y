import { minify } from "html-minifier-terser";
import { generateHydrationScript } from "solid-js/web";
import type { Plugin } from "vite";

const ANALYTICS_SCRIPT = `<script src="https://thorn-side-absolutely.solid-a11y.dev/script.js" data-site="XSKZAHPM" defer></script>`;

export default function solidA11yIndexHTMLPlugin(): Plugin {
  let isProduction = false;
  const hydrationScript = generateHydrationScript();
  return {
    name: "solid-a11y:index-html",
    config(_userConfig, { mode }) {
      isProduction = mode === "production";
    },
    transformIndexHtml(html) {
      if (isProduction) {
        html = html.replace("</body>", `${ANALYTICS_SCRIPT}</body>`);
      }
      return minify(html.replace("</head>", `${hydrationScript}</head>`), {
        collapseWhitespace: true,
        removeComments: false,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
      });
    },
  };
}

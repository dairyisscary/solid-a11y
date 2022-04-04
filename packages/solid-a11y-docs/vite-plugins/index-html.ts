import type { Plugin } from "vite";

const ANALYTICS_SCRIPT = `<script src="https://thorn-side-absolutely.solid-a11y.dev/script.js" data-site="XSKZAHPM" defer></script>`;

export default function solidA11yIndexHTMLPlugin(): Plugin {
  let isProduction = false;
  return {
    name: "solid-a11y:index-html",
    config(_userConfig, { mode }) {
      isProduction = mode === "production";
    },
    transformIndexHtml(html) {
      if (isProduction) {
        return html.replace("</body>", `${ANALYTICS_SCRIPT}</body>`);
      }
      return html;
    },
  };
}

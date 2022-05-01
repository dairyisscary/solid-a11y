const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{html,ts,tsx,mdx}", "./index.html", "./vite-plugins/**/*.ts"],
  plugins: [
    require("@tailwindcss/typography"),
    plugin(function ({ addVariant, e, postcss }) {
      addVariant("firefox", ({ container, separator }) => {
        const isFirefoxRule = postcss.atRule({ name: "-moz-document", params: "url-prefix()" });
        isFirefoxRule.append(container.nodes);
        container.append(isFirefoxRule);
        isFirefoxRule.walkRules((rule) => {
          rule.selector = `.${e(`firefox${separator}${rule.selector.slice(1)}`)}`;
        });
      });
    }),
  ],
  theme: {
    extend: {
      colors: {
        code: {
          accent: "#89DDFF",
          highlight: "#1E212D",
        },
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
};

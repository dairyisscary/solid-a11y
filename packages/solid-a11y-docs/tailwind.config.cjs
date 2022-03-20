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
        // Theme for code samples, modified Nord theme
        code: {
          base: "#F8F8F2",
          bg: "#1E222B",
          comment: "#636F88",
          important: "#EBCB8B",
          keyword: "#81A1C1",
          literal: "#A3BE8C",
          name: "#88C0D0",
          primitive: "#B48EAD",
        },
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
};

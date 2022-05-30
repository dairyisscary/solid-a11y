import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { type OptimizeOptions, type XastChild, optimize } from "svgo";
import type { Plugin } from "vite";

import { ICON_NAMES } from "../src/assets/svg-icon-name";

const SPRITE_SVG_OPTIONS_FOR_ICONS: OptimizeOptions["plugins"] = [
  {
    name: "removeSymbols",
    type: "perItem",
    fn: (node: XastChild) => {
      return (
        node.type !== "element" ||
        node.name !== "symbol" ||
        (ICON_NAMES as readonly string[]).includes(
          node.attributes.id.replace("ri-", "").replace("-line", ""),
        )
      );
    },
  },
  {
    name: "preset-default",
    params: {
      overrides: {
        removeHiddenElems: false,
        cleanupIDs: false,
      },
    },
  },
];
const DEFAULT_OPTIMIZE_SVG_OPTIONS: OptimizeOptions["plugins"] = ["preset-default"];

async function optimizeAndRewrite(path: string, isIconSprite: boolean): Promise<void> {
  const contents = await readFile(path, "utf-8");
  const result = optimize(contents, {
    multipass: true,
    plugins: isIconSprite ? SPRITE_SVG_OPTIONS_FOR_ICONS : DEFAULT_OPTIMIZE_SVG_OPTIONS,
  });
  if (result.modernError) {
    throw result.modernError;
  }
  return writeFile(path, result.data, "utf-8");
}

async function crawlForSvg(path: string): Promise<void> {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const { name } = entry;
    if (entry.isDirectory()) {
      await crawlForSvg(resolve(path, name));
    } else if (name.endsWith(".svg")) {
      await optimizeAndRewrite(resolve(path, name), name.includes("remixicon.symbol"));
    }
  }
}

export default function solidA11ySVGPlugin(): Plugin {
  return {
    name: "solid-a11y:svg",
    apply: "build",
    enforce: "post",
    configResolved({ root, build: { outDir, assetsDir, ssr } }) {
      if (ssr) {
        return;
      }
      this.closeBundle = () => crawlForSvg(resolve(root, outDir, assetsDir));
      this.buildEnd = (error) => {
        if (error) {
          this.closeBundle = undefined;
        }
      };
    },
  };
}

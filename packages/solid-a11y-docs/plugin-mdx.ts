import { createProcessor } from "@mdx-js/mdx";
import { valueToEstree } from "estree-util-value-to-estree";
import remarkSlug from "remark-slug";
import { SourceMapGenerator } from "source-map";
import type { Node } from "unist";
import type { Plugin } from "vite";

import { COMPONENTS } from "./src/components";

type MdxEsmNode = {
  type: "mdxjsEsm";
  value: string;
};
type MdxTextExpressionNode = {
  type: "mdxTextExpression";
  value: string;
};
type TextNode = {
  type: "text";
  value?: string;
};
type HTMLElementNode = {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
};
type HeadingNode = {
  type: "element";
  tagName: typeof HEADING_ELEMS extends Array<infer T> ? T : never;
  properties: { id: string };
};
type HastNode = Node & {
  children?: HastNode[];
} & (MdxEsmNode | TextNode | MdxTextExpressionNode | HTMLElementNode);
type ComponentTypesTuple =
  | ["COMPONENTS", string, keyof typeof COMPONENTS, undefined]
  | ["COMPONENTS", string, undefined, keyof typeof COMPONENTS];

const COMPONENTS_TITLE_MATCH = /^COMPONENTS(\.([^.]+)|\["([^"]+)"\])\.title$/;
const HEADING_ELEMS = ["h1", "h2", "h3", "h4", "h5"] as const;
const HEADING_LOOKUP = new Set(HEADING_ELEMS as readonly string[]);

function isHeadingNode(node: HastNode): node is HeadingNode {
  return (
    node.type === "element" &&
    HEADING_LOOKUP.has(node.tagName) &&
    typeof node.properties?.id === "string"
  );
}

function isTextNode(node: HastNode): node is TextNode {
  return node.type === "text" && "value" in node;
}

function* getHeadings(node: HastNode): Generator<HeadingNode> {
  if (isHeadingNode(node)) {
    yield node;
  }
  for (const child of node.children || []) {
    yield* getHeadings(child);
  }
}

function isComponentsTitleNode(node: HastNode): node is MdxTextExpressionNode {
  return node.type === "mdxTextExpression" && COMPONENTS_TITLE_MATCH.test(node.value);
}

function getText(node: HastNode) {
  let text = "";
  if (isTextNode(node)) {
    text += node.value || "";
  } else if (isComponentsTitleNode(node)) {
    const [, , keyProperty, keyStringLiteral] = node.value.match(
      COMPONENTS_TITLE_MATCH,
    ) as ComponentTypesTuple;
    text += COMPONENTS[keyStringLiteral || keyProperty].title;
  }
  for (const child of node.children || []) {
    text += getText(child);
  }
  return text;
}

function tableOfContents() {
  return function transformMdxTableOfContents(root: HastNode) {
    const data = [];
    for (const heading of getHeadings(root)) {
      data.push({
        id: heading.properties.id,
        text: getText(heading),
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    root.children!.push({
      type: "mdxjsEsm",
      value: `export const __tableOfContents = ${JSON.stringify(data)}`,
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              specifiers: [],
              source: null,
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: {
                      type: "Identifier",
                      name: "__tableOfContents",
                    },
                    init: valueToEstree(data),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}

export default function (): Plugin {
  const processor = createProcessor({
    SourceMapGenerator,
    remarkPlugins: [remarkSlug],
    rehypePlugins: [tableOfContents],
    jsx: true,
    jsxImportSource: "solid-js",
    providerImportSource: "solid-mdx",
  });
  return {
    name: "solid-a11y-mdx",
    enforce: "pre",
    async transform(value, path) {
      if (path.endsWith(".mdx")) {
        const compiled = await processor.process({ value, path });
        return { code: String(compiled.value), map: compiled.map };
      }
    },
  };
}

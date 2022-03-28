import type { TSESTree } from "@typescript-eslint/types";
import { type AST, parse } from "@typescript-eslint/typescript-estree";
import { resolve } from "path";
import type { Plugin } from "vite";

import type { ComponentPropertyDescriptor } from "../src/showcase";

const SUFFIX = "?component-docs=";
const PREFIX = `solid-a11y${SUFFIX}`;
const EXT_SUFFIX = "&ext=.tsx";

function parseCommentContent(comment: string) {
  return comment
    .split("\n")
    .map((line) => line.replace(/^(\s|\*)+|\s+$/gm, ""))
    .join(" ");
}

function sortBy<P extends string, T extends { [k in P]: string }>(propName: P) {
  return (a: T, b: T) => a[propName].localeCompare(b[propName]);
}

function getTypeFromSource(sourceLines: string[], loc: TSESTree.SourceLocation) {
  const { start, end } = loc;
  const lines = sourceLines.slice(start.line - 1, end.line);
  const last = lines.length - 1;
  return lines
    .map((line, index) => {
      const base =
        index === 0 ? line.slice(start.column) : index === last ? line.slice(0, end.column) : line;
      return base.replace(/^(\s|:)+|(\s|;)+$/gm, "");
    })
    .join(" ");
}

function walkTypeNodeForPropsAndComments(
  sourceLines: string[],
  node: TSESTree.TypeNode,
  props: ComponentPropertyDescriptor[],
  blockCommentLookup: Map<number, string>,
) {
  switch (node.type) {
    case "TSUnionType":
    case "TSIntersectionType":
      for (const type of node.types) {
        walkTypeNodeForPropsAndComments(sourceLines, type, props, blockCommentLookup);
      }
      break;
    case "TSTypeReference":
      for (const param of node.typeParameters?.params || []) {
        walkTypeNodeForPropsAndComments(sourceLines, param, props, blockCommentLookup);
      }
      break;
    case "TSTypeLiteral":
      for (const member of node.members) {
        if (member.type !== "TSPropertySignature" || member.key.type !== "Identifier") {
          continue;
        }

        const name = member.key.name;
        const alreadyNamedProp = props.find((prop) => prop.name === name);
        if (alreadyNamedProp) {
          alreadyNamedProp.optional = member.optional || alreadyNamedProp.optional;
          continue;
        }
        const description = blockCommentLookup.get(member.loc.start.line - 1);
        if (description) {
          props.push({
            name,
            optional: Boolean(member.optional),
            typeLiteral:
              member.typeAnnotation && getTypeFromSource(sourceLines, member.typeAnnotation.loc),
            description: parseCommentContent(description),
          });
        }
      }
      break;
  }
}

function findPropTypeExports(options: {
  sourceLines: string[];
  body: AST<{ loc: true }>["body"];
  propTypeNameLookup: Map<string, string>;
  blockCommentLookup: Map<number, string>;
}) {
  const { propTypeNameLookup, blockCommentLookup, sourceLines } = options;
  const propsLookup = new Map<string, ComponentPropertyDescriptor[]>();
  for (const statement of options.body) {
    if (statement.type !== "TSTypeAliasDeclaration" || statement.id?.type !== "Identifier") {
      continue;
    }

    const exportName = propTypeNameLookup.get(statement.id.name);
    if (exportName) {
      const props: ComponentPropertyDescriptor[] = [];
      walkTypeNodeForPropsAndComments(
        sourceLines,
        statement.typeAnnotation,
        props,
        blockCommentLookup,
      );
      propsLookup.set(exportName, props);
    }
  }
  return propsLookup;
}

function findComponentExports(options: {
  body: AST<{ loc: true }>["body"];
  exportIdentifiers: string[];
  blockCommentLookup: Map<number, string>;
}) {
  const { exportIdentifiers, blockCommentLookup } = options;
  const summaryLookup = new Map<string, string | undefined>();
  const propTypeNameLookup = new Map<string, string>();
  options.body.forEach((bodyItem) => {
    if (bodyItem.type !== "ExportNamedDeclaration") {
      return;
    }
    const { declaration } = bodyItem;
    if (
      declaration?.type !== "FunctionDeclaration" ||
      declaration.async ||
      declaration.generator ||
      declaration.id?.type !== "Identifier" ||
      !exportIdentifiers.includes(declaration.id.name) ||
      declaration.params.length !== 1
    ) {
      return;
    }

    const exportName = declaration.id.name;

    summaryLookup.set(exportName, blockCommentLookup.get(bodyItem.loc.start.line - 1));

    const [param] = declaration.params;
    if (param.type !== "Identifier" || !param.typeAnnotation) {
      return;
    }

    const { typeAnnotation } = param.typeAnnotation;
    if (typeAnnotation.type !== "TSTypeReference") {
      return;
    }

    const typeName = typeAnnotation.typeName.type === "Identifier" && typeAnnotation.typeName.name;
    if (typeName) {
      propTypeNameLookup.set(typeName, exportName);
    }
  });
  return { summaryLookup, propTypeNameLookup };
}

export default function solidA11yComponentDocsPlugin(): Plugin {
  return {
    name: "solid-a11y:component-docs",
    enforce: "pre",
    resolveId(id) {
      if (id.startsWith(PREFIX)) {
        const [importName, componentNames] = id.slice(PREFIX.length).split(":");
        const realFileId = resolve("../solid-a11y/src", importName);
        return `${realFileId}?component-docs=${componentNames}${EXT_SUFFIX}`;
      }
    },
    transform(source, id) {
      const suffixIndex = id.indexOf(SUFFIX);
      if (suffixIndex === -1) {
        return;
      }
      const exportIdentifiers = id
        .slice(suffixIndex + SUFFIX.length, -1 * EXT_SUFFIX.length)
        .split(",");
      const { body, comments } = parse(source, { jsx: true, comment: true, loc: true });

      const blockCommentLookup = new Map(
        comments
          .filter(({ type, value }) => {
            return type === "Block" && value.startsWith("*") && value.endsWith(" ");
          })
          .map((blockComment) => [blockComment.loc.end.line, blockComment.value]),
      );

      const { summaryLookup, propTypeNameLookup } = findComponentExports({
        body,
        blockCommentLookup,
        exportIdentifiers,
      });
      const propsLookup = findPropTypeExports({
        sourceLines: source.split("\n"),
        body,
        propTypeNameLookup,
        blockCommentLookup,
      });

      const docs = exportIdentifiers.map((exportIdentifier) => {
        const summary = summaryLookup.get(exportIdentifier);
        return {
          component: exportIdentifier,
          summary: summary && parseCommentContent(summary),
          props: (propsLookup.get(exportIdentifier) || []).sort(sortBy("name")),
        };
      });
      return `export default ${JSON.stringify(docs)};`;
    },
  };
}

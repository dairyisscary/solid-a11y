import Prism from "prismjs";
import loadPrismLanguages from "prismjs/components/index.js";
import type { Plugin } from "vite";

type Range = [number, number];

const EXAMPLE_RE = /\.example\.(xcss|tsx)\?.*prism.*$/;

function getClassesFor(className: string): string[] {
  switch (className) {
    case "italic":
      return ["italic"];
    case "bold":
      return ["font-semibold"];
    case "important":
      return ["text-code-important", "font-semibold"];
    case "regex":
    case "constant":
      return ["text-code-important"];
    case "comment":
      return ["text-code-comment"];
    case "number":
    case "symbol":
    case "boolean":
      return ["text-code-primitive"];
    case "at-rule":
    case "attr-value":
    case "function":
    case "class-name":
      return ["text-code-name"];
    case "selector":
    case "attr-name":
    case "string":
    case "char":
    case "builtin":
    case "inserted":
      return ["text-code-literal"];
    case "keyword":
    case "operator":
    case "entity":
    case "url":
    case "variable":
    case "punctuation":
    case "property":
    case "tag":
    case "deleted":
      return ["text-code-keyword"];
    case "token":
    default:
      return [];
  }
}

function cleanContent(content: string): { cleaned: string; ranges: Range[] } {
  const lines = content.split("\n");
  const { cleanedLines, ranges } = lines.reduce(
    (accum, line) => {
      const firstMatchValue = line.matchAll(/highlight-next-line(s (\d+))?/g).next().value as
        | string[]
        | undefined;
      if (firstMatchValue) {
        const [, , end] = firstMatchValue;
        const range = [accum.lineNumber, accum.lineNumber + Number(end || 1) - 1] as Range;
        return { ...accum, ranges: accum.ranges.concat([range]) };
      }
      return {
        ...accum,
        lineNumber: accum.lineNumber + 1,
        cleanedLines: accum.cleanedLines.concat(line),
      };
    },
    { lineNumber: 0, cleanedLines: [] as string[], ranges: [] as Range[] },
  );
  return { cleaned: cleanedLines.join("\n"), ranges };
}

function inRange(index: number, ranges: Range[]) {
  return ranges.some(([start, end]) => index >= start && index <= end);
}

function highlightLines(content: string, ranges: Range[]) {
  return content
    .split("\n")
    .reduce((accum, line, index) => {
      return inRange(index, ranges)
        ? `${accum}<div class="code-line-highlight">${line}\n</div>`
        : `${accum}${line}\n`;
    }, "")
    .slice(0, -1);
}

export default function solidA11yPrismjsPlugin(): Plugin {
  return {
    name: "solid-a11y:prismjs",
    enforce: "pre",
    config() {
      Prism.manual = true;
      Prism.hooks.add("wrap", (env) => {
        env.classes = Array.from(new Set(env.classes.flatMap(getClassesFor)));
      });
      loadPrismLanguages(["css", "tsx"]);
    },
    transform(code, id) {
      if (!EXAMPLE_RE.test(id)) {
        return;
      }
      const { ranges, cleaned } = cleanContent(code);
      const [lang, langName] = id.includes(".xcss?")
        ? [Prism.languages.css, "css"]
        : [Prism.languages.tsx, "tsx"];
      const syntaxHighlighted = Prism.highlight(cleaned, lang, langName);
      const highlighted = highlightLines(syntaxHighlighted, ranges);
      return `export default {
raw: ${JSON.stringify(cleaned)},
highlighted: ${JSON.stringify(highlighted)},
};`;
    },
  };
}

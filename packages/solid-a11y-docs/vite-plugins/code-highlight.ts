import { getHighlighter } from "shiki";
import type { Plugin } from "vite";

const EXAMPLE_RE = /\.example\.(xcss|tsx)\?.*highlight.*$/;
const HIGHLIGHTED_LINE_CLASSES = ["code-line-highlight"];

function cleanContent(content: string): { cleaned: string; highlightedLineNumbers: Set<number> } {
  return content.split("\n").reduce(
    (accum, line) => {
      const firstMatchValue = line.matchAll(/highlight-next-line(s (\d+))?/g).next().value as
        | string[]
        | undefined;
      if (firstMatchValue) {
        const [, , endRaw] = firstMatchValue;
        const end = accum.lineNumber + Number(endRaw || 1);
        for (let i = accum.lineNumber; i < end; i++) {
          accum.highlightedLineNumbers.add(i);
        }
        return accum;
      }
      return {
        highlightedLineNumbers: accum.highlightedLineNumbers,
        lineNumber: accum.lineNumber + 1,
        cleaned: accum.cleaned ? `${accum.cleaned}\n${line}` : line,
      };
    },
    { lineNumber: 1, cleaned: "", highlightedLineNumbers: new Set<number>() },
  );
}

export default function solidA11yCodeHighlightPlugin(): Plugin {
  const sharedHighlighter = getHighlighter({ theme: "material-palenight" });
  return {
    name: "solid-a11y:code-highlight",
    enforce: "pre",
    async transform(code, id) {
      if (!EXAMPLE_RE.test(id)) {
        return;
      }
      const highlighter = await sharedHighlighter;
      const { highlightedLineNumbers, cleaned } = cleanContent(code);
      const highlighted = highlighter.codeToHtml(cleaned, {
        lang: id.includes(".xcss?") ? "css" : "tsx",
        lineOptions: Array.from(highlightedLineNumbers).map((lineNumber) => ({
          line: lineNumber,
          classes: HIGHLIGHTED_LINE_CLASSES,
        })),
      });
      return `export default {
  raw: ${JSON.stringify(cleaned)},
  highlighted: ${JSON.stringify(highlighted)},
};`;
    },
  };
}

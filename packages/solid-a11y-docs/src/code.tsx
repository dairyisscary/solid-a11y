import { For } from "solid-js";

type TerminalLinesProps = {
  lines: string[];
};

export function TerminalLines(props: TerminalLinesProps) {
  return (
    <code class="m-2 inline-block rounded-xl bg-slate-800 p-3 text-slate-200 shadow-lg ring-1 ring-inset ring-white/10">
      <For each={props.lines}>
        {(line) => (
          <span class="block">
            <span class="text-pink-400">$</span> {line}
          </span>
        )}
      </For>
    </code>
  );
}

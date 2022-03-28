import { type ComponentProps, For, Show, createSignal } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

import { joinSpaceSeparated } from "@docs/utils/html";

export type ComponentPropertyDescriptor = {
  name: string;
  optional: boolean;
  description: string;
  typeLiteral?: string;
};
type ComponentAPIExplorerProps = {
  components: {
    component: string;
    summary?: string;
    props: ComponentPropertyDescriptor[];
  }[];
};
type ShowcaseActionButtonProps = {
  children: JSX.Element;
  selected?: boolean;
  onClick: Exclude<ComponentProps<"button">["onClick"], undefined>;
  invert?: boolean;
};
type ActionsProps = {
  selectedAction: "preview" | "code";
  includePreview?: boolean;
  rawSource: string;
  onSelect: (action: ActionsProps["selectedAction"]) => void;
};
type CodeSampleProps = {
  selectedAction: ActionsProps["selectedAction"];
  source: { raw: string; highlighted: string };
};
type ExampleProps = {
  children: JSX.Element;
  class?: string;
  source: CodeSampleProps["source"];
};

function ShowcaseActionButton(props: ShowcaseActionButtonProps) {
  return (
    <button
      type="button"
      class="rounded-md px-3 py-2 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-50"
      classList={{
        "bg-black": !props.invert,
        "bg-white": props.invert,
        "bg-opacity-20": props.selected,
        "bg-opacity-0 hover:bg-opacity-10": !props.selected,
      }}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

function ShowcaseActions(props: ActionsProps) {
  const [copied, setCopied] = createSignal(false);
  let timeoutId: number | undefined;
  const handleCopyClick = async () => {
    const { clipboard } = window.navigator;
    if (clipboard) {
      window.clearTimeout(timeoutId);
      await clipboard.writeText(props.rawSource);
      setCopied(true);
      timeoutId = window.setTimeout(() => setCopied(false), 2_000);
    }
  };
  const codeIsShown = () => props.selectedAction === "code";
  return (
    <div class="absolute right-0 top-0 flex items-stretch space-x-1 px-2 py-1">
      <Show when={props.includePreview}>
        {() => (
          <>
            <ShowcaseActionButton
              onClick={[props.onSelect, "preview"]}
              selected={props.selectedAction === "preview"}
              invert={codeIsShown()}
            >
              Preview
            </ShowcaseActionButton>
            <ShowcaseActionButton
              onClick={[props.onSelect, "code"]}
              selected={props.selectedAction === "code"}
              invert={codeIsShown()}
            >
              Code
            </ShowcaseActionButton>
          </>
        )}
      </Show>
      <ShowcaseActionButton onClick={handleCopyClick} invert={codeIsShown()}>
        {copied() ? "Copied!" : "Copy"}
      </ShowcaseActionButton>
    </div>
  );
}

function CodeSample(props: { code: string }) {
  return (
    <pre class="text-code-base bg-code-bg overflow-auto whitespace-pre rounded-xl py-3 px-4 text-sm lg:text-base">
      <code innerHTML={props.code} />
    </pre>
  );
}

export function CodeSampleShowcase(props: CodeSampleProps) {
  return (
    <section class="not-prose relative">
      <ShowcaseActions onSelect={() => {}} selectedAction="code" rawSource={props.source.raw} />
      <CodeSample code={props.source.highlighted} />
    </section>
  );
}

export function RunningShowcase(props: ExampleProps) {
  const [selectedAction, setSelectedAction] =
    createSignal<ActionsProps["selectedAction"]>("preview");
  return (
    <section class="not-prose relative">
      <ShowcaseActions
        includePreview
        onSelect={setSelectedAction}
        selectedAction={selectedAction()}
        rawSource={props.source.raw}
      />
      {selectedAction() === "code" ? (
        <CodeSample code={props.source.highlighted} />
      ) : (
        <div
          class={joinSpaceSeparated(
            "flex h-full min-h-[180px] items-center justify-center rounded-xl bg-gradient-to-r p-12",
            props.class,
          )}
        >
          {props.children}
        </div>
      )}
    </section>
  );
}

export function ComponentAPIExplorer(props: ComponentAPIExplorerProps) {
  return (
    <For each={props.components}>
      {({ component, summary, props }) => (
        <>
          <h3>
            <code>&lt;{component} /&gt;</code>
          </h3>
          <Show when={summary}>
            <p>{summary}</p>
          </Show>
          <Show when={props.length}>
            <table class="text-sm">
              <caption class="sr-only">Properties of {component} component</caption>
              <thead>
                <tr>
                  <th scope="col" class="w-3/12">
                    Name
                  </th>
                  <th scope="col" class="w-1/12">
                    Optional
                  </th>
                  <th scope="col" class="w-2/3">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={props}>
                  {({ typeLiteral, name, optional, description }) => (
                    <tr>
                      <th scope="row">
                        <code>{name}</code>
                      </th>
                      <td>
                        <Show when={optional} fallback="No">
                          Yes
                        </Show>
                      </td>
                      <td>
                        <code class="block">{typeLiteral}</code>
                        <span class="my-1 block">{description}</span>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </>
      )}
    </For>
  );
}

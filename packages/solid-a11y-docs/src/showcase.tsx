import { NavLink, Outlet } from "solid-app-router";
import {
  type Component,
  type ComponentProps,
  For,
  Show,
  createResource,
  createSignal,
  createUniqueId,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import { ORDERED_COMPONENTS } from "@docs/components";
import { Main, StickySidebar } from "@docs/layout";
import { classnames } from "@docs/utils/html";

type ShowcaseActionButtonProps = {
  children: JSX.Element;
  selected?: boolean;
  onClick: Exclude<ComponentProps<"button">["onClick"], undefined>;
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
type TableOfContentsProps = {
  list: { text: string; id: string }[];
};
type ShowcaseProps = {
  lazyModule: () => Promise<{
    default: Component;
    __tableOfContents?: TableOfContentsProps["list"];
  }>;
};

function ShowcaseActionButton(props: ShowcaseActionButtonProps) {
  return (
    <button
      type="button"
      class="rounded-md bg-black px-3 py-2 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-50"
      classList={{
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
  return (
    <div class="absolute right-0 top-0 z-10 flex items-stretch px-2 py-1">
      {props.includePreview && (
        <ShowcaseActionButton
          onClick={[props.onSelect, "preview"]}
          selected={props.selectedAction === "preview"}
        >
          Preview
        </ShowcaseActionButton>
      )}
      <ShowcaseActionButton
        onClick={[props.onSelect, "code"]}
        selected={props.selectedAction === "code"}
      >
        Code
      </ShowcaseActionButton>
      <ShowcaseActionButton onClick={handleCopyClick}>
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
          class={classnames(
            "flex h-full min-h-[180px] items-center justify-center rounded-xl bg-gradient-to-r",
            props.class,
          )}
        >
          {props.children}
        </div>
      )}
    </section>
  );
}

async function getComponentDocs(source: ShowcaseProps["lazyModule"]) {
  const { default: MdxComponent, __tableOfContents: tableOfContents } = await source();
  return { MdxComponent, tableOfContents };
}

function TableOfContents(props: TableOfContentsProps) {
  const id = createUniqueId();
  return (
    <StickySidebar class="text-sm">
      <p id={id} class="font-semibold uppercase tracking-wide text-white">
        Table of Contents
      </p>
      <nav aria-labelledby={id}>
        <ol class="mt-3 space-y-4">
          <For each={props.list}>
            {({ id, text }) => (
              <li>
                <a href={`#${id}`}>{text}</a>
              </li>
            )}
          </For>
        </ol>
      </nav>
    </StickySidebar>
  );
}

export function ComponentShowcaseNavigation() {
  return (
    <>
      <StickySidebar class="w-64">
        <nav aria-label="Main Navigation">
          <ul class="space-y-4">
            <For each={ORDERED_COMPONENTS}>
              {({ key, title, color }) => (
                <li>
                  <NavLink
                    activeClass="text-white"
                    class="flex items-center whitespace-nowrap font-medium"
                    href={`/components/${key}`}
                  >
                    <span
                      class={classnames(
                        color,
                        "mr-4 inline-block h-6 w-6 flex-shrink-0 rounded bg-gradient-to-r",
                      )}
                      aria-hidden="true"
                    />
                    {title}
                  </NavLink>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </StickySidebar>
      <Outlet />
    </>
  );
}

export function ComponentShowcase(props: ShowcaseProps) {
  const [mod] = createResource(() => props.lazyModule, getComponentDocs);
  return (
    <Show when={mod()}>
      {({ MdxComponent, tableOfContents }) => (
        <Main class="flex min-w-0 items-start space-x-4 sm:space-x-6 lg:space-x-8">
          <article class="prose prose-invert prose-headings:before:content-[''] prose-headings:before:block prose-headings:before:mt-[-120px] prose-headings:before:h-[120px] lg:prose-lg min-w-0 max-w-none flex-1">
            <Dynamic component={MdxComponent} />
          </article>
          <Show when={tableOfContents}>{(list) => <TableOfContents list={list} />}</Show>
        </Main>
      )}
    </Show>
  );
}

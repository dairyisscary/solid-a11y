import { Dialog, DialogOverlay, DialogTitle } from "solid-a11y";
import { NavLink, Outlet } from "solid-app-router";
import {
  type Component,
  type ComponentProps,
  For,
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  createUniqueId,
  onCleanup,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import { NamedSVGIcon } from "@docs/assets/svg-icon";
import { ORDERED_COMPONENTS } from "@docs/components";
import { Main, StickySidebar } from "@docs/layout";
import { joinSpaceSeparated } from "@docs/utils/html";

type OverlayNavProps = {
  children: JSX.Element;
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
    <div class="absolute right-0 top-0 z-10 flex items-stretch space-x-1 px-2 py-1">
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
            "flex h-full min-h-[180px] items-center justify-center rounded-xl bg-gradient-to-r p-8",
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
    <StickySidebar class="hidden text-sm xl:block">
      <p id={id} class="font-semibold uppercase tracking-wide text-white">
        Table of Contents
      </p>
      <nav aria-labelledby={id}>
        <ol class="mt-3 space-y-4">
          <For each={props.list}>
            {({ id, text }) => (
              <li>
                {/* Use native a so we can conrol the base url before the hash */}
                {/* Add the target to workaround a bug in hash links in solid-app-router */}
                <a href={`#${id}`} class="no-underline" target="_self">
                  {text}
                </a>
              </li>
            )}
          </For>
        </ol>
      </nav>
    </StickySidebar>
  );
}

function ComponentShowcaseNavigationList() {
  return (
    <nav aria-label="Main Navigation">
      <ul class="space-y-5">
        <For each={ORDERED_COMPONENTS}>
          {({ key, title, color, icon }) => (
            <li>
              <NavLink
                activeClass="text-white"
                class="flex items-center whitespace-nowrap font-medium no-underline"
                href={`/components/${key}`}
              >
                <span
                  class={joinSpaceSeparated(
                    color,
                    "mr-4 inline-block flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gradient-to-r",
                  )}
                  aria-hidden="true"
                >
                  <NamedSVGIcon name={icon} class="h-4 w-4 text-white" />
                </span>
                {title}
              </NavLink>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}

function OverlayNav(props: OverlayNavProps) {
  const [open, setOpen] = createSignal<boolean | { towards: boolean }>(false);
  const isTransitioning = createMemo(() => typeof open() === "object");
  const commonButtonClasses =
    "flex items-center justify-center fixed border bottom-4 right-4 w-16 h-16 rounded-full border-white border-opacity-20 bg-white bg-opacity-20 text-white focus:outline-none focus-visible:ring firefox:bg-opacity-90 firefox:bg-gray-800";
  createEffect(() => {
    if (isTransitioning()) {
      const { towards } = open() as { towards: boolean };
      const timeoutId = setTimeout(() => setOpen(towards), towards ? 0 : 250);
      onCleanup(() => clearTimeout(timeoutId));
    }
  });
  return (
    <>
      <button
        type="button"
        class={joinSpaceSeparated(
          "z-20 backdrop-blur backdrop-filter lg:hidden",
          commonButtonClasses,
        )}
        onClick={[setOpen, { towards: true }]}
      >
        <span class="sr-only">Open Site Navigation</span>
        <NamedSVGIcon name="menu" class="h-1/2 w-1/2" />
      </button>
      <Show when={open()}>
        {() => (
          <Dialog onClose={() => setOpen({ towards: false })}>
            <DialogOverlay
              class="firefox:bg-opacity-90 fixed inset-0 z-30 h-full w-full bg-gray-900 bg-opacity-50 backdrop-blur backdrop-filter transition-opacity duration-150"
              classList={{ "opacity-0": isTransitioning() }}
            >
              <button type="button" class={commonButtonClasses}>
                <span class="sr-only">Close Site Navigation</span>
                <NamedSVGIcon name="close" class="h-1/2 w-1/2" />
              </button>
            </DialogOverlay>
            <div
              class="fixed inset-y-0 left-0 z-40 w-full max-w-[40ch] border-r border-white border-opacity-10 bg-slate-800 p-5 transition-transform duration-150"
              classList={{ "-translate-x-full": isTransitioning() }}
            >
              <DialogTitle class="sr-only">Site Navigation</DialogTitle>
              {props.children}
            </div>
          </Dialog>
        )}
      </Show>
    </>
  );
}

export function ComponentShowcaseNavigation() {
  return (
    <>
      <StickySidebar class="hidden w-64 lg:block">
        <ComponentShowcaseNavigationList />
      </StickySidebar>
      <OverlayNav>
        <ComponentShowcaseNavigationList />
      </OverlayNav>
      <Outlet />
    </>
  );
}

export function ComponentShowcase(props: ShowcaseProps) {
  const [mod] = createResource(() => props.lazyModule, getComponentDocs);
  return (
    <Show when={mod()}>
      {({ MdxComponent, tableOfContents }) => (
        <Main class="flex min-w-0 flex-1 items-start space-x-4 sm:space-x-6 lg:space-x-8">
          <article class="prose prose-invert prose-headings:scroll-mt-24 lg:prose-lg min-w-0 max-w-none flex-1">
            <Dynamic component={MdxComponent} />
          </article>
          <Show when={tableOfContents}>{(list) => <TableOfContents list={list} />}</Show>
        </Main>
      )}
    </Show>
  );
}

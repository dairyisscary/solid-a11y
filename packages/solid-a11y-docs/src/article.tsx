import {
  type Component,
  For,
  Show,
  createEffect,
  createResource,
  createUniqueId,
  onCleanup,
} from "solid-js";
import { Dynamic } from "solid-js/web";

import { Main, StickySidebar } from "@docs/layout";
import { NavigationHeader } from "@docs/layout/navigation";

type TableOfContentsProps = {
  list: { text: string; id: string }[];
};
type LazyMDXArticleProps = {
  docTitle?: string;
  lazyModule: () => Promise<{
    default: Component;
    __tableOfContents?: TableOfContentsProps["list"];
  }>;
};

export const SECONDARY_NAVIGATION = Object.freeze([
  {
    path: "/design-philosophy",
    link: "Design Philosophy",
    getModule: () => import("@docs/design-philosophy.mdx"),
  },
  {
    path: "/labeling-and-descriptions",
    link: "Labeling & Descriptions",
    getModule: () => import("@docs/labeling-and-descriptions/index.mdx"),
  },
]);

async function getComponentDocs(source: LazyMDXArticleProps["lazyModule"]) {
  const { default: MdxComponent, __tableOfContents: tableOfContents } = await source();
  return { MdxComponent, tableOfContents };
}

function TableOfContents(props: TableOfContentsProps) {
  const id = createUniqueId();
  return (
    <StickySidebar class="hidden w-56 text-sm xl:block">
      <NavigationHeader id={id}>Table of Contents</NavigationHeader>
      <nav aria-labelledby={id} class="mt-3 space-y-4">
        <For each={props.list}>
          {({ id, text }) => (
            // Use native anchor so we can control the base url before the hash -- no trailing slash
            <a href={`#${id}`} class="block no-underline">
              {text}
            </a>
          )}
        </For>
      </nav>
    </StickySidebar>
  );
}

export function LazyMDXArticle(props: LazyMDXArticleProps) {
  const [mod] = createResource(() => props.lazyModule, getComponentDocs);
  createEffect(() => {
    const pageTitle = props.docTitle || mod()?.tableOfContents?.[0]?.text;
    if (pageTitle) {
      const originalTitle = document.title;
      document.title = `${pageTitle} | ${originalTitle}`;
      onCleanup(() => {
        document.title = originalTitle;
      });
    }
  });
  return (
    <Show when={mod()} keyed>
      {({ MdxComponent, tableOfContents }) => (
        <Main class="flex min-w-0 flex-1 items-start space-x-4 sm:space-x-6 lg:space-x-8">
          <article class="prose prose-invert prose-headings:scroll-mt-24 lg:prose-lg min-w-0 max-w-none flex-1">
            <Dynamic component={MdxComponent} />
          </article>
          <Show when={tableOfContents} keyed>
            {(list) => <TableOfContents list={list} />}
          </Show>
        </Main>
      )}
    </Show>
  );
}

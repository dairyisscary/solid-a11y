import {
  type Component,
  For,
  createEffect,
  createResource,
  createUniqueId,
  onCleanup,
} from "solid-js";

import { Main, StickySidebar } from "@docs/layout";
import { NavigationHeader } from "@docs/layout/navigation";

type TableOfContents = { text: string; id: string }[];
type TableOfContentsProps = { list: TableOfContents };
type LazyMDXArticleProps = {
  LazyContent: Component & { preload: () => Promise<{ TABLE_OF_CONTENTS?: TableOfContents }> };
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

function createTableOfContents(props: LazyMDXArticleProps) {
  const [tableOfContents] = createResource<TableOfContents>(
    async () => {
      const { TABLE_OF_CONTENTS } = await props.LazyContent.preload();
      return TABLE_OF_CONTENTS || [];
    },
    { initialValue: [] },
  );

  createEffect(() => {
    const [firstItem] = tableOfContents();
    if (firstItem) {
      const originalTitle = document.title;
      document.title = `${firstItem.text} | ${originalTitle}`;
      onCleanup(() => {
        document.title = originalTitle;
      });
    }
  });

  return tableOfContents;
}

export function LazyMDXArticle(props: LazyMDXArticleProps) {
  const tableOfContents = createTableOfContents(props);
  return (
    <Main class="flex min-w-0 flex-1 items-start space-x-4 sm:space-x-6 lg:space-x-8">
      <article class="prose prose-invert prose-headings:scroll-mt-24 lg:prose-lg min-w-0 max-w-none flex-1">
        <props.LazyContent />
      </article>
      <TableOfContents list={tableOfContents()} />
    </Main>
  );
}

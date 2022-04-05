import { renderToStringAsync } from "solid-js/web";

import DocsApp from "@docs/app";
import { SECONDARY_NAVIGATION } from "@docs/article";
import { COMPONENTS } from "@docs/components";

type Page = Readonly<{ path: string; isError?: boolean }>;

export function render(url: string): Promise<string> {
  return renderToStringAsync(() => <DocsApp url={url} />);
}

export const PAGES: ReadonlyArray<Page> = Object.keys(COMPONENTS)
  .map((key) => ({ path: `/components/${key}` }))
  .concat(SECONDARY_NAVIGATION)
  .concat({ path: "/404", isError: true } as Page)
  .concat({ path: "/" });

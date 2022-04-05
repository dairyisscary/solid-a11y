import { hydrate } from "solid-js/web";

import DocsApp from "@docs/app";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const cleanup = hydrate(() => <DocsApp />, document.getElementById("root")!);
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}

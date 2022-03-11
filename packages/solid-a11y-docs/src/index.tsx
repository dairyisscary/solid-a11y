import { Route, Router, Routes } from "solid-app-router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";

import { ORDERED_COMPONENTS } from "@docs/components";
import { BodyContainer, Header } from "@docs/layout";
import { ComponentShowcase, ComponentShowcaseNavigation } from "@docs/showcase";

const Home = lazy(() => import("@docs/home"));
const NotFound = lazy(() => import("@docs/404"));

function DocsApp() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/*" element={<BodyContainer class="lg:space-x-8" />}>
          <Route path="/components" element={<ComponentShowcaseNavigation />}>
            {ORDERED_COMPONENTS.map(({ key, getModule }) => (
              <Route path={key} element={<ComponentShowcase lazyModule={getModule} />} />
            ))}
          </Route>
        </Route>

        <Route path="/*" element={<BodyContainer />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const cleanup = render(DocsApp, document.getElementById("root")!);
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}

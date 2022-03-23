import { type RouteDefinition, Router, useRoutes } from "solid-app-router";
import { lazy } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { render } from "solid-js/web";

import { LazyMDXArticle, SECONDARY_NAVIGATION } from "@docs/article";
import { ORDERED_COMPONENTS } from "@docs/components";
import { BodyContainer, Header } from "@docs/layout";
import { StickySidebarNavigation } from "@docs/layout/navigation";

const Home = lazy(() => import("@docs/home"));
const NotFound = lazy(() => import("@docs/404"));

function BodyWithStickySidebar(props: { children?: JSX.Element }) {
  return (
    <BodyContainer class="lg:space-x-8">
      <StickySidebarNavigation>{props.children}</StickySidebarNavigation>
    </BodyContainer>
  );
}

function DocsRoutes() {
  const secondaryRoutes: RouteDefinition[] = SECONDARY_NAVIGATION.map(({ path, getModule }) => ({
    path,
    component: () => (
      <BodyWithStickySidebar>
        <LazyMDXArticle lazyModule={getModule} />
      </BodyWithStickySidebar>
    ),
  }));
  const routes = secondaryRoutes.concat([
    {
      path: "/components",
      component: BodyWithStickySidebar,
      children: ORDERED_COMPONENTS.map(({ key, getModule }) => ({
        path: key,
        component: () => <LazyMDXArticle lazyModule={getModule} />,
      })),
    },
    {
      path: "/",
      component: () => (
        <BodyContainer>
          <Home />
        </BodyContainer>
      ),
    },
    { path: "/*", component: NotFound },
  ]);
  const Routes = useRoutes(routes);
  return <Routes />;
}

function DocsApp() {
  return (
    <Router>
      <Header />
      <DocsRoutes />
    </Router>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const cleanup = render(DocsApp, document.getElementById("root")!);
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}

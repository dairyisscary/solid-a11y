import { type RouteDefinition, Router, useRoutes } from "solid-app-router";
import { Suspense, lazy } from "solid-js";

import { LazyMDXArticle, SECONDARY_NAVIGATION } from "@docs/article";
import { ORDERED_COMPONENTS } from "@docs/components";
import { BodyContainer, Header } from "@docs/layout";
import { StickySidebarNavigation } from "@docs/layout/navigation";

const Home = lazy(() => import("@docs/home"));
const NotFound = lazy(() => import("@docs/404"));

type MDXModulePromise = () => Promise<unknown>;

function constructLazyMDXPage(getModule: MDXModulePromise) {
  const LazyContent = lazy(getModule);
  return () => {
    return (
      <BodyContainer class="lg:space-x-8">
        <StickySidebarNavigation>
          <LazyMDXArticle LazyContent={LazyContent} />
        </StickySidebarNavigation>
      </BodyContainer>
    );
  };
}

const ROUTE_DEFS: RouteDefinition[] = SECONDARY_NAVIGATION.map(({ path, getModule }) => ({
  path,
  component: constructLazyMDXPage(getModule),
}))
  .concat(
    ORDERED_COMPONENTS.map(({ key, getModule }) => ({
      path: `/components/${key}`,
      component: constructLazyMDXPage(getModule),
    })),
  )
  .concat([
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

function DocsRoutes() {
  const Routes = useRoutes(ROUTE_DEFS);
  return <Routes />;
}

export default function DocsApp(props: { url?: string }) {
  return (
    <Router url={props.url}>
      <Suspense>
        <Header />
        <DocsRoutes />
      </Suspense>
    </Router>
  );
}

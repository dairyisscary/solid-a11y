import { Outlet } from "solid-app-router";
import { type ComponentProps, splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

import { joinSpaceSeparated } from "@docs/utils/html";

import { SiteNavigation } from "./navigation";

const MAIN_CONTENT_ID = "solid-a11y-docs-main-content";

function Container(props: JSX.IntrinsicElements["div"]) {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      {...rest}
      class={joinSpaceSeparated("max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8", local.class)}
    >
      {local.children}
    </div>
  );
}

export function StickySidebar(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      {...rest}
      class={joinSpaceSeparated(
        "sticky top-[98px] max-h-screen flex-shrink-0 overflow-y-auto pb-20",
        local.class,
      )}
    >
      {local.children}
    </div>
  );
}

export function BodyContainer(props: ComponentProps<typeof Container>) {
  return (
    <Container
      {...props}
      class={joinSpaceSeparated("flex items-start pt-4 pb-24 sm:pt-6 lg:pb-12", props.class)}
    >
      {props.children || <Outlet />}
    </Container>
  );
}

export function Header() {
  return (
    <header class="firefox:bg-opacity-90 sticky inset-x-0 top-0 z-10 border-b border-gray-800 bg-gray-900 bg-opacity-50 py-4 backdrop-blur backdrop-filter">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full p-1 opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:ease-in"
      >
        Jump to Content
      </a>
      <Container>
        <SiteNavigation />
      </Container>
    </header>
  );
}

export function Main(props: Omit<JSX.IntrinsicElements["main"], "id">) {
  return (
    <main {...props} id={MAIN_CONTENT_ID}>
      {props.children}
    </main>
  );
}

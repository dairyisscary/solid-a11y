import { Link, Outlet } from "solid-app-router";
import { type ComponentProps, createUniqueId, splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

import { GitHubIcon } from "@docs/assets/github-icon";
import { SVGIconLink } from "@docs/assets/svg-icon";
import { joinSpaceSeparated } from "@docs/utils/html";

const MAIN_CONTENT_ID = createUniqueId();

function Container(props: JSX.IntrinsicElements["div"]) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      {...rest}
      class={joinSpaceSeparated("max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8", local.class)}
    />
  );
}

export function StickySidebar(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      {...rest}
      class={joinSpaceSeparated(
        "sticky top-[81px] max-h-screen flex-shrink-0 overflow-y-auto pb-20",
        local.class,
      )}
    />
  );
}

export function BodyContainer(props: ComponentProps<typeof Container>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <Container
      {...rest}
      class={joinSpaceSeparated(
        "flex items-start space-x-4 py-4 sm:space-x-6 sm:py-6 lg:space-x-8",
        local.class,
      )}
    >
      <Outlet />
    </Container>
  );
}

export function Header() {
  return (
    <header class="firefox:bg-opacity-90 sticky inset-x-0 top-0 z-20 border-b border-gray-800 bg-gray-900 bg-opacity-50 py-4 backdrop-blur backdrop-filter">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full p-1 opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:ease-in"
      >
        Jump to Content
      </a>
      <Container class="flex items-center justify-between">
        <Link class="text-white" href="/">
          solid-a11y
        </Link>
        <SVGIconLink
          readerLabel="GitHub Repository for solid-a11y"
          href="https://github.com/dairyisscary/solid-a11y"
          class="h-5 w-5 hover:text-slate-200"
        >
          <GitHubIcon />
        </SVGIconLink>
      </Container>
    </header>
  );
}

export function Main(props: Omit<JSX.IntrinsicElements["main"], "id">) {
  return <main {...props} id={MAIN_CONTENT_ID} />;
}

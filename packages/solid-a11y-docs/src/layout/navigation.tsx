import { Dialog, DialogOverlay, DialogTitle } from "solid-a11y";
import { NavLink, Outlet } from "solid-app-router";
import {
  type ComponentProps,
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

import { SECONDARY_NAVIGATION } from "@docs/article";
import { NamedSVGIcon, SVGIconLink } from "@docs/assets/svg-icon";
import { ORDERED_COMPONENTS } from "@docs/components";
import { joinSpaceSeparated } from "@docs/utils/html";

import { StickySidebar } from ".";

type SiteNavSecondaryLinksProps = {
  children: (options: { href: string; children: JSX.Element }) => JSX.Element;
};
type CollectionLinksProps = {
  onLinkClick?: () => void;
};
type OverlayNavProps = {
  children: (handleClose: () => void) => JSX.Element;
};

const SITE_NAV_CLASSES = "py-2 px-4 text-slate-100 hover:text-slate-400";

function OverlayNav(props: OverlayNavProps) {
  const [open, setOpen] = createSignal<boolean | { towards: boolean }>(false);
  const isTransitioning = createMemo(() => typeof open() === "object");
  const handleClose = () => setOpen({ towards: false });
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
          "z-10 backdrop-blur backdrop-filter lg:hidden",
          commonButtonClasses,
        )}
        onClick={[setOpen, { towards: true }]}
      >
        <span class="sr-only">Open Site Navigation</span>
        <NamedSVGIcon name="menu" class="h-1/2 w-1/2" />
      </button>
      <Show when={open()}>
        <Dialog onClose={handleClose}>
          <DialogOverlay
            class="firefox:bg-opacity-90 fixed inset-0 z-20 h-full w-full bg-gray-900 bg-opacity-50 backdrop-blur backdrop-filter transition-opacity duration-150"
            classList={{ "opacity-0": isTransitioning() }}
          />
          <div
            class="fixed inset-y-0 left-0 z-20 w-11/12 max-w-[40ch] border-r border-white border-opacity-10 bg-slate-800 p-5 transition-transform duration-150"
            classList={{ "-translate-x-full": isTransitioning() }}
          >
            <DialogTitle class="sr-only">Site Navigation</DialogTitle>
            {props.children(handleClose)}
          </div>
          <button
            type="button"
            onClick={handleClose}
            class={joinSpaceSeparated(commonButtonClasses, "z-20 transition-opacity duration-150")}
            classList={{ "opacity-0": isTransitioning() }}
          >
            <span class="sr-only">Close Site Navigation</span>
            <NamedSVGIcon name="close" class="h-1/2 w-1/2" />
          </button>
        </Dialog>
      </Show>
    </>
  );
}

function SiteNavSecondaryLinks(props: SiteNavSecondaryLinksProps) {
  return (
    <For each={SECONDARY_NAVIGATION}>
      {({ path, link }) => props.children({ href: path, children: link })}
    </For>
  );
}

export function SiteNavigation() {
  return (
    <nav aria-label="Site Navigation" class="flex items-center">
      <NavLink class={joinSpaceSeparated(SITE_NAV_CLASSES, "mr-auto block")} href="/">
        solid-a11y
      </NavLink>
      <SiteNavSecondaryLinks>
        {({ href, children }) => (
          <NavLink href={href} class={joinSpaceSeparated(SITE_NAV_CLASSES, "hidden md:block")}>
            {children}
          </NavLink>
        )}
      </SiteNavSecondaryLinks>
      <SVGIconLink
        readerLabel="GitHub Repository for solid-a11y"
        href="https://github.com/dairyisscary/solid-a11y"
        class="block h-10 w-10 p-2 text-slate-100 hover:text-slate-400"
      >
        <NamedSVGIcon name="github" />
      </SVGIconLink>
    </nav>
  );
}

function SideBarNavLink(props: ComponentProps<typeof NavLink>) {
  return (
    <NavLink
      {...props}
      activeClass="text-white"
      class="flex items-center whitespace-nowrap px-2 font-medium no-underline"
    />
  );
}

function Nav(props: ComponentProps<"nav">) {
  return <nav {...props} class={joinSpaceSeparated(props.class, "space-y-4")} />;
}

function SecondarySiteNavigation(props: CollectionLinksProps) {
  const secondaryLinksId = createUniqueId();
  return (
    <>
      <NavigationHeader id={secondaryLinksId} class="mb-4 md:hidden">
        Other Resources
      </NavigationHeader>
      <Nav aria-labelledby={secondaryLinksId} class="mb-10 md:hidden">
        <SiteNavSecondaryLinks>
          {({ href, children }) => (
            <SideBarNavLink href={href} onClick={props.onLinkClick}>
              {children}
            </SideBarNavLink>
          )}
        </SiteNavSecondaryLinks>
      </Nav>
    </>
  );
}

function ComponentNavigation(props: CollectionLinksProps) {
  const componentNavId = createUniqueId();
  return (
    <>
      <NavigationHeader id={componentNavId} class="mb-4">
        Components
      </NavigationHeader>
      <Nav aria-labelledby={componentNavId}>
        <For each={ORDERED_COMPONENTS}>
          {({ key, title, color, icon }) => (
            <SideBarNavLink href={`/components/${key}`} onClick={props.onLinkClick}>
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
            </SideBarNavLink>
          )}
        </For>
      </Nav>
    </>
  );
}

export function StickySidebarNavigation(props: { children?: JSX.Element }) {
  return (
    <>
      <StickySidebar class="hidden w-64 lg:block">
        <ComponentNavigation />
      </StickySidebar>
      <OverlayNav>
        {(handleClose) => (
          <>
            <SecondarySiteNavigation onLinkClick={handleClose} />
            <ComponentNavigation onLinkClick={handleClose} />
          </>
        )}
      </OverlayNav>
      {props.children || <Outlet />}
    </>
  );
}

export function NavigationHeader(props: ComponentProps<"p">) {
  return (
    <p
      {...props}
      class={joinSpaceSeparated(props.class, "font-semibold uppercase tracking-wide text-white")}
    />
  );
}

import IconsUrl from "remixicon/fonts/remixicon.symbol.svg";
import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

type IconLinkProps = JSX.IntrinsicElements["a"] & {
  readerLabel: JSX.Element;
};
type IconName =
  | "github"
  | "menu"
  | "close"
  | "radio-button"
  | "toggle"
  | "window"
  | "table"
  | "check"
  | "listbox"
  | "arrow-down"
  | "external-link";
type NamedIconProps = Omit<JSX.IntrinsicElements["svg"], "children"> & {
  name: IconName;
};

function namedIconSymbol(name: IconName): string {
  switch (name) {
    case "github":
    case "menu":
    case "close":
    case "radio-button":
    case "toggle":
    case "table":
    case "check":
    case "external-link":
    case "arrow-down":
      return `${name}-line`;
    case "listbox":
      return "layout-top-2-line";
    case "window":
      return "window-2-line";
  }
}

function SVGIcon(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg
      // @ts-expect-error -- not in the svg props (yet)
      focusable="false"
      aria-hidden="true"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    />
  );
}

export function NamedSVGIcon(props: NamedIconProps) {
  const [local, rest] = splitProps(props, ["name"]);
  return (
    <SVGIcon {...rest} class={props.class || "h-full w-full"}>
      <use href={`${IconsUrl}#ri-${namedIconSymbol(local.name)}`} />
    </SVGIcon>
  );
}

export function SVGIconLink(props: IconLinkProps) {
  const [local, aProps] = splitProps(props, ["children", "readerLabel"]);
  return (
    <a {...aProps}>
      <span class="sr-only">{local.readerLabel}</span>
      {local.children}
    </a>
  );
}

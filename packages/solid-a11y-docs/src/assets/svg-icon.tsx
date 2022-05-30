import IconsUrl from "remixicon/fonts/remixicon.symbol.svg";
import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

import type { IconName } from "@docs/assets/svg-icon-name";

type IconLinkProps = JSX.IntrinsicElements["a"] & {
  readerLabel: JSX.Element;
};
type NamedIconProps = Omit<JSX.IntrinsicElements["svg"], "children"> & {
  name: IconName;
};

export function NamedSVGIcon(props: NamedIconProps) {
  const [local, rest] = splitProps(props, ["class", "name"]);
  return (
    <svg
      // @ts-expect-error -- not in the svg props (yet)
      focusable="false"
      aria-hidden="true"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      class={local.class || "h-full w-full"}
    >
      <use href={`${IconsUrl}#ri-${local.name}-line`} />
    </svg>
  );
}

export function SVGIconLink(props: IconLinkProps) {
  const [local, rest] = splitProps(props, ["readerLabel"]);
  return (
    <a {...rest}>
      <span class="sr-only">{local.readerLabel}</span>
      {rest.children}
    </a>
  );
}

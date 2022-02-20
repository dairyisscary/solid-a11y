import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

type IconLinkProps = JSX.IntrinsicElements["a"] & {
  readerLabel: JSX.Element;
};

export function SVGIcon(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg aria-hidden="true" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props} />
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

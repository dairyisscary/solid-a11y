import type { JSX as SolidJSX } from "solid-js/jsx-runtime";

declare global {
  // mdx types shit the bed
  export namespace JSX {
    export type Element = SolidJSX.Element;
    export type ElementClass = SolidJSX.ElementClass;
    export type IntrinsicElements = SolidJSX.IntrinsicElements;
  }
}

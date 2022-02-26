import type { Component, ComponentProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

export type DynamicComponent = Component | keyof JSX.IntrinsicElements;
export type A11yDynamicProps<
  Comp extends DynamicComponent,
  OtherProps extends Record<string, unknown> = Record<never, never>,
  Omitted extends string = never,
> = Omit<ComponentProps<Comp>, Omitted | keyof OtherProps> &
  OtherProps & {
    component?: Comp;
    children?: ComponentProps<Comp> extends { children?: infer Child } ? Child : never;
  };
type NextFocusAction = { type: "direction"; direction: "next" | "prev" };
type FocusAction = { type: "element"; element: HTMLElement } | NextFocusAction;

const FOCUS_SELECTOR = [
  "[contentEditable=true]",
  "[tabindex]",
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "iframe",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
]
  .map((selector) => `${selector}:not([tabindex='-1'])`)
  .join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUS_SELECTOR));
}

function findNextFocus(allFocusable: HTMLElement[], direction: NextFocusAction["direction"]) {
  const active = document.activeElement as HTMLElement | null;
  const activeIndex = allFocusable.indexOf(active!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const beforeElems = allFocusable.slice(0, Math.max(activeIndex, 0));
  const afterElems = allFocusable.slice(activeIndex + 1);
  const baseIter =
    direction === "prev"
      ? beforeElems.reverse().concat(afterElems.reverse())
      : afterElems.concat(beforeElems);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const iter = activeIndex > -1 ? baseIter.concat(active!) : baseIter;

  for (const elem of iter) {
    elem.focus();
    if (document.activeElement === elem) {
      return true;
    }
  }

  return false;
}

export function joinSpaceSeparated(
  ...values: (undefined | false | null | string)[]
): string | undefined {
  return values.filter(Boolean).join(" ") || undefined;
}

export function callThrough<T, E extends Event>(
  callback: undefined | JSX.EventHandlerUnion<T, E>,
  event: E,
): void {
  if (Array.isArray(callback)) {
    const bound = callback as JSX.BoundEventHandler<T, E>;
    return bound[0](bound[1], event as E & { currentTarget: T; target: Element });
  } else if (typeof callback === "function") {
    return callback(event as E & { currentTarget: T; target: HTMLElement });
  }
}

export function focusIn(element: HTMLElement, action: FocusAction): boolean {
  const allFocusable = getFocusableElements(element);
  if (action.type === "element" && allFocusable.includes(action.element)) {
    action.element.focus();
    return true;
  }
  return findNextFocus(allFocusable, action.type === "direction" ? action.direction : "next");
}

import {
  type Component,
  type ComponentProps,
  type ValidComponent,
  onCleanup,
  onMount,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

type RefCallback<E> = (el: E) => void;
export type A11yDynamicProps<
  Comp extends ValidComponent,
  OtherProps extends Record<string, unknown> = Record<never, never>,
  Omitted extends string = never,
> = Omit<ComponentProps<Comp>, Omitted | keyof OtherProps> &
  OtherProps & {
    component?: keyof JSX.IntrinsicElements | Component<Record<string, unknown>>;
    ref?: HTMLElement | RefCallback<HTMLElement>;
    children?: OtherProps extends { children?: infer OtherChild }
      ? OtherChild
      : ComponentProps<Comp> extends { children?: infer BaseChild }
      ? BaseChild
      : never;
  };
type FocusAction =
  | { type: "element"; element: HTMLElement }
  | { type: "direction"; direction: Parameters<typeof focusNextElement>[1] };

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

function getFocusableElements(container: HTMLElement, selector?: string) {
  return Array.from(container.querySelectorAll<HTMLElement>(selector || FOCUS_SELECTOR));
}

export function isFocusable(element: HTMLElement | null): boolean {
  while (element) {
    if (element.matches(FOCUS_SELECTOR)) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}

export function createClickOutside(
  elementRefFns: (() => HTMLElement | null | undefined)[],
  cb: (evt: PointerEvent) => void,
) {
  function clickOutsideHandler(evt: PointerEvent) {
    const target = evt.target as HTMLElement;
    if (!target.ownerDocument.documentElement.contains(target)) {
      return;
    }
    for (const elementRefFn of elementRefFns) {
      if (elementRefFn()?.contains(target)) {
        return;
      }
    }
    return cb(evt);
  }
  onMount(() => {
    window.addEventListener("pointerdown", clickOutsideHandler);
    onCleanup(() => {
      window.removeEventListener("pointerdown", clickOutsideHandler);
    });
  });
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

export function callThroughRef<E extends HTMLElement>(
  props: { ref?: E | RefCallback<E> },
  callback: RefCallback<E>,
): RefCallback<E> {
  return (el) => {
    const inProps = "ref" in props;
    if (inProps && typeof props.ref === "function") {
      props.ref(el);
    } else if (inProps) {
      props.ref = el;
    }
    callback(el);
  };
}

export function nextFocusableElementPool(
  orderedElementPool: HTMLElement[],
  direction: "next" | "prev",
  active?: HTMLElement,
): HTMLElement[] {
  active = active || (document.activeElement as HTMLElement);
  const activeIndex = orderedElementPool.indexOf(active);
  const beforeElems = orderedElementPool.slice(0, Math.max(activeIndex, 0));
  const afterElems = orderedElementPool.slice(activeIndex + 1);
  const baseIter =
    direction === "prev"
      ? beforeElems.reverse().concat(afterElems.reverse())
      : afterElems.concat(beforeElems);
  return activeIndex > -1 ? baseIter.concat(active) : baseIter;
}

export function focusNextElement(
  orderedElementPool: HTMLElement[],
  direction: "next" | "prev",
): undefined | HTMLElement {
  for (const elem of nextFocusableElementPool(orderedElementPool, direction)) {
    elem.focus();
    if (document.activeElement === elem) {
      return elem;
    }
  }
}

export function focusIn(element: HTMLElement, action: FocusAction): undefined | HTMLElement {
  const allFocusable = getFocusableElements(element);
  const pointedElement = action.type === "element" && action.element;
  if (pointedElement && allFocusable.includes(pointedElement)) {
    pointedElement.focus();
    if (document.activeElement === pointedElement) {
      return pointedElement;
    }
  }
  return focusNextElement(allFocusable, action.type === "direction" ? action.direction : "next");
}

export function getTypeAttributeForDefaultButtonComponent(
  component: ValidComponent | undefined,
  type: string | null | undefined,
) {
  return type || (component && component !== "button") ? type : "button";
}

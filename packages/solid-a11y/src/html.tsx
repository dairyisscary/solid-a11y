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
  };

export function joinSeperated(
  ...values: (undefined | false | null | string)[]
): string | undefined {
  return values.filter(Boolean).join(" ") || undefined;
}

export function callThrough<T, E extends Event>(
  callback: undefined | JSX.EventHandlerUnion<T, E>,
  event: E,
) {
  if (Array.isArray(callback)) {
    return callback[0](callback[1], event);
  } else if (typeof callback === "function") {
    return callback(event as E & { currentTarget: T; target: HTMLElement });
  }
}

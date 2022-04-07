import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import { useDescribedBy, useLabeledBy } from "../group";
import {
  type A11yDynamicProps,
  type DynamicComponent,
  callThrough,
  getTypeAttributeForDefaultButtonComponent,
  joinSpaceSeparated,
} from "../html";
import { SPACE_KEY, TAB_KEY } from "../keyboard";

type SwitchProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    /** Controls if the switch is "on" */
    checked?: boolean;
    /** Callback when user takes action to change the value of the switch */
    onChange: (newValue: boolean) => void;
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
    onKeyUp?: JSX.EventHandlerUnion<C, KeyboardEvent>;
    type?: string;
  },
  "id" | "role" | "tabindex" | "aria-checked"
>;

const DEFAULT_SWITCH_COMPONENT = "button";

/** Two-state "switch" element */
export function Switch<C extends DynamicComponent = typeof DEFAULT_SWITCH_COMPONENT>(
  props: SwitchProps<C>,
) {
  const [local, rest] = splitProps(props as SwitchProps<typeof DEFAULT_SWITCH_COMPONENT>, [
    "checked",
    "onChange",
  ]);
  const toggle = () => local.onChange(!local.checked);
  const labeledBy = useLabeledBy();
  const describedBy = useDescribedBy();
  return (
    <Dynamic
      component={DEFAULT_SWITCH_COMPONENT}
      {...rest}
      type={getTypeAttributeForDefaultButtonComponent(rest.component, rest.type)}
      role="switch"
      tabindex={0}
      aria-labelledby={joinSpaceSeparated(props["aria-labelledby"], labeledBy())}
      aria-describedby={joinSpaceSeparated(props["aria-describedby"], describedBy())}
      aria-checked={Boolean(local.checked)}
      onClick={(evt: MouseEvent) => {
        toggle();
        return callThrough(props.onClick, evt);
      }}
      onKeyUp={(evt: KeyboardEvent) => {
        if (evt.key !== TAB_KEY) {
          evt.preventDefault();
        }
        if (evt.key === SPACE_KEY) {
          toggle();
        }
        return callThrough(props.onKeyUp, evt);
      }}
    />
  );
}

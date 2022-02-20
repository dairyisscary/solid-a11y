import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import { useLabeledBy } from "../group";
import { type A11yDynamicProps, type DynamicComponent, callThrough, joinSeperated } from "../html";
import { SPACE_KEY, TAB_KEY } from "../keyboard";

type SwitchProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    "aria-labelledby"?: string;
    checked?: boolean;
    onChange: (newValue: boolean) => void;
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
    onKeyUp?: JSX.EventHandlerUnion<C, KeyboardEvent>;
    type?: string;
  },
  "id" | "role" | "tabindex" | "aria-checked"
>;

const DEFAULT_SWITCH_COMPONENT = "button";

export function Switch<C extends DynamicComponent = typeof DEFAULT_SWITCH_COMPONENT>(
  props: SwitchProps<C>,
) {
  const [local, rest] = splitProps(props as SwitchProps<typeof DEFAULT_SWITCH_COMPONENT>, [
    "checked",
    "type",
    "onChange",
  ]);
  const toggle = () => local.onChange(!local.checked);
  const labeledBy = useLabeledBy();
  return (
    <Dynamic
      component={DEFAULT_SWITCH_COMPONENT}
      {...rest}
      type={
        local.type || (rest.component && rest.component !== DEFAULT_SWITCH_COMPONENT)
          ? local.type
          : DEFAULT_SWITCH_COMPONENT
      }
      role="switch"
      tabindex={0}
      aria-labelledby={joinSeperated(props["aria-labelledby"], labeledBy())}
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

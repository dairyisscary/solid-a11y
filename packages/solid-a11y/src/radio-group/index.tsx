import {
  createContext,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import { DescriptionGroup, LabelGroup, useDescribedBy, useLabeledBy } from "../group";
import {
  type A11yDynamicProps,
  type DynamicComponent,
  callThrough,
  focusNextElement,
  joinSpaceSeparated,
} from "../html";
import {
  DOWN_ARROW_KEY,
  LEFT_ARROW_KEY,
  RIGHT_ARROW_KEY,
  SPACE_KEY,
  UP_ARROW_KEY,
} from "../keyboard";

type OptionRegistration = {
  ref: HTMLElement;
  value: unknown;
  disabled?: boolean;
  index: number;
};
type GroupContext = Readonly<{
  isDisabled: () => boolean | undefined;
  isChecked: (value: unknown) => boolean;
  isTabable: (value: unknown) => boolean;
  change: (newValue: unknown) => void;
  register: (registration: OptionRegistration) => () => void;
}>;
type ClassList = JSX.IntrinsicElements["div"]["classList"];
type OptionRenderProps = Readonly<{
  checked: () => boolean;
  active: () => boolean;
}>;
type OptionProps<V, C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    /** When truthy, this option is disabled and non-interactive */
    disabled?: boolean;
    /** The option's value */
    value: V;
    /** The index of this item -- so RadioGroup knows what is the first item for focus management */
    index: number;
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
    onFocus?: JSX.EventHandlerUnion<C, FocusEvent>;
    onBlur?: JSX.EventHandlerUnion<C, FocusEvent>;
    /** Render prop for children -- passed checked and active signal getters */
    children: (renderProps: OptionRenderProps) => JSX.Element;
    /** Render prop for conditional classes -- passed checked and active signal getters */
    classList?: ((renderProps: OptionRenderProps) => ClassList) | ClassList;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  },
  "role" | "aria-checked" | "aria-disabled" | "tabindex"
>;
type GroupProps<V, C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    /** Callback for when user takes action to change the value -- new value is passed */
    onChange: (newValue: V) => void;
    /** The current controlled value of the group */
    value: V;
    /** When truthy, the entire group is disabled and non-interactive */
    disabled?: boolean;
    onKeyDown?: JSX.EventHandlerUnion<C, KeyboardEvent>;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  },
  "role" | "aria-disabled"
>;

const UNIQUE_VALUE = Symbol();
const DEFAULT_GROUP_COMPONENT = "div";
const DEFAULT_OPTION_COMPONENT = "div";
const RADIO_GROUP_CONTEXT = createContext<GroupContext | null>(null);

function sortByIndex(a: OptionRegistration, b: OptionRegistration) {
  return a.index - b.index;
}

function getValueOfArrowedOption(evt: KeyboardEvent, lookup: OptionRegistration[]) {
  const { key } = evt;
  const isNextArrow = key === DOWN_ARROW_KEY || key === RIGHT_ARROW_KEY;
  if (isNextArrow || key === LEFT_ARROW_KEY || key === UP_ARROW_KEY) {
    evt.preventDefault();
    const focused = focusNextElement(
      lookup.filter((reg) => !reg.disabled).map((reg) => reg.ref),
      isNextArrow ? "next" : "prev",
    );
    return focused && lookup.find((reg) => reg.ref === focused);
  } else if (key === SPACE_KEY) {
    evt.preventDefault();
    const active = document.activeElement;
    return lookup.find((reg) => reg.ref === active);
  }
}

function RadioGroupRoot<V, C extends DynamicComponent>(props: GroupProps<V, C>) {
  const [local, rest] = splitProps(props, ["value", "onChange", "disabled"]);
  const labeledBy = useLabeledBy();
  const describedBy = useDescribedBy();
  const [optionRefLookup, setOptionRefLookup] = createSignal<OptionRegistration[]>([]);
  const groupContext: GroupContext = {
    isDisabled: () => local.disabled,
    isChecked: createSelector(() => local.value),
    isTabable: createSelector(() => {
      // We return a unique value that never compares to a value if we can't find an appropriate radio value
      if (local.disabled) {
        return UNIQUE_VALUE;
      }

      const checked = local.value;
      const checkedOption = optionRefLookup().find((reg) => reg.value === checked);
      if (checkedOption) {
        return checkedOption.disabled ? UNIQUE_VALUE : checked;
      }

      return optionRefLookup().find((reg) => !reg.disabled)?.value || UNIQUE_VALUE;
    }),
    register: (registration) => {
      setOptionRefLookup((old) => old.concat(registration).sort(sortByIndex));
      return () => setOptionRefLookup((old) => old.filter((value) => value !== registration));
    },
    change: (newValue) => {
      // We do disabled checking in option...
      local.onChange(newValue as V);
    },
  };
  return (
    <RADIO_GROUP_CONTEXT.Provider value={groupContext}>
      <Dynamic
        component={DEFAULT_GROUP_COMPONENT}
        {...rest}
        role="radiogroup"
        onKeyDown={(evt: KeyboardEvent) => {
          const nextOption = !local.disabled && getValueOfArrowedOption(evt, optionRefLookup());
          if (nextOption) {
            local.onChange(nextOption.value as V);
          }
          return callThrough(props.onKeyDown, evt);
        }}
        aria-labelledby={joinSpaceSeparated(props["aria-labelledby"], labeledBy())}
        aria-describedby={joinSpaceSeparated(props["aria-describedby"], describedBy())}
      />
    </RADIO_GROUP_CONTEXT.Provider>
  );
}

/** The group "container" and context holder */
export function RadioGroup<V = string, C extends DynamicComponent = typeof DEFAULT_GROUP_COMPONENT>(
  props: GroupProps<V, C>,
) {
  return (
    <LabelGroup>
      <DescriptionGroup>
        <RadioGroupRoot<V, C> {...props} />
      </DescriptionGroup>
    </LabelGroup>
  );
}

function RadioGroupOptionRoot<V, C extends DynamicComponent>(props: OptionProps<V, C>) {
  const group = useContext(RADIO_GROUP_CONTEXT);
  if (!group) {
    throw new Error("Use of <RadioGroupOption /> outside of <RadioGroup />");
  }
  const [active, setActive] = createSignal(false);
  const [local, rest] = splitProps(props, ["index", "value", "disabled"]);
  const labeledBy = useLabeledBy();
  const describedBy = useDescribedBy();
  const disabled = createMemo(() => Boolean(local.disabled || group.isDisabled()));
  const checked = () => group.isChecked(local.value);
  const renderProps: OptionRenderProps = { checked, active };
  let optionRef: HTMLElement | undefined;
  createEffect(() =>
    onCleanup(
      group.register({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ref: optionRef!,
        // We use local.disabled and expect group to manage group disabled
        disabled: local.disabled,
        index: local.index,
        value: local.value,
      }),
    ),
  );
  return (
    <Dynamic
      component={DEFAULT_OPTION_COMPONENT}
      {...rest}
      ref={optionRef}
      role="radio"
      aria-labelledby={joinSpaceSeparated(props["aria-labelledby"], labeledBy())}
      aria-describedby={joinSpaceSeparated(props["aria-describedby"], describedBy())}
      aria-checked={checked().toString()}
      aria-disabled={disabled() ? "true" : undefined}
      // Setting this to -1 also prevents keyboard navigation
      tabindex={group.isTabable(local.value) ? 0 : -1}
      onFocus={(evt: FocusEvent) => {
        if (!disabled()) {
          setActive(true);
        }
        return callThrough(props.onFocus, evt);
      }}
      onBlur={(evt: FocusEvent) => {
        if (!disabled()) {
          setActive(false);
        }
        return callThrough(props.onBlur, evt);
      }}
      onClick={(evt: MouseEvent) => {
        if (!disabled()) {
          group.change(local.value);
          setActive(true);
          (evt.currentTarget as HTMLElement).focus();
        }
        return callThrough(props.onClick, evt);
      }}
      classList={
        typeof props.classList === "function" ? props.classList(renderProps) : props.classList
      }
    >
      {props.children(renderProps)}
    </Dynamic>
  );
}

/** An option within the group */
export function RadioGroupOption<
  V = string,
  C extends DynamicComponent = typeof DEFAULT_OPTION_COMPONENT,
>(props: OptionProps<V, C>) {
  return (
    <LabelGroup>
      <DescriptionGroup>
        <RadioGroupOptionRoot<V, C> {...props} />
      </DescriptionGroup>
    </LabelGroup>
  );
}

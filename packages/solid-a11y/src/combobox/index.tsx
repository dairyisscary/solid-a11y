import {
  Show,
  batch,
  createContext,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import { DescriptionGroup, LabelGroup, sortByDOM, useDescribedBy, useLabeledBy } from "../group";
import {
  type A11yDynamicProps,
  type DynamicComponent,
  callThrough,
  callThroughRef,
  createClickOutside,
  getTypeAttributeForDefaultButtonComponent,
  isFocusable,
  joinSpaceSeparated,
  nextFocusableElementPool,
} from "../html";
import {
  DOWN_ARROW_KEY,
  END_KEY,
  ENTER_KEY,
  ESCAPE_KEY,
  HOME_KEY,
  LEFT_ARROW_KEY,
  PAGE_DOWN_KEY,
  PAGE_UP_KEY,
  RIGHT_ARROW_KEY,
  SPACE_KEY,
  TAB_KEY,
  UP_ARROW_KEY,
} from "../keyboard";

type ExcludeValue<V> = Exclude<V, Function>; // eslint-disable-line @typescript-eslint/ban-types
type OptionRegistration = {
  disabled: boolean | undefined;
  ref: () => HTMLElement;
  value: unknown;
};
type GroupContext = {
  isOpen: () => boolean;
  isDisabled: () => boolean;
  isActive: (value: unknown) => boolean;
  isSelected: (value: unknown) => boolean;
  select: (value: unknown) => void;
  selectActive: () => void;
  activeOptionId: () => string | undefined;
  activateDirection: (direction: "first" | "last" | "next" | "prev") => void;
  optionsId: () => string | undefined;
  toggleOpen: () => void;
  close: () => void;
  registerButton: (el: HTMLElement) => void;
  registerInput: (el: HTMLElement) => void;
  registerOptions: (el: HTMLElement) => void;
  registerOption: (registration: OptionRegistration) => () => void;
};
type ComboboxProps<V> = {
  /** The currently selected value */
  value: V;
  /** The callback to change the value -- new value is passed */
  onChange: (newValue: V) => void;
  children: JSX.Element;
  /** When truthy, the entire comboxbox is disabled */
  disabled?: boolean;
};
type ClassList = JSX.IntrinsicElements["div"]["classList"];
type ButtonRenderProps = Readonly<{ open: () => boolean }>;
type ComboboxButtonProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    type?: JSX.IntrinsicElements["button"]["type"];
    /** Render prop for conditional content -- passed open signal getter */
    children: ((renderProps: ButtonRenderProps) => JSX.Element) | JSX.Element;
    /** Render prop for conditional classes -- passed open signal getter */
    classList?: ((renderProps: ButtonRenderProps) => ClassList) | ClassList;
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
  },
  "id"
>;
type ComboboxOptionsProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    /** A lazy render function */
    children: () => JSX.Element;
  },
  "role"
>;
type OptionRenderProps = Readonly<{ selected: () => boolean; active: () => boolean }>;
type ComboboxOptionProps<V, C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    value: V;
    disabled?: boolean;
    /** Render prop for conditional content -- passed selected and active signal getter */
    children: ((renderProps: OptionRenderProps) => JSX.Element) | JSX.Element;
    /** Render prop for conditional classes -- passed selected and active signal getter */
    classList?: ((renderProps: OptionRenderProps) => ClassList) | ClassList;
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
  },
  "id" | "role"
>;
type ComboboxInputProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    type?: JSX.IntrinsicElements["input"]["type"];
    onKeyDown?: JSX.EventHandlerUnion<C, KeyboardEvent>;
  },
  "id" | "role" | "aria-expanded" | "aria-controls" | "aria-activedescendant"
>;

const COMBOBOX_CONTEXT = createContext<GroupContext | null>(null);
const DEFAULT_OPTIONS_COMPONENT = "ul";
const DEFAULT_OPTION_COMPONENT = "li";
const DEFAULT_BUTTON_COMPONENT = "button";
const DEFAULT_INPUT_COMPONTENT = "input";

function useComboboxContext(label: string) {
  const context = useContext(COMBOBOX_CONTEXT);
  if (!context) {
    throw new Error(`<${label} /> cannot be used outside <Combobox />`);
  }
  return context;
}

/** An option within a combobox */
export function ComboboxButton<C extends DynamicComponent = typeof DEFAULT_BUTTON_COMPONENT>(
  props: ComboboxButtonProps<C>,
) {
  const context = useComboboxContext("ComboboxButton");
  const id = createUniqueId(); // TODO?
  const renderProps = { open: context.isOpen };
  return (
    <Dynamic
      component={DEFAULT_BUTTON_COMPONENT}
      {...props}
      ref={callThroughRef(props, context.registerButton)}
      type={getTypeAttributeForDefaultButtonComponent(props.component, props.type)}
      id={id}
      classList={
        typeof props.classList === "function" ? props.classList(renderProps) : props.classList
      }
      aria-haspopup="true"
      aria-expanded={context.isDisabled() ? undefined : context.isOpen()}
      aria-controls={context.optionsId()}
      disabled={context.isDisabled()}
      tabindex={-1}
      onClick={(evt: MouseEvent) => {
        evt.preventDefault();
        context.toggleOpen();
        return callThrough(props.onClick, evt);
      }}
    >
      {typeof props.children === "function" ? props.children(renderProps) : props.children}
    </Dynamic>
  );
}

/** An option within a combobox */
export function ComboboxOption<
  V = string,
  C extends DynamicComponent = typeof DEFAULT_OPTION_COMPONENT,
>(props: ComboboxOptionProps<V, C>) {
  const [local, rest] = splitProps(props, ["value", "disabled"]);
  const context = useComboboxContext("ComboboxOption");
  const id = createUniqueId();
  let optionRef: undefined | HTMLElement;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const optionRefGetter = () => optionRef!;
  const active = () => context.isActive(local.value);
  const selected = () => context.isSelected(local.value);
  const renderProps = { active, selected };
  createEffect(() =>
    onCleanup(
      context.registerOption({
        ref: optionRefGetter,
        // We use local.disabled and expect group to manage group disabled
        disabled: local.disabled,
        value: local.value,
      }),
    ),
  );
  return (
    <Dynamic
      component={DEFAULT_OPTION_COMPONENT}
      {...rest}
      ref={callThroughRef(rest, (el) => (optionRef = el))}
      tabindex={local.disabled ? undefined : "-1"}
      aria-disabled={local.disabled ? "true" : undefined}
      aria-selected={selected() ? "true" : undefined}
      role="option"
      id={id}
      classList={
        typeof props.classList === "function" ? props.classList(renderProps) : props.classList
      }
      onClick={(evt: MouseEvent) => {
        if (!local.disabled) {
          context.select(local.value);
        }
        return callThrough(props.onClick, evt);
      }}
    >
      {typeof props.children === "function" ? props.children(renderProps) : props.children}
    </Dynamic>
  );
}

/** The container for the options in a combobox */
export function ComboboxOptions<C extends DynamicComponent = typeof DEFAULT_OPTIONS_COMPONENT>(
  props: ComboboxOptionsProps<C>,
) {
  const context = useComboboxContext("ComboboxOptions");
  const id = createUniqueId();
  return (
    <Show when={context.isOpen()}>
      <Dynamic
        component={DEFAULT_OPTIONS_COMPONENT}
        {...props}
        ref={callThroughRef(props, context.registerOptions)}
        role="listbox"
        aria-activedescendant={context.activeOptionId()}
        id={id}
      >
        {props.children()}
      </Dynamic>
    </Show>
  );
}

/** The interactive element a user will type in to query */
export function ComboboxInput<C extends DynamicComponent = typeof DEFAULT_INPUT_COMPONTENT>(
  props: ComboboxInputProps<C>,
) {
  const context = useComboboxContext("ComboboxInput");
  const id = createUniqueId();
  return (
    <Dynamic
      component={DEFAULT_INPUT_COMPONTENT}
      type={props.type || (props.component && props.component !== "input") ? props.type : "text"}
      {...props}
      ref={callThroughRef(props, context.registerInput)}
      id={id}
      role="combobox"
      aria-expanded={context.isDisabled() ? undefined : context.isOpen()}
      aria-controls={context.optionsId()}
      aria-activedescendant={context.activeOptionId()}
      onKeyDown={(evt: KeyboardEvent) => {
        switch (evt.key) {
          case ESCAPE_KEY:
            evt.preventDefault();
            context.close();
            break;
          case ENTER_KEY:
            evt.preventDefault();
            context.selectActive();
            break;
          case TAB_KEY:
            context.selectActive();
            break;
          case DOWN_ARROW_KEY:
            evt.preventDefault();
            context.activateDirection("next");
            break;
          case UP_ARROW_KEY:
            evt.preventDefault();
            context.activateDirection("prev");
            break;
          case HOME_KEY:
          case PAGE_UP_KEY:
            evt.preventDefault();
            context.activateDirection("first");
            break;
          case END_KEY:
          case PAGE_DOWN_KEY:
            evt.preventDefault();
            context.activateDirection("last");
            break;
        }
        return callThrough(props.onKeyDown, evt);
      }}
    />
  );
}

/** The main combobox component and context provider */
export function Combobox<V = string>(props: ComboboxProps<V>) {
  let inputRef: undefined | HTMLElement;
  let buttonRef: undefined | HTMLElement;
  const [open, setOpen] = createSignal(false);
  const [optionsRef, setOptionsRef] = createSignal<HTMLElement>();
  const [options, setOptions] = createSignal<OptionRegistration[]>([]);
  const [activeValue, setActiveValue] = createSignal<null | V>(null);
  const isDisabled = () => Boolean(props.disabled);
  const isOpen = () => open() && !isDisabled();
  const isSelected = createSelector(() => props.value);
  const isActive = createSelector(activeValue);
  const setHardClosed = () => {
    batch(() => {
      setOpen(false);
      setActiveValue(null);
    });
    inputRef?.focus({ preventScroll: true });
  };
  const select: GroupContext["select"] = (v) => {
    props.onChange(v as V);
    setHardClosed();
  };
  const activeOptionRef = () =>
    // XXX is this bad because its not reactive?
    options()
      .find((option) => isActive(option.value))
      ?.ref();
  const activateDirection: GroupContext["activateDirection"] = (direction) => {
    const nonDisabled = options().filter((option) => !option.disabled);
    switch (direction) {
      case "first": {
        const [first] = nonDisabled;
        if (first) {
          setActiveValue(first.value as ExcludeValue<V>);
        }
        break;
      }
      case "last": {
        const last = nonDisabled[nonDisabled.length - 1];
        if (last) {
          setActiveValue(last.value as ExcludeValue<V>);
        }
        break;
      }
      case "next":
      case "prev": {
        const [nextElem] = nextFocusableElementPool(
          nonDisabled.map((option) => option.ref()),
          direction,
          activeOptionRef(),
        );
        if (nextElem) {
          setActiveValue(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            options().find((option) => option.ref() === nextElem)!.value as ExcludeValue<V>,
          );
        }
        break;
      }
    }
  };
  const setHardOpen = (direction: "last" | "first") => {
    setOpen(true);
    const selectedOption = options().find((reg) => isSelected(reg.value));
    if (selectedOption) {
      setActiveValue(selectedOption.value as ExcludeValue<V>);
    } else {
      activateDirection(direction);
    }
    inputRef?.focus({ preventScroll: true });
  };
  const context: GroupContext = {
    isOpen,
    isDisabled,
    isActive,
    isSelected,
    close: setHardClosed,
    select,
    selectActive: () => {
      const activeOption = options().find((option) => isActive(option.value));
      if (activeOption) {
        select(activeOption.value);
      } else {
        setHardClosed();
      }
    },
    activateDirection,
    optionsId: createMemo(() => optionsRef()?.id),
    activeOptionId: createMemo(() => activeOptionRef()?.id),
    toggleOpen: () => {
      if (open()) {
        setHardClosed();
      } else {
        setHardOpen("first");
      }
    },
    registerButton: (el) => (buttonRef = el),
    registerInput: (el) => (inputRef = el),
    registerOptions: setOptionsRef,
    registerOption: (registration) => {
      setOptions((old) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sortByDOM(optionsRef()!, "[role='option']", old.concat(registration), (option) =>
          option.ref(),
        ),
      );
      return () => setOptions((old) => old.filter((value) => value !== registration));
    },
  };
  createClickOutside([() => buttonRef, () => inputRef, optionsRef], (evt) => {
    if (open()) {
      setOpen(false);
      if (!isFocusable(evt.target as HTMLElement)) {
        evt.preventDefault();
        // buttonRef?.focus(); TODO
      }
    }
  });
  return <COMBOBOX_CONTEXT.Provider value={context}>{props.children}</COMBOBOX_CONTEXT.Provider>;
}

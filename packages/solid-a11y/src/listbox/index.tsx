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
type ClassList = JSX.IntrinsicElements["div"]["classList"];
type OptionRegistration = {
  disabled: boolean | undefined;
  ref: () => HTMLElement;
  value: unknown;
};
type GroupContext = {
  orientation: () => "vertical" | "horizontal";
  isDisabled: () => boolean;
  isSelected: (value: unknown) => boolean;
  isOpen: () => boolean;
  isActive: (value: unknown) => boolean;
  activate: (v: unknown) => void;
  deactivate: (v: unknown) => void;
  select: (v: unknown) => void;
  selectActive: () => void;
  open: (direction: "first" | "last") => void;
  close: () => void;
  toggleOpen: () => void;
  activateDirection: (direction: "first" | "last" | "next" | "prev") => void;
  registerOption: (registration: OptionRegistration) => () => void;
  registerButton: (el: HTMLElement) => void;
  registerListbox: (el: HTMLElement) => void;
  optionsRefId: () => string | undefined;
  activeOptionId: () => string | undefined;
};
type ListboxProps<V> = {
  /** The currently selected value */
  value: V;
  /** The callback to change the value -- new value is passed */
  onChange: (newValue: V) => void;
  /** Defaults to vertical -- will change keybinding direction */
  orientation?: "horizontal" | "vertical";
  children: JSX.Element;
  /** When true, disables the entire listbox */
  disabled?: boolean;
};
type OptionRenderProps = Readonly<{
  selected: () => boolean;
  active: () => boolean;
}>;
type ListboxOptionProps<V, C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    /** The value of the option for when user selects it via pointer or keyboard */
    value: V;
    /** If true, option will be disabled */
    disabled?: boolean;
    /** Render prop for conditional classes -- passed selected and active signal getters */
    classList?: ((renderProps: OptionRenderProps) => ClassList) | ClassList;
    /** Render prop for conditional content -- passed selected and active signal getters */
    children: ((renderProps: OptionRenderProps) => JSX.Element) | JSX.Element;
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
    onPointerMove?: JSX.EventHandlerUnion<C, PointerEvent>;
    onPointerLeave?: JSX.EventHandlerUnion<C, PointerEvent>;
  },
  "id" | "role" | "aria-selected" | "aria-disabled" | "tabindex"
>;
type ListboxOptionsProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    /** A lazy render function */
    children: () => JSX.Element;
    onKeyDown?: JSX.EventHandlerUnion<C, KeyboardEvent>;
  },
  "id" | "role" | "tabindex" | "aria-orientation" | "aria-activedescendant"
>;
type ButtonRenderProps = Readonly<{ open: () => boolean }>;
type ListboxButtonProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    /** Render prop for conditional content -- passed open signal getter */
    children: ((renderProps: ButtonRenderProps) => JSX.Element) | JSX.Element;
    /** Render prop for conditional classes -- passed open signal getter */
    classList?: ((renderProps: ButtonRenderProps) => ClassList) | ClassList;
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
    onKeyDown?: JSX.EventHandlerUnion<C, KeyboardEvent>;
    ["aria-describedby"]?: string;
    ["aria-labelledby"]?: string;
    type?: string;
  },
  "id" | "role" | "aria-haspopup" | "aria-controls" | "aria-expanded" | "disabled"
>;

const LISTBOX_CONTEXT = createContext<GroupContext | null>(null);
const DEFAULT_BUTTON_COMPONENT = "button";
const DEFAULT_OPTIONS_COMPONENT = "ul";
const DEFAULT_OPTION_COMPONENT = "li";

function useListboxContext(label: string) {
  const context = useContext(LISTBOX_CONTEXT);
  if (!context) {
    throw new Error(`<${label} /> cannot be used outside <Listbox />`);
  }
  return context;
}

/** The button to toggle the listbox's open state */
export function ListboxButton<C extends DynamicComponent = typeof DEFAULT_BUTTON_COMPONENT>(
  props: ListboxButtonProps<C>,
) {
  const id = createUniqueId();
  const context = useListboxContext("ListboxButton");
  const labeledBy = useLabeledBy();
  const describedBy = useDescribedBy();
  const renderProps = { open: context.isOpen };
  return (
    <Dynamic
      component={DEFAULT_BUTTON_COMPONENT}
      {...props}
      ref={context.registerButton}
      aria-labelledby={joinSpaceSeparated(props["aria-labelledby"], labeledBy())}
      aria-describedby={joinSpaceSeparated(props["aria-describedby"], describedBy())}
      id={id}
      classList={
        typeof props.classList === "function" ? props.classList(renderProps) : props.classList
      }
      type={getTypeAttributeForDefaultButtonComponent(props.component, props.type)}
      aria-haspopup="true"
      aria-expanded={context.isOpen().toString()}
      aria-controls={context.optionsRefId()}
      disabled={context.isDisabled()}
      onClick={(evt: MouseEvent) => {
        evt.preventDefault();
        context.toggleOpen();
        return callThrough(props.onClick, evt);
      }}
      onKeyDown={(evt: KeyboardEvent) => {
        switch (evt.key) {
          case SPACE_KEY:
          case ENTER_KEY:
          case DOWN_ARROW_KEY:
            evt.preventDefault();
            context.open("first");
            break;
          case UP_ARROW_KEY:
            evt.preventDefault();
            context.open("last");
            break;
        }
        return callThrough(props.onKeyDown, evt);
      }}
    >
      {typeof props.children === "function" ? props.children(renderProps) : props.children}
    </Dynamic>
  );
}

/** The container for options within a listbox */
export function ListboxOptions<C extends DynamicComponent = typeof DEFAULT_OPTIONS_COMPONENT>(
  props: ListboxOptionsProps<C>,
) {
  const context = useListboxContext("ListboxOptions");
  const id = createUniqueId();
  return (
    <Show when={context.isOpen()}>
      {() => (
        <Dynamic
          component={DEFAULT_OPTIONS_COMPONENT}
          {...props}
          ref={context.registerListbox}
          id={id}
          role="listbox"
          tabindex="0"
          aria-orientation={context.orientation()}
          aria-activedescendant={context.activeOptionId()}
          onKeyDown={(evt: KeyboardEvent) => {
            const isHorizontal = context.orientation() === "horizontal";
            switch (evt.key) {
              case TAB_KEY:
                evt.preventDefault();
                break;
              case ENTER_KEY:
                evt.preventDefault();
                context.selectActive();
                break;
              case ESCAPE_KEY:
                evt.preventDefault();
                context.close();
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
              case isHorizontal ? LEFT_ARROW_KEY : UP_ARROW_KEY:
                evt.preventDefault();
                context.activateDirection("prev");
                break;
              case isHorizontal ? RIGHT_ARROW_KEY : DOWN_ARROW_KEY:
                evt.preventDefault();
                context.activateDirection("next");
                break;
            }
            return callThrough(props.onKeyDown, evt);
          }}
        >
          {props.children()}
        </Dynamic>
      )}
    </Show>
  );
}

/** An option within a listbox */
export function ListboxOption<
  V = string,
  C extends DynamicComponent = typeof DEFAULT_OPTION_COMPONENT,
>(props: ListboxOptionProps<V, C>) {
  const id = createUniqueId();
  const [local, rest] = splitProps(props, ["value", "disabled"]);
  let optionRef: undefined | HTMLElement;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const optionRefGetter = () => optionRef!;
  const context = useListboxContext("ListboxOption");
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
      ref={optionRef}
      id={id}
      classList={
        typeof props.classList === "function" ? props.classList(renderProps) : props.classList
      }
      tabindex={local.disabled ? undefined : "-1"}
      role="option"
      aria-disabled={local.disabled ? "true" : undefined}
      // According to the WAI-ARIA best practices, we should use aria-checked for
      // multi-select, but Voice-Over disagrees. So we use aria-checked instead for
      // both single and multi-select.
      aria-selected={selected() ? "true" : undefined}
      onPointerMove={(evt: PointerEvent) => {
        if (!local.disabled) {
          context.activate(local.value);
        }
        return callThrough(props.onPointerMove, evt);
      }}
      onPointerLeave={(evt: PointerEvent) => {
        if (!local.disabled) {
          context.deactivate(local.value);
        }
        return callThrough(props.onPointerLeave, evt);
      }}
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

/** The main listbox component and context provider */
export function Listbox<V = string>(props: ListboxProps<V>) {
  let buttonRef: undefined | null | HTMLElement;
  const [open, setOpen] = createSignal(false);
  const [listboxRef, setListboxRef] = createSignal<HTMLElement | null>(null);

  const [activeValue, setActiveValue] = createSignal<null | V>(null);
  const [options, setOptions] = createSignal<OptionRegistration[]>([]);

  const isDisabled = () => Boolean(props.disabled);
  const isActive = createSelector(activeValue);
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
          first.ref().focus();
        }
        break;
      }
      case "last": {
        const last = nonDisabled[nonDisabled.length - 1];
        if (last) {
          setActiveValue(last.value as ExcludeValue<V>);
          last.ref().focus();
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
          nextElem.focus();
        }
        break;
      }
    }
  };
  const isSelected = createSelector(() => props.value);
  const setHardOpen = (direction: "last" | "first") => {
    setOpen(true);
    const selectedOption = options().find((reg) => isSelected(reg.value));
    if (selectedOption) {
      setActiveValue(selectedOption.value as ExcludeValue<V>);
      selectedOption?.ref().focus();
    } else {
      activateDirection(direction);
    }
  };
  const setHardClosed = () => {
    batch(() => {
      setOpen(false);
      setActiveValue(null);
    });
    buttonRef?.focus({ preventScroll: true });
  };
  const select: GroupContext["select"] = (v) => {
    props.onChange(v as V);
    setHardClosed();
  };
  const isOpen = () => open() && !isDisabled();
  const context: GroupContext = {
    orientation: createMemo(() => props.orientation || "vertical"),
    isSelected,
    isOpen,
    isActive,
    isDisabled,

    activate: setActiveValue as (v: unknown) => void,
    activateDirection,
    deactivate: (v) => setActiveValue((cur) => (v === cur ? null : cur)),

    select,
    selectActive: () => {
      const activeOption = options().find((option) => isActive(option.value));
      if (activeOption) {
        select(activeOption.value);
      }
    },

    open: setHardOpen,
    close: setHardClosed,
    toggleOpen: () => {
      if (open()) {
        setHardClosed();
      } else {
        setHardOpen("first");
      }
    },

    registerOption: (registration) => {
      setOptions((old) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sortByDOM(listboxRef()!, "[role='option']", old.concat(registration), (option) =>
          option.ref(),
        ),
      );
      return () => setOptions((old) => old.filter((value) => value !== registration));
    },
    registerButton: (el) => (buttonRef = el),
    registerListbox: (el) => {
      setListboxRef(el);
    },
    optionsRefId: () => (isOpen() ? listboxRef()?.id : undefined),
    activeOptionId: createMemo(() => activeOptionRef()?.id),
  };
  createClickOutside([() => buttonRef, listboxRef], (evt) => {
    if (open()) {
      setOpen(false);
      if (!isFocusable(evt.target as HTMLElement)) {
        evt.preventDefault();
        buttonRef?.focus();
      }
    }
  });
  return (
    <LabelGroup>
      <DescriptionGroup>
        <LISTBOX_CONTEXT.Provider value={context}>{props.children}</LISTBOX_CONTEXT.Provider>
      </DescriptionGroup>
    </LabelGroup>
  );
}

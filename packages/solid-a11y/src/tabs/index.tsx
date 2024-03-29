import {
  Show,
  type ValidComponent,
  createContext,
  createEffect,
  createSelector,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import { LabelGroup, sortByDOM, sortByIndex, useLabeledBy } from "../group";
import {
  type A11yDynamicProps,
  callThrough,
  callThroughRef,
  focusNextElement,
  getTypeAttributeForDefaultButtonComponent,
  joinSpaceSeparated,
} from "../html";
import {
  DOWN_ARROW_KEY,
  END_KEY,
  ENTER_KEY,
  HOME_KEY,
  LEFT_ARROW_KEY,
  PAGE_DOWN_KEY,
  PAGE_UP_KEY,
  RIGHT_ARROW_KEY,
  SPACE_KEY,
  UP_ARROW_KEY,
} from "../keyboard";

type TabRegistration = {
  ref: HTMLElement;
  disabled: () => boolean | undefined;
};
type PanelRegistration = {
  id: string;
  index: number;
};
type TabsContext = {
  changeToIndexOf: (element: HTMLElement | null | undefined) => void;
  orientation: () => "vertical" | undefined;
  registerTab: (registration: TabRegistration) => () => void;
  registerTabList: (ref: HTMLElement) => void;
  registerPanel: (registration: PanelRegistration) => () => void;
  isSelectedTab: (ref: HTMLElement | undefined) => boolean;
  isSelectedPanel: (id: string) => boolean;
  getAssociatedTabId: (index: number) => undefined | string;
  getAssociatedPanelId: (ref: HTMLElement | undefined) => undefined | string;
  getAllNonDisabledTabs: () => HTMLElement[];
};
type ClassList = JSX.IntrinsicElements["div"]["classList"];
type TabRenderProps = Readonly<{
  selected: () => boolean;
}>;
type GroupProps = {
  /** Defaults to horizontal -- will change keybinding direction */
  orientation?: "horizontal" | "vertical";
  children: JSX.Element;
} & (
  | {
      /** Supply this to control tab group enable the tab group to be controlled -- must be paired with selectedIndex */
      onChange: (newIndex: number) => void;
      /** Supply this to control tab group enable the tab group to be controlled -- must be paired with onChange */
      selectedIndex: number;
      initialIndex?: never;
    }
  | {
      onChange?: never;
      selectedIndex?: never;
      /** Support for initial index in uncontrolled case -- incompatible with onChange/selectedIndex -- defaults to 0 */
      initialIndex?: number;
    }
);
type TabsProps<C extends ValidComponent> = A11yDynamicProps<
  C,
  { ["aria-labelledby"]?: string },
  "role" | "aria-orientation"
>;
type TabProps<C extends ValidComponent> = A11yDynamicProps<
  C,
  {
    /** If truthy, tab will be ignored for keyboard interactions */
    disabled?: boolean;
    /** Render prop for conditional classes -- passed active signal getter */
    classList?: ((renderProps: TabRenderProps) => ClassList) | ClassList;
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
    onKeyDown?: JSX.EventHandlerUnion<C, KeyboardEvent>;
    /** Can accept a function for conditional children -- passed active signal getter */
    children: ((renderProps: TabRenderProps) => JSX.Element) | JSX.Element;
    type?: string;
  },
  "role" | "id" | "tabindex" | "aria-controls" | "aria-selected"
>;
type TabPanelProps<C extends ValidComponent> = A11yDynamicProps<
  C,
  {
    /** Can accept a function for lazy evaluated children */
    children: (() => JSX.Element) | JSX.Element;
    ["aria-labelledby"]?: string;
    /** The index of this Panel -- so TabGroup can associate tabs and panels together and know their order */
    index: number;
  },
  "role" | "id" | "tabindex"
>;

const DEFAULT_TABS_TAG = "div";
const DEFAULT_TAB_TAG = "button";
const DEFAULT_PANEL_TAG = "div";
const TABS_CONTEXT = createContext<TabsContext | null>(null);

function useTabsContext(label: string): TabsContext {
  const context = useContext(TABS_CONTEXT);
  if (!context) {
    throw new Error(`Cannot use <${label} /> outside of a <TabGroup />`);
  }
  return context;
}

/** The required container for <Tab /> components */
export function Tabs<C extends ValidComponent = typeof DEFAULT_TABS_TAG>(props: TabsProps<C>) {
  const labeledBy = useLabeledBy();
  const context = useTabsContext("Tabs");
  return (
    <Dynamic
      component={DEFAULT_TABS_TAG}
      {...props}
      ref={callThroughRef(props, context.registerTabList)}
      role="tablist"
      aria-orientation={context.orientation()}
      aria-labelledby={joinSpaceSeparated(props["aria-labelledby"], labeledBy())}
    />
  );
}

/** The element the user interacts with to select the currently visible content */
export function Tab<C extends ValidComponent = typeof DEFAULT_TAB_TAG>(props: TabProps<C>) {
  const id = createUniqueId();
  const context = useTabsContext("Tab");
  let tabRef: HTMLElement | undefined;
  const renderProps = { selected: () => context.isSelectedTab(tabRef) };
  createEffect(() =>
    onCleanup(
      context.registerTab({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ref: tabRef!,
        disabled: () => props.disabled,
      }),
    ),
  );
  return (
    <Dynamic
      component={DEFAULT_TAB_TAG}
      {...props}
      classList={
        typeof props.classList === "function" ? props.classList(renderProps) : props.classList
      }
      type={getTypeAttributeForDefaultButtonComponent(props.component, props.type)}
      ref={callThroughRef(props, (el) => (tabRef = el))}
      role="tab"
      id={id}
      aria-controls={context.getAssociatedPanelId(tabRef)}
      aria-selected={context.isSelectedTab(tabRef).toString()}
      tabindex={context.isSelectedTab(tabRef) ? 0 : -1}
      onKeyDown={(evt: KeyboardEvent) => {
        const { key } = evt;
        switch (key) {
          case SPACE_KEY:
          case ENTER_KEY: {
            evt.preventDefault();
            context.changeToIndexOf(tabRef);
            return callThrough(props.onKeyDown, evt);
          }
          case HOME_KEY:
          case PAGE_UP_KEY: {
            evt.preventDefault();
            const [firstTab] = context.getAllNonDisabledTabs();
            firstTab?.focus();
            context.changeToIndexOf(firstTab);
            return callThrough(props.onKeyDown, evt);
          }
          case END_KEY:
          case PAGE_DOWN_KEY: {
            evt.preventDefault();
            const tabs = context.getAllNonDisabledTabs();
            const lastTab = tabs[tabs.length - 1];
            lastTab?.focus();
            context.changeToIndexOf(lastTab);
            return callThrough(props.onKeyDown, evt);
          }
        }

        const isVertical = context.orientation() === "vertical";
        const direction =
          (isVertical && key === UP_ARROW_KEY) || (!isVertical && key === LEFT_ARROW_KEY)
            ? "prev"
            : (isVertical && key === DOWN_ARROW_KEY) || (!isVertical && key === RIGHT_ARROW_KEY)
            ? "next"
            : null;
        if (direction) {
          const tabs = context.getAllNonDisabledTabs();
          const element = focusNextElement(tabs, direction);
          context.changeToIndexOf(element);
        }
        return callThrough(props.onKeyDown, evt);
      }}
      onClick={(evt: MouseEvent) => {
        context.changeToIndexOf(tabRef);
        return callThrough(props.onClick, evt);
      }}
    >
      {typeof props.children === "function" ? props.children(renderProps) : props.children}
    </Dynamic>
  );
}

/** A panel of the tabs, only one is visible at a time */
export function TabPanel<C extends ValidComponent = typeof DEFAULT_PANEL_TAG>(
  props: TabPanelProps<C>,
) {
  const [local, rest] = splitProps(props, ["index"]);
  const id = createUniqueId();
  const context = useTabsContext("TabPanel");
  createEffect(() => onCleanup(context.registerPanel({ id, index: local.index })));
  return (
    <Show when={context.isSelectedPanel(id)}>
      {() => (
        <Dynamic
          component={DEFAULT_PANEL_TAG}
          {...rest}
          id={id}
          role="tabpanel"
          tabindex={0}
          aria-labelledby={joinSpaceSeparated(
            props["aria-labelledby"],
            context.getAssociatedTabId(local.index),
          )}
        >
          {typeof props.children === "function" ? props.children() : props.children}
        </Dynamic>
      )}
    </Show>
  );
}

/** The required wrapping context */
export function TabGroup(props: GroupProps) {
  const [selectedIndex, setSelectedIndex] = props.onChange
    ? [() => props.selectedIndex, (newIndex: number) => props.onChange(newIndex)]
    : createSignal(props.initialIndex || 0);
  const [tabs, setTabs] = createSignal<TabRegistration[]>([]);
  const [panels, setPanels] = createSignal<PanelRegistration[]>([]);
  let groupRef: HTMLElement | undefined;
  const context: TabsContext = {
    changeToIndexOf: (element) => {
      const index = element ? tabs().findIndex((tab) => tab.ref === element) : -1;
      if (index > -1) {
        setSelectedIndex(index);
      }
    },
    isSelectedTab: createSelector(() => tabs()[selectedIndex()]?.ref),
    isSelectedPanel: createSelector(() => panels()[selectedIndex()]?.id),
    orientation: () => (props.orientation === "vertical" ? "vertical" : undefined),
    registerTabList: (ref) => (groupRef = ref),
    registerTab: (registration) => {
      setTabs((old) =>
        sortByDOM(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          groupRef!,
          "[role='tab']",
          old.concat(registration),
          (option) => option.ref,
        ),
      );
      return () => setTabs((old) => old.filter((tab) => tab !== registration));
    },
    registerPanel: (registration) => {
      setPanels((old) => old.concat(registration).sort(sortByIndex));
      return () => setPanels((old) => old.filter((panel) => panel !== registration));
    },
    getAssociatedTabId: (index) => tabs()[index]?.ref.id,
    getAssociatedPanelId: (tabRef) => {
      const index = tabs().findIndex((tab) => tab.ref === tabRef);
      return panels()[index]?.id;
    },
    getAllNonDisabledTabs: () =>
      tabs()
        .filter((reg) => !reg.disabled())
        .map((reg) => reg.ref),
  };
  return (
    <TABS_CONTEXT.Provider value={context}>
      <LabelGroup>{props.children}</LabelGroup>
    </TABS_CONTEXT.Provider>
  );
}

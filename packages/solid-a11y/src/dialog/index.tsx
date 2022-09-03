import {
  type ComponentProps,
  type ValidComponent,
  createContext,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic, Portal } from "solid-js/web";

import { DescriptionGroup, Label, LabelGroup, useDescribedBy, useLabeledBy } from "../group";
import {
  type A11yDynamicProps,
  callThrough,
  callThroughRef,
  focusIn,
  joinSpaceSeparated,
} from "../html";
import { ESCAPE_KEY, TAB_KEY } from "../keyboard";

type InertHTMLElement = HTMLElement & { inert: boolean };
type FocusOptions = {
  containerGetter: () => HTMLElement;
  close: (value: false) => void;
  initialFocusRef?: DialogProps<"div">["initialFocusRef"];
};
type DialogOverlayProps<C extends ValidComponent> = A11yDynamicProps<
  C,
  {
    /** Click handler for the overlay element -- this always closes the modal */
    onClick?: JSX.EventHandlerUnion<C, MouseEvent>;
  },
  "aria-hidden"
>;
type DialogProps<C extends ValidComponent> = A11yDynamicProps<
  C,
  {
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    mount?: ComponentProps<typeof Portal>["mount"];
    /** Ref (or ref getter) for the element that should be focused when the dialog initializes */
    initialFocusRef?: HTMLElement | (() => HTMLElement);
    /** Callback whenever a close action is taken by the user */
    onClose: (value: false) => void;
  },
  "role" | "aria-modal"
>;

const DEFAULT_DIALOG_COMPONENT = "div";
const DEFAULT_DIALOG_TITLE_COMPONENT = "h1";
const DIALOG_CONTEXT = createContext<DialogProps<typeof DEFAULT_DIALOG_COMPONENT>["onClose"]>(
  () => {},
);

function useScrollLock() {
  const { documentElement } = document;
  const { overflow: originalOverflow, paddingRight: originalPaddingRight } = documentElement.style;
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
  documentElement.style.paddingRight = `${scrollbarWidth}px`;
  documentElement.style.overflow = "hidden";
  onCleanup(() => {
    documentElement.style.overflow = originalOverflow;
    documentElement.style.paddingRight = originalPaddingRight;
  });
}

function useFocusManagement({ containerGetter, close, initialFocusRef }: FocusOptions) {
  function dialogKeydownHandler(evt: KeyboardEvent) {
    if (evt.key === ESCAPE_KEY) {
      close(false);
    } else if (evt.key === TAB_KEY) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const success = focusIn(containerGetter(), {
        type: "direction",
        direction: evt.shiftKey ? "prev" : "next",
      });
      if (success) {
        evt.preventDefault();
      }
    }
  }
  onMount(() => {
    const preDialogRef = document.activeElement as HTMLElement | null;
    focusIn(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      containerGetter()!,
      initialFocusRef
        ? {
            type: "element",
            element: typeof initialFocusRef === "function" ? initialFocusRef() : initialFocusRef,
          }
        : { type: "direction", direction: "next" },
    );
    window.document.addEventListener("keydown", dialogKeydownHandler);

    onCleanup(() => {
      preDialogRef?.focus({ preventScroll: true });
      window.document.removeEventListener("keydown", dialogKeydownHandler);
    });
  });
}

function forEachHTMLChild(fn: (child: InertHTMLElement) => void) {
  return document.querySelectorAll<Element | InertHTMLElement>("body > *").forEach((child) => {
    if (child instanceof HTMLElement) {
      fn(child);
    }
  });
}

function useInertOthers(containerGetter: () => HTMLElement) {
  onMount(() => {
    const originalAttributesLookup = new Map<
      HTMLElement,
      { ariaHidden: null | string; inert: boolean }
    >();
    const container = containerGetter();
    forEachHTMLChild((child) => {
      if (!child.contains(container)) {
        originalAttributesLookup.set(child, {
          ariaHidden: child.getAttribute("aria-hidden"),
          inert: child.inert,
        });
        child.setAttribute("aria-hidden", "true");
        child.inert = true;
      }
    });

    onCleanup(() => {
      forEachHTMLChild((child) => {
        const originalAttributes = originalAttributesLookup.get(child);
        if (!originalAttributes) {
          return;
        }
        child.inert = originalAttributes.inert;
        if (originalAttributes.ariaHidden === null) {
          child.removeAttribute("aria-hidden");
        } else {
          child.setAttribute("aria-hidden", originalAttributes.ariaHidden);
        }
      });
    });
  });
}

function DialogRoot<C extends ValidComponent>(props: Omit<DialogProps<C>, "onClose" | "mount">) {
  const [local, rest] = splitProps(props, [
    "initialFocusRef",
    "aria-labelledby",
    "aria-describedby",
  ]);
  const labeledBy = useLabeledBy();
  const describedBy = useDescribedBy();
  const close = useContext(DIALOG_CONTEXT);
  let containerRef: undefined | HTMLElement;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const containerGetter = () => containerRef!;
  useScrollLock();
  useFocusManagement({
    containerGetter,
    initialFocusRef: local.initialFocusRef,
    close,
  });
  useInertOthers(containerGetter);
  return (
    <Dynamic
      component={DEFAULT_DIALOG_COMPONENT}
      {...rest}
      ref={callThroughRef(rest, (el) => (containerRef = el))}
      role="dialog"
      aria-modal="true"
      aria-labelledby={joinSpaceSeparated(local["aria-labelledby"], labeledBy())}
      aria-describedby={joinSpaceSeparated(local["aria-describedby"], describedBy())}
    />
  );
}

/** Main Dialog component */
export function Dialog<C extends ValidComponent = typeof DEFAULT_DIALOG_COMPONENT>(
  props: DialogProps<C>,
) {
  const [local, rest] = splitProps(props, ["onClose", "mount"]);
  return (
    <DIALOG_CONTEXT.Provider value={local.onClose}>
      <LabelGroup>
        <DescriptionGroup>
          <Portal mount={local.mount}>
            <DialogRoot<C> {...rest} />
          </Portal>
        </DescriptionGroup>
      </LabelGroup>
    </DIALOG_CONTEXT.Provider>
  );
}

/** For creating overlays on top of content -- closes modal onClick */
export function DialogOverlay<C extends ValidComponent = typeof DEFAULT_DIALOG_COMPONENT>(
  props: DialogOverlayProps<C>,
) {
  const close = useContext(DIALOG_CONTEXT);
  return (
    <Dynamic
      component={DEFAULT_DIALOG_COMPONENT}
      {...props}
      onClick={(evt: MouseEvent) => {
        close(false);
        return callThrough(props.onClick, evt);
      }}
      aria-hidden="true"
    />
  );
}

/** For labeling a modal with its "title" or main idea -- just Label with a more sensible default tag */
export function DialogTitle<C extends ValidComponent = typeof DEFAULT_DIALOG_TITLE_COMPONENT>(
  props: A11yDynamicProps<C, Record<never, never>, "id">,
) {
  return <Label<C> component={DEFAULT_DIALOG_TITLE_COMPONENT} {...props} />;
}

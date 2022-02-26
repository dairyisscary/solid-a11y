import {
  type ComponentProps,
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
  type DynamicComponent,
  callThrough,
  focusIn,
  joinSpaceSeparated,
} from "../html";
import { ESCAPE_KEY, TAB_KEY } from "../keyboard";

type FocusOptions = {
  containerGetter: () => HTMLElement | undefined;
  close: () => void;
  initialFocusRef?: HTMLElement | (() => HTMLElement);
};
type DialogOverlayProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  { onClick?: JSX.EventHandlerUnion<C, MouseEvent> },
  "aria-hidden"
>;
type DialogProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    mount?: ComponentProps<typeof Portal>["mount"];
    initialFocusRef?: FocusOptions["initialFocusRef"];
    onClose: () => void;
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
      close();
    } else if (evt.key === TAB_KEY) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const success = focusIn(containerGetter()!, {
        type: "direction",
        direction: evt.shiftKey ? "prev" : "next",
      });
      if (success) {
        evt.preventDefault();
      }
    }
  }
  let preDialogRef: HTMLElement | null | undefined;
  onMount(() => {
    preDialogRef = document.activeElement as HTMLElement | null;
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
  });
  onCleanup(() => {
    preDialogRef?.focus({ preventScroll: true });
    window.document.removeEventListener("keydown", dialogKeydownHandler);
  });
}

function DialogRoot<C extends DynamicComponent>(props: Omit<DialogProps<C>, "mount">) {
  const [local, rest] = splitProps(props, [
    "initialFocusRef",
    "aria-labelledby",
    "aria-describedby",
  ]);
  const labeledBy = useLabeledBy();
  const describedBy = useDescribedBy();
  const close = useContext(DIALOG_CONTEXT);
  let containerRef: undefined | HTMLElement;
  useScrollLock();
  useFocusManagement({
    containerGetter: () => containerRef,
    initialFocusRef: local.initialFocusRef,
    close,
  });
  return (
    <Dynamic
      component={DEFAULT_DIALOG_COMPONENT}
      {...rest}
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={joinSpaceSeparated(local["aria-labelledby"], labeledBy())}
      aria-describedby={joinSpaceSeparated(local["aria-describedby"], describedBy())}
    />
  );
}

export function Dialog<C extends DynamicComponent = typeof DEFAULT_DIALOG_COMPONENT>(
  props: DialogProps<C>,
) {
  const [local, rest] = splitProps(props, ["mount"]);
  return (
    <DIALOG_CONTEXT.Provider value={props.onClose}>
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

export function DialogOverlay<C extends DynamicComponent = typeof DEFAULT_DIALOG_COMPONENT>(
  props: DialogOverlayProps<C>,
) {
  const close = useContext(DIALOG_CONTEXT);
  return (
    <Dynamic
      component={DEFAULT_DIALOG_COMPONENT}
      {...props}
      onClick={(evt: MouseEvent) => {
        close();
        return callThrough(props.onClick, evt);
      }}
      aria-hidden="true"
    />
  );
}

export function DialogTitle<C extends DynamicComponent = typeof DEFAULT_DIALOG_TITLE_COMPONENT>(
  props: A11yDynamicProps<C, Record<never, never>, "id">,
) {
  return <Label<C> component={DEFAULT_DIALOG_TITLE_COMPONENT} {...props} />;
}

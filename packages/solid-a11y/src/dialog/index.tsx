import {
  type ComponentProps,
  createContext,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import { Dynamic, Portal } from "solid-js/web";

import { DescriptionGroup, Label, LabelGroup, useDescribedBy, useLabeledBy } from "../group";
import {
  type A11yDynamicProps,
  type DynamicComponent,
  callThrough,
  focusIn,
  joinSeperated,
} from "../html";
import { ESCAPE_KEY, TAB_KEY } from "../keyboard";

type DialogOverlayProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  { onClick?: (evt: MouseEvent) => void },
  "aria-hidden"
>;
type DialogProps<C extends DynamicComponent> = A11yDynamicProps<
  C,
  {
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    mount?: ComponentProps<typeof Portal>["mount"];
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

function useFocusManagement(containerRef: () => HTMLElement | undefined, close: () => void) {
  function dialogKeydownHandler(evt: KeyboardEvent) {
    if (evt.key === ESCAPE_KEY) {
      close();
    } else if (evt.key === TAB_KEY) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const success = focusIn(containerRef()!, evt.shiftKey ? "prev" : "next");
      if (success) {
        evt.preventDefault();
      }
    }
  }
  onMount(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    focusIn(containerRef()!, "next");
    window.document.addEventListener("keydown", dialogKeydownHandler);
  });
  onCleanup(() => {
    window.document.removeEventListener("keydown", dialogKeydownHandler);
  });
}

function DialogRoot<C extends DynamicComponent>(props: Omit<DialogProps<C>, "mount">) {
  const [local, rest] = splitProps(props, ["aria-labelledby", "aria-describedby"]);
  const labeledBy = useLabeledBy();
  const describedBy = useDescribedBy();
  const close = useContext(DIALOG_CONTEXT);
  let containerRef: undefined | HTMLElement;
  useScrollLock();
  useFocusManagement(() => containerRef, close);
  return (
    <Dynamic
      component={DEFAULT_DIALOG_COMPONENT}
      {...rest}
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={joinSeperated(local["aria-labelledby"], labeledBy())}
      aria-describedby={joinSeperated(local["aria-describedby"], describedBy())}
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

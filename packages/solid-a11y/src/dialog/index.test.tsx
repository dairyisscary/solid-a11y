import UserEvent from "@testing-library/user-event";
import { type ComponentProps, Show, createSignal } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { render } from "solid-testing-library";

import { Dialog, DialogOverlay, DialogTitle } from ".";
import { Description } from "../group";

type TestDialogProps = Omit<
  Partial<ComponentProps<typeof Dialog>> & ComponentProps<"div">,
  "children"
> & {
  children?: () => JSX.Element;
};

describe("<Dialog />", () => {
  function createDialog(props: TestDialogProps = {}, init = true) {
    const [isShown, setIsShown] = createSignal(init);
    const onClose = jest.fn(() => setIsShown(false));
    const rendered = render(() => (
      <>
        <button type="button" onClick={() => setIsShown((o) => !o)}>
          Toggle me!
        </button>
        <Show when={isShown()}>
          {() => (
            <>
              <Dialog
                onClose={onClose}
                {...props}
                children={
                  <>
                    <DialogOverlay data-testid="overlay" />
                    {props.children?.() || (
                      <button type="button" onClick={onClose} textContent="Done!" />
                    )}
                  </>
                }
              />
            </>
          )}
        </Show>
      </>
    ));
    return { rendered, setIsShown, onClose, user: UserEvent.setup() };
  }

  function getDialogElement(rendered: ReturnType<typeof render>) {
    return rendered.getByRole("dialog") as HTMLElement;
  }

  function toggleOpenDialog(
    rendered: ReturnType<typeof render>,
    user: ReturnType<typeof UserEvent["setup"]>,
  ) {
    return user.click(rendered.getByText("Toggle me!") as HTMLElement);
  }

  function defaultDismissDialog(
    rendered: ReturnType<typeof render>,
    user: ReturnType<typeof UserEvent["setup"]>,
  ) {
    return user.click(rendered.getByText("Done!") as HTMLElement);
  }

  function dismissDialogClickOverlay(
    rendered: ReturnType<typeof render>,
    user: ReturnType<typeof UserEvent["setup"]>,
  ) {
    return user.click(rendered.getByTestId("overlay") as HTMLElement);
  }

  it("should have various built in close options.", async () => {
    const { onClose, rendered, user } = createDialog();
    expect(onClose).not.toHaveBeenCalled();

    await defaultDismissDialog(rendered, user);
    expect(onClose).toHaveBeenCalledTimes(1);

    await toggleOpenDialog(rendered, user);
    await dismissDialogClickOverlay(rendered, user);
    expect(onClose).toHaveBeenCalledTimes(2);

    await toggleOpenDialog(rendered, user);
    await user.keyboard("{escape}");
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("should focus trap.", async () => {
    let firstButton: HTMLButtonElement | undefined;
    let secondButton: HTMLButtonElement | undefined;
    let thirdButton: HTMLButtonElement | undefined;
    const { rendered, user } = createDialog(
      {
        children: () => (
          <>
            <button ref={firstButton} type="button">
              first
            </button>
            <button ref={secondButton} type="button">
              second
            </button>
            <button ref={thirdButton} type="button">
              third
            </button>
          </>
        ),
      },
      false,
    );
    expect(document.activeElement).toBe(document.body);
    const buttonBehind = rendered.getByText("Toggle me!");

    await toggleOpenDialog(rendered, user);
    expect(document.activeElement).toBe(firstButton);

    await user.keyboard("{tab}");
    expect(document.activeElement).not.toBe(buttonBehind);
    expect(document.activeElement).toBe(secondButton);

    await user.keyboard("{tab}");
    expect(document.activeElement).not.toBe(buttonBehind);
    expect(document.activeElement).toBe(thirdButton);

    await user.keyboard("{tab}");
    // round back to first
    expect(document.activeElement).not.toBe(buttonBehind);
    expect(document.activeElement).toBe(firstButton);

    // round forwards to third
    await user.keyboard("{Shift>}{tab}{/Shift}");
    expect(document.activeElement).not.toBe(buttonBehind);
    expect(document.activeElement).toBe(thirdButton);

    await user.keyboard("{Shift>}{tab}{/Shift}");
    expect(document.activeElement).not.toBe(buttonBehind);
    expect(document.activeElement).toBe(secondButton);
  });

  it("initially focus a ref if its given.", async () => {
    let initialFocusRef;
    const button = (
      <button ref={initialFocusRef} type="button">
        my button
      </button>
    );
    const { rendered, user } = createDialog(
      {
        initialFocusRef,
        children: () => (
          <>
            <button type="button">another button</button>
            {button}
          </>
        ),
      },
      false,
    );
    expect(document.activeElement).toBe(document.body);

    await toggleOpenDialog(rendered, user);
    expect(document.activeElement).toBe(button);
  });

  it("should manage focus when no initialFocusRef is passed.", async () => {
    const { rendered, user } = createDialog({}, false);
    expect(document.activeElement).toBe(document.body);

    await toggleOpenDialog(rendered, user);
    expect(document.activeElement).toBe(rendered.getByText("Done!"));
  });

  it("should allow the user to control attributes.", () => {
    const { rendered } = createDialog({
      class: "yoyoyo",
      component: "main",
      "aria-live": "polite",
      children: () => (
        <>
          <DialogTitle class="kowabunga" component="h2">
            hi
          </DialogTitle>
          <p>some more stuff</p>
        </>
      ),
    });
    const dialogElm = getDialogElement(rendered);
    expect(dialogElm.tagName).toBe("MAIN");
    expect(dialogElm.classList).toContain("yoyoyo");
    expect(dialogElm.getAttribute("aria-live")).toBe("polite");
    const title = rendered.getByText("hi") as HTMLElement;
    expect(title.tagName).toBe("H2");
    expect(title.classList).toContain("kowabunga");
    expect(rendered.getByText("some more stuff")).not.toBeNull();
  });

  it("should allow description and labeling.", () => {
    const titleText = "this is my title";
    const descriptionText = "this is my description";
    const { rendered } = createDialog({
      children: () => (
        <>
          <DialogTitle>{titleText}</DialogTitle>
          <Description>{descriptionText}</Description>
        </>
      ),
    });
    const dialogElm = getDialogElement(rendered);
    expect(document.getElementById(dialogElm.getAttribute("aria-labelledby")!)?.textContent).toBe(
      titleText,
    );
    expect(document.getElementById(dialogElm.getAttribute("aria-describedby")!)?.textContent).toBe(
      descriptionText,
    );
  });
});

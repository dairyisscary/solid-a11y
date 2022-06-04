import UserEvent from "@testing-library/user-event";
import { type ComponentProps, createSignal } from "solid-js";
import { render } from "solid-testing-library";
import { describe, expect, it, vi } from "vitest";

import { Switch } from ".";

describe("<Switch />", () => {
  function createSwitch(
    props: Partial<ComponentProps<typeof Switch> & ComponentProps<"div">> = {},
  ) {
    const [checked, setChecked] = createSignal(false);
    const rendered = render(() => <Switch {...props} onChange={setChecked} checked={checked()} />);
    const switchElement = rendered.getByRole("switch") as HTMLElement;
    return { rendered, setChecked, switchElement, user: UserEvent.setup() };
  }

  async function pressKeyWhileFocused(
    element: HTMLElement,
    user: ReturnType<typeof UserEvent["setup"]>,
    keyboard = " ",
  ) {
    if (document.activeElement !== element) {
      element.focus();
    }
    return user.keyboard(keyboard);
  }

  function expectIsChecked(element: HTMLElement, expectation: boolean) {
    expect(element.getAttribute("aria-checked")).toBe(expectation.toString());
  }

  it("should controlled the checked property.", async () => {
    const { switchElement, setChecked, user } = createSwitch();
    expectIsChecked(switchElement, false);

    await user.click(switchElement);
    expectIsChecked(switchElement, true);

    // Can be changed externally
    setChecked(false);
    expectIsChecked(switchElement, false);

    await pressKeyWhileFocused(switchElement, user);
    expectIsChecked(switchElement, true);

    await pressKeyWhileFocused(switchElement, user, "{Enter}");
    expectIsChecked(switchElement, false);
  });

  it("should allow the user to control attributes.", async () => {
    const onClick = vi.fn();
    const onKeyUp = vi.fn();
    const { switchElement, user } = createSwitch({
      component: "div",
      onKeyUp,
      onClick,
      children: <div>child text</div>,
      "aria-labelledby": "myid",
      class: "my-class",
    });
    expect(switchElement.tagName).toBe("DIV");
    expect(switchElement.getAttribute("type")).toBeNull();
    expect(switchElement.getAttribute("aria-labelledby")).toBe("myid");
    expect(switchElement.textContent).toBe("child text");
    expect(switchElement.getAttribute("class")).toBe("my-class");
    expect(onKeyUp).not.toHaveBeenCalled();

    await user.click(switchElement);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyUp).not.toHaveBeenCalled();

    await pressKeyWhileFocused(switchElement, user);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyUp).toHaveBeenCalledTimes(1);
  });

  it("should not prevent focus from changing.", async () => {
    const { switchElement, user } = createSwitch();
    switchElement.focus();
    expect(document.activeElement).toBe(switchElement);

    await user.keyboard("{Tab}");
    expect(document.activeElement).not.toBe(switchElement);
  });
});

import UserEvent from "@testing-library/user-event";
import { For, createSignal } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { render } from "solid-testing-library";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from ".";
import { Description, Label } from "../group";

describe("<Listbox />", () => {
  type OptionValue = "red" | "blue" | "green" | "cyan" | "yellow";
  type StateValue = OptionValue | undefined;
  const defaultOptions = ["red", "blue", "green"].map((color) => ({
    value: color,
  })) as { value: OptionValue; disabled?: boolean }[];

  function createListBox(creationOpts?: {
    optionsProps?: Record<string, unknown>;
    buttonProps?: Record<string, unknown>;
    initValue?: OptionValue;
    extraChildren?: () => JSX.Element;
  }) {
    const [value, setValue] = createSignal<StateValue>(creationOpts?.initValue);
    const [options, setOptions] = createSignal(defaultOptions);
    const [groupDisabled, setGroupDisabled] = createSignal(false);
    const rendered = render(() => (
      <Listbox<StateValue> disabled={groupDisabled()} value={value()} onChange={setValue}>
        {creationOpts?.extraChildren?.()}
        <ListboxButton {...(creationOpts?.buttonProps || {})}>{`Button: ${
          value() || "none"
        }`}</ListboxButton>
        <ListboxOptions {...(creationOpts?.optionsProps || {})}>
          {() => (
            <For each={options()}>
              {(option) => (
                <ListboxOption<OptionValue>
                  value={option.value}
                  disabled={option.disabled}
                  classList={({ selected, active }) => ({ selected: selected(), active: active() })}
                >
                  {({ selected, active }) => (
                    <p>{`${
                      option.value
                    } -- Active: ${active().toString()} - Selected: ${selected().toString()}`}</p>
                  )}
                </ListboxOption>
              )}
            </For>
          )}
        </ListboxOptions>
      </Listbox>
    ));
    return {
      rendered,
      value,
      setValue,
      setGroupDisabled,
      setOptions,
      user: UserEvent.setup(),
    };
  }

  function getListBoxButton(rendered: ReturnType<typeof render>) {
    return rendered.getByText(/^Button: /) as HTMLButtonElement;
  }

  function getOptions(rendered: ReturnType<typeof render>) {
    return rendered.queryAllByRole("option") as HTMLElement[];
  }

  function clickOptionWithValue(
    rendered: ReturnType<typeof render>,
    user: ReturnType<typeof UserEvent["setup"]>,
    value: OptionValue,
  ) {
    return user.click(
      rendered.getByText((text: string) => text.startsWith(`${value} -- `)) as HTMLElement,
    );
  }

  function expectButton(
    rendered: ReturnType<typeof render>,
    expectation: {
      expanded: boolean;
      disabled: boolean;
    },
  ) {
    const button = getListBoxButton(rendered);
    const ariaControls = button.getAttribute("aria-controls");
    if (expectation.expanded) {
      const listing = rendered.getByRole("listbox") as HTMLElement;
      expect(ariaControls).toBe(listing.id);
    } else {
      expect(ariaControls).toBeNull();
    }
    expect(button.getAttribute("aria-expanded")?.toString()).toBe(expectation.expanded.toString());
    expect(button.disabled).toBe(expectation.disabled);
  }

  function expectContainer(
    rendered: ReturnType<typeof render>,
    expectation: {
      orientation?: "horizontal" | "vertical";
      activeDescendantValue: OptionValue;
    },
  ) {
    const listing = rendered.getByRole("listbox") as HTMLElement;
    const desId = listing.getAttribute("aria-activedescendant");
    expect(document.getElementById(desId || "")?.textContent!.replace(/ --.*$/, "")).toBe(
      expectation.activeDescendantValue,
    );
    expect(listing.getAttribute("aria-orientation")).toBe(expectation.orientation || "vertical");
  }

  function serializeOptions(rendered: ReturnType<typeof render>) {
    return getOptions(rendered).map((option) => ({
      classList: Array.from(option.classList).sort(),
      selected: option.getAttribute("aria-selected") === "true",
      disabled: option.getAttribute("aria-disabled") === "true",
      textContent: option.textContent,
    }));
  }

  it("should allow options to change.", async () => {
    const { value, setValue, setOptions, rendered, user } = createListBox({ initValue: "red" });
    expect(value()).toBe("red");

    await user.click(getListBoxButton(rendered));
    expect(serializeOptions(rendered)).toMatchSnapshot("00 baseline, red selected and active");

    setOptions((old) => old.slice(0, 2).concat([{ value: "cyan" }, { value: "yellow" }]));
    expect(serializeOptions(rendered)).toMatchSnapshot(
      "01 add cyan and yellow, remove green, red still selected and active",
    );

    setValue("cyan");
    expect(serializeOptions(rendered)).toMatchSnapshot("02 cyan now selected");

    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(serializeOptions(rendered)).toMatchSnapshot("03 cyan still selected and yellow active");
  });

  it("should render a list of clickable options with a button.", async () => {
    const onOptionsClick = jest.fn();
    const onButtonClick = jest.fn();
    const { value, rendered, user } = createListBox({
      optionsProps: { onClick: onOptionsClick },
      buttonProps: { onClick: onButtonClick },
    });
    // Init with nothing checked
    expect(value()).toBeUndefined();
    expect(document.activeElement).toBe(document.body);
    expect(onButtonClick).not.toHaveBeenCalled();
    expectButton(rendered, { disabled: false, expanded: false });
    expect(serializeOptions(rendered)).toEqual([]);

    await user.click(getListBoxButton(rendered));
    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(onOptionsClick).not.toHaveBeenCalled();
    expect(value()).toBeUndefined();
    expectButton(rendered, { disabled: false, expanded: true });
    expectContainer(rendered, { activeDescendantValue: "red" });
    expect(serializeOptions(rendered)).toMatchSnapshot(
      "00 First active, no selected, nor disabled",
    );

    await clickOptionWithValue(rendered, user, "green");
    expect(value()).toBe("green");
    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(onOptionsClick).toHaveBeenCalledTimes(1);
    expectButton(rendered, { disabled: false, expanded: false });

    await user.click(getListBoxButton(rendered));
    expect(value()).toBe("green");
    expect(onButtonClick).toHaveBeenCalledTimes(2);
    expect(onOptionsClick).toHaveBeenCalledTimes(1);
    expectButton(rendered, { disabled: false, expanded: true });
    expectContainer(rendered, { activeDescendantValue: "green" });
    expect(serializeOptions(rendered)).toMatchSnapshot(
      "01 green active, green selected, nor disabled",
    );

    // Click an already seleted option
    await clickOptionWithValue(rendered, user, "green");
    expect(value()).toBe("green");
    expect(onButtonClick).toHaveBeenCalledTimes(2);
    expect(onOptionsClick).toHaveBeenCalledTimes(2);
    expectButton(rendered, { disabled: false, expanded: false });
  });

  it("should allow keyboard controls on the button.", async () => {
    const onOptionsKeyDown = jest.fn();
    const onButtonKeyDown = jest.fn();
    const { value, setValue, setGroupDisabled, rendered, user } = createListBox({
      buttonProps: { onKeyDown: onButtonKeyDown },
      optionsProps: { onKeyDown: onOptionsKeyDown },
    });

    await user.keyboard("{Tab}");
    expectButton(rendered, { disabled: false, expanded: false });
    expect(value()).toBeUndefined();
    expect(document.activeElement).toBe(getListBoxButton(rendered));
    // Not active on an element in the group so no keydown yet
    expect(onButtonKeyDown).toHaveBeenCalledTimes(0);

    await user.keyboard("{Enter}");
    expectButton(rendered, { disabled: false, expanded: true });
    expect(onButtonKeyDown).toHaveBeenCalledTimes(1);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(0);
    expect(document.activeElement?.textContent).toMatch(/^red --/);
    expect(serializeOptions(rendered)).toMatchSnapshot("00 red active but not selected");

    await user.keyboard("{Escape}");
    expectButton(rendered, { disabled: false, expanded: false });
    expect(document.activeElement).toBe(getListBoxButton(rendered));
    expect(onButtonKeyDown).toHaveBeenCalledTimes(1);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(1);

    await user.keyboard("{ArrowDown}");
    expectButton(rendered, { disabled: false, expanded: true });
    expect(onButtonKeyDown).toHaveBeenCalledTimes(2);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(1);
    expect(document.activeElement?.textContent).toMatch(/^red --/);
    expect(serializeOptions(rendered)).toMatchSnapshot("01 red active but not selected");

    await user.keyboard("{ArrowDown}");
    expect(value()).toBeUndefined();
    expect(onButtonKeyDown).toHaveBeenCalledTimes(2);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(2);
    expect(document.activeElement?.textContent).toMatch(/^blue --/);
    expect(serializeOptions(rendered)).toMatchSnapshot("02 blue active but not selected");

    await user.keyboard("{ArrowUp}");
    expect(value()).toBeUndefined();
    expect(onButtonKeyDown).toHaveBeenCalledTimes(2);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(3);
    expect(document.activeElement?.textContent).toMatch(/^red --/);
    expect(serializeOptions(rendered)).toMatchSnapshot("03 red active but not selected");

    await user.keyboard("{Enter}");
    expect(value()).toBe("red");
    expect(onButtonKeyDown).toHaveBeenCalledTimes(2);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(4);
    expect(document.activeElement).toBe(getListBoxButton(rendered));

    // no change when group is disabled
    setGroupDisabled(true);
    await user.keyboard(" ");
    expectButton(rendered, { disabled: true, expanded: false });
    expect(onButtonKeyDown).toHaveBeenCalledTimes(2);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(4);
    expect(document.activeElement).toBe(getListBoxButton(rendered));

    setGroupDisabled(false);
    setValue(undefined);
    await user.keyboard("{ArrowUp}");
    expect(onButtonKeyDown).toHaveBeenCalledTimes(3);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(4);
    // last element because of up arrow and no value
    expect(document.activeElement?.textContent).toMatch(/^green --/);
    expect(serializeOptions(rendered)).toMatchSnapshot("04 Green active but no selection");

    setValue("green");
    await user.keyboard("{Home}");
    expect(onButtonKeyDown).toHaveBeenCalledTimes(3);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(5);
    expect(document.activeElement?.textContent).toMatch(/^red --/);
    expect(serializeOptions(rendered)).toMatchSnapshot("05 Red active and green selected");

    await user.keyboard("{End}");
    expect(onButtonKeyDown).toHaveBeenCalledTimes(3);
    expect(onOptionsKeyDown).toHaveBeenCalledTimes(6);
    expect(document.activeElement?.textContent).toMatch(/^green --/);
    expect(serializeOptions(rendered)).toMatchSnapshot("06 Green active and active");
  });

  it("should close on click outside.", async () => {
    const { rendered, user } = createListBox();
    expectButton(rendered, { disabled: false, expanded: false });

    await user.click(getListBoxButton(rendered));
    expectButton(rendered, { disabled: false, expanded: true });

    await user.click(document.body);
    expectButton(rendered, { disabled: false, expanded: false });
  });

  it("should allow labeling of the button.", () => {
    const { rendered } = createListBox({
      extraChildren: () => (
        <>
          <Label>This labels the button.</Label>
          <Description>This describes the button.</Description>
        </>
      ),
    });

    const button = getListBoxButton(rendered);
    expect(document.getElementById(button.getAttribute("aria-labelledby")!)!.textContent).toBe(
      "This labels the button.",
    );
    expect(document.getElementById(button.getAttribute("aria-describedby")!)!.textContent).toBe(
      "This describes the button.",
    );
  });
});

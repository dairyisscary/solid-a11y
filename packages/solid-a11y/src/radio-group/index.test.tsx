import UserEvent from "@testing-library/user-event";
import { For, createSignal } from "solid-js";
import { render } from "solid-testing-library";

import { RadioGroup, RadioGroupOption } from ".";
import { Description, Label } from "../group";

describe("<RadioGroup />", () => {
  type OptionValue = "red" | "blue" | "green" | "cyan" | "yellow";
  const defaultOptions = ["red", "blue", "green"].map((color) => ({
    value: color,
  })) as { value: OptionValue; disabled?: boolean }[];

  function createGroup(props: Record<string, unknown> = {}, init?: OptionValue) {
    const [selected, setSelected] = createSignal(init);
    const [options, setOptions] = createSignal(defaultOptions);
    const [groupDisabled, setGroupDisabled] = createSignal(false);
    const rendered = render(() => (
      <RadioGroup<OptionValue | undefined>
        {...props}
        disabled={groupDisabled()}
        value={selected()}
        onChange={setSelected}
      >
        <Label>Group Label Here</Label>
        <Description>Group Description Here</Description>
        <For each={options()}>
          {(option) => (
            <RadioGroupOption<OptionValue>
              value={option.value}
              disabled={option.disabled}
              classList={({ checked, active }) => ({ checked: checked(), active: active() })}
            >
              {({ checked, active }) => (
                <>
                  <Label component="p">{`Label for: ${option.value}`}</Label>
                  <Description component="p">{`Active: ${active().toString()} - Checked: ${checked().toString()}`}</Description>
                </>
              )}
            </RadioGroupOption>
          )}
        </For>
      </RadioGroup>
    ));
    return {
      rendered,
      selected,
      setSelected,
      setGroupDisabled,
      setOptions,
      user: UserEvent.setup(),
    };
  }

  function getRadios(rendered: ReturnType<typeof render>) {
    return rendered.getAllByRole("radio") as HTMLElement[];
  }

  function getRadioWithValue(rendered: ReturnType<typeof render>, value: string) {
    return rendered.getByLabelText(`Label for: ${value}`) as HTMLElement;
  }

  function getCheckedRadio(rendered: ReturnType<typeof render>) {
    const allChecked = rendered.container.querySelectorAll("[aria-checked='true']");
    expect(allChecked.length).toBeLessThan(2);
    expect(allChecked.length).toBeGreaterThan(-1);
    return allChecked[0];
  }

  function getRadioDescription(radio: Element): string | null | undefined {
    const descriptionId = radio.getAttribute("aria-describedby");
    return descriptionId && document.getElementById(descriptionId)?.textContent;
  }

  function getRadioLabel(radio: Element): string | null | undefined {
    const labelId = radio.getAttribute("aria-labelledby");
    return labelId && document.getElementById(labelId)?.textContent;
  }

  function getRadioClassList(radio: Element): string[] {
    return Array.from(radio.classList).sort();
  }

  function getUncheckedRadios(rendered: ReturnType<typeof render>) {
    return rendered.container.querySelectorAll("[aria-checked='false']");
  }

  function serializeRadios(rendered: ReturnType<typeof render>) {
    return getRadios(rendered).map((radio) => ({
      classList: getRadioClassList(radio),
      checked: radio.getAttribute("aria-checked") === "true",
      disabled: radio.getAttribute("aria-disabled") === "true",
      label: getRadioLabel(radio),
      description: getRadioDescription(radio),
    }));
  }

  it("should allow options to change.", () => {
    const { selected, setSelected, setOptions, rendered } = createGroup({}, "red");
    expect(selected()).toBe("red");
    expect(getRadios(rendered)).toHaveLength(defaultOptions.length);

    setOptions((old) => old.slice(0, 2).concat([{ value: "cyan" }, { value: "yellow" }]));
    expect(selected()).toBe("red");
    expect(serializeRadios(rendered)).toMatchSnapshot("00 Red selected with extra options");

    setOptions((old) => old.slice(1));
    // XXX should red still be selected when its no longer on screen?
    expect(selected()).toBe("red");
    expect(serializeRadios(rendered)).toMatchSnapshot("01 Red selected but not in options anymore");

    setSelected("cyan");
    expect(selected()).toBe("cyan");
    expect(serializeRadios(rendered)).toMatchSnapshot("02 Cyan selected in smaller list");
  });

  it("should render a list of clickable options.", async () => {
    const onClick = jest.fn();
    const { selected, rendered, user } = createGroup({ onClick });
    // Init with nothing checked
    expect(getUncheckedRadios(rendered)).toHaveLength(defaultOptions.length);
    expect(getCheckedRadio(rendered)).toBeUndefined();
    expect(selected()).toBeUndefined();
    expect(document.activeElement).toBe(document.body);
    expect(onClick).not.toHaveBeenCalled();
    expect(serializeRadios(rendered)).toMatchSnapshot("00 Nothing active, selected, nor disabled");

    await user.click(getRadioWithValue(rendered, "red"));
    expect(getUncheckedRadios(rendered)).toHaveLength(defaultOptions.length - 1);
    expect(selected()).toBe("red");
    const redRadio = getCheckedRadio(rendered);
    expect(redRadio).toBeTruthy();
    expect(document.activeElement).toBe(redRadio);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(serializeRadios(rendered)).toMatchSnapshot("01 Red active and selected");

    await user.click(getRadioWithValue(rendered, "blue"));
    expect(getUncheckedRadios(rendered)).toHaveLength(defaultOptions.length - 1);
    expect(selected()).toBe("blue");
    const blueRadio = getCheckedRadio(rendered);
    expect(blueRadio).toBeTruthy();
    expect(document.activeElement).toBe(blueRadio);
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(serializeRadios(rendered)).toMatchSnapshot("02 Blue now active and selected");

    // Click an already seleted option
    await user.click(getRadioWithValue(rendered, "blue"));
    expect(getUncheckedRadios(rendered)).toHaveLength(defaultOptions.length - 1);
    expect(selected()).toBe("blue");
    expect(blueRadio).toBeTruthy();
    expect(document.activeElement).toBe(blueRadio);
    expect(onClick).toHaveBeenCalledTimes(3);
    expect(serializeRadios(rendered)).toMatchSnapshot("03 Blue _still_ active and selected");
  });

  it("should allow focus to with tab and selection with space key.", async () => {
    const onKeyDown = jest.fn();
    const { selected, setSelected, setOptions, setGroupDisabled, rendered, user } = createGroup({
      onKeyDown,
    });

    await user.keyboard("{Tab}");
    expect(selected()).toBeUndefined();
    expect(serializeRadios(rendered)).toMatchSnapshot("00 Red active but not selected");
    // We're not active on an element in the group so no keydown yet
    expect(onKeyDown).toHaveBeenCalledTimes(0);

    // no change when group is disabled
    setGroupDisabled(true);
    await user.keyboard(" ");
    expect(selected()).toBeUndefined();
    expect(onKeyDown).toHaveBeenCalledTimes(1);

    setGroupDisabled(false);
    await user.keyboard(" ");
    expect(selected()).toBe("red");
    expect(serializeRadios(rendered)).toMatchSnapshot("01 Red active and selected");
    expect(onKeyDown).toHaveBeenCalledTimes(2);

    await user.keyboard("{Tab}");
    expect(selected()).toBe("red");
    expect(serializeRadios(rendered)).toMatchSnapshot("02 Red still selected, but not active");
    expect(onKeyDown).toHaveBeenCalledTimes(3);
    expect(document.activeElement).toBe(document.body);

    await user.keyboard("{Tab}");
    expect(selected()).toBe("red");
    expect(serializeRadios(rendered)).toMatchSnapshot("03 Red active and selected again");
    expect(onKeyDown).toHaveBeenCalledTimes(3);

    // unset options and now first option should not be tab-able
    setSelected(undefined);
    setOptions((old) => ([{ ...old[0], disabled: true }] as typeof old).concat(old.slice(1)));
    await user.keyboard("{Tab}");
    expect(selected()).toBeUndefined();
    expect(serializeRadios(rendered)).toMatchSnapshot(
      "04 Blue active but not selected, red disabled",
    );

    await user.keyboard(" ");
    expect(selected()).toBe("blue");
  });

  it("should allow the arrow keys to select items.", async () => {
    const onKeyDown = jest.fn();
    const { selected, setGroupDisabled, setOptions, rendered, user } = createGroup({ onKeyDown });
    setOptions((old) => [old[0], old[1], { ...old[2], disabled: true }]);
    await user.keyboard("{Tab} ");
    expect(onKeyDown).toHaveBeenCalledTimes(1);

    await user.keyboard("{ArrowDown}");
    expect(selected()).toBe("blue");
    expect(serializeRadios(rendered)).toMatchSnapshot("00 Blue active and selected");
    expect(onKeyDown).toHaveBeenCalledTimes(2);

    await user.keyboard("{ArrowRight}");
    expect(selected()).toBe("red");
    // skip green as disabled and continue
    expect(serializeRadios(rendered)).toMatchSnapshot("01 Red active and selected");
    expect(onKeyDown).toHaveBeenCalledTimes(3);

    await user.keyboard("{ArrowUp}");
    expect(selected()).toBe("blue");
    // skip green as disabled and continue
    expect(serializeRadios(rendered)).toMatchSnapshot("02 Blue active and selected again");
    expect(onKeyDown).toHaveBeenCalledTimes(4);

    // no change if group is disabled
    setGroupDisabled(true);
    await user.keyboard("{ArrowLeft}");
    expect(selected()).toBe("blue");
    expect(onKeyDown).toHaveBeenCalledTimes(5);
  });
});

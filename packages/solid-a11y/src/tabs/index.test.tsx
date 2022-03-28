import UserEvent from "@testing-library/user-event";
import { createSignal } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { render } from "solid-testing-library";

import { Tab, TabGroup, TabPanel, Tabs } from ".";
import { Label } from "../group";

type TabOptions = {
  controlled?: boolean;
  initialIndex?: number;
  vertical?: boolean;
  disabledIndexes?: Record<number, undefined | (() => boolean)>;
  mainChildren?: () => JSX.Element;
};

describe("<Tabs />", () => {
  function createTabs(options: TabOptions = {}) {
    const [selectedIndex, setSelectedIndex] = createSignal(options.initialIndex ?? 0);
    const disabledIndexes = options?.disabledIndexes || {};
    const rendered = render(() => (
      <TabGroup
        {...(options.controlled
          ? { selectedIndex: selectedIndex(), onChange: setSelectedIndex }
          : { initialIndex: options.initialIndex })}
        orientation={options.vertical ? "vertical" : undefined}
      >
        {options.mainChildren?.()}
        <Tabs>
          <Tab index={0} disabled={disabledIndexes[0]?.()}>
            0 tab
          </Tab>
          <Tab index={1} disabled={disabledIndexes[1]?.()}>
            1 tab
          </Tab>
          <Tab index={2} disabled={disabledIndexes[2]?.()}>
            2 tab
          </Tab>
        </Tabs>
        <TabPanel index={0}>0 panel</TabPanel>
        <TabPanel index={1}>1 panel</TabPanel>
        <TabPanel index={2}>2 panel</TabPanel>
      </TabGroup>
    ));
    return { rendered, selectedIndex, setSelectedIndex, user: UserEvent.setup() };
  }

  function getTabs(rendered: ReturnType<typeof render>) {
    return rendered.getAllByRole("tab") as HTMLElement[];
  }

  function clickTabIndex(
    rendered: ReturnType<typeof render>,
    user: ReturnType<typeof UserEvent["setup"]>,
    index: number,
  ) {
    return user.click(rendered.getByText(`${index} tab`) as HTMLElement);
  }

  function expectTabIsSelected(
    rendered: ReturnType<typeof render>,
    expected: number,
    selectedIndex?: () => number,
  ) {
    if (selectedIndex) {
      expect(selectedIndex()).toBe(expected);
    }
    const tabs = getTabs(rendered);
    const tabsActual = tabs.map((tab) => ({
      ariaSelected: tab.getAttribute("aria-selected"),
      tabindex: tab.getAttribute("tabindex"),
    }));
    expect(tabsActual).toEqual(
      tabs.map((_tab, index) => ({
        ariaSelected: (index === expected).toString(),
        tabindex: index === expected ? "0" : "-1",
      })),
    );

    const visiblePanels = rendered.getAllByText(/\d+ panel/) as HTMLElement[];
    expect(visiblePanels).toHaveLength(1);
    expect(visiblePanels[0].textContent).toBe(`${expected} panel`);
  }

  it("should label the tablist with <Label />.", () => {
    const { rendered } = createTabs({
      mainChildren: () => <Label>This is the group label.</Label>,
    });
    const tabList = rendered.getByRole("tablist") as HTMLElement;
    const labelId = tabList.getAttribute("aria-labelledby")!;
    expect(document.getElementById(labelId)!.textContent).toBe("This is the group label.");
  });

  it("should select elements as the user clicks on them.", async () => {
    const { rendered, user } = createTabs();
    expectTabIsSelected(rendered, 0);

    await clickTabIndex(rendered, user, 1);
    expectTabIsSelected(rendered, 1);

    await clickTabIndex(rendered, user, 0);
    expectTabIsSelected(rendered, 0);

    await clickTabIndex(rendered, user, 2);
    expectTabIsSelected(rendered, 2);
  });

  it("should select elements as the user uses the keyboard.", async () => {
    const { rendered, user } = createTabs();
    expectTabIsSelected(rendered, 0);

    await clickTabIndex(rendered, user, 0);
    expectTabIsSelected(rendered, 0);

    await user.keyboard("{End}");
    expectTabIsSelected(rendered, 2);

    await user.keyboard("{Home}");
    expectTabIsSelected(rendered, 0);

    await user.keyboard("{PageDown}");
    expectTabIsSelected(rendered, 2);

    await user.keyboard("{PageUp}");
    expectTabIsSelected(rendered, 0);

    await user.keyboard("{ArrowRight}");
    expectTabIsSelected(rendered, 1);

    await user.keyboard("{ArrowRight}");
    expectTabIsSelected(rendered, 2);

    await user.keyboard("{ArrowRight}");
    expectTabIsSelected(rendered, 0);

    await user.keyboard("{ArrowLeft}");
    expectTabIsSelected(rendered, 2);

    await user.keyboard("{ArrowLeft}");
    expectTabIsSelected(rendered, 1);
  });

  it("should use up and down arrows when vertical.", async () => {
    const { rendered, user } = createTabs({ vertical: true });
    expectTabIsSelected(rendered, 0);

    await clickTabIndex(rendered, user, 0);
    expectTabIsSelected(rendered, 0);

    await user.keyboard("{ArrowRight}");
    expectTabIsSelected(rendered, 0); // no change

    await user.keyboard("{ArrowDown}");
    expectTabIsSelected(rendered, 1);

    await user.keyboard("{ArrowDown}");
    expectTabIsSelected(rendered, 2);

    await user.keyboard("{ArrowDown}");
    expectTabIsSelected(rendered, 0);

    await user.keyboard("{ArrowUp}");
    expectTabIsSelected(rendered, 2);

    await user.keyboard("{ArrowUp}");
    expectTabIsSelected(rendered, 1);
  });

  it("should allow the selected tab to be controlled.", async () => {
    const { rendered, user, setSelectedIndex, selectedIndex } = createTabs({
      controlled: true,
      initialIndex: 1,
    });
    expectTabIsSelected(rendered, 1, selectedIndex);

    setSelectedIndex(2);
    expectTabIsSelected(rendered, 2, selectedIndex);

    await clickTabIndex(rendered, user, 2);
    expectTabIsSelected(rendered, 2, selectedIndex);

    await user.keyboard("{ArrowLeft}");
    expectTabIsSelected(rendered, 1, selectedIndex);

    await clickTabIndex(rendered, user, 0);
    expectTabIsSelected(rendered, 0, selectedIndex);
  });

  it("should initialize selected index without full control.", async () => {
    const { rendered, user } = createTabs({ initialIndex: 2 });
    expectTabIsSelected(rendered, 2);

    await clickTabIndex(rendered, user, 0);
    expectTabIsSelected(rendered, 0);
  });

  it("should support disabling tabs.", async () => {
    const [firstIndexIsDisabled, setFirstIndexIsDisabled] = createSignal(true);
    const { rendered, user } = createTabs({
      disabledIndexes: {
        1: firstIndexIsDisabled,
      },
    });
    await clickTabIndex(rendered, user, 0);
    expectTabIsSelected(rendered, 0);

    await user.keyboard("{ArrowRight}");
    expectTabIsSelected(rendered, 2); // Skips disabled 1 index

    await clickTabIndex(rendered, user, 1);
    expectTabIsSelected(rendered, 2); // no change

    await clickTabIndex(rendered, user, 2);
    await user.keyboard("{ArrowLeft}");
    expectTabIsSelected(rendered, 0); // Skips disabled 1 index

    setFirstIndexIsDisabled(false);
    await user.keyboard("{ArrowRight}");
    expectTabIsSelected(rendered, 1); // Does _not_ skip disabled 1 index
  });
});

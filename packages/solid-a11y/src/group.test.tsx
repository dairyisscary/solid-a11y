import UserEvent from "@testing-library/user-event";
import { For, Show, createSignal } from "solid-js";
import { render } from "solid-testing-library";
import { describe, expect, it, vi } from "vitest";

import {
  Description,
  DescriptionGroup,
  Label,
  LabelGroup,
  useDescribedBy,
  useLabeledBy,
} from "./group";

describe("Groupings", () => {
  describe("<Description />", () => {
    const DESCRIBED_BY_TEXT = "I have a description";

    function DescribedBy() {
      const describedBy = useDescribedBy();
      return <div aria-describedby={describedBy()}>{DESCRIBED_BY_TEXT}</div>;
    }

    function createDescriptionGroup(initDes?: string[]) {
      const [descriptions, setDescriptions] = createSignal(initDes);
      const rendered = render(() => (
        <DescriptionGroup>
          <DescribedBy />
          <Show when={descriptions()} keyed>
            {(des) => <For each={des}>{(d) => <Description>{d}</Description>}</For>}
          </Show>
        </DescriptionGroup>
      ));
      return { rendered, setDescriptions };
    }

    function getTextOfDescriptions(rendered: ReturnType<typeof render>): string[] {
      const ids = (rendered.getByText(DESCRIBED_BY_TEXT) as HTMLElement).getAttribute(
        "aria-describedby",
      );
      return (ids || "")
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .filter(Boolean)
        .sort() as string[];
    }

    it("should describe the group and work when the description is missing.", () => {
      const { rendered, setDescriptions } = createDescriptionGroup();
      expect(getTextOfDescriptions(rendered)).toEqual([]);

      const description = "a nice description";
      setDescriptions([description]);
      expect(getTextOfDescriptions(rendered)).toEqual([description]);
    });

    it("should work with multiple descriptions.", () => {
      const description = "a nice description";
      const description2 = "a second description";
      const { rendered } = createDescriptionGroup([description2, description]);
      expect(getTextOfDescriptions(rendered)).toEqual([description, description2]);
    });
  });

  describe("<Label />", () => {
    const LABELED_BY_TEXT = "This is the element being labeled";

    function LabeledBy() {
      const labeledBy = useLabeledBy();
      return <div aria-labelledby={labeledBy()}>{LABELED_BY_TEXT}</div>;
    }

    function createLabelGroup(init?: (string | Record<string, unknown>)[]) {
      const [labels, setLabels] = createSignal(init);
      const rendered = render(() => (
        <LabelGroup>
          <LabeledBy />
          <Show when={labels()} keyed>
            {(labels) => (
              <For each={labels}>
                {(l) => (typeof l === "string" ? <Label textContent={l} /> : <Label {...l} />)}
              </For>
            )}
          </Show>
        </LabelGroup>
      ));
      return { rendered, setLabels, user: UserEvent.setup() };
    }

    function getLabels(rendered: ReturnType<typeof render>): HTMLElement[] {
      const ids = (rendered.getByText(LABELED_BY_TEXT) as HTMLElement).getAttribute(
        "aria-labelledby",
      );
      return (ids || "")
        .split(" ")
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];
    }

    function getTextOfLabels(rendered: ReturnType<typeof render>): (null | string)[] {
      const labels = getLabels(rendered);
      return labels.map((elm) => elm.textContent).sort();
    }

    it("should label the group and work when the label is missing.", () => {
      const { rendered, setLabels } = createLabelGroup();
      expect(getTextOfLabels(rendered)).toEqual([]);

      const label = "a nice label";
      setLabels([label]);
      expect(getTextOfLabels(rendered)).toEqual([label]);
    });

    it("should work with multiple labels.", () => {
      const label = "a nice label";
      const label2 = "a second label";
      const { rendered } = createLabelGroup([label, label2]);
      expect(getTextOfLabels(rendered)).toEqual([label, label2]);
    });

    it("should allow other attributes to label.", async () => {
      const onClick = vi.fn();
      const label = { textContent: "first", component: "div", onClick };
      const label2 = { textContent: "second", component: "p" };
      const { rendered, user } = createLabelGroup([label, label2]);
      const renderedLabels = getLabels(rendered);
      expect(renderedLabels).toHaveLength(2);

      const [renderedOne, renderedTwo] = renderedLabels;
      expect(renderedOne.tagName).toBe("DIV");
      expect(renderedOne.textContent).toBe("first");
      expect(renderedTwo.tagName).toBe("P");
      expect(renderedTwo.textContent).toBe("second");
      expect(onClick).not.toHaveBeenCalled();

      await user.click(renderedOne);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});

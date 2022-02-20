import { For, Show, createSignal } from "solid-js";
import { render } from "solid-testing-library";

import { Description, DescriptionGroup, useDescribedBy } from "./group";

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
          <Show when={descriptions()}>
            {(des) => <For each={des}>{(d) => <Description>{d}</Description>}</For>}
          </Show>
        </DescriptionGroup>
      ));
      return { rendered, setDescriptions };
    }

    function getDescriptionText(rendered: ReturnType<typeof render>): null | string[] {
      const ids = (rendered.getByText(DESCRIBED_BY_TEXT) as HTMLElement).getAttribute(
        "aria-describedby",
      );
      return ids
        ? (ids
            .split(" ")
            .map((id) => document.getElementById(id)?.textContent)
            .filter(Boolean)
            .sort() as string[])
        : null;
    }

    it("should describe the group and work when the description is missing.", async () => {
      const { rendered, setDescriptions } = createDescriptionGroup();
      expect(getDescriptionText(rendered)).toBeNull();

      const description = "a nice description";
      setDescriptions([description]);
      expect(getDescriptionText(rendered)).toEqual([description]);
    });

    it("should work with multiple descriptions.", async () => {
      const description = "a nice description";
      const description2 = "a second description";
      const { rendered } = createDescriptionGroup([description2, description]);
      expect(getDescriptionText(rendered)).toEqual([description, description2]);
    });
  });
});

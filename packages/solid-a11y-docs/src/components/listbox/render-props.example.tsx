import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "solid-a11y";
import { createSignal } from "solid-js";

type YesOrNo = "yes" | "no";

export default function RenderPropsExample() {
  const [choice, setChoice] = createSignal<YesOrNo>("yes");
  return (
    <Listbox<YesOrNo> onChange={setChoice} value={choice()}>
      <ListboxButton>
        {/* highlight-next-line */}
        {({ open }) => `Currently ${open() ? "open" : "closed"} for the choice: ${choice()}`}
      </ListboxButton>
      <ListboxOptions>
        {() => (
          <>
            <ListboxOption<YesOrNo>
              value="yes"
              index={0}
              // highlight-next-lines 4
              classList={({ active, selected }) => ({
                "font-semibold": selected(),
                "text-white": active(),
              })}
            >
              {/* highlight-next-lines 5 */}
              {({ active, selected }) =>
                `Yes is ${selected() ? "" : "not "}selected and is ${
                  active() ? "" : "not "
                }focused.`
              }
            </ListboxOption>
            <ListboxOption<YesOrNo> value="no" index={1}>
              No
            </ListboxOption>
          </>
        )}
      </ListboxOptions>
    </Listbox>
  );
}

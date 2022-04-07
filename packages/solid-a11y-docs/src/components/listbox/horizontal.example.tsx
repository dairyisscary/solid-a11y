import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "solid-a11y";
import { createSignal } from "solid-js";

type YesOrNo = "yes" | "no";

export default function HorizontalExample() {
  const [choice, setChoice] = createSignal<YesOrNo>("yes");
  return (
    // highlight-next-lines 1
    <Listbox<YesOrNo> onChange={setChoice} value={choice()} orientation="horizontal">
      <ListboxButton>{choice()}</ListboxButton>
      <ListboxOptions>
        {() => (
          <>
            <ListboxOption<YesOrNo> value="yes" index={0}>
              Yes
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

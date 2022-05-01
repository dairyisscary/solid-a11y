import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "solid-a11y";
import { createSignal } from "solid-js";

type Color = "red" | "green" | "blue";

export default function DisabledExample() {
  const [color, setColor] = createSignal<Color>("green");
  return (
    // highlight-next-lines 2
    // Once user selects red, the entire dropdown is disabled.
    <Listbox<Color> onChange={setColor} value={color()} disabled={color() === "red"}>
      <ListboxButton>{color()}</ListboxButton>
      <ListboxOptions>
        {() => (
          <>
            <ListboxOption<Color> value="red">Red</ListboxOption>
            <ListboxOption<Color> value="green">Green</ListboxOption>
            {/* highlight-next-lines 2 */}
            {/* Blue is not an option for this user */}
            <ListboxOption<Color> disabled value="blue">
              Blue (Out of stock)
            </ListboxOption>
          </>
        )}
      </ListboxOptions>
    </Listbox>
  );
}

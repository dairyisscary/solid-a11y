import {
  Description,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "solid-a11y";
import { createSignal } from "solid-js";

type Color = "red" | "green" | "blue";

export default function LabelExample() {
  const [color, setColor] = createSignal<Color>("green");
  return (
    <Listbox<Color> onChange={setColor} value={color()}>
      {/* highlight-next-lines 2 */}
      <Label>Which color is your favorite?</Label>
      <Description>Choosing a color will affect your preferences for t-shirt color.</Description>
      <ListboxButton>{color()}</ListboxButton>
      <ListboxOptions>
        {() => (
          <>
            <ListboxOption<Color> value="red">Red</ListboxOption>
            <ListboxOption<Color> value="green">Green</ListboxOption>
            <ListboxOption<Color> value="blue">Blue</ListboxOption>
          </>
        )}
      </ListboxOptions>
    </Listbox>
  );
}

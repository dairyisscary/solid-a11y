import { Description, Label, RadioGroup, RadioGroupOption } from "solid-a11y";
import { createSignal } from "solid-js";

type Condiments = "ketchup" | "mustard" | "mayo";

export default function Example() {
  const [value, setValue] = createSignal<Condiments>("ketchup");
  return (
    <RadioGroup<Condiments> value={value()} onChange={setValue}>
      {/* highlight-next-lines 2 */}
      {/* Labels the entire group as a child of RadioGroup */}
      <Label>Which condiment do you like on your french fries?</Label>
      <RadioGroupOption<Condiments> value="ketchup" index={0}>
        {() => (
          <div>
            {/* highlight-next-lines 3 */}
            {/* Labels and describes this particular item */}
            <Label>Ketchup</Label>
            <Description>A sweet and mushy tomato dip!</Description>
          </div>
        )}
      </RadioGroupOption>
      <RadioGroupOption<Condiments> value="mustard" index={0}>
        {() => (
          <div>
            <Label>Mustard</Label>
            <Description>A spicy and acidic flavor!</Description>
          </div>
        )}
      </RadioGroupOption>
      <RadioGroupOption<Condiments> value="mayo" index={0}>
        {() => (
          <div>
            <Label>Mayonasie</Label>
            <Description>A creamy and tangy sauce!</Description>
          </div>
        )}
      </RadioGroupOption>
    </RadioGroup>
  );
}

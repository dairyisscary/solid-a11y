import { Description, Label, RadioGroup, RadioGroupOption } from "solid-a11y";
import { createSignal } from "solid-js";

export function AutomaticExample() {
  const [value, setValue] = createSignal();
  return (
    <RadioGroup value={value()} onChange={setValue}>
      <RadioGroupOption value="apple">
        {() => (
          <>
            <Label>Apple</Label>
            <Description>A tart and sweet fruit.</Description>
          </>
        )}
      </RadioGroupOption>
      <RadioGroupOption value="cucumber">
        {() => (
          <>
            <Label>Cucumber</Label>
            <Description>A fresh green vegetable with a light melon aroma.</Description>
          </>
        )}
      </RadioGroupOption>
    </RadioGroup>
  );
}

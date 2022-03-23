import { Description, Label, RadioGroup, RadioGroupOption } from "solid-a11y";
import { createSignal } from "solid-js";

export function AutomaticExample() {
  const [value, setValue] = createSignal();
  return (
    <RadioGroup value={value()} onChange={setValue}>
      <RadioGroupOption index={0} value="apple">
        {() => (
          <>
            <Label>Apple</Label>
            <Description>A tart and sweet fruit.</Description>
          </>
        )}
      </RadioGroupOption>
      <RadioGroupOption index={1} value="cucumber">
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

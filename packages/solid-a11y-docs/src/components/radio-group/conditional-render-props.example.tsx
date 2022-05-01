import { Label, RadioGroup, RadioGroupOption } from "solid-a11y";
import { createSignal } from "solid-js";

type YesOrNo = "yes" | "no";

export default function Example() {
  const [value, setValue] = createSignal<YesOrNo>("no");
  return (
    <RadioGroup<YesOrNo> value={value()} onChange={setValue}>
      <RadioGroupOption<YesOrNo>
        value="yes"
        // highlight-next-lines 4
        classList={({ checked, active }) => ({
          "text-white": checked(),
          "ring-2 ring-offset-2 ring-offset-sky-300 ring-white ring-opacity-80": active(),
        })}
      >
        {/* highlight-next-lines 7 */}
        {({ checked, active }) => (
          <>
            <Label>Yes</Label>
            <div>{checked() ? "Checked!" : "Not Checked"}</div>
            <div>{active() ? "Focused!" : "Not Focused"}</div>
          </>
        )}
      </RadioGroupOption>

      <RadioGroupOption<YesOrNo> value="no">{() => <Label>No</Label>}</RadioGroupOption>
    </RadioGroup>
  );
}

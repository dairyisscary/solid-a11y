import { Description, DescriptionGroup, Label, LabelGroup, Switch } from "solid-a11y";
import { createSignal } from "solid-js";

export default function Example() {
  const [checked, setChecked] = createSignal(false);
  return (
    // highlight-next-lines 4
    <LabelGroup>
      <DescriptionGroup>
        <Label>Send Email Notifications</Label>
        <Description>Enabling this setting will email you all notification updates.</Description>
        <Switch checked={checked()} onChange={setChecked} />
        {/* highlight-next-lines 2 */}
      </DescriptionGroup>
    </LabelGroup>
  );
}

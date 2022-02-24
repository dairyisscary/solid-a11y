import { Switch } from "solid-a11y";
import { createSignal } from "solid-js";

export default function Example() {
  const [checked, setChecked] = createSignal(false);
  return (
    <Switch checked={checked()} onChange={setChecked}>
      {/* highlight-next-line */}
      <span class="sr-only">Send Email Notifications</span>
    </Switch>
  );
}

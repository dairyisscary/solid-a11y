import { Switch } from "solid-a11y";
import { createSignal } from "solid-js";

export default function Example() {
  const [checked, setChecked] = createSignal(false);
  return (
    <Switch
      checked={checked()}
      onChange={setChecked}
      class="inline-block h-[36px] w-[72px] rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      classList={{ "bg-green-400": checked(), "bg-gray-400": !checked() }}
    >
      <span class="sr-only">Send Email Notifications</span>
      <div
        aria-hidden="true"
        class="pointer-events-none h-[32px] w-[32px] transform rounded-full bg-white drop-shadow-sm transition-transform duration-200 ease-in-out"
        classList={{ "translate-x-[36px]": checked(), "translate-x-0": !checked() }}
      />
    </Switch>
  );
}

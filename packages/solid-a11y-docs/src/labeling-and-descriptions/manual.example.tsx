import { Switch } from "solid-a11y";
import { createSignal, createUniqueId } from "solid-js";

export function ManualExample() {
  const labelId = createUniqueId();
  const descriptionId = createUniqueId();
  const [checked, setChecked] = createSignal(false);
  return (
    <>
      <h1 id={labelId}>Are we going to the moon?</h1>
      <p id={descriptionId}>By turning this on, the boosters are engaged, friend.</p>
      <Switch
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        onChange={setChecked}
        checked={checked()}
      />
    </>
  );
}

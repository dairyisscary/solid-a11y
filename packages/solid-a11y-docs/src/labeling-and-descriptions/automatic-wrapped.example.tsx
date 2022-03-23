import { Description, DescriptionGroup, Label, LabelGroup, Switch } from "solid-a11y";
import { createSignal } from "solid-js";

export function AutomaticExample() {
  const [checked, setChecked] = createSignal(false);
  return (
    <LabelGroup>
      <DescriptionGroup>
        <Label component="h1">Are we going to the moon?</Label>
        <Description>By turning this on, the boosters are engaged, friend.</Description>
        {/*
          This <Switch /> is now aria-labelledby the <Label /> and aria-describedby the <Description /> 
          because it shares a <LabelGroup /> and <DescriptionGroup /> context.
        */}
        <Switch onChange={setChecked} checked={checked()} />
      </DescriptionGroup>
    </LabelGroup>
  );
}

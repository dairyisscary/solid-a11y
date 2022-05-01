import { Description, Label, RadioGroup, RadioGroupOption } from "solid-a11y";
import { For, Show, createSignal } from "solid-js";

type OptionValue = typeof options[number]["value"];

const options = [
  { value: "espresso", label: "Espresso", description: "Rich and sharp" },
  { value: "pour-over", label: "Pour-Over", description: "Refreshing and crisp" },
  { value: "french-press", label: "French Press", description: "Bold and full-bodied" },
  { value: "aero-press", label: "AeroPress", description: "Smooth and clean" },
] as const;

export default function Example() {
  const [value, setValue] = createSignal<OptionValue>();
  return (
    <RadioGroup<OptionValue | undefined>
      class="min-w-[330px] space-y-2"
      value={value()}
      onChange={setValue}
    >
      <For each={options}>
        {(option) => (
          <RadioGroupOption<OptionValue>
            value={option.value}
            class="flex cursor-pointer items-center justify-between rounded-lg px-5 py-4 text-sm shadow-md focus:outline-none"
            classList={({ checked, active }) => ({
              "bg-slate-900 bg-opacity-60 text-white": checked(),
              "bg-white": !checked(),
              "ring-2 ring-offset-2 ring-offset-sky-300 ring-white ring-opacity-80": active(),
            })}
          >
            {({ checked }) => (
              <>
                <div>
                  <Label
                    component="p"
                    class="font-medium"
                    classList={{ "text-gray-900": !checked() }}
                  >
                    {option.label}
                  </Label>
                  <Description
                    component="span"
                    class={checked() ? "text-sky-100" : "text-gray-500"}
                  >
                    {option.description}
                  </Description>
                </div>
                <Show when={checked()}>
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 bg-opacity-60">
                    ✓
                  </div>
                </Show>
              </>
            )}
          </RadioGroupOption>
        )}
      </For>
    </RadioGroup>
  );
}

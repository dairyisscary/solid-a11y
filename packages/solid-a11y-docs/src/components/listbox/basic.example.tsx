import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "solid-a11y";
import { For, Show, createSignal } from "solid-js";

import { NamedSVGIcon } from "@docs/assets/svg-icon";

type Treat = typeof TREATS[number];

const TREATS = [
  { value: "candy", label: "Candy" },
  { value: "fruit", label: "Fruit" },
  { value: "nuts", label: "Nuts" },
  { value: "popcorn", label: "Popcorn" },
];

const searchPredicate = (search: string, treat: Treat) => treat.value.startsWith(search);

export default function BasicExample() {
  const [selectedTreat, setSelectedTreat] = createSignal(TREATS[0]);
  return (
    <div class="relative h-[250px] w-full max-w-md text-gray-900">
      <Listbox<Treat>
        keyboardSearchPredicate={searchPredicate}
        onChange={setSelectedTreat}
        value={selectedTreat()}
      >
        <ListboxButton class="flex w-full cursor-default items-center justify-between gap-3 rounded-lg bg-white py-2 px-3 shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-fuchsia-300">
          {({ open }) => (
            <>
              {selectedTreat().label}
              <NamedSVGIcon
                aria-hidden="true"
                class="h-5 w-5 text-gray-500 transition-transform"
                classList={{ "rotate-180": open() }}
                name="arrow-down"
              />
            </>
          )}
        </ListboxButton>
        <ListboxOptions class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
          {() => (
            <For each={TREATS}>
              {(treat) => (
                <ListboxOption<Treat>
                  class="flex cursor-default select-none items-center gap-3 py-2 px-4 focus:outline-none"
                  classList={({ active, selected }) => ({
                    "text-fuchsia-900 bg-fuchsia-100": active(),
                    "font-semibold": selected(),
                  })}
                  value={treat}
                >
                  {({ selected }) => (
                    <>
                      <span class="h-5 w-5">
                        <Show when={selected()}>
                          <NamedSVGIcon aria-hidden="true" name="check" />
                        </Show>
                      </span>
                      {treat.label}
                    </>
                  )}
                </ListboxOption>
              )}
            </For>
          )}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}

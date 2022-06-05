import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "solid-a11y";
import { For, Show, createMemo, createSignal } from "solid-js";

import { NamedSVGIcon } from "@docs/assets/svg-icon";

type ProgLang = typeof ALLITERATION_PROGRAMMING_LANGS[number];

const ALLITERATION_PROGRAMMING_LANGS = [
  "Elated Elixir",
  "Tilted TypeScript",
  "Happy Haskell",
  "Robust Rust",
  "Silly Scheme",
  "Optimistic OCaml",
] as const;

function stringForSearch(input: string): string {
  return input.toLowerCase().replace(/\s+/g, "");
}

export default function Example() {
  const [selected, setSelected] = createSignal<ProgLang | null>(ALLITERATION_PROGRAMMING_LANGS[0]);
  const [search, setSearch] = createSignal("");
  const filteredLangs = createMemo(() => {
    const searchText = stringForSearch(search());
    return searchText
      ? ALLITERATION_PROGRAMMING_LANGS.filter((lang) => stringForSearch(lang).includes(searchText))
      : ALLITERATION_PROGRAMMING_LANGS;
  });
  return (
    <div class="h-[250px] w-full max-w-md text-gray-900">
      <Combobox<ProgLang | null> value={selected()} onChange={setSelected}>
        <div class="relative overflow-hidden rounded-lg bg-white shadow-md">
          <ComboboxInput
            onInput={(evt: InputEvent) => setSearch((evt.target as HTMLInputElement).value)}
            class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5"
          />
          <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
            {({ open }) => (
              <>
                <span class="sr-only">Choose Programming Language</span>
                <NamedSVGIcon
                  aria-hidden="true"
                  class="h-5 w-5 text-gray-500 transition-transform"
                  classList={{ "rotate-180": open() }}
                  name="arrow-down"
                />
              </>
            )}
          </ComboboxButton>
        </div>
        <div class="relative mt-1">
          <ComboboxOptions class="absolute max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {() => (
              <For
                each={filteredLangs()}
                fallback={
                  <div class="cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                }
              >
                {(lang) => (
                  <ComboboxOption<ProgLang>
                    value={lang}
                    class="select-none py-2 pl-10 pr-4"
                    classList={({ active }) => ({ "bg-teal-600 text-white": active() })}
                  >
                    {({ selected }) => (
                      <span class="flex items-center gap-2">
                        {lang}
                        <Show when={selected()}>
                          <NamedSVGIcon aria-hidden="true" name="check" class="h-5 w-5" />
                        </Show>
                      </span>
                    )}
                  </ComboboxOption>
                )}
              </For>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
}

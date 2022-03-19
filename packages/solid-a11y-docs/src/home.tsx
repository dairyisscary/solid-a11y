import { Link } from "solid-app-router";
import { For } from "solid-js";

import { NamedSVGIcon } from "@docs/assets/svg-icon";
import { ORDERED_COMPONENTS } from "@docs/components";
import { Main } from "@docs/layout";
import { joinSpaceSeparated } from "@docs/utils/html";

export default function Home() {
  return (
    <Main class="w-full">
      <ul class="flex w-full flex-wrap gap-4 md:gap-6">
        <For each={ORDERED_COMPONENTS}>
          {({ key, title, color, icon }) => (
            <li class="w-full md:w-auto">
              <Link
                class={joinSpaceSeparated(
                  color,
                  "block flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-5 px-4 text-white no-underline",
                )}
                href={`/components/${key}`}
              >
                <NamedSVGIcon name={icon} class="h-16 w-16" />
                {title}
              </Link>
            </li>
          )}
        </For>
      </ul>
    </Main>
  );
}

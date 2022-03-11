import { Link } from "solid-app-router";
import { For } from "solid-js";

import { NamedSVGIcon } from "@docs/assets/svg-icon";
import { ORDERED_COMPONENTS } from "@docs/components";
import { Main } from "@docs/layout";
import { joinSpaceSeparated } from "@docs/utils/html";

export default function Home() {
  return (
    <Main class="flex min-w-0 items-start space-x-4 sm:space-x-6 lg:space-x-8">
      <ul class="flex flex-wrap gap-4 lg:gap-8">
        <For each={ORDERED_COMPONENTS}>
          {({ key, title, color, icon }) => (
            <li>
              <Link
                class={joinSpaceSeparated(
                  color,
                  "block flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r p-4 text-white no-underline",
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

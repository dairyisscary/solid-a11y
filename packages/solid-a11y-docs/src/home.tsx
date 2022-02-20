import { Link } from "solid-app-router";
import { For } from "solid-js";

import { ORDERED_COMPONENTS } from "@docs/components";
import { Main } from "@docs/layout";
import { classnames } from "@docs/utils/html";

export default function Home() {
  return (
    <Main class="flex min-w-0 items-start space-x-4 sm:space-x-6 lg:space-x-8">
      <ul class="flex flex-wrap gap-4 lg:gap-8">
        <For each={ORDERED_COMPONENTS}>
          {({ key, title, color }) => (
            <li>
              <Link
                class={classnames(
                  color,
                  "block flex h-36 w-64 items-center justify-center rounded-xl bg-gradient-to-r text-white",
                )}
                href={`/components/${key}`}
              >
                {title}
              </Link>
            </li>
          )}
        </For>
      </ul>
    </Main>
  );
}

import { Link } from "solid-app-router";
import { For } from "solid-js";

import { NamedSVGIcon } from "@docs/assets/svg-icon";
import { TerminalLines } from "@docs/code";
import { ORDERED_COMPONENTS } from "@docs/components";
import { Main } from "@docs/layout";
import { joinSpaceSeparated } from "@docs/utils/html";

export default function Home() {
  return (
    <Main class="w-full">
      <h1 class="mt-20 text-2xl font-bold text-white sm:text-3xl md:max-w-3xl">
        A collection of fully accessible, completely unstyled components for&nbsp;
        <a href="https://www.solidjs.com/">SolidJS</a>.
      </h1>
      <p class="ml-3 mb-20 mt-12 md:max-w-3xl">
        Run
        <TerminalLines lines={["npm install solid-a11y"]} />
        and read the <a href="/design-philosophy">design philosophy</a> to get&nbsp;started.
      </p>
      <ul class="flex w-full flex-wrap gap-4 md:gap-6">
        <For each={ORDERED_COMPONENTS}>
          {({ key, title, color, icon }) => (
            <li class="w-full md:w-56">
              <Link
                class={joinSpaceSeparated(
                  color,
                  "block flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-5 px-4 text-white no-underline shadow-lg md:justify-start",
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

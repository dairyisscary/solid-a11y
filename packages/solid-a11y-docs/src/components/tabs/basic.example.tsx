import { Tab, TabGroup, TabPanel, Tabs } from "solid-a11y";
import { For } from "solid-js";

const TABS = [
  {
    title: "Product Team",
    contentTitle: "Product Powerhouse",
    content: "Our product team kicks butt!",
  },
  {
    title: "Engineering Team",
    contentTitle: "Engineering Evangelicals",
    content: "Our engineering team is stacked!",
  },
  {
    title: "Sales Team",
    contentTitle: "Sales Salamanders",
    content: "Our sales team never stops ringing the gong!",
  },
];

export default function BasicExample() {
  return (
    <div class="w-full max-w-md space-y-3">
      <TabGroup>
        <Tabs class="flex space-x-2">
          <For each={TABS}>
            {(tab, index) => (
              <Tab
                index={index()}
                class="flex-1 border-b-2 p-3 text-sm font-medium ring-white ring-opacity-60 ring-offset-2 ring-offset-amber-400 transition-colors focus:outline-none focus:ring-2"
                classList={({ selected }) => ({
                  "text-amber-700 border-amber-700": selected(),
                  "text-amber-100 border-transparent hover:text-white hover:border-white":
                    !selected(),
                })}
              >
                {tab.title}
              </Tab>
            )}
          </For>
        </Tabs>
        <For each={TABS}>
          {(tab, index) => (
            <TabPanel
              index={index()}
              class="rounded-xl bg-white p-3 text-slate-800 ring-white ring-opacity-60 ring-offset-2 ring-offset-amber-400 focus:outline-none focus:ring-2"
            >
              <h2 class="mb-2 font-semibold">{tab.contentTitle}</h2>
              <p class="text-sm">{tab.content}</p>
            </TabPanel>
          )}
        </For>
      </TabGroup>
    </div>
  );
}

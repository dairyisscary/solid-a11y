export const COMPONENTS = Object.freeze({
  dialog: {
    color: "from-purple-500 to-indigo-500",
    getModule: () => import("@docs/components/dialog/index.mdx"),
    title: "Dialog (Modal)",
    icon: "window" as const,
  },
  "radio-group": {
    color: "from-green-400 to-cyan-500",
    getModule: () => import("@docs/components/radio-group/index.mdx"),
    title: "Radio Group",
    icon: "radio-button" as const,
  },
  switch: {
    color: "from-orange-400 to-pink-600",
    getModule: () => import("@docs/components/switch/index.mdx"),
    title: "Switch (Toggle)",
    icon: "toggle" as const,
  },
  tabs: {
    color: "from-amber-300 to-orange-500",
    getModule: () => import("@docs/components/tabs/index.mdx"),
    title: "Tabs",
    icon: "table" as const,
  },
});

function compare(a: { title: string }, b: { title: string }) {
  return a.title.localeCompare(b.title);
}

export const ORDERED_COMPONENTS = Object.entries(COMPONENTS)
  .map(([key, props]) => ({ ...props, key }))
  .sort(compare);

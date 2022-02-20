export const COMPONENTS = Object.freeze({
  switch: {
    color: "from-orange-400 to-pink-600",
    getModule: () => import("@docs/components/switch/index.mdx"),
    title: "Switch (Toggle)",
  },
});

function compare(a: { title: string }, b: { title: string }) {
  return a.title.localeCompare(b.title);
}

export const ORDERED_COMPONENTS = Object.entries(COMPONENTS)
  .map(([key, props]) => ({ ...props, key }))
  .sort(compare);

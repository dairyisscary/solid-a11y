export const COMPONENTS = Object.freeze({
});

function compare(a: { title: string }, b: { title: string }) {
  return a.title.localeCompare(b.title);
}

export const ORDERED_COMPONENTS = Object.entries(COMPONENTS)
  .map(([key, props]) => ({ ...props, key }))
  .sort(compare);

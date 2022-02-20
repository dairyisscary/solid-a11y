export function classnames(...args: (false | string | null | undefined)[]): string {
  return args.filter(Boolean).join(" ");
}

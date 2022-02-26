export function joinSpaceSeparated(
  ...values: (undefined | false | null | string)[]
): string | undefined {
  return values.filter(Boolean).join(" ") || undefined;
}

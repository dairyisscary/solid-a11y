import { NamedSVGIcon } from "@docs/assets/svg-icon";

export function joinSpaceSeparated(
  ...values: (undefined | false | null | string)[]
): string | undefined {
  return values.filter(Boolean).join(" ") || undefined;
}

export function ExternalLink(props: Omit<JSX.IntrinsicElements["a"], "target" | "rel">) {
  return (
    <a {...props} rel="noreferrer noopener" target="_blank">
      {props.children}
      <NamedSVGIcon class="h-4 w-4 pl-1" name="external-link" />
    </a>
  );
}

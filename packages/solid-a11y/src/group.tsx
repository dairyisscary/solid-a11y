import {
  type ValidComponent,
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  useContext,
} from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import { type A11yDynamicProps, joinSpaceSeparated } from "./html";

type GroupContext = [() => undefined | string, (id: string) => () => void];
type GroupProps<C extends ValidComponent> = A11yDynamicProps<C, Record<never, never>, "id">;

const DEFAULT_LABEL_COMPONENT = "label";
const DEFAULT_DESCRIPTION_COMPONENT = "p";

function makeGroupContext(name: string) {
  const errorMessage = `A <${name} /> was used without a matching <${name}Provider />.`;
  const context = createContext<GroupContext>([
    () => undefined,
    () => {
      throw new Error(errorMessage);
    },
  ]);

  return {
    useBy: function useGroupContext() {
      return useContext(context)[0];
    },
    provider: function GroupProvider(props: { children: JSX.Element }) {
      const [ids, setIds] = createSignal<Set<string>>(new Set());
      const joinedIds = createMemo(() => joinSpaceSeparated(...ids()));
      const register = function registerLabelId(id: string) {
        setIds((ids) => {
          const newIds = new Set(ids);
          newIds.add(id);
          return newIds;
        });
        return () =>
          setIds((ids) => {
            const newIds = new Set(ids);
            newIds.delete(id);
            return newIds;
          });
      };
      return <context.Provider value={[joinedIds, register]}>{props.children}</context.Provider>;
    },
    useRegisterId: function registerId() {
      const id = createUniqueId();
      const [, register] = useContext(context);
      onCleanup(register(id));
      return id;
    },
  };
}

const labelGroupContext = makeGroupContext("Label");
export const useLabeledBy = labelGroupContext.useBy;
export const LabelGroup = labelGroupContext.provider;

export function Label<C extends ValidComponent = typeof DEFAULT_LABEL_COMPONENT>(
  props: GroupProps<C>,
) {
  const id = labelGroupContext.useRegisterId();
  return <Dynamic component={DEFAULT_LABEL_COMPONENT} {...props} id={id} />;
}

const descriptonGroupContext = makeGroupContext("Description");
export const useDescribedBy = descriptonGroupContext.useBy;
export const DescriptionGroup = descriptonGroupContext.provider;

export function Description<C extends ValidComponent = typeof DEFAULT_DESCRIPTION_COMPONENT>(
  props: GroupProps<C>,
) {
  const id = descriptonGroupContext.useRegisterId();
  return <Dynamic component={DEFAULT_DESCRIPTION_COMPONENT} {...props} id={id} />;
}

export function sortByIndex(a: { index: number }, b: { index: number }): number {
  return a.index - b.index;
}

export function sortByDOM<I = { ref: HTMLElement }>(
  groupRef: HTMLElement,
  selector: string,
  oldItems: I[],
  getter: (item: I) => HTMLElement,
): I[] {
  const newItems: I[] = [];
  for (const element of groupRef.querySelectorAll(selector)) {
    const oldOption = oldItems.find((item) => getter(item) === element);
    if (oldOption) {
      newItems.push(oldOption);
    }
  }
  return newItems;
}

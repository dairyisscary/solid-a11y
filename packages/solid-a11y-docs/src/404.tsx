import { Main } from "@docs/layout";

export default function NotFound() {
  return (
    <Main class="flex items-center justify-center">
      <h1 class="mr-4 border-r border-slate-400 py-3 pr-4 text-2xl font-medium text-slate-200">
        404
      </h1>
      <p>This page could not be found.</p>
    </Main>
  );
}

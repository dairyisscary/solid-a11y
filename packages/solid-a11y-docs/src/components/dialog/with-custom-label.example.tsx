import { Description, Dialog, DialogOverlay, DialogTitle } from "solid-a11y";

export default function ExampleWithLabels({ onClose }: { onClose: (value: false) => void }) {
  return (
    <Dialog class="fixed inset-0 z-30 overflow-y-auto" onClose={onClose}>
      <div class="flex min-h-screen items-center justify-center py-5">
        <DialogOverlay class="fixed inset-0 bg-zinc-900/40" />
        <div class="w-full max-w-md transform rounded-2xl bg-slate-800 p-6 text-sm shadow-xl">
          {/* highlight-next-lines 6 */}
          {/* This DialogTitle labels the entire dialog */}
          <DialogTitle class="text-lg font-medium leading-6 text-white">
            Payment successful
          </DialogTitle>
          {/* This Description adds optional context to the dialog */}
          <Description>Payment went through perfectly.</Description>
          <button
            type="button"
            class="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 focus:bg-indigo-600"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </Dialog>
  );
}

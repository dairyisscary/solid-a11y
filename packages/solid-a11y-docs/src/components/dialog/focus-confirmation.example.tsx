import { Dialog, DialogOverlay, DialogTitle } from "solid-a11y";

export default function ExampleWithLabels({ onClose }: { onClose: (value: false) => void }) {
  // highlight-next-line
  let cancelButtonRef: HTMLButtonElement | undefined;
  return (
    <Dialog
      // highlight-next-lines 2
      // Pass in a reference to the button we wish to initially focus.
      initialFocusRef={() => cancelButtonRef!}
      class="fixed inset-0 z-30 overflow-y-auto"
      onClose={onClose}
    >
      <div class="flex min-h-screen items-center justify-center py-5">
        <DialogOverlay class="fixed inset-0 bg-zinc-900/40" />
        <div class="w-full max-w-md transform rounded-2xl bg-slate-800 p-6 text-sm shadow-xl">
          <DialogTitle class="text-lg font-medium leading-6 text-white">
            Are you sure you want to delete all your email?
          </DialogTitle>
          <p>This process cannot be undone!</p>
          <button
            type="button"
            class="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 focus:bg-indigo-600"
          >
            Yes, I'm Sure!
          </button>
          <button
            type="button"
            class="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-300 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-200 focus:bg-indigo-600"
            // highlight-next-line
            ref={cancelButtonRef}
          >
            Whoa, Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
}

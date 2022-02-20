import { Description, Dialog, DialogOverlay, DialogTitle } from "solid-a11y";
import { createSignal } from "solid-js";
import { Show } from "solid-js/web";

export default function Example() {
  const [open, setOpen] = createSignal(true);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        class="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Open dialog
      </button>

      <Show when={open()}>
        <Dialog class="fixed inset-0 z-30 overflow-y-auto" onClose={() => setOpen(false)}>
          <div class="flex min-h-screen items-center justify-center py-5">
            {/* Put in an overlay to capture clicks outside the dialog. */}
            <DialogOverlay class="fixed inset-0 bg-zinc-900/30" />

            {/* Content */}
            <div class="w-full max-w-md transform rounded-2xl bg-slate-700 p-6 text-sm shadow-xl">
              <DialogTitle class="text-lg font-medium leading-6 text-slate-200">
                Payment successful
              </DialogTitle>
              <Description class="mt-2">Your payment went through perfectly.</Description>
              <p class="mt-2">
                You can read more on our <a href="#">payment policy</a>.
              </p>
              <button
                type="button"
                class="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => setOpen(false)}
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </Dialog>
      </Show>
    </>
  );
}

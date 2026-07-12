'use client'

import { Toast as ToastPrimitive } from '@base-ui/react/toast'
import { cn } from '@/lib/utils'
import { toastManager } from '@/lib/toast'

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      className={cn(
        '[--gap:0.5rem] absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom',
        'rounded-xl border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10',
        'select-none transition-[transform,opacity] duration-300',
        'data-starting-style:opacity-0 data-starting-style:translate-y-4',
        'data-ending-style:opacity-0'
      )}
    >
      <ToastPrimitive.Content className="flex items-center gap-3 p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastPrimitive.Title className="text-sm font-semibold text-foreground" />
          <ToastPrimitive.Description className="text-xs text-muted-foreground" />
        </div>
        <ToastPrimitive.Close
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          ✕
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ))
}

export function ToastViewport() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} timeout={3500}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed top-auto right-4 bottom-4 z-[60] mx-auto w-[calc(100vw-2rem)] sm:w-[22rem]">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

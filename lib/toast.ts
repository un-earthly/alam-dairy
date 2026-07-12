import { Toast } from '@base-ui/react/toast'

// Single manager instance so any client component can queue a toast without
// being inside a particular React subtree.
export const toastManager = Toast.createToastManager()

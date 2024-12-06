import type { ToastItem } from "$src/model/component";
import { readonly, writable, type Writable } from "svelte/store";

const toastWritable: Writable<ToastItem[]> = writable([]);
export const TOAST_LIST = readonly(toastWritable);

export const ShowToast = function (
  message,
  type: "success" | "error" | "warning" | "info" = "success",
  icon = null,
  action = () => {},
  closeable = true,
  duration = 3000
) {
  let toast: ToastItem = {
    message: message,
    icon: icon,
    duration: duration,
    action: action,
    closeable: closeable,
    type: type,
  };
  toastWritable.update((toasts) => {
    toasts.push(toast);
    return toasts;
  });
  setTimeout(() => {
    toastWritable.update((toasts) => {
      toasts.shift();
      return toasts;
    });
  }, duration);
};
export const HideToast = function (toast: ToastItem) {
  toastWritable.update((toasts) => {
    toasts.splice(toasts.indexOf(toast), 1);
    return toasts;
  });
};

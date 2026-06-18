import { useContext } from "react";

import {
  ToastContext,
  TOAST_EVENT,
} from "../context/ToastContext";

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider.",
    );
  }

  return context;
}

export function dispatchToast(toast) {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: toast,
    }),
  );
}

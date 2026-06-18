import { createContext } from "react";

export const ToastContext = createContext(null);

export const TOAST_EVENT = "expenseiq:toast";

export const SESSION_EXPIRED_EVENT =
  "expense-tracker:session-expired";

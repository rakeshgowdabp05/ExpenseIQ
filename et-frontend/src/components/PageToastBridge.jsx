import { useEffect } from "react";

import { dispatchToast } from "../hooks/useToast";

const DEFAULT_TITLES = Object.freeze({
  success: "Action completed",
  error: "Action failed",
  warning: "Attention needed",
  info: "Information",
});

export default function PageToastBridge({
  type = "info",
  title,
  message,
  durationMs = 4500,
  onConsumed,
}) {
  useEffect(() => {
    if (!message) {
      return;
    }

    dispatchToast({
      type,
      title:
        title ||
        DEFAULT_TITLES[type] ||
        DEFAULT_TITLES.info,
      message,
      durationMs,
    });

    if (typeof onConsumed === "function") {
      onConsumed();
    }
  }, [
    durationMs,
    message,
    onConsumed,
    title,
    type,
  ]);

  return null;
}

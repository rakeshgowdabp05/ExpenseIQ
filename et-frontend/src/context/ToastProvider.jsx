import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  SESSION_EXPIRED_EVENT,
  TOAST_EVENT,
  ToastContext,
} from "./ToastContext";

const DEFAULT_DURATION_MS = 3600;
const MAX_VISIBLE_TOASTS = 4;
const DEDUPE_WINDOW_MS = 1500;

const TOAST_TONES = Object.freeze({
  success: {
    icon: CheckCircle2,
    accentClass: "bg-emerald-500",
    iconClass:
      "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  },
  error: {
    icon: CircleAlert,
    accentClass: "bg-rose-500",
    iconClass:
      "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  },
  warning: {
    icon: TriangleAlert,
    accentClass: "bg-amber-500",
    iconClass:
      "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  },
  info: {
    icon: Info,
    accentClass: "bg-[#2457d6]",
    iconClass:
      "bg-blue-50 text-[#2457d6] ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  },
});

function normalizeToast(
  toastInput,
  fallbackType = "info",
) {
  if (typeof toastInput === "string") {
    return {
      type: fallbackType,
      title: toastInput,
      message: "",
      durationMs: DEFAULT_DURATION_MS,
    };
  }

  const toast =
    toastInput && typeof toastInput === "object"
      ? toastInput
      : {};

  const title =
    toast.title ||
    toast.message ||
    "Notification";

  return {
    type: toast.type || fallbackType,
    title,
    message:
      toast.message && toast.message !== title
        ? toast.message
        : "",
    durationMs: Number.isFinite(Number(toast.durationMs))
      ? Number(toast.durationMs)
      : DEFAULT_DURATION_MS,
  };
}

export function ToastProvider({
  children,
}) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);
  const recentToastRef = useRef(null);

  const removeToast = useCallback((toastId) => {
    setToasts((currentToasts) =>
      currentToasts.filter(
        (toast) => toast.id !== toastId,
      ),
    );
  }, []);

  const showToast = useCallback((toastInput) => {
    const normalizedToast =
      normalizeToast(toastInput);

    const now = Date.now();

    const dedupeKey = [
      normalizedToast.type,
      normalizedToast.title,
      normalizedToast.message,
    ].join("::");

    const recentToast = recentToastRef.current;

    if (
      recentToast &&
      recentToast.key === dedupeKey &&
      now - recentToast.createdAt < DEDUPE_WINDOW_MS
    ) {
      return recentToast.id;
    }

    counterRef.current += 1;

    const toast = {
      ...normalizedToast,
      id: `${now}-${counterRef.current}`,
    };

    recentToastRef.current = {
      key: dedupeKey,
      id: toast.id,
      createdAt: now,
    };

    setToasts((currentToasts) =>
      [
        toast,
        ...currentToasts,
      ].slice(0, MAX_VISIBLE_TOASTS),
    );

    return toast.id;
  }, []);

  const toastApi = useMemo(
    () => ({
      show: showToast,

      success(toast) {
        return showToast({
          ...normalizeToast(toast, "success"),
          type: "success",
        });
      },

      error(toast) {
        return showToast({
          ...normalizeToast(toast, "error"),
          type: "error",
        });
      },

      warning(toast) {
        return showToast({
          ...normalizeToast(toast, "warning"),
          type: "warning",
        });
      },

      info(toast) {
        return showToast({
          ...normalizeToast(toast, "info"),
          type: "info",
        });
      },

      remove: removeToast,
    }),
    [
      removeToast,
      showToast,
    ],
  );

  useEffect(() => {
    function handleToastEvent(event) {
      showToast(event.detail);
    }

    function handleSessionExpired() {
      showToast({
        type: "warning",
        title: "Session expired",
        message:
          "Please sign in again to continue.",
      });
    }

    window.addEventListener(
      TOAST_EVENT,
      handleToastEvent,
    );

    window.addEventListener(
      SESSION_EXPIRED_EVENT,
      handleSessionExpired,
    );

    return () => {
      window.removeEventListener(
        TOAST_EVENT,
        handleToastEvent,
      );

      window.removeEventListener(
        SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={toastApi}>
      {children}

      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="pointer-events-none fixed inset-x-3 top-3 z-[220] flex flex-col items-stretch gap-2.5 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[380px]"
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onClose,
}) {
  const tone =
    TOAST_TONES[toast.type] ??
    TOAST_TONES.info;

  const IconComponent = tone.icon;

  useEffect(() => {
    if (toast.durationMs === 0) {
      return undefined;
    }

    const timerId = window.setTimeout(
      () => onClose(toast.id),
      toast.durationMs,
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    onClose,
    toast.durationMs,
    toast.id,
  ]);

  return (
    <article
      role="status"
      className="pointer-events-auto relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 pr-3 shadow-[0_18px_42px_-28px_rgba(15,23,42,0.55)] ring-1 ring-slate-950/[0.03] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_54px_-30px_rgba(15,23,42,0.7)] dark:border-slate-700/80 dark:bg-[#0d1628]/95 dark:ring-white/[0.04]"
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${tone.accentClass}`}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3 pl-1">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${tone.iconClass}`}
        >
          <IconComponent className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 tracking-[-0.01em] text-slate-950 dark:text-white">
            {toast.title}
          </p>

          {toast.message && (
            <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onClose(toast.id)}
          aria-label="Dismiss notification"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

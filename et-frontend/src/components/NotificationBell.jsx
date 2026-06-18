import {
  Archive,
  Bell,
  CheckCheck,
  CircleAlert,
  Info,
  LoaderCircle,
  RefreshCw,
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
import { useNavigate } from "react-router";

import { notificationUiText } from "../config/notificationUiText";
import { useToast } from "../hooks/useToast";
import { notificationService } from "../services/notificationService";

const severityConfig = Object.freeze({
  INFO: {
    icon: Info,
    dotClass:
      "bg-blue-500",
    iconClass:
      "text-blue-600 dark:text-blue-300",
  },
  SUCCESS: {
    icon: CheckCheck,
    dotClass:
      "bg-emerald-500",
    iconClass:
      "text-emerald-600 dark:text-emerald-300",
  },
  WARNING: {
    icon: TriangleAlert,
    dotClass:
      "bg-amber-500",
    iconClass:
      "text-amber-600 dark:text-amber-300",
  },
  DANGER: {
    icon: CircleAlert,
    dotClass:
      "bg-rose-500",
    iconClass:
      "text-rose-600 dark:text-rose-300",
  },
});

function getErrorMessage(
  error,
  fallbackMessage,
) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function formatNotificationTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    navigator.language,
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState({
    totalCount: 0,
    unreadCount: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const toast = useToast();
  const navigate = useNavigate();

  const unreadCount = summary.unreadCount || 0;

  const visibleUnreadText = useMemo(() => {
    if (unreadCount <= 0) {
      return "";
    }

    return unreadCount > 99
      ? "99+"
      : String(unreadCount);
  }, [unreadCount]);

  const loadNotifications = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const [
          nextSummary,
          nextNotifications,
        ] = await Promise.all([
          notificationService.getSummary(),
          notificationService.getUnreadNotifications(),
        ]);

        setSummary(nextSummary);
        setNotifications(nextNotifications);
      } catch (error) {
        toast.error({
          title: getErrorMessage(
            error,
            notificationUiText.errors.loadFailed,
          ),
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadNotifications({
        silent: true,
      });
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        dropdownRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );
    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  async function handleRefreshAlerts() {
    setGenerating(true);

    try {
      const response =
        await notificationService.generateAlerts();

      toast.success({
        title: response.message,
      });

      await loadNotifications({
        silent: true,
      });
    } catch (error) {
      toast.error({
        title: getErrorMessage(
          error,
          notificationUiText.errors.refreshFailed,
        ),
      });
    } finally {
      setGenerating(false);
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount <= 0) {
      return;
    }

    setMarkingAll(true);

    try {
      const response =
        await notificationService.markAllAsRead();

      setNotifications([]);
      setSummary((currentSummary) => ({
        ...currentSummary,
        unreadCount: 0,
      }));

      toast.success({
        title: response.message,
      });
    } catch (error) {
      toast.error({
        title: getErrorMessage(
          error,
          notificationUiText.errors.markAllReadFailed,
        ),
      });
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleOpenNotification(notification) {
    if (!notification.read) {
      setActiveActionId(notification.publicId);

      try {
        await notificationService.markAsRead(
          notification.publicId,
        );

        setNotifications((currentNotifications) =>
          currentNotifications.filter(
            (item) =>
              item.publicId !== notification.publicId,
          ),
        );

        setSummary((currentSummary) => ({
          ...currentSummary,
          unreadCount: Math.max(
            0,
            (currentSummary.unreadCount || 0) - 1,
          ),
        }));
      } catch (error) {
        toast.error({
          title: getErrorMessage(
            error,
            notificationUiText.errors.markReadFailed,
          ),
        });
      } finally {
        setActiveActionId(null);
      }
    }

    if (notification.actionUrl) {
      setOpen(false);
      navigate(notification.actionUrl);
    }
  }

  async function handleArchiveNotification(
    event,
    notification,
  ) {
    event.stopPropagation();

    setActiveActionId(notification.publicId);

    try {
      const response =
        await notificationService.archive(
          notification.publicId,
        );

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (item) =>
            item.publicId !== notification.publicId,
        ),
      );

      setSummary((currentSummary) => ({
        totalCount: Math.max(
          0,
          (currentSummary.totalCount || 0) - 1,
        ),
        unreadCount: notification.read
          ? currentSummary.unreadCount || 0
          : Math.max(
              0,
              (currentSummary.unreadCount || 0) - 1,
            ),
      }));

      toast.success({
        title: response.message,
      });
    } catch (error) {
      toast.error({
        title: getErrorMessage(
          error,
          notificationUiText.errors.archiveFailed,
        ),
      });
    } finally {
      setActiveActionId(null);
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={notificationUiText.buttons.open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-[#2457d6]/40 hover:text-[#2457d6] hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-400/40 dark:hover:text-blue-300"
      >
        <Bell className="h-4 w-4" />

        {visibleUnreadText && (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[0.62rem] font-black leading-none text-white shadow-sm dark:border-slate-900">
            {visibleUnreadText}
          </span>
        )}
      </button>

      {open && (
        <section
          ref={dropdownRef}
          className="absolute right-0 top-12 z-50 w-[calc(100vw-1.25rem)] max-w-[24rem] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_26px_70px_-42px_rgba(15,23,42,0.85)] ring-1 ring-slate-950/[0.03] dark:border-slate-700 dark:bg-[#0d1628] dark:ring-white/[0.05] sm:w-[24rem]"
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black tracking-[-0.01em] text-slate-950 dark:text-white">
                  {notificationUiText.title}
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount} {notificationUiText.unread}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <IconActionButton
                  label={notificationUiText.buttons.refreshList}
                  onClick={() => loadNotifications()}
                  disabled={loading}
                  busy={loading}
                  icon={RefreshCw}
                />

                <IconActionButton
                  label={notificationUiText.buttons.refreshAlerts}
                  onClick={handleRefreshAlerts}
                  disabled={generating}
                  busy={generating}
                  icon={Bell}
                  primary
                />

                {unreadCount > 0 && (
                  <IconActionButton
                    label={notificationUiText.buttons.markAllRead}
                    onClick={handleMarkAllRead}
                    disabled={markingAll}
                    busy={markingAll}
                    icon={CheckCheck}
                    success
                  />
                )}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={notificationUiText.buttons.close}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="notification-scrollbar max-h-[24rem] overflow-y-auto overscroll-contain">
            {loading && notifications.length === 0 ? (
              <NotificationLoading />
            ) : notifications.length === 0 ? (
              <NotificationEmpty />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.publicId}
                    notification={notification}
                    busy={
                      activeActionId ===
                      notification.publicId
                    }
                    onOpen={handleOpenNotification}
                    onArchive={
                      handleArchiveNotification
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function IconActionButton({
  label,
  onClick,
  disabled,
  busy,
  icon: Icon,
  primary = false,
  success = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-60",
        primary
          ? "border-blue-100 bg-blue-50 text-[#2457d6] hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
          : "",
        success
          ? "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "",
        !primary && !success
          ? "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          : "",
      ].join(" ")}
    >
      {busy ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </button>
  );
}

function NotificationLoading() {
  return (
    <div>
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 px-4 py-4"
        >
          <div className="h-8 w-8 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />

          <div className="min-w-0 flex-1">
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationEmpty() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Bell className="h-5 w-5" />
      </div>

      <p className="mt-4 text-sm font-black text-slate-900 dark:text-white">
        {notificationUiText.emptyTitle}
      </p>

      <p className="mx-auto mt-1 max-w-64 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {notificationUiText.emptyMessage}
      </p>
    </div>
  );
}

function NotificationItem({
  notification,
  busy,
  onOpen,
  onArchive,
}) {
  const config =
    severityConfig[notification.severity] ??
    severityConfig.INFO;

  const IconComponent = config.icon;

  function handleKeyDown(event) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      onOpen(notification);
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(notification)}
      onKeyDown={handleKeyDown}
      className="group relative cursor-pointer bg-white px-4 py-3.5 outline-none transition hover:bg-slate-50 focus-visible:bg-slate-50 dark:bg-[#0d1628] dark:hover:bg-white/[0.03] dark:focus-visible:bg-white/[0.03]"
    >
      <span
        className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full ${config.dotClass}`}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3 pl-1">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <IconComponent
            className={`h-4 w-4 ${config.iconClass}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-black leading-5 tracking-[-0.01em] text-slate-950 dark:text-white">
            {notification.title}
          </p>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {notification.message}
          </p>

          <p className="mt-2 text-[0.68rem] font-semibold text-slate-400 dark:text-slate-500">
            {formatNotificationTime(
              notification.createdAt,
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={(event) =>
            onArchive(event, notification)
          }
          disabled={busy}
          aria-label={notificationUiText.buttons.archive}
          title={notificationUiText.buttons.archive}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 opacity-100 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-slate-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          {busy ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
        </button>
      </div>
    </article>
  );
}

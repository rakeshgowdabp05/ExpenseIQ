import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Landmark,
  ReceiptText,
  Repeat2,
  Smartphone,
  WalletCards,
} from "lucide-react";
import {
  lazy,
  Suspense,
  createElement,
  useMemo,
} from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

import { useAuth } from "../hooks/useAuth";
import "./landingPageEnhancements.css";

const WebGLFinanceGlobe = lazy(() =>
  import("./WebGLFinanceGlobe"),
);

const GLOBE_ROTATION_CLOCK_STORAGE_KEY =
  "expenseiq:landing-globe-rotation-clock-started-at";

const GLOBE_ROTATION_SPEED_DEGREES_PER_SECOND =
  3.8;

const DEFAULT_GLOBE_CENTER =
  Object.freeze({
    latitude: 12.92072,
    longitude: 77.61166,
  });

const accountChannels = [
  {
    label: "Bank",
    icon: Landmark,
  },
  {
    label: "Wallet",
    icon: WalletCards,
  },
  {
    label: "Card",
    icon: CreditCard,
  },
  {
    label: "Mobile",
    icon: Smartphone,
  },
];

function getSafeWindow() {
  return typeof window === "undefined"
    ? null
    : window;
}

function getStoredRotationStartMs() {
  const safeWindow = getSafeWindow();

  if (!safeWindow) {
    return Date.now();
  }

  const storedValue =
    safeWindow.localStorage.getItem(
      GLOBE_ROTATION_CLOCK_STORAGE_KEY,
    );

  const timestamp =
    Number(storedValue);

  if (
    Number.isFinite(timestamp) &&
    timestamp > 0
  ) {
    return timestamp;
  }

  const now = Date.now();

  safeWindow.localStorage.setItem(
    GLOBE_ROTATION_CLOCK_STORAGE_KEY,
    String(now),
  );

  return now;
}

function createPersistentGlobeRotationClock() {
  return {
    startedAtMs:
      getStoredRotationStartMs(),

    speedDegreesPerSecond:
      GLOBE_ROTATION_SPEED_DEGREES_PER_SECOND,

    defaultLatitude:
      DEFAULT_GLOBE_CENTER.latitude,

    defaultLongitude:
      DEFAULT_GLOBE_CENTER.longitude,
  };
}

export function MoneyMovementPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="marketing-card h-full overflow-hidden p-6 sm:p-7">
      <div className="flex items-start justify-between gap-5 border-b border-slate-200 pb-5">
        <div>
          <h3 className="text-2xl">
            Money movement flow
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6">
            Every confirmed record changes only the accounts connected to that
            transaction.
          </p>
        </div>

        <ReceiptText className="h-7 w-7 shrink-0 text-[#1f55cf]" />
      </div>

      <div className="finance-flow-diagram mt-7">
        <FlowActionCard
          className="finance-flow-income"
          icon={ArrowUpRight}
          eyebrow="Money in"
          title="Income"
          description="Adds the confirmed amount to the selected destination account."
          direction="left"
          reduceMotion={reduceMotion}
        />

        <FlowArrow
          className="finance-flow-arrow-income"
          direction="right"
        />

        <BalanceImpactCard
          reduceMotion={reduceMotion}
        />

        <FlowActionCard
          className="finance-flow-expense"
          icon={ArrowDownRight}
          eyebrow="Money out"
          title="Expense"
          description="Reduces the confirmed amount from the selected source account."
          direction="left"
          reduceMotion={reduceMotion}
        />

        <FlowArrow
          className="finance-flow-arrow-expense"
          direction="right"
        />

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 34,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
            amount: 0.28,
          }}
          transition={{
            duration: 0.58,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="finance-flow-transfer"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] shadow-sm">
            <Repeat2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black text-[#0b1220]">
              Transfers keep both sides connected
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              The source decreases and the destination increases in one secured
              operation, preserving a clear trail on both accounts.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FlowActionCard({
  className,
  icon,
  eyebrow,
  title,
  description,
  direction,
  reduceMotion,
}) {
  const initialX =
    direction === "right"
      ? 48
      : -48;

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              x: initialX,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: false,
        amount: 0.28,
      }}
      transition={{
        duration: 0.58,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`finance-flow-card ${className}`}
    >
      <div className="finance-flow-card-icon">
        {createElement(icon, {
          className: "h-5 w-5",
          "aria-hidden": true,
        })}
      </div>

      <div>
        <p className="finance-flow-eyebrow">
          {eyebrow}
        </p>

        <h4 className="mt-1 text-lg">
          {title}
        </h4>

        <p className="mt-2 text-sm leading-6">
          {description}
        </p>
      </div>
    </motion.article>
  );
}

function BalanceImpactCard({
  reduceMotion,
}) {
  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              x: 48,
              scale: 0.97,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      viewport={{
        once: false,
        amount: 0.28,
      }}
      transition={{
        duration: 0.62,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="finance-flow-balance"
    >
      <div className="finance-flow-balance-ring">
        <WalletCards className="h-7 w-7" />
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-blue-200">
        Account impact
      </p>

      <h4 className="mt-2 text-2xl text-white">
        Balance updated
      </h4>

      <p className="mt-3 max-w-[260px] text-sm leading-6 text-blue-100">
        The visible balance is calculated from confirmed records owned by the
        signed-in user.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span>Validated</span>
        <span>Owned</span>
        <span>Traceable</span>
      </div>
    </motion.article>
  );
}

function FlowArrow({
  className,
  direction,
}) {
  return (
    <div
      className={`finance-flow-arrow ${className}`}
      data-direction={direction}
      aria-hidden="true"
    >
      <span />
    </div>
  );
}

function normalizeUserRegion(user) {
  if (!user) {
    return null;
  }

  return {
    registrationRegionCode:
      user.registrationRegionCode,

    registrationRegionLabel:
      user.registrationRegionLabel,

    registrationLatitude:
      user.registrationLatitude,

    registrationLongitude:
      user.registrationLongitude,

    registrationTimezone:
      user.registrationTimezone,

    registrationLocationSource:
      user.registrationLocationSource ??
      "ACCOUNT_PROFILE",

    registrationLocationCapturedAt:
      user.registrationLocationCapturedAt,
  };
}

function hasGlobeLocation(region) {
  return (
    Number.isFinite(
      Number(
        region?.registrationLatitude,
      ),
    ) &&
    Number.isFinite(
      Number(
        region?.registrationLongitude,
      ),
    )
  );
}

function hasLatinText(value) {
  return /[A-Za-z]/.test(
    String(value ?? ""),
  );
}

function getEnglishLocationLabel(value) {
  const parts = String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter(hasLatinText);

  return parts.join(", ");
}

function getGlobeLocationTitle(region) {
  if (!hasGlobeLocation(region)) {
    return "Interactive global account view";
  }

  const englishLabel =
    getEnglishLocationLabel(
      region?.registrationRegionLabel,
    );

  return (
    englishLabel ||
    "Saved account location"
  );
}

function getGlobeLocationDescription(region) {
  if (!hasGlobeLocation(region)) {
    return "Drag horizontally to explore";
  }

  return `Lat ${Number(
    region.registrationLatitude,
  ).toFixed(5)}, Lng ${Number(
    region.registrationLongitude,
  ).toFixed(5)}`;
}

export function RotatingFinancialEarth() {
  const reduceMotion = useReducedMotion();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  const rotationClock =
    useMemo(
      () => createPersistentGlobeRotationClock(),
      [],
    );

  const profileRegion =
    normalizeUserRegion(user);

  const effectiveRegion =
    isAuthenticated &&
    hasGlobeLocation(profileRegion)
      ? profileRegion
      : null;

  const markerActive =
    hasGlobeLocation(effectiveRegion);

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              x: -72,
              scale: 0.98,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      viewport={{
        once: false,
        amount: 0.2,
      }}
      transition={{
        duration: 0.78,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="financial-earth-visual"
    >
      <div className="financial-earth-canvas-shell">
        <Suspense fallback={<GlobeLoadingState />}>
          <WebGLFinanceGlobe
            userRegion={effectiveRegion}
            reduceMotion={reduceMotion}
            rotationClock={rotationClock}
          />
        </Suspense>

        <div className="financial-earth-status">
          <span
            className={`financial-earth-status-dot ${
              markerActive
                ? "financial-earth-status-dot-active"
                : ""
            }`}
          />

          <div>
            <p>
              {getGlobeLocationTitle(
                effectiveRegion,
              )}
            </p>

            <span>
              {getGlobeLocationDescription(
                effectiveRegion,
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="financial-earth-channels">
        {accountChannels.map((channel) => (
          <div
            key={channel.label}
            className="financial-earth-channel"
          >
            {createElement(channel.icon, {
              className: "h-4 w-4",
              "aria-hidden": true,
            })}

            <span>{channel.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function GlobeLoadingState() {
  return (
    <div className="webgl-globe-loading">
      <div className="webgl-globe-loading-orbit" />

      <p>Preparing interactive globe...</p>
    </div>
  );
}
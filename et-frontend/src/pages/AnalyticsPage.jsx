import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    CalendarDays,
    CircleDollarSign,
    Landmark,
    ReceiptText,
    RefreshCw,
    Repeat2,
    TriangleAlert,
    WalletCards,
  } from "lucide-react";
  import {
    createElement,
    useEffect,
    useMemo,
    useState,
  } from "react";
  import { Link } from "react-router";
  
  import { appRoutes } from "../config/appConfig";
  import { analyticsService } from "../services/analyticsService";
  import { getApiErrorMessage } from "../utils/apiError";
import PageToastBridge from "../components/PageToastBridge";
  
  const COPY = Object.freeze({
    pageEyebrow: "Financial intelligence",
    pageTitle: "Analytics",
    refresh: "Refresh analytics",
    refreshing: "Refreshing...",
    reportingPeriod: "Reporting period",
    applyRange: "Apply range",
    currencyTitle: "Reporting currency",
    currencyDescription:
      "Currency totals remain separate.",
    rangeMissing:
      "Select both the start and end date.",
    rangeReversed:
      "The start date cannot be after the end date.",
    rangeFuture:
      "Analytics cannot include a future date.",
    loadFailure:
      "Unable to load your financial analytics.",
  });
  
  const DATE_PRESETS = Object.freeze([
    {
      value: "CURRENT_MONTH",
      label: "This month",
    },
    {
      value: "LAST_3_MONTHS",
      label: "3 months",
    },
    {
      value: "LAST_6_MONTHS",
      label: "6 months",
    },
    {
      value: "YEAR_TO_DATE",
      label: "Year to date",
    },
  ]);
  
  const MONTHLY_SERIES = Object.freeze([
    {
      key: "income",
      label: "Income",
      barClass: "bg-emerald-500",
    },
    {
      key: "expense",
      label: "Expense",
      barClass: "bg-rose-500",
    },
    {
      key: "transferVolume",
      label: "Transfers",
      barClass: "bg-[#1f55cf]",
    },
  ]);
  
  const METRICS = Object.freeze([
    {
      key: "income",
      label: "Income",
      description:
        "Posted income during the selected period",
      icon: ArrowUpRight,
      iconClass:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
      valueClass:
        "text-emerald-600 dark:text-emerald-300",
    },
    {
      key: "expense",
      label: "Expense",
      description:
        "Posted expenses during the selected period",
      icon: ArrowDownRight,
      iconClass:
        "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
      valueClass:
        "text-rose-600 dark:text-rose-300",
    },
    {
      key: "netCashFlow",
      label: "Net cash flow",
      description:
        "Income minus expenses for this period",
      icon: CircleDollarSign,
      iconClass:
        "bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300",
      valueClass:
        "text-[#0b1220] dark:text-white",
    },
    {
      key: "transferVolume",
      label: "Transfer volume",
      description:
        "Money moved between your own accounts",
      icon: Repeat2,
      iconClass:
        "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
      valueClass:
        "text-violet-600 dark:text-violet-300",
    },
  ]);
  
  function getLocale() {
    return typeof navigator !== "undefined" &&
      navigator.language
      ? navigator.language
      : "en";
  }
  
  function toNumber(value) {
    const number = Number(value ?? 0);
  
    return Number.isFinite(number)
      ? number
      : 0;
  }
  
  function toDateInputValue(date) {
    const year = date.getFullYear();
  
    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");
  
    const day = String(
      date.getDate(),
    ).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }
  
  function parseLocalDate(value) {
    if (!value) {
      return null;
    }
  
    const [year, month, day] = value
      .split("-")
      .map(Number);
  
    if (!year || !month || !day) {
      return null;
    }
  
    return new Date(
      year,
      month - 1,
      day,
    );
  }
  
  function startOfMonth(date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    );
  }
  
  function addMonths(date, amount) {
    return new Date(
      date.getFullYear(),
      date.getMonth() + amount,
      1,
    );
  }
  
  function getPresetRange(preset) {
    const today = new Date();
  
    const toDate =
      toDateInputValue(today);
  
    switch (preset) {
      case "CURRENT_MONTH":
        return {
          fromDate:
            toDateInputValue(
              startOfMonth(today),
            ),
          toDate,
        };
  
      case "LAST_3_MONTHS":
        return {
          fromDate:
            toDateInputValue(
              addMonths(
                startOfMonth(today),
                -2,
              ),
            ),
          toDate,
        };
  
      case "LAST_6_MONTHS":
        return {
          fromDate:
            toDateInputValue(
              addMonths(
                startOfMonth(today),
                -5,
              ),
            ),
          toDate,
        };
  
      case "YEAR_TO_DATE":
        return {
          fromDate:
            `${today.getFullYear()}-01-01`,
          toDate,
        };
  
      default:
        return null;
    }
  }
  
  function detectPreset(
    fromDate,
    toDate,
  ) {
    return (
      DATE_PRESETS.find(
        (preset) => {
          const range =
            getPresetRange(
              preset.value,
            );
  
          return (
            range?.fromDate ===
              fromDate &&
            range?.toDate === toDate
          );
        },
      )?.value ?? "CUSTOM"
    );
  }
  
  function formatCurrency(
    value,
    currencyCode,
  ) {
    const number = toNumber(value);
  
    if (!currencyCode) {
      return new Intl.NumberFormat(
        getLocale(),
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ).format(number);
    }
  
    try {
      return new Intl.NumberFormat(
        getLocale(),
        {
          style: "currency",
          currency: currencyCode,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ).format(number);
    } catch {
      return `${currencyCode} ${number.toFixed(
        2,
      )}`;
    }
  }
  
  function formatCompactCurrency(
    value,
    currencyCode,
  ) {
    const number = toNumber(value);
  
    if (!currencyCode) {
      return new Intl.NumberFormat(
        getLocale(),
        {
          notation: "compact",
          maximumFractionDigits: 1,
        },
      ).format(number);
    }
  
    try {
      return new Intl.NumberFormat(
        getLocale(),
        {
          style: "currency",
          currency: currencyCode,
          notation: "compact",
          maximumFractionDigits: 1,
        },
      ).format(number);
    } catch {
      return formatCurrency(
        value,
        currencyCode,
      );
    }
  }
  
  function formatDate(value) {
    const date =
      parseLocalDate(value);
  
    if (!date) {
      return value || "-";
    }
  
    return new Intl.DateTimeFormat(
      getLocale(),
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(date);
  }
  
  function formatRange(
    fromDate,
    toDate,
  ) {
    return fromDate && toDate
      ? `${formatDate(
          fromDate,
        )} - ${formatDate(toDate)}`
      : "Analytics period";
  }
  
  function formatMonthLabel(item) {
    const rawValue =
      item?.monthLabel ??
      item?.label ??
      item?.month ??
      item?.yearMonth ??
      item?.periodStart ??
      item?.date;
  
    if (!rawValue) {
      return "Period";
    }
  
    const match = String(
      rawValue,
    ).match(
      /^([0-9]{4})-([0-9]{2})/,
    );
  
    if (!match) {
      return String(rawValue);
    }
  
    return new Intl.DateTimeFormat(
      getLocale(),
      {
        month: "short",
        year: "2-digit",
      },
    ).format(
      new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        1,
      ),
    );
  }
  
  function getItemLabel(
    item,
    fallback,
  ) {
    return (
      item?.categoryName ??
      item?.accountName ??
      item?.weekdayLabel ??
      item?.weekdayName ??
      item?.dayLabel ??
      item?.dayName ??
      item?.dayOfWeek ??
      item?.weekday ??
      item?.name ??
      item?.label ??
      fallback
    );
  }
  
  function getTransactionCount(item) {
    return toNumber(
      item?.transactionCount ??
        item?.expenseTransactionCount ??
        item?.count,
    );
  }
  
  function getChange(
    currentValue,
    previousValue,
  ) {
    const current =
      toNumber(currentValue);
  
    const previous =
      toNumber(previousValue);
  
    if (previous === 0) {
      return current === 0
        ? {
            percentage: 0,
            direction: "FLAT",
            newActivity: false,
          }
        : {
            percentage: null,
            direction:
              current > 0
                ? "UP"
                : "DOWN",
            newActivity: true,
          };
    }
  
    const percentage =
      ((current - previous) /
        Math.abs(previous)) *
      100;
  
    return {
      percentage,
      direction:
        percentage > 0
          ? "UP"
          : percentage < 0
            ? "DOWN"
            : "FLAT",
      newActivity: false,
    };
  }
  
  function SectionHeader({
    eyebrow,
    title,
    description,
    icon,
  }) {
    return (
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[#1f55cf] dark:text-blue-300">
            {eyebrow}
          </p>
  
          <h2 className="mt-2 text-[1.45rem] font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
            {title}
          </h2>
  
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
  
        {icon && (
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] sm:flex dark:bg-blue-500/10 dark:text-blue-300">
            {createElement(icon, {
              className: "h-5 w-5",
              "aria-hidden": true,
            })}
          </div>
        )}
      </div>
    );
  }
  
  function LoadingState() {
    return (
      <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 overflow-x-hidden">
        <div className="animate-pulse">
          <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
  
          <div className="mt-4 h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
  
          <div className="mt-3 h-4 max-w-xl rounded bg-slate-100 dark:bg-slate-800" />
  
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              "one",
              "two",
              "three",
              "four",
            ].map((key) => (
              <div
                key={key}
                className="h-40 rounded-[1.4rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#101a2c]"
              />
            ))}
          </div>
  
          <div className="mt-6 h-[390px] rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#101a2c]" />
        </div>
      </div>
    );
  }
  
  function ErrorState({
    message,
    onRetry,
  }) {
    return (
      <div className="flex min-h-[520px] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-[1.5rem] border border-rose-200 bg-white p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-rose-500/20 dark:bg-[#101a2c]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <TriangleAlert className="h-6 w-6" />
          </div>
  
          <h2 className="mt-5 text-xl font-extrabold text-[#0b1220] dark:text-white">
            Analytics could not be loaded
          </h2>
  
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {message}
          </p>
  
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-5 text-sm font-extrabold text-white transition hover:bg-[#1848b5]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  function EmptyAnalytics() {
    return (
      <section className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.055)] dark:border-slate-800 dark:bg-[#101a2c]">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-7 sm:p-9 lg:p-11">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
              <BarChart3 className="h-6 w-6" />
            </div>
  
            <p className="mt-7 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[#1f55cf] dark:text-blue-300">
              No posted activity
            </p>
  
            <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-[-0.035em] text-[#080808] dark:text-white">
              Your charts will build from
              real transactions
            </h2>
  
            <p className="mt-4 max-w-xl text-[0.95rem] leading-7 text-slate-600 dark:text-slate-400">
              Record posted income, expenses,
              or transfers. ExpenseIQ will
              calculate every chart without
              inserting demo values.
            </p>
  
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={appRoutes.transactions}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white transition hover:bg-[#1848b5]"
              >
                <ReceiptText className="h-4 w-4" />
                Add transaction
              </Link>
  
              <Link
                to={appRoutes.accounts}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-extrabold text-[#0b1220] transition hover:border-[#1f55cf] hover:text-[#1f55cf] dark:border-slate-700 dark:bg-[#101a2c] dark:text-white"
              >
                Review accounts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
  
          <div className="border-t border-slate-200 bg-[#f8fafc] p-7 dark:border-slate-800 dark:bg-[#0b1424] sm:p-9 lg:border-l lg:border-t-0 lg:p-11">
            <p className="text-sm font-extrabold text-[#0b1220] dark:text-white">
              Available after activity is
              recorded
            </p>
  
            <div className="mt-6 space-y-4">
              <EmptyFeature
                icon={CircleDollarSign}
                title="Cash-flow totals"
                description="Income, expenses, transfers, and net cash flow."
              />
  
              <EmptyFeature
                icon={BarChart3}
                title="Monthly trends"
                description="Time-based comparison across the selected range."
              />
  
              <EmptyFeature
                icon={Landmark}
                title="Spending breakdowns"
                description="Distribution by category, account, and weekday."
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  function EmptyFeature({
    icon,
    title,
    description,
  }) {
    return (
      <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#101a2c]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
          {createElement(icon, {
            className: "h-4.5 w-4.5",
            "aria-hidden": true,
          })}
        </div>
  
        <div>
          <p className="text-sm font-extrabold text-[#0b1220] dark:text-white">
            {title}
          </p>
  
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
    );
  }
  
  function ChangeBadge({
    currentValue,
    previousValue,
  }) {
    const change = getChange(
      currentValue,
      previousValue,
    );
  
    const Icon =
      change.direction === "UP"
        ? ArrowUpRight
        : change.direction === "DOWN"
          ? ArrowDownRight
          : Repeat2;
  
    const className =
      change.direction === "UP"
        ? "bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300"
        : change.direction === "DOWN"
          ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold ${className}`}
      >
        <Icon className="h-3 w-3" />
  
        {change.newActivity
          ? "New activity"
          : `${Math.abs(
              change.percentage ?? 0,
            ).toFixed(1)}%`}
      </span>
    );
  }
  
  function MetricCard({
    metric,
    currentPeriod,
    previousPeriod,
    currencyCode,
  }) {
    return (
      <article className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-[#101a2c]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {metric.label}
            </p>
  
            <p
              className={`mt-3 truncate text-[1.75rem] font-extrabold tracking-[-0.04em] tabular-nums ${metric.valueClass}`}
            >
              {formatCurrency(
                currentPeriod?.[
                  metric.key
                ],
                currencyCode,
              )}
            </p>
  
            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {metric.description}
            </p>
          </div>
  
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${metric.iconClass}`}
          >
            {createElement(
              metric.icon,
              {
                className: "h-5 w-5",
                "aria-hidden": true,
              },
            )}
          </div>
        </div>
  
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400">
            Versus previous period
          </span>
  
          <ChangeBadge
            currentValue={
              currentPeriod?.[
                metric.key
              ]
            }
            previousValue={
              previousPeriod?.[
                metric.key
              ]
            }
          />
        </div>
      </article>
    );
  }
  
  function CountCard({
    label,
    value,
    icon,
    tone,
  }) {
    const toneClasses = {
      primary:
        "bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300",
      success:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
      danger:
        "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
      violet:
        "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
    };
  
    return (
      <article className="rounded-[1.3rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#101a2c]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {label}
            </p>
  
            <p className="mt-2 text-[1.65rem] font-extrabold tabular-nums text-[#080808] dark:text-white">
              {toNumber(value)}
            </p>
          </div>
  
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
          >
            {createElement(icon, {
              className: "h-4.5 w-4.5",
              "aria-hidden": true,
            })}
          </div>
        </div>
      </article>
    );
  }
  
  function ChartEmptyState({
    message,
  }) {
    return (
      <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-[#f8fafc] px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-[#0b1424] dark:text-slate-400">
        {message}
      </div>
    );
  }
  
  function getNiceMaximum(value) {
    if (value <= 0) {
      return 1;
    }
  
    const magnitude =
      10 **
      Math.floor(
        Math.log10(value),
      );
  
    const normalized =
      value / magnitude;
  
    let roundedNormalized;
  
    if (normalized <= 1) {
      roundedNormalized = 1;
    } else if (normalized <= 2) {
      roundedNormalized = 2;
    } else if (normalized <= 5) {
      roundedNormalized = 5;
    } else {
      roundedNormalized = 10;
    }
  
    return (
      roundedNormalized * magnitude
    );
  }
  
  function MonthlyTrendChart({
    items,
    currencyCode,
  }) {
    const normalizedItems = items.map(
      (item, index) => ({
        ...item,
        chartKey:
          item?.month ??
          item?.yearMonth ??
          item?.periodStart ??
          item?.label ??
          index,
      }),
    );
  
    const rawMaximum = Math.max(
      ...normalizedItems.flatMap(
        (item) =>
          MONTHLY_SERIES.map(
            (series) =>
              toNumber(
                item?.[series.key],
              ),
          ),
      ),
      0,
    );
  
    const maximum =
      getNiceMaximum(rawMaximum);
  
    const chartHeight = 196;
    const tickCount = 4;
  
    const tickValues = Array.from(
      {
        length: tickCount + 1,
      },
      (_, index) =>
        maximum -
        (maximum / tickCount) *
          index,
    );
  
    const chartWidth = Math.max(
      normalizedItems.length * 112,
      640,
    );
  
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-7">
        <SectionHeader
          eyebrow="Period movement"
          title="Monthly trend"
          description="Income, expenses, and transfers remain separate so cash flow is not overstated."
          icon={BarChart3}
        />
  
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
          {MONTHLY_SERIES.map(
            (series) => (
              <div
                key={series.key}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${series.barClass}`}
                />
  
                {series.label}
              </div>
            ),
          )}
        </div>
  
        {normalizedItems.length ===
        0 ? (
          <ChartEmptyState message="No monthly trend points are available for this period." />
        ) : (
          <div className="mt-7 overflow-x-auto pb-2">
            <div className="flex min-w-max">
              <div className="mr-3 flex w-[4.5rem] shrink-0 flex-col">
                <div
                  className="flex flex-col justify-between text-right"
                  style={{
                    height: `${chartHeight}px`,
                  }}
                >
                  {tickValues.map(
                    (
                      tickValue,
                      index,
                    ) => (
                      <span
                        key={`${tickValue}-${index}`}
                        className="text-[0.62rem] font-semibold tabular-nums text-slate-400 dark:text-slate-500"
                      >
                        {formatCompactCurrency(
                          tickValue,
                          currencyCode,
                        )}
                      </span>
                    ),
                  )}
                </div>
  
                <div className="h-12" />
              </div>
  
              <div
                className="relative border-b border-slate-200 dark:border-slate-700"
                style={{
                  width: `${chartWidth}px`,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0"
                  style={{
                    height: `${chartHeight}px`,
                  }}
                >
                  {tickValues.map(
                    (_, index) => (
                      <div
                        key={`monthly-grid-${index}`}
                        className="absolute inset-x-0 border-t border-dashed border-slate-200 dark:border-slate-800"
                        style={{
                          top: `${
                            (index /
                              tickCount) *
                            100
                          }%`,
                        }}
                      />
                    ),
                  )}
                </div>
  
                <div className="relative z-10 flex items-end gap-5 px-3">
                  {normalizedItems.map(
                    (item) => {
                      const monthValues =
                        MONTHLY_SERIES.map(
                          (series) =>
                            toNumber(
                              item?.[
                                series.key
                              ],
                            ),
                        );
  
                      const hasActivity =
                        monthValues.some(
                          (value) =>
                            value > 0,
                        );
  
                      return (
                        <div
                          key={
                            item.chartKey
                          }
                          className="flex min-w-20 flex-1 flex-col items-center"
                        >
                          <div
                            className="relative flex items-end gap-1.5"
                            style={{
                              height: `${chartHeight}px`,
                            }}
                          >
                            {MONTHLY_SERIES.map(
                              (series) => {
                                const value =
                                  toNumber(
                                    item?.[
                                      series.key
                                    ],
                                  );
  
                                const height =
                                  value > 0
                                    ? Math.max(
                                        (value /
                                          maximum) *
                                          100,
                                        3,
                                      )
                                    : 0;
  
                                const tooltip =
                                  `${formatMonthLabel(
                                    item,
                                  )} · ${
                                    series.label
                                  }: ${formatCurrency(
                                    value,
                                    currencyCode,
                                  )}`;
  
                                return (
                                  <div
                                    key={
                                      series.key
                                    }
                                    tabIndex={
                                      value > 0
                                        ? 0
                                        : -1
                                    }
                                    aria-label={
                                      value > 0
                                        ? tooltip
                                        : undefined
                                    }
                                    className="group relative flex h-full w-4 items-end rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#1f55cf] focus-visible:ring-offset-2 sm:w-5"
                                  >
                                    {value >
                                      0 && (
                                      <div className="pointer-events-none absolute left-1/2 top-2 z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#071426] px-2.5 py-1.5 text-[0.62rem] font-bold text-white shadow-xl group-hover:block group-focus:block">
                                        {
                                          tooltip
                                        }
                                      </div>
                                    )}
  
                                    {value >
                                    0 ? (
                                      <div
                                        className={`w-full rounded-t-md ${series.barClass} transition-[height] duration-700`}
                                        style={{
                                          height: `${height}%`,
                                        }}
                                      />
                                    ) : null}
                                  </div>
                                );
                              },
                            )}
  
                            {!hasActivity && (
                              <div className="absolute inset-x-0 bottom-0 mx-auto h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                            )}
                          </div>
  
                          <p className="mt-3 whitespace-nowrap text-[0.68rem] font-extrabold text-slate-600 dark:text-slate-300">
                            {formatMonthLabel(
                              item,
                            )}
                          </p>
  
                          {!hasActivity && (
                            <p className="mt-1 text-[0.58rem] font-semibold text-slate-400 dark:text-slate-500">
                              No activity
                            </p>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
  
  function BreakdownSection({
    eyebrow,
    title,
    description,
    items,
    currencyCode,
    icon,
    emptyMessage,
  }) {
    const total = items.reduce(
      (sum, item) =>
        sum +
        toNumber(item?.amount),
      0,
    );
  
    const maximum = Math.max(
      ...items.map((item) =>
        toNumber(item?.amount),
      ),
      1,
    );
  
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-7">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          icon={icon}
        />
  
        {items.length === 0 ? (
          <ChartEmptyState
            message={emptyMessage}
          />
        ) : (
          <div className="mt-7 space-y-5">
            {items.map(
              (item, index) => {
                const amount =
                  toNumber(
                    item?.amount,
                  );
  
                const percentage =
                  total > 0
                    ? (amount /
                        total) *
                      100
                    : 0;
  
                return (
                  <article
                    key={`${getItemLabel(
                      item,
                      "Item",
                    )}-${index}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#0b1220] dark:text-white">
                          {getItemLabel(
                            item,
                            `Item ${
                              index + 1
                            }`,
                          )}
                        </p>
  
                        <p className="mt-1 text-[0.68rem] text-slate-500 dark:text-slate-400">
                          {getTransactionCount(
                            item,
                          )}{" "}
                          transaction
                          {getTransactionCount(
                            item,
                          ) === 1
                            ? ""
                            : "s"}
                        </p>
                      </div>
  
                      <div className="text-right">
                        <p className="text-sm font-extrabold tabular-nums text-[#0b1220] dark:text-white">
                          {formatCurrency(
                            amount,
                            currencyCode,
                          )}
                        </p>
  
                        <p className="mt-1 text-[0.68rem] font-bold text-slate-500 dark:text-slate-400">
                          {percentage.toFixed(
                            1,
                          )}
                          %
                        </p>
                      </div>
                    </div>
  
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-[#1f55cf] transition-[width] duration-700"
                        style={{
                          width: `${Math.max(
                            (amount /
                              maximum) *
                              100,
                            amount > 0
                              ? 2
                              : 0,
                          )}%`,
                        }}
                      />
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    );
  }
  
  function WeekdayChart({
    items,
    currencyCode,
  }) {
    const maximum = Math.max(
      ...items.map((item) =>
        toNumber(item?.amount),
      ),
      1,
    );
  
    const totalAmount = items.reduce(
      (sum, item) =>
        sum +
        toNumber(item?.amount),
      0,
    );
  
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-7">
        <SectionHeader
          eyebrow="Weekly rhythm"
          title="Expense by weekday"
          description="See which days account for the largest share of posted spending."
          icon={CalendarDays}
        />
  
        {items.length === 0 ? (
          <ChartEmptyState message="No weekday expense activity is available for this period." />
        ) : (
          <div className="mt-7 overflow-x-auto pb-2">
            <div className="flex min-w-[700px] items-end gap-5 border-b border-slate-200 px-3 pb-1 dark:border-slate-700">
              {items.map(
                (item, index) => {
                  const amount =
                    toNumber(
                      item?.amount,
                    );
  
                  const height =
                    amount > 0
                      ? Math.max(
                          (amount /
                            maximum) *
                            100,
                          5,
                        )
                      : 0;
  
                  const percentage =
                    totalAmount > 0
                      ? (amount /
                          totalAmount) *
                        100
                      : 0;
  
                  const label =
                    getItemLabel(
                      item,
                      `Day ${
                        index + 1
                      }`,
                    );
  
                  const transactionCount =
                    getTransactionCount(
                      item,
                    );
  
                  const tooltip =
                    `${label}: ${formatCurrency(
                      amount,
                      currencyCode,
                    )} · ${transactionCount} transaction${
                      transactionCount ===
                      1
                        ? ""
                        : "s"
                    }`;
  
                  return (
                    <div
                      key={`${label}-${index}`}
                      className="flex min-w-20 flex-1 flex-col items-center"
                    >
                      <p className="mb-2 text-[0.65rem] font-extrabold tabular-nums text-slate-500 dark:text-slate-400">
                        {formatCompactCurrency(
                          amount,
                          currencyCode,
                        )}
                      </p>
  
                      <div className="relative flex h-40 w-full max-w-14 items-end justify-center">
                        {amount > 0 ? (
                          <div
                            tabIndex={0}
                            aria-label={
                              tooltip
                            }
                            className="group relative flex h-full w-full items-end rounded-t-xl outline-none focus-visible:ring-2 focus-visible:ring-[#1f55cf] focus-visible:ring-offset-2"
                          >
                            <div className="pointer-events-none absolute left-1/2 top-2 z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#071426] px-2.5 py-1.5 text-[0.62rem] font-bold text-white shadow-xl group-hover:block group-focus:block">
                              {tooltip}
                            </div>
  
                            <div
                              className="w-full rounded-t-xl bg-[#1f55cf] shadow-[0_8px_20px_rgba(31,85,207,0.18)] transition-[height] duration-700"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            aria-label={`${label}: No spending`}
                            className="h-1 w-8 rounded-full bg-slate-200 dark:bg-slate-700"
                          />
                        )}
                      </div>
  
                      <p className="mt-3 max-w-24 truncate text-[0.68rem] font-extrabold text-slate-600 dark:text-slate-300">
                        {label}
                      </p>
  
                      <p className="mt-1 min-h-4 text-center text-[0.6rem] font-semibold text-slate-400 dark:text-slate-500">
                        {amount > 0
                          ? `${percentage.toFixed(
                              1,
                            )}% of spending`
                          : "No spending"}
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </section>
    );
  }
  
  function ComparisonTable({
    analytics,
    currency,
  }) {
    const current =
      currency?.currentPeriod ?? {};
  
    const previous =
      currency?.previousPeriod ?? {};
  
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-7">
        <SectionHeader
          eyebrow="Period comparison"
          title="Current versus previous"
          description={`${formatRange(
            analytics?.previousFromDate,
            analytics?.previousToDate,
          )} is used as the comparison window.`}
          icon={BarChart3}
        />
  
        <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-[#f8fafc] dark:bg-[#0b1424]">
              <tr className="text-left text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">
                  Metric
                </th>
  
                <th className="px-4 py-3">
                  Current
                </th>
  
                <th className="px-4 py-3">
                  Previous
                </th>
  
                <th className="px-4 py-3">
                  Change
                </th>
              </tr>
            </thead>
  
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {METRICS.map(
                (metric) => (
                  <tr
                    key={metric.key}
                    className="text-sm"
                  >
                    <td className="px-4 py-4">
                      <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${metric.iconClass}`}
                        >
                          {createElement(
                            metric.icon,
                            {
                              className:
                                "h-4 w-4",
                              "aria-hidden":
                                true,
                            },
                          )}
                        </div>
  
                        <span className="font-extrabold text-[#0b1220] dark:text-white">
                          {
                            metric.label
                          }
                        </span>
                      </div>
                    </td>
  
                    <td className="px-4 py-4 font-extrabold tabular-nums text-[#0b1220] dark:text-white">
                      {formatCurrency(
                        current?.[
                          metric.key
                        ],
                        currency
                          ?.currencyCode,
                      )}
                    </td>
  
                    <td className="px-4 py-4 font-extrabold tabular-nums text-[#0b1220] dark:text-white">
                      {formatCurrency(
                        previous?.[
                          metric.key
                        ],
                        currency
                          ?.currencyCode,
                      )}
                    </td>
  
                    <td className="px-4 py-4">
                      <ChangeBadge
                        currentValue={
                          current?.[
                            metric.key
                          ]
                        }
                        previousValue={
                          previous?.[
                            metric.key
                          ]
                        }
                      />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
  
  function DateInput({
    label,
    ...inputProperties
  }) {
    return (
      <label className="block">
        <span className="mb-1.5 block text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
  
        <input
          {...inputProperties}
          type="date"
          required
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0b1220] outline-none transition focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white sm:w-44"
        />
      </label>
    );
  }
  
  export default function AnalyticsPage() {
    const [analytics, setAnalytics] =
      useState(null);
  
    const [
      selectedCurrency,
      setSelectedCurrency,
    ] = useState("");
  
    const [dateRange, setDateRange] =
      useState({
        fromDate: "",
        toDate: "",
      });
  
    const [
      activePreset,
      setActivePreset,
    ] = useState("CUSTOM");
  
    const [loading, setLoading] =
      useState(true);
  
    const [
      refreshing,
      setRefreshing,
    ] = useState(false);
  
    const [
      errorMessage,
      setErrorMessage,
    ] = useState("");
  
    useEffect(() => {
      const abortController =
        new AbortController();
  
      analyticsService
        .getAnalytics({
          signal:
            abortController.signal,
        })
        .then((data) => {
          if (
            abortController.signal
              .aborted
          ) {
            return;
          }
  
          setAnalytics(data);
  
          const nextRange = {
            fromDate:
              data?.fromDate ?? "",
            toDate:
              data?.toDate ?? "",
          };
  
          setDateRange(nextRange);
  
          setActivePreset(
            detectPreset(
              nextRange.fromDate,
              nextRange.toDate,
            ),
          );
  
          const availableCurrencies =
            data?.currencies ?? [];
  
          setSelectedCurrency(
            availableCurrencies[0]
              ?.currencyCode ?? "",
          );
  
          setErrorMessage("");
        })
        .catch((error) => {
          const requestCancelled =
            error?.code ===
              "ERR_CANCELED" ||
            error?.name ===
              "CanceledError" ||
            error?.name ===
              "AbortError";
  
          if (requestCancelled) {
            return;
          }
  
          setErrorMessage(
            getApiErrorMessage(
              error,
              COPY.loadFailure,
            ),
          );
        })
        .finally(() => {
          if (
            !abortController.signal
              .aborted
          ) {
            setLoading(false);
          }
        });
  
      return () => {
        abortController.abort();
      };
    }, []);
  
    const currencies = useMemo(
      () =>
        analytics?.currencies ?? [],
      [analytics],
    );
  
    const currency = useMemo(
      () =>
        currencies.find(
          (item) =>
            item.currencyCode ===
            selectedCurrency,
        ) ??
        currencies[0] ??
        null,
      [
        currencies,
        selectedCurrency,
      ],
    );
  
    const currentPeriod =
      currency?.currentPeriod ?? {};
  
    const previousPeriod =
      currency?.previousPeriod ?? {};
  
    const hasFinancialActivity =
      toNumber(
        currentPeriod
          .totalTransactionCount,
      ) > 0 ||
      [
        "income",
        "expense",
        "transferVolume",
      ].some(
        (key) =>
          toNumber(
            currentPeriod[key],
          ) !== 0,
      );
  
    function applyResponse(
      data,
      requestedPreset,
    ) {
      setAnalytics(data);
  
      const nextRange = {
        fromDate:
          data?.fromDate ?? "",
        toDate:
          data?.toDate ?? "",
      };
  
      setDateRange(nextRange);
  
      setActivePreset(
        requestedPreset ??
          detectPreset(
            nextRange.fromDate,
            nextRange.toDate,
          ),
      );
  
      const availableCurrencies =
        data?.currencies ?? [];
  
      setSelectedCurrency(
        (currentCurrency) =>
          availableCurrencies.some(
            (item) =>
              item.currencyCode ===
              currentCurrency,
          )
            ? currentCurrency
            : availableCurrencies[0]
                ?.currencyCode ?? "",
      );
    }
  
    async function loadAnalytics({
      fromDate,
      toDate,
      requestedPreset = null,
    } = {}) {
      setRefreshing(true);
      setErrorMessage("");
  
      try {
        const data =
          await analyticsService.getAnalytics(
            {
              fromDate,
              toDate,
            },
          );
  
        applyResponse(
          data,
          requestedPreset,
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            COPY.loadFailure,
          ),
        );
      } finally {
        setRefreshing(false);
      }
    }
  
    function updateDateField(event) {
      const { name, value } =
        event.target;
  
      setDateRange((current) => ({
        ...current,
        [name]: value,
      }));
  
      setActivePreset("CUSTOM");
    }
  
    function validateRange(range) {
      const today =
        toDateInputValue(
          new Date(),
        );
  
      if (
        !range.fromDate ||
        !range.toDate
      ) {
        return COPY.rangeMissing;
      }
  
      if (
        range.fromDate >
        range.toDate
      ) {
        return COPY.rangeReversed;
      }
  
      if (range.toDate > today) {
        return COPY.rangeFuture;
      }
  
      return "";
    }
  
    async function applyPreset(
      preset,
    ) {
      const range =
        getPresetRange(preset);
  
      if (!range) {
        return;
      }
  
      setActivePreset(preset);
      setDateRange(range);
  
      await loadAnalytics({
        ...range,
        requestedPreset: preset,
      });
    }
  
    async function applyCustomRange(
      event,
    ) {
      event.preventDefault();
  
      const validationMessage =
        validateRange(dateRange);
  
      if (validationMessage) {
        setErrorMessage(
          validationMessage,
        );
  
        return;
      }
  
      setActivePreset("CUSTOM");
  
      await loadAnalytics({
        ...dateRange,
        requestedPreset: "CUSTOM",
      });
    }
  
    if (loading) {
      return <LoadingState />;
    }
  
    if (
      !analytics &&
      errorMessage
    ) {
      return (
        <ErrorState
          message={errorMessage}
          onRetry={() =>
            window.location.reload()
          }
        />
      );
    }
  
    return (
      <div
        className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 overflow-x-hidden"
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.19em] text-[#1f55cf] dark:text-blue-300">
              {COPY.pageEyebrow}
            </p>
  
            <h1 className="mt-3 text-[2.15rem] font-extrabold tracking-[-0.045em] text-[#080808] dark:text-white sm:text-[2.5rem]">
              {COPY.pageTitle}
            </h1>
  
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#1f55cf] dark:text-blue-300" />
  
                {formatRange(
                  analytics?.fromDate,
                  analytics?.toDate,
                )}
              </span>
  
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
  
              <span>
                {analytics?.timezone ??
                  "Timezone unavailable"}
              </span>
            </div>
          </div>
  
          <button
            type="button"
            onClick={() =>
              loadAnalytics({
                ...dateRange,
                requestedPreset:
                  activePreset,
              })
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-[#0b1220] shadow-sm transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:opacity-60 dark:border-slate-700 dark:bg-[#101a2c] dark:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
  
            {refreshing
              ? COPY.refreshing
              : COPY.refresh}
          </button>
        </header>
  
        <section className="mt-8 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-extrabold text-[#0b1220] dark:text-white">
                {COPY.reportingPeriod}
              </p>
  
              <div className="mt-3 flex flex-wrap gap-2">
                {DATE_PRESETS.map(
                  (preset) => (
                    <button
                      key={
                        preset.value
                      }
                      type="button"
                      onClick={() =>
                        applyPreset(
                          preset.value,
                        )
                      }
                      disabled={
                        refreshing
                      }
                      className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition disabled:opacity-60 ${
                        activePreset ===
                        preset.value
                          ? "bg-[#1f55cf] text-white shadow-[0_7px_15px_rgba(31,85,207,0.18)]"
                          : "bg-[#f1f5f9] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ),
                )}
  
                <button
                  type="button"
                  onClick={() =>
                    setActivePreset(
                      "CUSTOM",
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                    activePreset ===
                    "CUSTOM"
                      ? "bg-[#1f55cf] text-white shadow-[0_7px_15px_rgba(31,85,207,0.18)]"
                      : "bg-[#f1f5f9] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
  
            <form
              onSubmit={
                applyCustomRange
              }
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <DateInput
                label="From"
                name="fromDate"
                value={
                  dateRange.fromDate
                }
                max={
                  dateRange.toDate ||
                  toDateInputValue(
                    new Date(),
                  )
                }
                onChange={
                  updateDateField
                }
              />
  
              <DateInput
                label="To"
                name="toDate"
                value={
                  dateRange.toDate
                }
                min={
                  dateRange.fromDate
                }
                max={toDateInputValue(
                  new Date(),
                )}
                onChange={
                  updateDateField
                }
              />
  
              <button
                type="submit"
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-5 text-xs font-extrabold text-white transition hover:bg-[#1848b5] disabled:opacity-60"
              >
                {COPY.applyRange}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </section>
        {errorMessage && analytics && (
          <PageToastBridge
            type="warning"
            title="Analytics refresh failed"
            message={errorMessage}
            onConsumed={() => setErrorMessage("")}
          />
        )}
  
        {currencies.length > 1 && (
          <section className="mt-6 flex flex-col gap-3 rounded-[1.3rem] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#101a2c] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-[#0b1220] dark:text-white">
                {COPY.currencyTitle}
              </p>
  
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {
                  COPY.currencyDescription
                }
              </p>
            </div>
  
            <select
              value={
                selectedCurrency
              }
              onChange={(event) =>
                setSelectedCurrency(
                  event.target.value,
                )
              }
              className="h-11 min-w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-[#0b1220] outline-none focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
            >
              {currencies.map(
                (item) => (
                  <option
                    key={
                      item.currencyCode
                    }
                    value={
                      item.currencyCode
                    }
                  >
                    {
                      item.currencyCode
                    }
                  </option>
                ),
              )}
            </select>
          </section>
        )}
  
        {!currency ||
        !hasFinancialActivity ? (
          <div className="mt-6">
            <EmptyAnalytics />
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {METRICS.map(
                (metric) => (
                  <MetricCard
                    key={metric.key}
                    metric={metric}
                    currentPeriod={
                      currentPeriod
                    }
                    previousPeriod={
                      previousPeriod
                    }
                    currencyCode={
                      currency.currencyCode
                    }
                  />
                ),
              )}
            </section>
  
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <CountCard
                label="All transactions"
                value={
                  currentPeriod
                    .totalTransactionCount
                }
                icon={ReceiptText}
                tone="primary"
              />
  
              <CountCard
                label="Income records"
                value={
                  currentPeriod
                    .incomeTransactionCount
                }
                icon={ArrowUpRight}
                tone="success"
              />
  
              <CountCard
                label="Expense records"
                value={
                  currentPeriod
                    .expenseTransactionCount
                }
                icon={ArrowDownRight}
                tone="danger"
              />
  
              <CountCard
                label="Transfer records"
                value={
                  currentPeriod
                    .transferTransactionCount
                }
                icon={Repeat2}
                tone="violet"
              />
            </section>
  
            <div className="mt-6">
              <MonthlyTrendChart
                items={
                  currency.monthlyTrend ??
                  []
                }
                currencyCode={
                  currency.currencyCode
                }
              />
            </div>
  
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <BreakdownSection
                eyebrow="Spending mix"
                title="Expense by category"
                description="Categories are ranked by their contribution to posted expenses."
                items={
                  currency.expenseByCategory ??
                  []
                }
                currencyCode={
                  currency.currencyCode
                }
                icon={WalletCards}
                emptyMessage="No category expense breakdown is available for this period."
              />
  
              <BreakdownSection
                eyebrow="Source accounts"
                title="Expense by account"
                description="Understand which financial accounts funded the selected period's spending."
                items={
                  currency.expenseByAccount ??
                  []
                }
                currencyCode={
                  currency.currencyCode
                }
                icon={Landmark}
                emptyMessage="No account expense breakdown is available for this period."
              />
            </div>
  
            <div className="mt-6">
              <WeekdayChart
                items={
                  currency.expenseByWeekday ??
                  []
                }
                currencyCode={
                  currency.currencyCode
                }
              />
            </div>
  
            <div className="mt-6">
              <ComparisonTable
                analytics={analytics}
                currency={currency}
              />
            </div>
          </>
        )}
      </div>
    );
  }
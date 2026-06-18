import {
  ArrowDownToLine,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { reportService } from "../services/reportService";
import { getApiErrorMessage } from "../utils/apiError";
import PageToastBridge from "../components/PageToastBridge";

const COPY = Object.freeze({
  eyebrow: "Export center",
  title: "Reports",
  description:
    "Generate real financial reports from your posted transactions, budgets, and goals.",
  refresh: "Refresh report",
  refreshing: "Refreshing...",
  exportCsv: "Export CSV",
  exportPdf: "Export PDF",
  exportXlsx: "Export XLSX",
  exporting: "Preparing file...",
  applyRange: "Apply range",
  currentMonth: "Current month",
  yearToDate: "Year to date",
  custom: "Custom",
  from: "From",
  to: "To",
  emptyTitle: "No report data yet",
  emptyMessage:
    "Add real transactions, budgets, or goals to generate report data.",
  loadFailure:
    "Unable to load your financial report.",
  rangeMissing:
    "Select both start and end dates.",
  rangeReversed:
    "Start date cannot be after end date.",
  rangeFuture:
    "Reports cannot include a future date.",
});

function getLocale() {
  return typeof navigator !== "undefined" &&
    navigator.language
    ? navigator.language
    : "en-IN";
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

  const day = String(date.getDate()).padStart(
    2,
    "0",
  );

  return [
    year,
    month,
    day,
  ].join("-");
}

function startOfMonth(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

function formatCurrency(value, currencyCode) {
  const amount = toNumber(value);

  try {
    return new Intl.NumberFormat(
      getLocale(),
      {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(amount);
  } catch {
    return [
      currencyCode,
      amount.toFixed(2),
    ]
      .filter(Boolean)
      .join(" ");
  }
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    getLocale(),
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function getCurrentMonthRange() {
  const today = new Date();

  return {
    fromDate: toDateInputValue(
      startOfMonth(today),
    ),
    toDate: toDateInputValue(today),
  };
}

function getYearToDateRange() {
  const today = new Date();

  return {
    fromDate: [
      today.getFullYear(),
      "01",
      "01",
    ].join("-"),
    toDate: toDateInputValue(today),
  };
}

function validateRange(range) {
  const today =
    toDateInputValue(new Date());

  if (!range.fromDate || !range.toDate) {
    return COPY.rangeMissing;
  }

  if (range.fromDate > range.toDate) {
    return COPY.rangeReversed;
  }

  if (range.toDate > today) {
    return COPY.rangeFuture;
  }

  return "";
}

function PageLoading() {
  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 overflow-x-hidden">
      <div className="animate-pulse space-y-5">
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-12 w-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-36 rounded-[1.5rem] bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-44 rounded-[1.5rem] bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-[1.5rem] bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-[1.5rem] bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({
  message,
}) {
  if (!message) {
    return null;
  }

  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  tone,
}) {
  const toneClasses = {
    blue:
      "bg-blue-50 text-[#2457d6] dark:bg-blue-500/10 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    rose:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  };

  return (
    <article className="rounded-[1.45rem] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-[1.75rem] font-black tracking-[-0.045em] text-[#0b1220] dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl " +
            toneClasses[tone]
          }
        >
          {createElement(icon, {
            className: "h-5 w-5",
            "aria-hidden": true,
          })}
        </div>
      </div>
    </article>
  );
}

function DataTable({
  title,
  description,
  columns,
  rows,
  emptyMessage,
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div>
        <h2 className="text-lg font-black tracking-[-0.02em] text-[#0b1220] dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-[#0b1424] dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-slate-50 dark:bg-[#0b1424]">
              <tr className="text-left text-[0.68rem] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, index) => (
                <tr
                  key={row.key ?? index}
                  className="text-sm"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function ReportsPage() {
  const initialRange =
    getCurrentMonthRange();

  const [report, setReport] =
    useState(null);

  const [dateRange, setDateRange] =
    useState(initialRange);

  const [activePreset, setActivePreset] =
    useState("CURRENT_MONTH");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [exportingType, setExportingType] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadReport = useCallback(
    async ({
      range,
      preset,
      initial = false,
    } = {}) => {
      const resolvedRange =
        range ?? getCurrentMonthRange();

      const resolvedPreset =
        preset ?? "CURRENT_MONTH";

      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setErrorMessage("");

      try {
        const data =
          await reportService.getReport({
            fromDate: resolvedRange.fromDate,
            toDate: resolvedRange.toDate,
          });

        const nextRange = {
          fromDate:
            data?.fromDate ??
            resolvedRange.fromDate,
          toDate:
            data?.toDate ??
            resolvedRange.toDate,
        };

        setReport(data);

        setDateRange((currentRange) =>
          currentRange.fromDate ===
            nextRange.fromDate &&
          currentRange.toDate === nextRange.toDate
            ? currentRange
            : nextRange,
        );

        setActivePreset(resolvedPreset);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            COPY.loadFailure,
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadReport({
        initial: true,
      });
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadReport]);

  const currency =
    report?.currencies?.[0] ?? null;

  const totals =
    currency?.totals ?? {};

  const hasData =
    Boolean(currency) &&
    toNumber(totals.transactionCount) +
      toNumber(currency?.budgets?.length) +
      toNumber(currency?.goals?.length) >
      0;

  const categoryRows = useMemo(
    () =>
      (currency?.categoryExpenses ?? []).map(
        (row) => ({
          key: row.categoryPublicId,
          ...row,
        }),
      ),
    [currency],
  );

  const budgetRows = useMemo(
    () =>
      (currency?.budgets ?? []).map(
        (row) => ({
          key: row.budgetPublicId,
          ...row,
        }),
      ),
    [currency],
  );

  const goalRows = useMemo(
    () =>
      (currency?.goals ?? []).map(
        (row) => ({
          key: row.goalPublicId,
          ...row,
        }),
      ),
    [currency],
  );

  function updateDateField(event) {
    const {
      name,
      value,
    } = event.target;

    setDateRange((current) => ({
      ...current,
      [name]: value,
    }));

    setActivePreset("CUSTOM");
  }

  async function applyPreset(preset) {
    const range =
      preset === "YEAR_TO_DATE"
        ? getYearToDateRange()
        : getCurrentMonthRange();

    setDateRange(range);
    setActivePreset(preset);

    await loadReport({
      range,
      preset,
    });
  }

  async function applyCustomRange(event) {
    event.preventDefault();

    const validationMessage =
      validateRange(dateRange);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    await loadReport({
      range: dateRange,
      preset: "CUSTOM",
    });
  }

  async function exportFile(type) {
    setExportingType(type);
    setErrorMessage("");

    try {
      const payload = {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
      };

      if (type === "CSV") {
        await reportService.downloadCsv(payload);
      } else if (type === "XLSX") {
        await reportService.downloadXlsx(payload);
      } else {
        await reportService.downloadPdf(payload);
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to export report.",
        ),
      );
    } finally {
      setExportingType("");
    }
  }

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9 overflow-x-hidden">
      {errorMessage && (
        <PageToastBridge
          type="error"
          message={errorMessage}
          onConsumed={() => setErrorMessage("")}
        />
      )}

      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#2457d6] dark:text-blue-300">
            {COPY.eyebrow}
          </p>

          <h1 className="mt-3 text-[2.15rem] font-black tracking-[-0.045em] text-[#080808] dark:text-white sm:text-[2.5rem]">
            {COPY.title}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {COPY.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#2457d6] dark:text-blue-300" />
              {formatDate(report?.fromDate)} - {formatDate(report?.toDate)}
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

            <span>
              {report?.timezone ?? "Timezone unavailable"}
            </span>
          </div>
        </div>

        <div className="report-action-toolbar flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2.5">
          <button
            type="button"
            onClick={() =>
              loadReport({
                range: dateRange,
                preset: activePreset,
              })
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-[#0b1220] shadow-sm transition hover:border-[#2457d6] hover:text-[#2457d6] disabled:opacity-60 dark:border-slate-700 dark:bg-[#101a2c] dark:text-white"
          >
            <RefreshCw
              className={
                refreshing
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />
            {refreshing
              ? COPY.refreshing
              : COPY.refresh}
          </button>

          <button
            type="button"
            onClick={() => exportFile("CSV")}
            disabled={!hasData || Boolean(exportingType)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2457d6] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#1d46ad] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportingType === "CSV" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {exportingType === "CSV"
              ? COPY.exporting
              : COPY.exportCsv}
          </button>

          <button
            type="button"
            onClick={() => exportFile("XLSX")}
            disabled={!hasData || Boolean(exportingType)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportingType === "XLSX" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {exportingType === "XLSX"
              ? COPY.exporting
              : COPY.exportXlsx}
          </button>

          <button
            type="button"
            onClick={() => exportFile("PDF")}
            disabled={!hasData || Boolean(exportingType)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-[#0b1220] shadow-sm transition hover:border-[#2457d6] hover:text-[#2457d6] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#101a2c] dark:text-white"
          >
            {exportingType === "PDF" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {exportingType === "PDF"
              ? COPY.exporting
              : COPY.exportPdf}
          </button>
        </div>
      </header>

      <section className="mt-8 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black text-[#0b1220] dark:text-white">
              Reporting period
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  applyPreset("CURRENT_MONTH")
                }
                disabled={refreshing}
                className={
                  "rounded-xl px-4 py-2.5 text-xs font-black transition disabled:opacity-60 " +
                  (activePreset === "CURRENT_MONTH"
                    ? "bg-[#2457d6] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")
                }
              >
                {COPY.currentMonth}
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset("YEAR_TO_DATE")
                }
                disabled={refreshing}
                className={
                  "rounded-xl px-4 py-2.5 text-xs font-black transition disabled:opacity-60 " +
                  (activePreset === "YEAR_TO_DATE"
                    ? "bg-[#2457d6] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")
                }
              >
                {COPY.yearToDate}
              </button>

              <button
                type="button"
                onClick={() =>
                  setActivePreset("CUSTOM")
                }
                className={
                  "rounded-xl px-4 py-2.5 text-xs font-black transition " +
                  (activePreset === "CUSTOM"
                    ? "bg-[#2457d6] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300")
                }
              >
                {COPY.custom}
              </button>
            </div>
          </div>

          <form
            onSubmit={applyCustomRange}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <DateField
              label={COPY.from}
              name="fromDate"
              value={dateRange.fromDate}
              max={dateRange.toDate}
              onChange={updateDateField}
            />

            <DateField
              label={COPY.to}
              name="toDate"
              value={dateRange.toDate}
              min={dateRange.fromDate}
              max={toDateInputValue(new Date())}
              onChange={updateDateField}
            />

            <button
              type="submit"
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2457d6] px-5 text-xs font-black text-white transition hover:bg-[#1d46ad] disabled:opacity-60"
            >
              {COPY.applyRange}
              <Download className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </section>

      <ErrorBanner message={errorMessage} />

      {!hasData ? (
        <section className="mt-6 rounded-[1.6rem] border border-slate-200 bg-white p-10 text-center shadow-[0_12px_32px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2457d6] dark:bg-blue-500/10 dark:text-blue-300">
            <FileText className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#0b1220] dark:text-white">
            {COPY.emptyTitle}
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {COPY.emptyMessage}
          </p>
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Income"
              value={formatCurrency(
                totals.income,
                currency.currencyCode,
              )}
              description="Posted income in this report period"
              icon={ArrowDownToLine}
              tone="emerald"
            />

            <SummaryCard
              title="Expenses"
              value={formatCurrency(
                totals.expense,
                currency.currencyCode,
              )}
              description="Posted expenses in this report period"
              icon={ReceiptText}
              tone="rose"
            />

            <SummaryCard
              title="Net cash flow"
              value={formatCurrency(
                totals.netCashFlow,
                currency.currencyCode,
              )}
              description="Income minus expenses"
              icon={FileText}
              tone="blue"
            />

            <SummaryCard
              title="Transactions"
              value={toNumber(
                totals.transactionCount,
              )}
              description="Posted records included in the report"
              icon={ReceiptText}
              tone="violet"
            />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <DataTable
              title="Category expense report"
              description="Expense categories ranked by posted spending."
              rows={categoryRows}
              emptyMessage="No category expenses are available for this period."
              columns={[
                {
                  key: "categoryName",
                  label: "Category",
                },
                {
                  key: "amount",
                  label: "Amount",
                  render: (row) =>
                    formatCurrency(
                      row.amount,
                      currency.currencyCode,
                    ),
                },
                {
                  key: "transactionCount",
                  label: "Transactions",
                },
                {
                  key: "percentageOfExpense",
                  label: "Share",
                  render: (row) =>
                    String(row.percentageOfExpense) +
                    "%",
                },
              ]}
            />

            <DataTable
              title="Budget performance"
              description="Budget limits compared with actual period spending."
              rows={budgetRows}
              emptyMessage="No budgets match this report period."
              columns={[
                {
                  key: "budgetName",
                  label: "Budget",
                },
                {
                  key: "limitAmount",
                  label: "Limit",
                  render: (row) =>
                    formatCurrency(
                      row.limitAmount,
                      currency.currencyCode,
                    ),
                },
                {
                  key: "spentAmount",
                  label: "Spent",
                  render: (row) =>
                    formatCurrency(
                      row.spentAmount,
                      currency.currencyCode,
                    ),
                },
                {
                  key: "status",
                  label: "Status",
                },
              ]}
            />
          </div>

          <div className="mt-6">
            <DataTable
              title="Goal progress"
              description="Savings goal progress for this currency."
              rows={goalRows}
              emptyMessage="No savings goals are available for this currency."
              columns={[
                {
                  key: "goalName",
                  label: "Goal",
                },
                {
                  key: "currentAmount",
                  label: "Current",
                  render: (row) =>
                    formatCurrency(
                      row.currentAmount,
                      currency.currencyCode,
                    ),
                },
                {
                  key: "targetAmount",
                  label: "Target",
                  render: (row) =>
                    formatCurrency(
                      row.targetAmount,
                      currency.currencyCode,
                    ),
                },
                {
                  key: "progressPercentage",
                  label: "Progress",
                  render: (row) =>
                    String(row.progressPercentage) +
                    "%",
                },
                {
                  key: "targetDate",
                  label: "Target date",
                  render: (row) =>
                    formatDate(row.targetDate),
                },
                {
                  key: "status",
                  label: "Status",
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}

function DateField({
  label,
  ...props
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.68rem] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <input
        {...props}
        type="date"
        required
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0b1220] outline-none transition focus:border-[#2457d6] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white sm:w-44"
      />
    </label>
  );
}

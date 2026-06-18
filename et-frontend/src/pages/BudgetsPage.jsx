import {
  Archive,
  CalendarDays,  Edit3,
  Gauge,
  Layers3,
  MoreVertical,
  PiggyBank,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import BudgetFormModal from "../components/BudgetFormModal";
import {
  BUDGET_STATUS_FILTERS,
  getBudgetStatusLabel,
} from "../config/budgetOptions";
import { accountService } from "../services/accountService";
import { budgetService } from "../services/budgetService";
import { categoryService } from "../services/categoryService";
import { getApiErrorMessage } from "../utils/apiError";
import PageToastBridge from "../components/PageToastBridge";

const BUDGET_SKELETON_KEYS = [
  "budget-skeleton-1",
  "budget-skeleton-2",
  "budget-skeleton-3",
  "budget-skeleton-4",
];

function getCurrentMonth() {
  const currentDate = new Date();

  const year = currentDate.getFullYear();

  const month = String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0");

  return `${year}-${month}`;
}

function getActiveParameter(filter) {
  if (filter === "ACTIVE") {
    return true;
  }

  if (filter === "INACTIVE") {
    return false;
  }

  return undefined;
}

function formatCurrency(
  value,
  currencyCode,
) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return `${currencyCode ?? ""} ${value ?? ""}`.trim();
  }

  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency:
          currencyCode || "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(numericValue);
  } catch {
    return `${currencyCode ?? ""} ${numericValue.toFixed(
      2,
    )}`.trim();
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const parts = dateValue
    .split("-")
    .map(Number);

  if (parts.length !== 3) {
    return dateValue;
  }

  const date = new Date(
    parts[0],
    parts[1] - 1,
    parts[2],
  );

  return new Intl.DateTimeFormat(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatDateRange(
  startDate,
  endDate,
) {
  return `${formatDate(
    startDate,
  )} - ${formatDate(endDate)}`;
}

function formatMonthTitle(monthValue) {
  if (!monthValue) {
    return "Selected month";
  }

  const [year, month] =
    monthValue
      .split("-")
      .map(Number);

  if (!year || !month) {
    return "Selected month";
  }

  const date = new Date(
    year,
    month - 1,
    1,
  );

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function clampPercentage(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(
    Math.max(numericValue, 0),
    100,
  );
}

function formatPercentage(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.00";
  }

  return numericValue.toFixed(2);
}

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth);

  const [activeFilter, setActiveFilter] =
    useState("ALL");

  const [searchText, setSearchText] =
    useState("");

  const [budgets, setBudgets] =
    useState([]);

  const [summary, setSummary] =
    useState(null);

  const [categories, setCategories] =
    useState([]);

  const [accounts, setAccounts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    dependenciesLoading,
    setDependenciesLoading,
  ] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [formState, setFormState] =
    useState(null);

  const [
    actionBudgetId,
    setActionBudgetId,
  ] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      categoryService.getCategories(
        "EXPENSE",
        true,
      ),
      accountService.getAccounts(),
    ])
      .then(
        ([
          categoryData,
          accountData,
        ]) => {
          if (cancelled) {
            return;
          }

          setCategories(categoryData);
          setAccounts(accountData);
        },
      )
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to load budget form options.",
          ),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setDependenciesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      budgetService.getBudgets({
        month: selectedMonth,
        active:
          getActiveParameter(
            activeFilter,
          ),
      }),
      budgetService.getSummary(
        selectedMonth,
      ),
    ])
      .then(
        ([
          budgetData,
          summaryData,
        ]) => {
          if (cancelled) {
            return;
          }

          setBudgets(budgetData);
          setSummary(summaryData);
          setErrorMessage("");
        },
      )
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to load budgets.",
          ),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    selectedMonth,
    activeFilter,
  ]);

  const visibleBudgets =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return budgets;
      }

      return budgets.filter(
        (budget) => {
          const searchableValues = [
            budget.name,
            budget.categoryName,
            budget.currencyCode,
            budget.status,
            budget.periodType,
          ];

          return searchableValues.some(
            (value) =>
              value
                ?.toString()
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ),
          );
        },
      );
    }, [budgets, searchText]);

  const suggestedCurrencies =
    useMemo(() => {
      const currencies = [
        ...accounts.map(
          (account) =>
            account.currencyCode,
        ),
        ...budgets.map(
          (budget) =>
            budget.currencyCode,
        ),
        ...(
          summary?.currencies ?? []
        ).map(
          (currency) =>
            currency.currencyCode,
        ),
      ];

      return Array.from(
        new Set(
          currencies.filter(Boolean),
        ),
      ).sort();
    }, [
      accounts,
      budgets,
      summary,
    ]);

  async function loadBudgets() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        budgetData,
        summaryData,
      ] = await Promise.all([
        budgetService.getBudgets({
          month: selectedMonth,
          active:
            getActiveParameter(
              activeFilter,
            ),
        }),
        budgetService.getSummary(
          selectedMonth,
        ),
      ]);

      setBudgets(budgetData);
      setSummary(summaryData);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to load budgets.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function changeMonth(event) {
    const nextMonth =
      event.target.value;

    if (
      !nextMonth ||
      nextMonth === selectedMonth
    ) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setSelectedMonth(nextMonth);
  }

  function changeActiveFilter(
    nextFilter,
  ) {
    if (
      nextFilter === activeFilter
    ) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setActiveFilter(nextFilter);
  }

  async function handleFormSaved(
    message,
  ) {
    setFormState(null);
    setSuccessMessage(message);

    await loadBudgets();
  }

  async function handleStatusChange(
    budget,
  ) {
    setActionBudgetId(
      budget.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await budgetService.updateBudgetStatus(
        budget.publicId,
        !budget.active,
      );

      setSuccessMessage(
        budget.active
          ? "Budget deactivated successfully."
          : "Budget activated successfully.",
      );

      await loadBudgets();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to update the budget status.",
        ),
      );
    } finally {
      setActionBudgetId(null);
    }
  }

  async function handleArchive(
    budget,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${budget.name}"? Its historical information will no longer appear in the budget workspace.`,
      );

    if (!confirmed) {
      return;
    }

    setActionBudgetId(
      budget.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await budgetService.archiveBudget(
        budget.publicId,
      );

      setSuccessMessage(
        "Budget archived successfully.",
      );

      await loadBudgets();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to archive the budget.",
        ),
      );
    } finally {
      setActionBudgetId(null);
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9 overflow-x-hidden"
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.19em] text-[#1f55cf] dark:text-blue-300">
            Spending control
          </p>

          <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.045em] text-[#080808] dark:text-white sm:mt-3 sm:text-[2.5rem]">
            Budgets
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:mt-3">
            Set overall or category spending limits and compare them with real posted expense transactions.
          </p>
        </div>

        <button
          type="button"
          disabled={
            dependenciesLoading
          }
          onClick={() =>
            setFormState({
              budget: null,
            })
          }
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1848b5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Create budget
        </button>
      </header>

      <section className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
        <SummaryCard
          label="Total budgets"
          value={
            summary?.totalBudgetCount ??
            0
          }
          icon={
            <PiggyBank className="h-5 w-5" />
          }
          tone="primary"
        />

        <SummaryCard
          label="On track"
          value={
            summary?.onTrackCount ?? 0
          }
          icon={
            <TrendingUp className="h-5 w-5" />
          }
          tone="success"
        />

        <SummaryCard
          label="Warning"
          value={
            summary?.warningCount ?? 0
          }
          icon={
            <Gauge className="h-5 w-5" />
          }
          tone="warning"
        />

        <SummaryCard
          label="Exceeded"
          value={
            summary?.exceededCount ?? 0
          }
          icon={
            <TrendingDown className="h-5 w-5" />
          }
          tone="danger"
        />

        <SummaryCard
          label="Inactive"
          value={
            summary?.inactiveCount ?? 0
          }
          icon={
            <ToggleLeft className="h-5 w-5" />
          }
          tone="neutral"
        />
      </section>

      <BudgetInsightPanel
        budgets={budgets}
        loading={loading}
        summary={summary}
        selectedMonth={selectedMonth}
      />

      <section className="mt-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:mt-6 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {BUDGET_STATUS_FILTERS.map(
              (filterOption) => (
                <button
                  key={
                    filterOption.value
                  }
                  type="button"
                  onClick={() =>
                    changeActiveFilter(
                      filterOption.value,
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                    activeFilter ===
                    filterOption.value
                      ? "bg-[#1f55cf] text-white shadow-[0_7px_15px_rgba(31,85,207,0.18)]"
                      : "bg-[#f1f5f9] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {
                    filterOption.label
                  }
                </button>
              ),
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="month"
                value={selectedMonth}
                onChange={changeMonth}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-[#0b1220] outline-none transition focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white sm:w-48"
              />
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value,
                  )
                }
                placeholder="Search budgets"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white sm:w-72"
              />
            </div>

            <button
              type="button"
              onClick={loadBudgets}
              disabled={loading}
              aria-label="Refresh budgets"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:opacity-50 dark:border-slate-700 dark:bg-[#0b1424] dark:text-slate-300"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {errorMessage && (
        <PageToastBridge
          type="error"
          message={errorMessage}
          onConsumed={() => setErrorMessage("")}
        />
      )}

      {successMessage && (
        <PageToastBridge
          type="success"
          message={successMessage}
          onConsumed={() => setSuccessMessage("")}
        />
      )}

      {(summary?.currencies?.length ??
        0) > 0 && (
        <section className="mt-6">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[#1f55cf] dark:text-blue-300">
              Currency-safe totals
            </p>

            <h2 className="mt-2 text-[1.45rem] font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
              {formatMonthTitle(
                selectedMonth,
              )} summary
            </h2>
          </div>

          <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-2">
            {summary.currencies.map(
              (currencySummary) => (
                <CurrencySummaryCard
                  key={
                    currencySummary.currencyCode
                  }
                  summary={
                    currencySummary
                  }
                />
              ),
            )}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[1.45rem] font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
              Budget plans
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {visibleBudgets.length} matching budget
              {visibleBudgets.length === 1
                ? ""
                : "s"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <BudgetSkeletons />
          ) : visibleBudgets.length ===
            0 ? (
            <EmptyBudgets
              filtered={Boolean(
                searchText.trim(),
              )}
              onCreate={() =>
                setFormState({
                  budget: null,
                })
              }
            />
          ) : (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleBudgets.map(
                (budget) => (
                  <BudgetCard
                    key={
                      budget.publicId
                    }
                    budget={budget}
                    actionPending={
                      actionBudgetId ===
                      budget.publicId
                    }
                    onEdit={() =>
                      setFormState({
                        budget,
                      })
                    }
                    onStatusChange={() =>
                      handleStatusChange(
                        budget,
                      )
                    }
                    onArchive={() =>
                      handleArchive(
                        budget,
                      )
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      </section>

      {formState && (
        <BudgetFormModal
          key={
            formState.budget
              ?.publicId ??
            "new-budget"
          }
          budget={
            formState.budget
          }
          categories={categories}
          suggestedCurrencies={
            suggestedCurrencies
          }
          selectedMonth={
            selectedMonth
          }
          onClose={() =>
            setFormState(null)
          }
          onSaved={
            handleFormSaved
          }
        />
      )}

      <style>{`
        .budget-form-input {
          height: 2.9rem;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding-right: 0.9rem;
          font-size: 0.875rem;
          color: #0b1220;
          outline: none;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease;
        }

        .budget-form-input:focus {
          border-color: #1f55cf;
          box-shadow: 0 0 0 4px rgb(31 85 207 / 10%);
        }

        .dark .budget-form-input {
          border-color: rgb(51 65 85);
          background: #0b1424;
          color: white;
        }
      `}</style>
    </div>
  );
}

function getHighestRiskBudget(budgets) {
  const riskRank = {
    EXCEEDED: 4,
    WARNING: 3,
    ON_TRACK: 2,
    INACTIVE: 1,
  };

  return [...budgets]
    .filter((budget) => budget.active)
    .sort((left, right) => {
      const rightRank = riskRank[right.status] ?? 0;
      const leftRank = riskRank[left.status] ?? 0;

      if (rightRank !== leftRank) {
        return rightRank - leftRank;
      }

      return (
        Number(right.percentageUsed ?? 0) -
        Number(left.percentageUsed ?? 0)
      );
    })[0];
}

function BudgetInsightPanel({
  budgets,
  loading,
  summary,
  selectedMonth,
}) {
  const activeBudgets = budgets.filter(
    (budget) => budget.active,
  );

  const highestRiskBudget =
    getHighestRiskBudget(activeBudgets);

  const exceededCount =
    summary?.exceededCount ?? 0;

  const warningCount =
    summary?.warningCount ?? 0;

  let title = loading
    ? "Checking budget usage"
    : "Budgets are under control";

  let description = loading
    ? "ExpenseIQ is comparing your active budgets with posted expenses."
    : "Your active budgets are currently within their planned limits.";

  let icon =
    <PiggyBank className="h-5 w-5" />;

  let toneClass =
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";

  if (!loading && exceededCount > 0) {
    title = `${exceededCount} budget${
      exceededCount === 1 ? "" : "s"
    } exceeded`;

    description = highestRiskBudget
      ? `${highestRiskBudget.name} is at ${formatPercentage(
          highestRiskBudget.percentageUsed,
        )}% usage for ${formatMonthTitle(
          selectedMonth,
        )}.`
      : "One or more budgets have crossed their limit.";

    icon =
      <TrendingDown className="h-5 w-5" />;

    toneClass =
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300";
  } else if (!loading && warningCount > 0) {
    title = `${warningCount} budget${
      warningCount === 1 ? "" : "s"
    } near limit`;

    description = highestRiskBudget
      ? `${highestRiskBudget.name} has reached ${formatPercentage(
          highestRiskBudget.percentageUsed,
        )}% of its limit. Slow down before it exceeds.`
      : "Some budgets are close to their warning threshold.";

    icon = <Gauge className="h-5 w-5" />;

    toneClass =
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300";
  } else if (
    !loading &&
    activeBudgets.length === 0
  ) {
    title = "No active budgets yet";
    description =
      "Create an overall or category budget to start tracking spending risk.";

    toneClass =
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300";
  }

  return (
    <section
      className={`mt-4 rounded-[1.35rem] border px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.035)] sm:mt-6 sm:px-5 ${toneClass}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
            {icon}
          </div>

          <div>
            <h2 className="text-base font-extrabold tracking-[-0.02em]">
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 opacity-85">
              {description}
            </p>
          </div>
        </div>

        {highestRiskBudget && !loading && (
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-extrabold shadow-sm dark:bg-white/10">
            {formatCurrency(
              highestRiskBudget.remainingAmount,
              highestRiskBudget.currencyCode,
            )}{" "}
            remaining
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
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
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    danger:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    neutral:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <article className="rounded-[1.3rem] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-[1.65rem] font-extrabold leading-none tracking-[-0.035em] text-[#080808] tabular-nums dark:text-white sm:mt-3 sm:text-[1.8rem]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

function CurrencySummaryCard({
  summary,
}) {
  return (
    <article className="rounded-[1.45rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
            {summary.currencyCode}
          </span>

          <h3 className="mt-4 text-lg font-extrabold text-[#0b1220] dark:text-white">
            Budget allocation
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Layers3 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
        <CurrencyMetric
          label="Overall limit"
          value={formatCurrency(
            summary.overallBudgetLimit,
            summary.currencyCode,
          )}
        />

        <CurrencyMetric
          label="Overall spent"
          value={formatCurrency(
            summary.overallBudgetSpent,
            summary.currencyCode,
          )}
          expense
        />

        <CurrencyMetric
          label="Category limits"
          value={formatCurrency(
            summary.categoryBudgetLimit,
            summary.currencyCode,
          )}
        />

        <CurrencyMetric
          label="Category spent"
          value={formatCurrency(
            summary.categoryBudgetSpent,
            summary.currencyCode,
          )}
          expense
        />
      </div>
    </article>
  );
}

function CurrencyMetric({
  label,
  value,
  expense = false,
}) {
  return (
    <div className="rounded-2xl bg-[#f8fafc] p-3 dark:bg-[#0b1424] sm:p-4">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-extrabold tabular-nums ${
          expense
            ? "text-rose-600 dark:text-rose-300"
            : "text-[#0b1220] dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BudgetCard({
  budget,
  actionPending,
  onEdit,
  onStatusChange,
  onArchive,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const progressWidth =
    clampPercentage(
      budget.percentageUsed,
    );

  return (
    <article className="relative rounded-[1.45rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.075)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
          <PiggyBank className="h-5 w-5" />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (current) => !current,
              )
            }
            aria-label="Budget actions"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#1f55cf] dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#101a2c]">
              <BudgetActionButton
                icon={
                  <Edit3 className="h-4 w-4" />
                }
                label="Edit budget"
                disabled={
                  actionPending
                }
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              />

              <BudgetActionButton
                icon={
                  budget.active ? (
                    <ToggleLeft className="h-4 w-4" />
                  ) : (
                    <ToggleRight className="h-4 w-4" />
                  )
                }
                label={
                  budget.active
                    ? "Deactivate"
                    : "Activate"
                }
                disabled={
                  actionPending
                }
                onClick={() => {
                  setMenuOpen(false);
                  onStatusChange();
                }}
              />

              <BudgetActionButton
                icon={
                  <Archive className="h-4 w-4" />
                }
                label="Archive budget"
                danger
                disabled={
                  actionPending
                }
                onClick={() => {
                  setMenuOpen(false);
                  onArchive();
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold tracking-[-0.02em] text-[#0b1220] dark:text-white">
              {budget.name}
            </h3>

            <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {budget.overallBudget
                ? "Overall spending"
                : budget.categoryName}
            </p>
          </div>

          <BudgetStatusBadge
            status={budget.status}
          />
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Spent
            </p>

            <p className="mt-1 text-[1.5rem] font-extrabold tracking-[-0.03em] text-[#080808] tabular-nums dark:text-white">
              {formatCurrency(
                budget.spentAmount,
                budget.currencyCode,
              )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Limit
            </p>

            <p className="mt-1 text-sm font-extrabold text-slate-700 tabular-nums dark:text-slate-200">
              {formatCurrency(
                budget.limitAmount,
                budget.currencyCode,
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:mt-4">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${getProgressClass(
              budget.status,
            )}`}
            style={{
              width: `${progressWidth}%`,
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-4 text-xs">
          <span className="font-extrabold text-slate-700 tabular-nums dark:text-slate-200">
            {formatPercentage(
              budget.percentageUsed,
            )}
            % used
          </span>

          <span className="text-slate-500 dark:text-slate-400">
            Warning at{" "}
            {budget.warningThreshold}%
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#f8fafc] p-3 dark:bg-[#0b1424] sm:mt-5 sm:p-4">
          <BudgetDetail
            label="Remaining"
            value={formatCurrency(
              budget.remainingAmount,
              budget.currencyCode,
            )}
            negative={
              Number(
                budget.remainingAmount,
              ) < 0
            }
          />

          <BudgetDetail
            label="Period"
            value={
              budget.periodType ===
              "MONTHLY"
                ? "Monthly"
                : "Custom"
            }
          />
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:mt-4">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />

          <span>
            {formatDateRange(
              budget.startDate,
              budget.endDate,
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

function BudgetDetail({
  label,
  value,
  negative = false,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-xs font-extrabold ${
          negative
            ? "text-rose-600 dark:text-rose-300"
            : "text-[#0b1220] dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BudgetStatusBadge({
  status,
}) {
  const statusClasses = {
    ON_TRACK:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    WARNING:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    EXCEEDED:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    INACTIVE:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-wide ${
        statusClasses[status] ??
        statusClasses.INACTIVE
      }`}
    >
      {getBudgetStatusLabel(
        status,
      )}
    </span>
  );
}

function getProgressClass(status) {
  if (status === "EXCEEDED") {
    return "bg-rose-500";
  }

  if (status === "WARNING") {
    return "bg-amber-500";
  }

  if (status === "INACTIVE") {
    return "bg-slate-400";
  }

  return "bg-emerald-500";
}

function BudgetActionButton({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}


function EmptyBudgets({
  filtered,
  onCreate,
}) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-10 text-center shadow-[0_14px_40px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:px-6 sm:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
        <PiggyBank className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
        {filtered
          ? "No matching budgets"
          : "No budgets for this period"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {filtered
          ? "Change your search text or budget filter."
          : "Create an overall or category-specific budget. Spending will be calculated from your real posted expenses."}
      </p>

      {!filtered && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:bg-[#1848b5]"
        >
          <Plus className="h-4 w-4" />
          Create first budget
        </button>
      )}
    </div>
  );
}

function BudgetSkeletons() {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
      {BUDGET_SKELETON_KEYS.map(
        (key) => (
          <div
            key={key}
            className="animate-pulse rounded-[1.45rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#101a2c]"
          >
            <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-6 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="mt-3 h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />

            <div className="mt-7 h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="mt-5 h-2.5 rounded bg-slate-100 dark:bg-slate-800" />

            <div className="mt-6 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ),
      )}
    </div>
  );
}

import {
  createElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  Gauge,
  Landmark,
  Layers3,
  LoaderCircle,
  PiggyBank,
  ReceiptText,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import { appRoutes } from "../config/appConfig";
import { getBudgetStatusLabel } from "../config/budgetOptions";
import { getDashboard } from "../services/dashboardService";
import DashboardGoalsOverview from "../components/DashboardGoalsOverview";
import PageToastBridge from "../components/PageToastBridge";

const TRANSACTION_TYPE_CONFIG = {
  INCOME: {
    label: "Income",
    icon: ArrowUpRight,
    amountClass:
      "text-emerald-600 dark:text-emerald-400",
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amountPrefix: "+",
  },
  EXPENSE: {
    label: "Expense",
    icon: ArrowDownRight,
    amountClass:
      "text-rose-600 dark:text-rose-400",
    iconClass:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    amountPrefix: "-",
  },
  TRANSFER: {
    label: "Transfer",
    icon: Repeat2,
    amountClass:
      "text-[#1f55cf] dark:text-blue-300",
    iconClass:
      "bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300",
    amountPrefix: "",
  },
};

function getLocale() {
  if (
    typeof navigator !== "undefined" &&
    navigator.language
  ) {
    return navigator.language;
  }

  return "en-IN";
}

function formatCurrency(
  amount,
  currencyCode,
) {
  const numericAmount = Number(
    amount ?? 0,
  );

  try {
    return new Intl.NumberFormat(
      getLocale(),
      {
        style: "currency",
        currency:
          currencyCode || "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(numericAmount);
  } catch {
    return `${currencyCode || ""} ${numericAmount.toFixed(
      2,
    )}`.trim();
  }
}

function formatIsoDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const dateParts =
    dateValue.split("-");

  if (dateParts.length !== 3) {
    return dateValue;
  }

  const [year, month, day] =
    dateParts;

  if (
    !year ||
    !month ||
    !day
  ) {
    return dateValue;
  }

  return `${day}-${month}-${year}`;
}

function formatMonthRange(
  periodStart,
  periodEnd,
) {
  if (!periodStart || !periodEnd) {
    return "Current month";
  }

  return `${formatIsoDate(
    periodStart,
  )} - ${formatIsoDate(
    periodEnd,
  )}`;
}

function formatPercentage(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.00%";
  }

  return `${numericValue.toFixed(2)}%`;
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

function getTransactionAccountName(
  transaction,
) {
  return (
    transaction?.account?.name ??
    transaction?.accountName ??
    transaction?.sourceAccount?.name ??
    transaction?.sourceAccountName ??
    "Financial account"
  );
}

function getDestinationAccountName(
  transaction,
) {
  return (
    transaction?.destinationAccount
      ?.name ??
    transaction
      ?.destinationAccountName ??
    null
  );
}

function getCategoryName(transaction) {
  return (
    transaction?.category?.name ??
    transaction?.categoryName ??
    null
  );
}

function getTransactionTitle(
  transaction,
) {
  return (
    transaction?.merchantName ??
    transaction?.description ??
    transaction?.referenceNumber ??
    transaction?.reference ??
    getCategoryName(transaction) ??
    TRANSACTION_TYPE_CONFIG[
      transaction?.transactionType
    ]?.label ??
    "Transaction"
  );
}

function getErrorMessage(
  error,
  fallback,
) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    fallback
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>

        <p className="mt-5 text-base font-extrabold text-[#0b1220] dark:text-white">
          Loading your dashboard
        </p>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Reading your accounts, transactions, and budgets.
        </p>
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          <TriangleAlert className="h-6 w-6" />
        </div>

        <h2 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-[#0b1220] dark:text-white">
          Dashboard could not be loaded
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(31,85,207,0.2)] transition hover:bg-[#1848b5]"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.055)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-7 sm:p-9 lg:p-11">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
            <WalletCards className="h-6 w-6" />
          </div>

          <p className="mt-7 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[#1f55cf] dark:text-blue-300">
            Your workspace is ready
          </p>

          <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-[-0.035em] text-[#080808] dark:text-white sm:text-[2.15rem]">
            Start with the accounts you actually use
          </h2>

          <p className="mt-4 max-w-xl text-[0.95rem] leading-7 text-slate-600 dark:text-slate-400">
            Add a cash, bank, wallet, savings, or card account with its real opening balance. Your dashboard will update as you record income, expenses, and transfers.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to={appRoutes.accounts}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:bg-[#1848b5]"
            >
              <Landmark className="h-4 w-4" />
              Add financial account
            </Link>

            <Link
              to={appRoutes.categories}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-extrabold text-[#0b1220] transition hover:border-[#1f55cf] hover:text-[#1f55cf] dark:border-slate-700 dark:bg-[#101a2c] dark:text-white"
            >
              Review categories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-[#f8fafc] p-7 dark:border-slate-800 dark:bg-[#0b1424] sm:p-9 lg:border-l lg:border-t-0 lg:p-11">
          <p className="text-sm font-extrabold text-[#0b1220] dark:text-white">
            Build your first financial view
          </p>

          <div className="mt-6 space-y-5">
            <OnboardingStep
              number="01"
              title="Create an account"
              description="Add the source where your money is currently held."
            />

            <OnboardingStep
              number="02"
              title="Record activity"
              description="Add income, expenses, and transfers using real values."
            />

            <OnboardingStep
              number="03"
              title="Review the result"
              description="See balances and monthly cash flow calculated from confirmed records."
            />
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1f55cf] dark:text-blue-300" />

            <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
              Only records belonging to your authenticated account are included in this dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OnboardingStep({
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-extrabold text-[#1f55cf] shadow-sm dark:bg-[#101a2c] dark:text-blue-300">
        {number}
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

function MetricCard({
  title,
  value,
  description,
  icon,
  iconClass,
}) {
  return (
    <article className="group rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(15,23,42,0.075)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[0.78rem] font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-[#080808] tabular-nums dark:text-white">
            {value}
          </p>

          <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
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

function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
  action,
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
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

      <div className="flex shrink-0 items-center gap-3">
        {action}

        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
            {createElement(icon, {
              className: "h-5 w-5",
              "aria-hidden": true,
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BalanceSection({ balances }) {
  if (!balances.length) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-7">
      <SectionHeader
        eyebrow="Account position"
        title="Balances by currency"
        description="Currencies remain separate so unrelated balances are never combined."
        icon={Banknote}
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {balances.map((balance) => (
          <article
            key={balance.currencyCode}
            className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 dark:border-slate-700 dark:bg-[#0b1424]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-lg bg-white px-2.5 py-1 text-[0.68rem] font-extrabold text-[#1f55cf] shadow-sm dark:bg-[#101a2c] dark:text-blue-300">
                {balance.currencyCode}
              </span>

              <span className="text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400">
                {balance.includedAccountCount} account
                {balance.includedAccountCount === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            <p className="mt-5 text-[1.75rem] font-extrabold tracking-[-0.035em] text-[#080808] tabular-nums dark:text-white">
              {formatCurrency(
                balance.totalBalance,
                balance.currencyCode,
              )}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CashFlowSection({ cashFlow }) {
  if (!cashFlow.length) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-7">
      <SectionHeader
        eyebrow="Current month"
        title="Cash flow by currency"
        description="Income and expenses are calculated only from posted transactions."
        icon={CircleDollarSign}
      />

      <div className="mt-7 space-y-4">
        {cashFlow.map((summary) => {
          const income = Number(
            summary.income ?? 0,
          );

          const expense = Number(
            summary.expense ?? 0,
          );

          const maximum = Math.max(
            income,
            expense,
            1,
          );

          const incomeWidth = Math.min(
            (income / maximum) * 100,
            100,
          );

          const expenseWidth = Math.min(
            (expense / maximum) * 100,
            100,
          );

          return (
            <article
              key={summary.currencyCode}
              className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 dark:border-slate-700 dark:bg-[#0b1424]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="rounded-lg bg-white px-2.5 py-1 text-[0.68rem] font-extrabold text-[#1f55cf] shadow-sm dark:bg-[#101a2c] dark:text-blue-300">
                    {summary.currencyCode}
                  </span>

                  <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Net cash flow
                  </p>

                  <p
                    className={`mt-1 text-[1.55rem] font-extrabold tracking-[-0.03em] tabular-nums ${
                      Number(
                        summary.netCashFlow,
                      ) >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {formatCurrency(
                      summary.netCashFlow,
                      summary.currencyCode,
                    )}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Posted records
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-[#080808] tabular-nums dark:text-white">
                    {
                      summary.postedTransactionCount
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <CashFlowBar
                  label="Income"
                  value={summary.income}
                  currencyCode={
                    summary.currencyCode
                  }
                  width={incomeWidth}
                  labelClass="text-emerald-600 dark:text-emerald-400"
                  barClass="bg-emerald-500"
                />

                <CashFlowBar
                  label="Expense"
                  value={summary.expense}
                  currencyCode={
                    summary.currencyCode
                  }
                  width={expenseWidth}
                  labelClass="text-rose-600 dark:text-rose-400"
                  barClass="bg-rose-500"
                />
              </div>

              {Number(
                summary.transferVolume ?? 0,
              ) > 0 && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <Repeat2 className="h-4 w-4 text-[#1f55cf] dark:text-blue-300" />

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Transfer volume{" "}
                    <strong className="ml-1 font-extrabold tabular-nums text-[#0b1220] dark:text-white">
                      {formatCurrency(
                        summary.transferVolume,
                        summary.currencyCode,
                      )}
                    </strong>
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CashFlowBar({
  label,
  value,
  currencyCode,
  width,
  labelClass,
  barClass,
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span
          className={`text-xs font-extrabold ${labelClass}`}
        >
          {label}
        </span>

        <span className="text-xs font-extrabold text-[#0b1220] tabular-nums dark:text-white">
          {formatCurrency(
            value,
            currencyCode,
          )}
        </span>
      </div>

      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full ${barClass} transition-[width] duration-700`}
          style={{
            width: `${width}%`,
          }}
        />
      </div>
    </div>
  );
}

function BudgetOverviewSection({
  budgetOverview,
}) {
  const budgetSummary =
    budgetOverview?.summary ?? null;

  const overallBudget =
    budgetOverview?.overallBudget ?? null;

  const highestRiskCategory =
    budgetOverview
      ?.highestRiskCategoryBudget ??
    null;

  const totalBudgetCount =
    Number(
      budgetSummary?.totalBudgetCount ??
        0,
    );

  const inactiveCount = Number(
    budgetSummary?.inactiveCount ?? 0,
  );

  const activeCount = Math.max(
    totalBudgetCount - inactiveCount,
    0,
  );

  const onTrackCount = Number(
    budgetSummary?.onTrackCount ?? 0,
  );

  const warningCount = Number(
    budgetSummary?.warningCount ?? 0,
  );

  const exceededCount = Number(
    budgetSummary?.exceededCount ?? 0,
  );

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-7">
      <SectionHeader
        eyebrow="Monthly controls"
        title="Budget position"
        description="Limits and usage are calculated from your active budgets and posted expense transactions."
        icon={PiggyBank}
        action={
          <Link
            to={appRoutes.budgets}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-[#1f55cf] transition hover:border-[#1f55cf] dark:border-slate-700 dark:bg-[#0b1424] dark:text-blue-300"
          >
            Manage budgets
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <BudgetCountCard
          label="Active"
          value={activeCount}
          className="bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300"
        />

        <BudgetCountCard
          label="On track"
          value={onTrackCount}
          className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
        />

        <BudgetCountCard
          label="Warning"
          value={warningCount}
          className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
        />

        <BudgetCountCard
          label="Exceeded"
          value={exceededCount}
          className="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
        />
      </div>

      {(budgetSummary?.currencies
        ?.length ?? 0) > 0 && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {budgetSummary.currencies.map(
            (currencySummary) => (
              <BudgetCurrencySummary
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
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <BudgetProgressCard
          eyebrow="Overall monthly budget"
          budget={overallBudget}
          emptyTitle="No active overall budget"
          emptyDescription="Create an overall budget to compare total monthly spending with one clear limit."
        />

        <BudgetProgressCard
          eyebrow="Highest-risk category"
          budget={
            highestRiskCategory
          }
          emptyTitle="No category budget risk"
          emptyDescription="Create category budgets to identify which spending area is closest to its limit."
          categoryMode
        />
      </div>
    </section>
  );
}

function BudgetCountCard({
  label,
  value,
  className,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 dark:border-slate-700 dark:bg-[#0b1424]">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${className}`}
      >
        <Layers3 className="h-4 w-4" />
      </div>

      <p className="mt-4 text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold tabular-nums text-[#080808] dark:text-white">
        {value}
      </p>
    </article>
  );
}

function BudgetCurrencySummary({
  summary,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 dark:border-slate-700 dark:bg-[#0b1424]">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-lg bg-white px-2.5 py-1 text-[0.68rem] font-extrabold text-[#1f55cf] shadow-sm dark:bg-[#101a2c] dark:text-blue-300">
          {summary.currencyCode}
        </span>

        <span className="text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
          Active budget allocation
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <BudgetCurrencyMetric
          label="Overall limit"
          value={formatCurrency(
            summary.overallBudgetLimit,
            summary.currencyCode,
          )}
        />

        <BudgetCurrencyMetric
          label="Overall spent"
          value={formatCurrency(
            summary.overallBudgetSpent,
            summary.currencyCode,
          )}
          expense
        />

        <BudgetCurrencyMetric
          label="Category limits"
          value={formatCurrency(
            summary.categoryBudgetLimit,
            summary.currencyCode,
          )}
        />

        <BudgetCurrencyMetric
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

function BudgetCurrencyMetric({
  label,
  value,
  expense = false,
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-xs font-extrabold tabular-nums ${
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

function BudgetProgressCard({
  eyebrow,
  budget,
  emptyTitle,
  emptyDescription,
  categoryMode = false,
}) {
  if (!budget) {
    return (
      <article className="rounded-2xl border border-dashed border-slate-300 bg-[#f8fafc] p-6 dark:border-slate-700 dark:bg-[#0b1424]">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
          {categoryMode ? (
            <Gauge className="h-5 w-5" />
          ) : (
            <PiggyBank className="h-5 w-5" />
          )}
        </div>

        <h3 className="mt-5 text-base font-extrabold text-[#0b1220] dark:text-white">
          {emptyTitle}
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
          {emptyDescription}
        </p>

        <Link
          to={appRoutes.budgets}
          className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#1f55cf] dark:text-blue-300"
        >
          Open budgets
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </article>
    );
  }

  const progressWidth =
    clampPercentage(
      budget.percentageUsed,
    );

  const remainingAmount =
    Number(
      budget.remainingAmount ?? 0,
    );

  return (
    <article className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 dark:border-slate-700 dark:bg-[#0b1424]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[#1f55cf] dark:text-blue-300">
            {eyebrow}
          </p>

          <h3 className="mt-2 truncate text-lg font-extrabold text-[#0b1220] dark:text-white">
            {budget.name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {budget.overallBudget
              ? "Overall spending"
              : budget.categoryName}
            {" · "}
            {budget.currencyCode}
          </p>
        </div>

        <BudgetStatusBadge
          status={budget.status}
        />
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
            Spent
          </p>

          <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em] tabular-nums text-[#080808] dark:text-white">
            {formatCurrency(
              budget.spentAmount,
              budget.currencyCode,
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
            Limit
          </p>

          <p className="mt-1 text-sm font-extrabold tabular-nums text-[#0b1220] dark:text-white">
            {formatCurrency(
              budget.limitAmount,
              budget.currencyCode,
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${getBudgetProgressClass(
            budget.status,
          )}`}
          style={{
            width: `${progressWidth}%`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-4 text-[0.68rem]">
        <span className="font-extrabold text-[#0b1220] dark:text-white">
          {formatPercentage(
            budget.percentageUsed,
          )}{" "}
          used
        </span>

        <span className="text-slate-500 dark:text-slate-400">
          Warning at{" "}
          {budget.warningThreshold}%
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#101a2c]">
        <div>
          <p className="text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400">
            Remaining
          </p>

          <p
            className={`mt-1 text-xs font-extrabold tabular-nums ${
              remainingAmount < 0
                ? "text-rose-600 dark:text-rose-300"
                : "text-[#0b1220] dark:text-white"
            }`}
          >
            {formatCurrency(
              budget.remainingAmount,
              budget.currencyCode,
            )}
          </p>
        </div>

        <div>
          <p className="text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400">
            Period
          </p>

          <p className="mt-1 text-xs font-extrabold text-[#0b1220] dark:text-white">
            {formatMonthRange(
              budget.startDate,
              budget.endDate,
            )}
          </p>
        </div>
      </div>
    </article>
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
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-wide ${
        statusClasses[status] ??
        statusClasses.INACTIVE
      }`}
    >
      {getBudgetStatusLabel(status)}
    </span>
  );
}

function getBudgetProgressClass(
  status,
) {
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

function RecentTransactions({
  transactions,
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[#1f55cf] dark:text-blue-300">
            Latest activity
          </p>

          <h2 className="mt-2 text-[1.45rem] font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
            Recent transactions
          </h2>
        </div>

        <Link
          to={appRoutes.transactions}
          className="inline-flex items-center gap-2 text-sm font-extrabold text-[#1f55cf] transition hover:text-[#1848b5] dark:text-blue-300"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <ReceiptText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />

          <h3 className="mt-4 text-base font-extrabold text-[#0b1220] dark:text-white">
            No transactions yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Add an income, expense, or transfer after creating your first financial account.
          </p>

          <Link
            to={appRoutes.transactions}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-5 text-sm font-extrabold text-white transition hover:bg-[#1848b5]"
          >
            Open transactions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map(
            (transaction) => {
              const config =
                TRANSACTION_TYPE_CONFIG[
                  transaction
                    .transactionType
                ] ??
                TRANSACTION_TYPE_CONFIG
                  .TRANSFER;

              const destinationName =
                getDestinationAccountName(
                  transaction,
                );

              return (
                <article
                  key={
                    transaction.publicId
                  }
                  className="flex flex-col gap-4 px-6 py-4 transition hover:bg-[#f8fafc] dark:hover:bg-[#0b1424] sm:flex-row sm:items-center sm:justify-between sm:px-7"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.iconClass}`}
                    >
                      {createElement(
                        config.icon,
                        {
                          className:
                            "h-5 w-5",
                          "aria-hidden":
                            true,
                        },
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold text-[#0b1220] dark:text-white">
                        {getTransactionTitle(
                          transaction,
                        )}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {getTransactionAccountName(
                          transaction,
                        )}

                        {destinationName
                          ? ` → ${destinationName}`
                          : ""}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-slate-500 dark:text-slate-400">
                        <span>
                          {formatIsoDate(
                            transaction
                              .transactionDate,
                          )}
                        </span>

                        {getCategoryName(
                          transaction,
                        ) && (
                          <span>
                            {getCategoryName(
                              transaction,
                            )}
                          </span>
                        )}

                        <span className="rounded-full bg-slate-100 px-2 py-1 font-bold dark:bg-slate-800">
                          {
                            transaction
                              .transactionStatus
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-base font-extrabold tabular-nums ${config.amountClass}`}
                  >
                    {config.amountPrefix}
                    {formatCurrency(
                      transaction.amount,
                      transaction.currencyCode,
                    )}
                  </p>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let active = true;

    async function initialiseDashboard() {
      try {
        const dashboardData =
          await getDashboard();

        if (!active) {
          return;
        }

        setDashboard(
          dashboardData,
        );

        setErrorMessage("");
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to load your dashboard.",
          ),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initialiseDashboard();

    return () => {
      active = false;
    };
  }, []);

  async function retryDashboard() {
    setLoading(true);
    setErrorMessage("");

    try {
      const dashboardData =
        await getDashboard();

      setDashboard(
        dashboardData,
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to load your dashboard.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshDashboard() {
    setRefreshing(true);
    setErrorMessage("");

    try {
      const dashboardData =
        await getDashboard();

      setDashboard(
        dashboardData,
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to refresh your dashboard.",
        ),
      );
    } finally {
      setRefreshing(false);
    }
  }

  const balances = useMemo(
    () =>
      dashboard?.balancesByCurrency ??
      [],
    [dashboard],
  );

  const cashFlow = useMemo(
    () =>
      dashboard
        ?.currentMonthCashFlow ?? [],
    [dashboard],
  );

  const recentTransactions =
    useMemo(
      () =>
        dashboard
          ?.recentTransactions ?? [],
    [dashboard],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (errorMessage && !dashboard) {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={retryDashboard}
      />
    );
  }

  if (!dashboard) {
    return null;
  }

  const hasNoFinancialData =
    dashboard.totalAccountCount === 0 &&
    dashboard.transactionCounts.total ===
      0;

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
            Financial overview
          </p>

          <h1 className="mt-3 text-[2.15rem] font-extrabold tracking-[-0.045em] text-[#080808] dark:text-white sm:text-[2.5rem]">
            Dashboard
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#1f55cf] dark:text-blue-300" />

              {formatMonthRange(
                dashboard.periodStart,
                dashboard.periodEnd,
              )}
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

            <span>
              {dashboard.timezone}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={
            refreshDashboard
          }
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-[#0b1220] shadow-sm transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#101a2c] dark:text-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh dashboard"}
        </button>
      </header>
      {errorMessage && dashboard && (
        <PageToastBridge
          type="warning"
          title="Dashboard refresh failed"
          message={errorMessage}
          onConsumed={() => setErrorMessage("")}
        />
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active accounts"
          value={
            dashboard.activeAccountCount
          }
          description={`${dashboard.totalAccountCount} total account${
            dashboard.totalAccountCount ===
            1
              ? ""
              : "s"
          }`}
          icon={Landmark}
          iconClass="bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300"
        />

        <MetricCard
          title="Posted transactions"
          value={
            dashboard.transactionCounts
              .posted
          }
          description="Confirmed records affecting balances"
          icon={ReceiptText}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />

        <MetricCard
          title="Cancelled transactions"
          value={
            dashboard.transactionCounts
              .cancelled
          }
          description="Balance effects safely reversed"
          icon={Repeat2}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />

        <MetricCard
          title="Transaction records"
          value={
            dashboard.transactionCounts
              .total
          }
          description="Posted and cancelled activity"
          icon={CircleDollarSign}
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
        />
      </section>

      <div className="mt-6">
        {hasNoFinancialData ? (
          <EmptyDashboard />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <BalanceSection
              balances={balances}
            />

            <CashFlowSection
              cashFlow={cashFlow}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
  <BudgetOverviewSection
    budgetOverview={
      dashboard.budgetOverview
    }
  />
</div>

<div className="mt-6">
  <DashboardGoalsOverview
    goalOverview={
      dashboard.goalOverview
    }
  />
</div>

{!hasNoFinancialData && (
        <div className="mt-6">
          <RecentTransactions
            transactions={
              recentTransactions
            }
          />
        </div>
      )}
    </div>
  );
}
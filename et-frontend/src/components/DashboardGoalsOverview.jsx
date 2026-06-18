import {
    ArrowRight,
    CalendarDays,
    CircleAlert,
    CirclePause,
    Goal,
    Target,
    Timer,
    Trophy,
  } from "lucide-react";
  import { Link } from "react-router";
  
  import { appRoutes } from "../config/appConfig";
  
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
  
    const parts =
      dateValue.split("-");
  
    if (parts.length !== 3) {
      return dateValue;
    }
  
    const [year, month, day] =
      parts;
  
    return `${day}-${month}-${year}`;
  }
  
  function formatPercentage(value) {
    const numericValue =
      Number(value);
  
    if (!Number.isFinite(numericValue)) {
      return "0.00%";
    }
  
    return `${numericValue.toFixed(
      2,
    )}%`;
  }
  
  function clampPercentage(value) {
    const numericValue =
      Number(value);
  
    if (!Number.isFinite(numericValue)) {
      return 0;
    }
  
    return Math.min(
      Math.max(numericValue, 0),
      100,
    );
  }
  
  function getGoalStatusLabel(status) {
    const labels = {
      IN_PROGRESS: "In progress",
      PAUSED: "Paused",
      COMPLETED: "Completed",
      OVERDUE: "Overdue",
    };
  
    return labels[status] ?? "Unknown";
  }
  
  function getGoalStatusClass(status) {
    const classes = {
      IN_PROGRESS:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      PAUSED:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      COMPLETED:
        "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
      OVERDUE:
        "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    };
  
    return (
      classes[status] ??
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
    );
  }
  
  function getGoalProgressClass(status) {
    if (status === "COMPLETED") {
      return "bg-violet-500";
    }
  
    if (status === "OVERDUE") {
      return "bg-rose-500";
    }
  
    if (status === "PAUSED") {
      return "bg-amber-500";
    }
  
    return "bg-emerald-500";
  }
  
  function getDeadlineText(goal) {
    if (goal.status === "COMPLETED") {
      return "Goal completed";
    }
  
    if (goal.overdue) {
      return "Target date passed";
    }
  
    const daysRemaining =
      Number(
        goal.daysRemaining ?? 0,
      );
  
    if (daysRemaining === 0) {
      return "Due today";
    }
  
    return `${daysRemaining} day${
      daysRemaining === 1
        ? ""
        : "s"
    } remaining`;
  }
  
  function CountCard({
    label,
    value,
    icon: Icon,
    iconClass,
  }) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 dark:border-slate-700 dark:bg-[#0b1424]">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon
            className="h-4 w-4"
            aria-hidden="true"
          />
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
  
  function CurrencySummaryCard({
    summary,
  }) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 dark:border-slate-700 dark:bg-[#0b1424]">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-lg bg-white px-2.5 py-1 text-[0.68rem] font-extrabold text-[#1f55cf] shadow-sm dark:bg-[#101a2c] dark:text-blue-300">
            {summary.currencyCode}
          </span>
  
          <span className="text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
            Active savings allocation
          </span>
        </div>
  
        <div className="mt-5 grid grid-cols-3 gap-4">
          <CurrencyMetric
            label="Target"
            value={formatCurrency(
              summary.totalTargetAmount,
              summary.currencyCode,
            )}
          />
  
          <CurrencyMetric
            label="Saved"
            value={formatCurrency(
              summary.totalSavedAmount,
              summary.currencyCode,
            )}
            positive
          />
  
          <CurrencyMetric
            label="Remaining"
            value={formatCurrency(
              summary.totalRemainingAmount,
              summary.currencyCode,
            )}
          />
        </div>
      </article>
    );
  }
  
  function CurrencyMetric({
    label,
    value,
    positive = false,
  }) {
    return (
      <div className="min-w-0">
        <p className="text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
  
        <p
          className={`mt-1 truncate text-xs font-extrabold tabular-nums ${
            positive
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-[#0b1220] dark:text-white"
          }`}
        >
          {value}
        </p>
      </div>
    );
  }
  
  function GoalHighlightCard({
    eyebrow,
    goal,
    emptyTitle,
    emptyDescription,
  }) {
    if (!goal) {
      return (
        <article className="rounded-2xl border border-dashed border-slate-300 bg-[#f8fafc] p-6 dark:border-slate-700 dark:bg-[#0b1424]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
            <Target className="h-5 w-5" />
          </div>
  
          <h3 className="mt-5 text-base font-extrabold text-[#0b1220] dark:text-white">
            {emptyTitle}
          </h3>
  
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            {emptyDescription}
          </p>
  
          <Link
            to={appRoutes.goals}
            className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#1f55cf] dark:text-blue-300"
          >
            Open goals
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>
      );
    }
  
    const progressWidth =
      clampPercentage(
        goal.progressPercentage,
      );
  
    return (
      <article className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 dark:border-slate-700 dark:bg-[#0b1424]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-[#1f55cf] dark:text-blue-300">
              {eyebrow}
            </p>
  
            <h3 className="mt-2 truncate text-lg font-extrabold text-[#0b1220] dark:text-white">
              {goal.name}
            </h3>
  
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {goal.description ||
                "Savings target connected to your authenticated workspace."}
            </p>
          </div>
  
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-wide ${getGoalStatusClass(
              goal.status,
            )}`}
          >
            {getGoalStatusLabel(
              goal.status,
            )}
          </span>
        </div>
  
        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
              Saved
            </p>
  
            <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em] tabular-nums text-[#080808] dark:text-white">
              {formatCurrency(
                goal.currentAmount,
                goal.currencyCode,
              )}
            </p>
          </div>
  
          <div className="text-right">
            <p className="text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
              Target
            </p>
  
            <p className="mt-1 text-sm font-extrabold tabular-nums text-[#0b1220] dark:text-white">
              {formatCurrency(
                goal.targetAmount,
                goal.currencyCode,
              )}
            </p>
          </div>
        </div>
  
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${getGoalProgressClass(
              goal.status,
            )}`}
            style={{
              width: `${progressWidth}%`,
            }}
          />
        </div>
  
        <div className="mt-2 flex items-center justify-between gap-4 text-[0.68rem]">
          <span className="font-extrabold text-[#0b1220] dark:text-white">
            {formatPercentage(
              goal.progressPercentage,
            )}{" "}
            saved
          </span>
  
          <span className="text-slate-500 dark:text-slate-400">
            {goal.currencyCode}
          </span>
        </div>
  
        <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#101a2c]">
          <div>
            <p className="text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400">
              Remaining
            </p>
  
            <p className="mt-1 text-xs font-extrabold tabular-nums text-[#0b1220] dark:text-white">
              {formatCurrency(
                goal.remainingAmount,
                goal.currencyCode,
              )}
            </p>
          </div>
  
          <div>
            <p className="text-[0.65rem] font-semibold text-slate-500 dark:text-slate-400">
              Deadline
            </p>
  
            <p className="mt-1 text-xs font-extrabold text-[#0b1220] dark:text-white">
              {formatIsoDate(
                goal.targetDate,
              )}
            </p>
          </div>
        </div>
  
        <div className="mt-4 flex items-center gap-2 text-[0.68rem] text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5 text-[#1f55cf] dark:text-blue-300" />
  
          {getDeadlineText(goal)}
        </div>
      </article>
    );
  }
  
  export default function DashboardGoalsOverview({
    goalOverview,
  }) {
    const summary =
      goalOverview?.summary ?? {
        totalGoalCount: 0,
        inProgressCount: 0,
        pausedCount: 0,
        completedCount: 0,
        overdueCount: 0,
        currencies: [],
      };
  
    const totalGoalCount =
      Number(
        summary.totalGoalCount ?? 0,
      );
  
    const currencies =
      summary.currencies ?? [];
  
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[#1f55cf] dark:text-blue-300">
              Future planning
            </p>
  
            <h2 className="mt-2 text-[1.45rem] font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
              Savings goal position
            </h2>
  
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Targets, contributions, remaining amounts, and deadlines are calculated from your real savings-goal records.
            </p>
          </div>
  
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to={appRoutes.goals}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-[#1f55cf] transition hover:border-[#1f55cf] dark:border-slate-700 dark:bg-[#0b1424] dark:text-blue-300"
            >
              Manage goals
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
  
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
              <Goal className="h-5 w-5" />
            </div>
          </div>
        </div>
  
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <CountCard
            label="Total"
            value={totalGoalCount}
            icon={Goal}
            iconClass="bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300"
          />
  
          <CountCard
            label="In progress"
            value={Number(
              summary.inProgressCount ?? 0,
            )}
            icon={Target}
            iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
          />
  
          <CountCard
            label="Paused"
            value={Number(
              summary.pausedCount ?? 0,
            )}
            icon={CirclePause}
            iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
          />
  
          <CountCard
            label="Completed"
            value={Number(
              summary.completedCount ?? 0,
            )}
            icon={Trophy}
            iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
          />
  
          <CountCard
            label="Overdue"
            value={Number(
              summary.overdueCount ?? 0,
            )}
            icon={CircleAlert}
            iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
          />
        </div>
  
        {currencies.length > 0 && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {currencies.map(
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
        )}
  
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <GoalHighlightCard
            eyebrow="Highest progress"
            goal={
              goalOverview?.highestProgressGoal ??
              null
            }
            emptyTitle="No active goal progress"
            emptyDescription="Create a savings goal and record contributions to begin tracking progress."
          />
  
          <GoalHighlightCard
            eyebrow="Nearest deadline"
            goal={
              goalOverview?.nearestUpcomingGoal ??
              null
            }
            emptyTitle={
              totalGoalCount > 0
                ? "No upcoming deadline"
                : "No savings goal yet"
            }
            emptyDescription={
              totalGoalCount > 0
                ? "All visible goals are completed or currently have no future target date."
                : "Create a target with a future date to track its deadline here."
            }
          />
        </div>
  
        {totalGoalCount === 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
            <Timer className="mt-0.5 h-5 w-5 shrink-0 text-[#1f55cf] dark:text-blue-300" />
  
            <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
              Goal information will appear here after you create your first target. No sample progress or invented balances are displayed.
            </p>
          </div>
        )}
      </section>
    );
  }
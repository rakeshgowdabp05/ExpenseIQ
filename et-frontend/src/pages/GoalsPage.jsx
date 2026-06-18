import {
    Archive,
    Edit3,
    Goal,
    HandCoins,
    History,
    MoreVertical,
    PauseCircle,
    PlayCircle,
    Plus,
    RefreshCw,
    Search,
    Target,
    Timer,
    TriangleAlert,
    Trophy,
  } from "lucide-react";
  import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import GoalContributionHistoryModal from "../components/GoalContributionHistoryModal";
  import GoalContributionModal from "../components/GoalContributionModal";
  import GoalFormModal from "../components/GoalFormModal";
  import {
    GOAL_STATUS_FILTERS,
    getGoalStatusLabel,
  } from "../config/goalOptions";
  import { accountService } from "../services/accountService";
  import { goalService } from "../services/goalService";
  import { getApiErrorMessage } from "../utils/apiError";
import PageToastBridge from "../components/PageToastBridge";
  
  const GOAL_SKELETON_KEYS = [
    "goal-skeleton-1",
    "goal-skeleton-2",
    "goal-skeleton-3",
  ];
  
  function formatCurrency(
    amount,
    currencyCode,
  ) {
    const value = Number(amount ?? 0);
  
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
      ).format(value);
    } catch {
      return `${currencyCode ?? ""} ${value.toFixed(
        2,
      )}`.trim();
    }
  }
  
  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }
  
    const [year, month, day] =
      dateValue.split("-");
  
    if (!year || !month || !day) {
      return dateValue;
    }
  
    return `${day}-${month}-${year}`;
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
  
  function canContribute(goal) {
    return (
      Number(goal.remainingAmount) > 0 &&
      [
        "IN_PROGRESS",
        "OVERDUE",
      ].includes(goal.status)
    );
  }
  
  export default function GoalsPage() {
    const [goals, setGoals] =
      useState([]);
  
    const [summary, setSummary] =
      useState(null);
  
    const [accounts, setAccounts] =
      useState([]);
  
    const [statusFilter, setStatusFilter] =
      useState("ALL");
  
    const [searchText, setSearchText] =
      useState("");
  
    const [loading, setLoading] =
      useState(true);
  
    const [errorMessage, setErrorMessage] =
      useState("");
  
    const [
      successMessage,
      setSuccessMessage,
    ] = useState("");
  
    const [formGoal, setFormGoal] =
      useState(undefined);
  
    const [
      contributionGoal,
      setContributionGoal,
    ] = useState(null);
  
    const [
      historyGoal,
      setHistoryGoal,
    ] = useState(null);
  
    const [
      actionGoalId,
      setActionGoalId,
    ] = useState(null);
  
    useEffect(() => {
      let cancelled = false;
  
      Promise.all([
        goalService.getGoals(),
        goalService.getSummary(),
        accountService.getAccounts(true),
      ])
        .then(
          ([
            goalData,
            summaryData,
            accountData,
          ]) => {
            if (cancelled) {
              return;
            }
  
            setGoals(goalData);
            setSummary(summaryData);
            setAccounts(accountData);
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
              "Unable to load savings goals.",
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
    }, []);
  
    const visibleGoals =
      useMemo(() => {
        const normalizedSearch =
          searchText
            .trim()
            .toLowerCase();
  
        return goals.filter((goalItem) => {
          const statusMatches =
            statusFilter === "ALL" ||
            goalItem.status ===
              statusFilter;
  
          if (!statusMatches) {
            return false;
          }
  
          if (!normalizedSearch) {
            return true;
          }
  
          return [
            goalItem.name,
            goalItem.description,
            goalItem.currencyCode,
            goalItem.status,
          ].some((value) =>
            value
              ?.toString()
              .toLowerCase()
              .includes(
                normalizedSearch,
              ),
          );
        });
      }, [
        goals,
        searchText,
        statusFilter,
      ]);
  
    const suggestedCurrencies =
      useMemo(
        () =>
          Array.from(
            new Set(
              [
                ...accounts.map(
                  (account) =>
                    account.currencyCode,
                ),
                ...goals.map(
                  (goalItem) =>
                    goalItem.currencyCode,
                ),
                ...(
                  summary?.currencies ?? []
                ).map(
                  (currencySummary) =>
                    currencySummary.currencyCode,
                ),
              ].filter(Boolean),
            ),
          ).sort(),
        [accounts, goals, summary],
      );
  
    async function loadWorkspace(
      showLoading = true,
    ) {
      if (showLoading) {
        setLoading(true);
      }
  
      setErrorMessage("");
  
      try {
        const [
          goalData,
          summaryData,
          accountData,
        ] = await Promise.all([
          goalService.getGoals(),
          goalService.getSummary(),
          accountService.getAccounts(
            true,
          ),
        ]);
  
        setGoals(goalData);
        setSummary(summaryData);
        setAccounts(accountData);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to load savings goals.",
          ),
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    }
  
    async function handleFormSaved(
      message,
    ) {
      setFormGoal(undefined);
      setSuccessMessage(message);
  
      await loadWorkspace();
    }
  
    async function handleContributionSaved(
      message,
    ) {
      setContributionGoal(null);
      setSuccessMessage(message);
  
      await loadWorkspace();
    }
  
    async function handleHistoryChanged(
      message,
    ) {
      setSuccessMessage(message);
  
      await loadWorkspace(false);
    }
  
    async function handleStatusChange(
      goalItem,
    ) {
      const nextStatus =
        goalItem.status === "PAUSED"
          ? "IN_PROGRESS"
          : "PAUSED";
  
      setActionGoalId(
        goalItem.publicId,
      );
  
      setErrorMessage("");
      setSuccessMessage("");
  
      try {
        await goalService.updateGoalStatus(
          goalItem.publicId,
          nextStatus,
        );
  
        setSuccessMessage(
          nextStatus === "PAUSED"
            ? "Savings goal paused successfully."
            : "Savings goal resumed successfully.",
        );
  
        await loadWorkspace();
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to update the savings goal status.",
          ),
        );
      } finally {
        setActionGoalId(null);
      }
    }
  
    async function handleArchive(
      goalItem,
    ) {
      const confirmed =
        window.confirm(
          `Archive "${goalItem.name}"? It will be removed from the active Goals workspace.`,
        );
  
      if (!confirmed) {
        return;
      }
  
      setActionGoalId(
        goalItem.publicId,
      );
  
      setErrorMessage("");
      setSuccessMessage("");
  
      try {
        await goalService.archiveGoal(
          goalItem.publicId,
        );
  
        setSuccessMessage(
          "Savings goal archived successfully.",
        );
  
        await loadWorkspace();
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to archive the savings goal.",
          ),
        );
      } finally {
        setActionGoalId(null);
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
              Future planning
            </p>
  
            <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.045em] text-[#080808] dark:text-white sm:mt-3 sm:text-[2.5rem]">
              Savings goals
            </h1>
  
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:mt-3">
              Define financial targets, record real contributions, and track progress without mixing different currencies.
            </p>
          </div>
  
          <button
            type="button"
            onClick={() =>
              setFormGoal(null)
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1848b5]"
          >
            <Plus className="h-4 w-4" />
            Create goal
          </button>
        </header>
  
        <section className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
          <SummaryCard
            label="Total goals"
            value={
              summary?.totalGoalCount ??
              0
            }
            icon={
              <Target className="h-5 w-5" />
            }
            tone="primary"
          />
  
          <SummaryCard
            label="In progress"
            value={
              summary?.inProgressCount ??
              0
            }
            icon={
              <Goal className="h-5 w-5" />
            }
            tone="success"
          />
  
          <SummaryCard
            label="Paused"
            value={
              summary?.pausedCount ?? 0
            }
            icon={
              <PauseCircle className="h-5 w-5" />
            }
            tone="warning"
          />
  
          <SummaryCard
            label="Completed"
            value={
              summary?.completedCount ??
              0
            }
            icon={
              <Trophy className="h-5 w-5" />
            }
            tone="completed"
          />
  
          <SummaryCard
            label="Overdue"
            value={
              summary?.overdueCount ?? 0
            }
            icon={
              <TriangleAlert className="h-5 w-5" />
            }
            tone="danger"
          />
        </section>
  
        <section className="mt-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:mt-6 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {GOAL_STATUS_FILTERS.map(
                (filterOption) => (
                  <button
                    key={
                      filterOption.value
                    }
                    type="button"
                    onClick={() => {
                      setStatusFilter(
                        filterOption.value,
                      );
                      setSuccessMessage("");
                    }}
                    className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                      statusFilter ===
                      filterOption.value
                        ? "bg-[#1f55cf] text-white shadow-[0_7px_15px_rgba(31,85,207,0.18)]"
                        : "bg-[#f1f5f9] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ),
              )}
            </div>
  
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 xl:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value,
                    )
                  }
                  placeholder="Search goals"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                />
              </div>
  
              <button
                type="button"
                onClick={() =>
                  loadWorkspace()
                }
                disabled={loading}
                aria-label="Refresh goals"
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
          <section className="mt-5 sm:mt-6">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[#1f55cf] dark:text-blue-300">
              Currency-safe totals
            </p>
  
            <h2 className="mt-2 text-[1.45rem] font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
              Savings allocation
            </h2>
  
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
  
        <section className="mt-6 sm:mt-8">
          <div>
            <h2 className="text-[1.45rem] font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
              Goal plans
            </h2>
  
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {visibleGoals.length} matching goal
              {visibleGoals.length === 1
                ? ""
                : "s"}
            </p>
          </div>
  
          <div className="mt-5">
            {loading ? (
              <GoalSkeletons />
            ) : visibleGoals.length ===
              0 ? (
              <EmptyGoals
                filtered={
                  statusFilter !== "ALL" ||
                  Boolean(
                    searchText.trim(),
                  )
                }
                onCreate={() =>
                  setFormGoal(null)
                }
              />
            ) : (
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleGoals.map(
                  (goalItem) => (
                    <GoalCard
                      key={
                        goalItem.publicId
                      }
                      goal={goalItem}
                      actionPending={
                        actionGoalId ===
                        goalItem.publicId
                      }
                      onEdit={() =>
                        setFormGoal(
                          goalItem,
                        )
                      }
                      onContribute={() =>
                        setContributionGoal(
                          goalItem,
                        )
                      }
                      onHistory={() =>
                        setHistoryGoal(
                          goalItem,
                        )
                      }
                      onStatusChange={() =>
                        handleStatusChange(
                          goalItem,
                        )
                      }
                      onArchive={() =>
                        handleArchive(
                          goalItem,
                        )
                      }
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </section>
  
        {formGoal !== undefined && (
          <GoalFormModal
            key={
              formGoal?.publicId ??
              "new-goal"
            }
            goal={formGoal}
            suggestedCurrencies={
              suggestedCurrencies
            }
            onClose={() =>
              setFormGoal(undefined)
            }
            onSaved={
              handleFormSaved
            }
          />
        )}
  
        {contributionGoal && (
          <GoalContributionModal
            key={
              contributionGoal.publicId
            }
            goal={contributionGoal}
            accounts={accounts}
            onClose={() =>
              setContributionGoal(null)
            }
            onSaved={
              handleContributionSaved
            }
          />
        )}
  
        {historyGoal && (
          <GoalContributionHistoryModal
            key={
              historyGoal.publicId
            }
            goal={historyGoal}
            onClose={() =>
              setHistoryGoal(null)
            }
            onChanged={
              handleHistoryChanged
            }
          />
        )}
      </div>
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
      completed:
        "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
      danger:
        "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
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
              Goal allocation
            </h3>
          </div>
  
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Target className="h-5 w-5" />
          </div>
        </div>
  
        <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
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
            success
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
    success = false,
  }) {
    return (
      <div className="rounded-2xl bg-[#f8fafc] p-3 dark:bg-[#0b1424] sm:p-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
  
        <p
          className={`mt-2 text-base font-extrabold tabular-nums ${
            success
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-[#0b1220] dark:text-white"
          }`}
        >
          {value}
        </p>
      </div>
    );
  }
  
  function GoalCard({
    goal,
    actionPending,
    onEdit,
    onContribute,
    onHistory,
    onStatusChange,
    onArchive,
  }) {
    const [menuOpen, setMenuOpen] =
      useState(false);
  
    const progressWidth =
      clampPercentage(
        goal.progressPercentage,
      );
  
    const contributionAllowed =
      canContribute(goal);
  
    const statusCanChange =
      ![
        "COMPLETED",
        "ARCHIVED",
      ].includes(goal.status);
  
    return (
      <article className="relative min-w-0 overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.075)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getGoalIconClass(
              goal.status,
            )}`}
          >
            {goal.status ===
            "COMPLETED" ? (
              <Trophy className="h-5 w-5" />
            ) : (
              <Target className="h-5 w-5" />
            )}
          </div>
  
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (current) => !current,
                )
              }
              aria-label="Goal actions"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#1f55cf] dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
  
            {menuOpen && (
              <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#101a2c]">
                <GoalActionButton
                  icon={
                    <Edit3 className="h-4 w-4" />
                  }
                  label="Edit goal"
                  disabled={actionPending}
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                />
  
                <GoalActionButton
                  icon={
                    <History className="h-4 w-4" />
                  }
                  label="Contribution history"
                  disabled={actionPending}
                  onClick={() => {
                    setMenuOpen(false);
                    onHistory();
                  }}
                />
  
                {statusCanChange && (
                  <GoalActionButton
                    icon={
                      goal.status ===
                      "PAUSED" ? (
                        <PlayCircle className="h-4 w-4" />
                      ) : (
                        <PauseCircle className="h-4 w-4" />
                      )
                    }
                    label={
                      goal.status ===
                      "PAUSED"
                        ? "Resume goal"
                        : "Pause goal"
                    }
                    disabled={actionPending}
                    onClick={() => {
                      setMenuOpen(false);
                      onStatusChange();
                    }}
                  />
                )}
  
                <GoalActionButton
                  icon={
                    <Archive className="h-4 w-4" />
                  }
                  label="Archive goal"
                  danger
                  disabled={actionPending}
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive();
                  }}
                />
              </div>
            )}
          </div>
        </div>
  
        <div className="mt-5 sm:mt-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="line-clamp-2 break-words text-lg font-extrabold tracking-[-0.02em] text-[#0b1220] dark:text-white">
                {goal.name}
              </h3>
  
              <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {goal.description ||
                  "No description provided."}
              </p>
            </div>
  
            <GoalStatusBadge
              status={goal.status}
            />
          </div>
  
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Saved
              </p>
  
              <p className="mt-1 text-[1.5rem] font-extrabold tracking-[-0.03em] text-[#080808] tabular-nums dark:text-white">
                {formatCurrency(
                  goal.currentAmount,
                  goal.currencyCode,
                )}
              </p>
            </div>
  
            <div className="min-w-0 sm:text-right">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Target
              </p>
  
              <p className="mt-1 break-words text-sm font-extrabold text-slate-700 tabular-nums dark:text-slate-200">
                {formatCurrency(
                  goal.targetAmount,
                  goal.currencyCode,
                )}
              </p>
            </div>
          </div>
  
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:mt-4">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ${getGoalProgressClass(
                goal.status,
              )}`}
              style={{
                width: `${progressWidth}%`,
              }}
            />
          </div>
  
          <div className="mt-2 flex items-center justify-between gap-4 text-xs">
            <span className="font-extrabold text-slate-700 tabular-nums dark:text-slate-200">
              {Number(
                goal.progressPercentage,
              ).toFixed(2)}
              % saved
            </span>
  
            <span className="text-slate-500 dark:text-slate-400">
              {goal.currencyCode}
            </span>
          </div>
  
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-[#f8fafc] p-3 dark:bg-[#0b1424] sm:mt-5 sm:grid-cols-2 sm:p-4">
            <GoalDetail
              label="Remaining"
              value={formatCurrency(
                goal.remainingAmount,
                goal.currencyCode,
              )}
            />
  
            <GoalDetail
              label="Deadline"
              value={formatDate(
                goal.targetDate,
              )}
            />
          </div>
  
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:mt-4">
            <Timer className="h-3.5 w-3.5 shrink-0" />
  
            <span>
              {getDeadlineText(goal)}
            </span>
          </div>
  
          <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={onContribute}
              disabled={
                !contributionAllowed ||
                actionPending
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            >
              <HandCoins className="h-4 w-4" />
              Add contribution
            </button>
  
            <button
              type="button"
              onClick={onHistory}
              disabled={actionPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:opacity-50 dark:border-slate-700 dark:bg-[#101a2c] dark:text-slate-200"
            >
              <History className="h-4 w-4" />
              History
            </button>
          </div>
        </div>
      </article>
    );
  }
  
  function GoalDetail({
    label,
    value,
  }) {
    return (
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
  
        <p className="mt-1 break-words text-xs font-extrabold text-[#0b1220] dark:text-white">
          {value}
        </p>
      </div>
    );
  }
  
  function GoalStatusBadge({
    status,
  }) {
    const statusClasses = {
      IN_PROGRESS:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      PAUSED:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      COMPLETED:
        "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
      OVERDUE:
        "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      ARCHIVED:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    };
  
    return (
      <span
        className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-wide ${
          statusClasses[status] ??
          statusClasses.ARCHIVED
        }`}
      >
        {getGoalStatusLabel(status)}
      </span>
    );
  }
  
  function getGoalProgressClass(
    status,
  ) {
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
  
  function getGoalIconClass(status) {
    if (status === "COMPLETED") {
      return "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300";
    }
  
    if (status === "OVERDUE") {
      return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300";
    }
  
    if (status === "PAUSED") {
      return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300";
    }
  
    return "bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300";
  }
  
  function getDeadlineText(goal) {
    if (goal.status === "COMPLETED") {
      return "Target completed";
    }
  
    if (goal.status === "OVERDUE") {
      return "Target date has passed";
    }
  
    if (goal.status === "PAUSED") {
      return "Goal progress is paused";
    }
  
    if (goal.daysRemaining === 0) {
      return "Target date is today";
    }
  
    return `${goal.daysRemaining} day${
      goal.daysRemaining === 1
        ? ""
        : "s"
    } remaining`;
  }
  
  function GoalActionButton({
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
function EmptyGoals({
    filtered,
    onCreate,
  }) {
    return (
      <div className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-10 text-center shadow-[0_14px_40px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:px-6 sm:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
          <Target className="h-6 w-6" />
        </div>
  
        <h2 className="mt-5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
          {filtered
            ? "No matching goals"
            : "No savings goals yet"}
        </h2>
  
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          {filtered
            ? "Change the selected status or search text."
            : "Create a real financial target, then record manual or account-funded contributions."}
        </p>
  
        {!filtered && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:bg-[#1848b5]"
          >
            <Plus className="h-4 w-4" />
            Create first goal
          </button>
        )}
      </div>
    );
  }
  
  function GoalSkeletons() {
    return (
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {GOAL_SKELETON_KEYS.map(
          (key) => (
            <div
              key={key}
              className="animate-pulse rounded-[1.45rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#101a2c] sm:p-6"
            >
              <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
  
              <div className="mt-6 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
  
              <div className="mt-3 h-10 rounded bg-slate-100 dark:bg-slate-800" />
  
              <div className="mt-6 h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
  
              <div className="mt-5 h-2.5 rounded bg-slate-100 dark:bg-slate-800" />
  
              <div className="mt-6 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />
  
              <div className="mt-6 h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          ),
        )}
      </div>
    );
  }


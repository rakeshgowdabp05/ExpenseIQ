import {
    CalendarDays,
    CircleAlert,
    HandCoins,
    Landmark,
    LoaderCircle,
    RefreshCw,
    RotateCcw,
    X,
  } from "lucide-react";
  import {
    useEffect,
    useState,
  } from "react";
  
  import { goalService } from "../services/goalService";
  import { getApiErrorMessage } from "../utils/apiError";
  
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
          currency: currencyCode,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ).format(value);
    } catch {
      return `${currencyCode} ${value.toFixed(
        2,
      )}`;
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
  
  export default function GoalContributionHistoryModal({
    goal,
    onClose,
    onChanged,
  }) {
    const [
      contributions,
      setContributions,
    ] = useState([]);
  
    const [loading, setLoading] =
      useState(true);
  
    const [errorMessage, setErrorMessage] =
      useState("");
  
    const [
      actionContributionId,
      setActionContributionId,
    ] = useState(null);
  
    useEffect(() => {
      let cancelled = false;
  
      goalService
        .getContributions(
          goal.publicId,
        )
        .then((result) => {
          if (cancelled) {
            return;
          }
  
          setContributions(result);
          setErrorMessage("");
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }
  
          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to load contribution history.",
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
    }, [goal.publicId]);
  
    useEffect(() => {
      const previousOverflow =
        document.body.style.overflow;
  
      document.body.style.overflow =
        "hidden";
  
      function handleKeyDown(event) {
        if (
          event.key === "Escape" &&
          !actionContributionId
        ) {
          onClose();
        }
      }
  
      window.addEventListener(
        "keydown",
        handleKeyDown,
      );
  
      return () => {
        document.body.style.overflow =
          previousOverflow;
  
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    }, [
      actionContributionId,
      onClose,
    ]);
  
    async function loadContributions() {
      setLoading(true);
      setErrorMessage("");
  
      try {
        const result =
          await goalService.getContributions(
            goal.publicId,
          );
  
        setContributions(result);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to load contribution history.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }
  
    async function handleCancel(
      contribution,
    ) {
      const confirmed =
        window.confirm(
          `Cancel ${formatCurrency(
            contribution.amount,
            contribution.currencyCode,
          )} contribution? If it used a source account, the amount will be refunded.`,
        );
  
      if (!confirmed) {
        return;
      }
  
      setActionContributionId(
        contribution.publicId,
      );
  
      setErrorMessage("");
  
      try {
        await goalService.cancelContribution(
          goal.publicId,
          contribution.publicId,
        );
  
        await loadContributions();
  
        await onChanged(
          "Contribution cancelled. Goal progress and source-account balance were recalculated.",
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to cancel the contribution.",
          ),
        );
      } finally {
        setActionContributionId(null);
      }
    }
  
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close contribution history"
          onClick={
            actionContributionId
              ? undefined
              : onClose
          }
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        />
  
        <section className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#101a2c]">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-7">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
                <HandCoins className="h-5 w-5" />
              </div>
  
              <div>
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[#1f55cf] dark:text-blue-300">
                  Contribution history
                </p>
  
                <h2 className="mt-1.5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
                  {goal.name}
                </h2>
  
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  Posted and cancelled contributions remain available for audit history.
                </p>
              </div>
            </div>
  
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={
                  loadContributions
                }
                disabled={
                  loading ||
                  Boolean(
                    actionContributionId,
                  )
                }
                aria-label="Refresh contribution history"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:opacity-50 dark:border-slate-700 dark:text-slate-400"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </button>
  
              <button
                type="button"
                onClick={onClose}
                disabled={Boolean(
                  actionContributionId,
                )}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>
  
          <div className="overflow-y-auto px-6 py-6 sm:px-7">
            {errorMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {errorMessage}
              </div>
            )}
  
            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#1f55cf]" />
  
                  <p className="mt-3 text-sm font-extrabold text-slate-600 dark:text-slate-300">
                    Loading contributions...
                  </p>
                </div>
              </div>
            ) : contributions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
                <HandCoins className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
  
                <h3 className="mt-4 text-base font-extrabold text-[#0b1220] dark:text-white">
                  No contributions yet
                </h3>
  
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Record the first contribution from the Goals page.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contributions.map(
                  (contribution) => (
                    <article
                      key={
                        contribution.publicId
                      }
                      className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 dark:border-slate-700 dark:bg-[#0b1424]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                              contribution.status ===
                              "POSTED"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {contribution
                              .sourceAccount ? (
                              <Landmark className="h-5 w-5" />
                            ) : (
                              <HandCoins className="h-5 w-5" />
                            )}
                          </div>
  
                          <div className="min-w-0">
                            <p
                              className={`text-lg font-extrabold tabular-nums ${
                                contribution.status ===
                                "CANCELLED"
                                  ? "text-slate-400 line-through"
                                  : "text-[#080808] dark:text-white"
                              }`}
                            >
                              {formatCurrency(
                                contribution.amount,
                                contribution.currencyCode,
                              )}
                            </p>
  
                            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {contribution
                                .sourceAccount
                                ?.name ??
                                "Manual contribution"}
                            </p>
  
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(
                                  contribution.contributionDate,
                                )}
                              </span>
  
                              {contribution.referenceNumber && (
                                <span>
                                  Ref:{" "}
                                  {
                                    contribution.referenceNumber
                                  }
                                </span>
                              )}
                            </div>
  
                            {contribution.note && (
                              <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
                                {contribution.note}
                              </p>
                            )}
                          </div>
                        </div>
  
                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-wide ${
                              contribution.status ===
                              "POSTED"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {contribution.status}
                          </span>
  
                          {contribution.status ===
                            "POSTED" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancel(
                                  contribution,
                                )
                              }
                              disabled={
                                actionContributionId ===
                                contribution.publicId
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/20 dark:bg-[#101a2c] dark:text-rose-300 dark:hover:bg-rose-500/10"
                            >
                              <RotateCcw
                                className={`h-3.5 w-3.5 ${
                                  actionContributionId ===
                                  contribution.publicId
                                    ? "animate-spin"
                                    : ""
                                }`}
                              />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>
  
          <footer className="flex justify-end border-t border-slate-200 bg-[#f8fafc] px-6 py-4 dark:border-slate-800 dark:bg-[#0b1424] sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(
                actionContributionId,
              )}
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:bg-[#101a2c] dark:text-slate-200"
            >
              Close
            </button>
          </footer>
        </section>
      </div>
    );
  }
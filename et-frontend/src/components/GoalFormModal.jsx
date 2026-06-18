import {
    CalendarDays,
    CircleAlert,
    CircleDollarSign,
    Goal,
    Target,
    X,
  } from "lucide-react";
  import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import { goalService } from "../services/goalService";
  import { getApiErrorMessage } from "../utils/apiError";
  
  function createInitialFormData(
    goal,
  ) {
    return {
      name: goal?.name ?? "",
      description:
        goal?.description ?? "",
      targetAmount:
        goal?.targetAmount?.toString() ??
        "",
      currencyCode:
        goal?.currencyCode ?? "",
      targetDate:
        goal?.targetDate ?? "",
    };
  }
  
  export default function GoalFormModal({
    goal,
    suggestedCurrencies,
    onClose,
    onSaved,
  }) {
    const editing = Boolean(goal);
  
    const [formData, setFormData] =
      useState(() =>
        createInitialFormData(goal),
      );
  
    const [submitting, setSubmitting] =
      useState(false);
  
    const [errorMessage, setErrorMessage] =
      useState("");
  
    const normalizedCurrencies =
      useMemo(
        () =>
          Array.from(
            new Set(
              suggestedCurrencies
                .filter(Boolean)
                .map((currencyCode) =>
                  currencyCode
                    .trim()
                    .toUpperCase(),
                ),
            ),
          ).sort(),
        [suggestedCurrencies],
      );
  
    useEffect(() => {
      const previousOverflow =
        document.body.style.overflow;
  
      document.body.style.overflow =
        "hidden";
  
      function handleKeyDown(event) {
        if (
          event.key === "Escape" &&
          !submitting
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
    }, [onClose, submitting]);
  
    function updateField(event) {
      const { name, value } =
        event.target;
  
      setFormData((current) => ({
        ...current,
        [name]: value,
      }));
    }
  
    function validateForm() {
      if (!formData.name.trim()) {
        return "Goal name is required.";
      }
  
      if (
        formData.name.trim().length < 2
      ) {
        return "Goal name must contain at least two characters.";
      }
  
      const targetAmount = Number(
        formData.targetAmount,
      );
  
      if (
        !Number.isFinite(
          targetAmount,
        ) ||
        targetAmount <= 0
      ) {
        return "Target amount must be greater than zero.";
      }
  
      if (
        editing &&
        targetAmount <
          Number(
            goal.currentAmount ?? 0,
          )
      ) {
        return "Target amount cannot be lower than the amount already saved.";
      }
  
      const currencyCode =
        formData.currencyCode
          .trim()
          .toUpperCase();
  
      if (
        !/^[A-Z]{3}$/.test(
          currencyCode,
        )
      ) {
        return "Currency code must contain exactly three letters.";
      }
  
      if (!formData.targetDate) {
        return "Target date is required.";
      }
  
      return "";
    }
  
    async function handleSubmit(event) {
      event.preventDefault();
  
      const validationMessage =
        validateForm();
  
      if (validationMessage) {
        setErrorMessage(
          validationMessage,
        );
  
        return;
      }
  
      setSubmitting(true);
      setErrorMessage("");
  
      const payload = {
        name: formData.name.trim(),
        description:
          formData.description.trim() ||
          null,
        targetAmount: Number(
          formData.targetAmount,
        ),
        currencyCode:
          formData.currencyCode
            .trim()
            .toUpperCase(),
        targetDate:
          formData.targetDate,
      };
  
      try {
        if (editing) {
          await goalService.updateGoal(
            goal.publicId,
            payload,
          );
        } else {
          await goalService.createGoal(
            payload,
          );
        }
  
        await onSaved(
          editing
            ? "Savings goal updated successfully."
            : "Savings goal created successfully.",
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            editing
              ? "Unable to update the savings goal."
              : "Unable to create the savings goal.",
          ),
        );
      } finally {
        setSubmitting(false);
      }
    }
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close goal form"
          onClick={
            submitting
              ? undefined
              : onClose
          }
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        />
  
        <section className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#101a2c]">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-7">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
                <Target className="h-5 w-5" />
              </div>
  
              <div>
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[#1f55cf] dark:text-blue-300">
                  Savings planning
                </p>
  
                <h2 className="mt-1.5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
                  {editing
                    ? "Edit savings goal"
                    : "Create savings goal"}
                </h2>
  
                <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Progress will be calculated from real posted contributions.
                </p>
              </div>
            </div>
  
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
  
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto"
          >
            <div className="space-y-5 px-6 py-6 sm:px-7">
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {errorMessage}
                </div>
              )}
  
              <FormField
                label="Goal name"
                icon={
                  <Goal className="h-4 w-4" />
                }
              >
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={updateField}
                  minLength={2}
                  maxLength={120}
                  placeholder="Example: Emergency fund"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                />
              </FormField>
  
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold text-slate-600 dark:text-slate-300">
                  Description
                </span>
  
                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={updateField}
                  maxLength={500}
                  rows={4}
                  placeholder="Describe what this goal is for."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                />
              </label>
  
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Target amount"
                  icon={
                    <CircleDollarSign className="h-4 w-4" />
                  }
                >
                  <input
                    type="number"
                    name="targetAmount"
                    value={
                      formData.targetAmount
                    }
                    onChange={updateField}
                    min={
                      editing
                        ? Math.max(
                            Number(
                              goal.currentAmount ??
                                0,
                            ),
                            0.01,
                          )
                        : 0.01
                    }
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                  />
                </FormField>
  
                <FormField
                  label="Currency"
                  icon={
                    <CircleDollarSign className="h-4 w-4" />
                  }
                >
                  <input
                    type="text"
                    name="currencyCode"
                    value={
                      formData.currencyCode
                    }
                    onChange={updateField}
                    maxLength={3}
                    list="goal-currency-options"
                    placeholder="Currency code"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm uppercase text-[#0b1220] outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                  />
  
                  <datalist id="goal-currency-options">
                    {normalizedCurrencies.map(
                      (currencyCode) => (
                        <option
                          key={currencyCode}
                          value={currencyCode}
                        />
                      ),
                    )}
                  </datalist>
                </FormField>
              </div>
  
              <FormField
                label="Target date"
                icon={
                  <CalendarDays className="h-4 w-4" />
                }
              >
                <input
                  type="date"
                  name="targetDate"
                  value={
                    formData.targetDate
                  }
                  onChange={updateField}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#0b1220] outline-none transition focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                />
              </FormField>
  
              {editing &&
                Number(
                  goal.currentAmount ?? 0,
                ) > 0 && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-slate-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-slate-300">
                    This goal already contains saved contributions. Its currency cannot be changed, and the target cannot be reduced below the saved amount.
                  </div>
                )}
            </div>
  
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-[#f8fafc] px-6 py-5 dark:border-slate-800 dark:bg-[#0b1424] sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:bg-[#101a2c] dark:text-slate-200"
              >
                Cancel
              </button>
  
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(31,85,207,0.2)] transition hover:bg-[#1848b5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Target className="h-4 w-4" />
  
                {submitting
                  ? editing
                    ? "Saving changes..."
                    : "Creating goal..."
                  : editing
                    ? "Save changes"
                    : "Create goal"}
              </button>
            </footer>
          </form>
        </section>
      </div>
    );
  }
  
  function FormField({
    label,
    icon,
    children,
  }) {
    return (
      <label className="block">
        <span className="mb-2 block text-xs font-extrabold text-slate-600 dark:text-slate-300">
          {label}
        </span>
  
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
  
          {children}
        </div>
      </label>
    );
  }
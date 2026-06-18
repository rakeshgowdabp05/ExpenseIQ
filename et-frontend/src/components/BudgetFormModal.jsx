import {
  CalendarDays,
  CircleAlert,
  CircleDollarSign,
  FolderTree,
  Gauge,
  PiggyBank,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BUDGET_PERIOD_OPTIONS,
  BUDGET_WARNING_THRESHOLD_MAX,
  BUDGET_WARNING_THRESHOLD_MIN,
  DEFAULT_BUDGET_WARNING_THRESHOLD,
} from "../config/budgetOptions";
import { budgetService } from "../services/budgetService";
import { getApiErrorMessage } from "../utils/apiError";

function getMonthFromDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  return dateValue.slice(0, 7);
}

function normalizeCurrencyCode(value) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 3);
}

function createInitialFormData(
  budget,
  selectedMonth,
) {
  const monthlyMonth =
    budget?.periodType === "MONTHLY"
      ? getMonthFromDate(
          budget.startDate,
        )
      : selectedMonth;

  return {
    name: budget?.name ?? "",
    categoryPublicId:
      budget?.categoryPublicId ?? "",
    limitAmount:
      budget?.limitAmount?.toString() ??
      "",
    currencyCode:
      budget?.currencyCode ?? "",
    periodType:
      budget?.periodType ?? "MONTHLY",
    month:
      monthlyMonth || selectedMonth,
    startDate:
      budget?.periodType === "CUSTOM"
        ? budget.startDate ?? ""
        : "",
    endDate:
      budget?.periodType === "CUSTOM"
        ? budget.endDate ?? ""
        : "",
    warningThreshold:
      budget?.warningThreshold?.toString() ??
      DEFAULT_BUDGET_WARNING_THRESHOLD.toString(),
  };
}

function getBudgetScopeLabel(
  categoryPublicId,
  categories,
) {
  if (!categoryPublicId) {
    return "Overall spending";
  }

  return (
    categories.find(
      (category) =>
        category.publicId ===
        categoryPublicId,
    )?.name ?? "Selected category"
  );
}

export default function BudgetFormModal({
  budget,
  categories,
  suggestedCurrencies,
  selectedMonth,
  onClose,
  onSaved,
}) {
  const editing = Boolean(budget);

  const [formData, setFormData] =
    useState(() =>
      createInitialFormData(
        budget,
        selectedMonth,
      ),
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const activeExpenseCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.active &&
            category.categoryType ===
              "EXPENSE",
        ),
      [categories],
    );

  const normalizedCurrencies =
    useMemo(
      () =>
        Array.from(
          new Set(
            suggestedCurrencies
              .filter(Boolean)
              .map((currency) =>
                normalizeCurrencyCode(
                  currency,
                ),
              )
              .filter(
                (currency) =>
                  currency.length === 3,
              ),
          ),
        ).sort(),
      [suggestedCurrencies],
    );

  const previewScope =
    getBudgetScopeLabel(
      formData.categoryPublicId,
      activeExpenseCategories,
    );

  useEffect(() => {
    const originalOverflow =
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
        originalOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClose, submitting]);

  function updateField(event) {
    const { name, value } =
      event.target;

    setErrorMessage("");

    setFormData((current) => {
      if (
        name === "periodType" &&
        value === "MONTHLY"
      ) {
        return {
          ...current,
          periodType: value,
          month:
            current.month ||
            selectedMonth,
          startDate: "",
          endDate: "",
        };
      }

      if (
        name === "periodType" &&
        value === "CUSTOM"
      ) {
        return {
          ...current,
          periodType: value,
          month: "",
        };
      }

      if (name === "currencyCode") {
        return {
          ...current,
          currencyCode:
            normalizeCurrencyCode(value),
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  }

  function validateForm() {
    const trimmedName =
      formData.name.trim();

    if (!trimmedName) {
      return "Budget name is required.";
    }

    if (trimmedName.length > 120) {
      return "Budget name must not exceed 120 characters.";
    }

    const limitAmount = Number(
      formData.limitAmount,
    );

    if (
      !Number.isFinite(limitAmount) ||
      limitAmount <= 0
    ) {
      return "Budget limit must be greater than zero.";
    }

    const currencyCode =
      normalizeCurrencyCode(
        formData.currencyCode,
      );

    if (
      !/^[A-Z]{3}$/.test(
        currencyCode,
      )
    ) {
      return "Currency code must contain exactly three letters.";
    }

    const warningThreshold = Number(
      formData.warningThreshold,
    );

    if (
      !Number.isInteger(
        warningThreshold,
      ) ||
      warningThreshold <
        BUDGET_WARNING_THRESHOLD_MIN ||
      warningThreshold >
        BUDGET_WARNING_THRESHOLD_MAX
    ) {
      return `Warning threshold must be between ${BUDGET_WARNING_THRESHOLD_MIN} and ${BUDGET_WARNING_THRESHOLD_MAX}.`;
    }

    if (
      formData.periodType ===
        "MONTHLY" &&
      !formData.month
    ) {
      return "Select a budget month.";
    }

    if (
      formData.periodType ===
      "CUSTOM"
    ) {
      if (
        !formData.startDate ||
        !formData.endDate
      ) {
        return "Start date and end date are required.";
      }

      if (
        formData.startDate >
        formData.endDate
      ) {
        return "End date cannot be before start date.";
      }
    }

    return "";
  }

  function buildPayload() {
    const periodType =
      formData.periodType;

    return {
      name: formData.name.trim(),
      categoryPublicId:
        formData.categoryPublicId ||
        null,
      limitAmount: Number(
        formData.limitAmount,
      ),
      currencyCode:
        normalizeCurrencyCode(
          formData.currencyCode,
        ),
      periodType,
      month:
        periodType === "MONTHLY"
          ? formData.month
          : null,
      startDate:
        periodType === "CUSTOM"
          ? formData.startDate
          : null,
      endDate:
        periodType === "CUSTOM"
          ? formData.endDate
          : null,
      warningThreshold: Number(
        formData.warningThreshold,
      ),
    };
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

    const payload = buildPayload();

    try {
      if (editing) {
        await budgetService.updateBudget(
          budget.publicId,
          payload,
        );
      } else {
        await budgetService.createBudget(
          payload,
        );
      }

      await onSaved(
        editing
          ? "Budget updated successfully."
          : "Budget created successfully.",
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          editing
            ? "Unable to update the budget."
            : "Unable to create the budget.",
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
        aria-label="Close budget form"
        onClick={
          submitting
            ? undefined
            : onClose
        }
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <section className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#101a2c]">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-7">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
              <PiggyBank className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-[#1f55cf] dark:text-blue-300">
                Budget planning
              </p>

              <h2 className="mt-1.5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
                {editing
                  ? "Edit budget"
                  : "Create budget"}
              </h2>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Spending is calculated from posted expense transactions.
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
          <div className="space-y-6 px-6 py-6 sm:px-7">
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-500/15 dark:bg-blue-500/10">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1f55cf] dark:text-blue-300">
                Budget preview
              </p>

              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                <PreviewMetric
                  label="Scope"
                  value={previewScope}
                />

                <PreviewMetric
                  label="Period"
                  value={
                    formData.periodType ===
                    "MONTHLY"
                      ? "Monthly"
                      : "Custom"
                  }
                />

                <PreviewMetric
                  label="Warning"
                  value={`${formData.warningThreshold || DEFAULT_BUDGET_WARNING_THRESHOLD}%`}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Budget name"
                icon={
                  <PiggyBank className="h-4 w-4" />
                }
              >
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={updateField}
                  maxLength={120}
                  placeholder="Budget name"
                  className="budget-form-input pl-10"
                  required
                />
              </FormField>

              <FormField
                label="Scope"
                icon={
                  <FolderTree className="h-4 w-4" />
                }
              >
                <select
                  name="categoryPublicId"
                  value={
                    formData.categoryPublicId
                  }
                  onChange={updateField}
                  className="budget-form-input pl-10"
                >
                  <option value="">
                    Overall spending
                  </option>

                  {activeExpenseCategories.map(
                    (category) => (
                      <option
                        key={
                          category.publicId
                        }
                        value={
                          category.publicId
                        }
                      >
                        {category.name}
                      </option>
                    ),
                  )}
                </select>
              </FormField>

              <FormField
                label="Budget limit"
                icon={
                  <CircleDollarSign className="h-4 w-4" />
                }
              >
                <input
                  type="number"
                  name="limitAmount"
                  value={
                    formData.limitAmount
                  }
                  onChange={updateField}
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="budget-form-input pl-10"
                  required
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
                  list="budget-currency-options"
                  placeholder="INR"
                  className="budget-form-input pl-10 uppercase"
                  required
                />

                <datalist id="budget-currency-options">
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

            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Budget period
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {BUDGET_PERIOD_OPTIONS.map(
                  (option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        formData.periodType ===
                        option.value
                          ? "border-[#1f55cf] bg-blue-50 ring-4 ring-blue-600/10 dark:border-blue-400 dark:bg-blue-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-[#0b1424]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="periodType"
                        value={option.value}
                        checked={
                          formData.periodType ===
                          option.value
                        }
                        onChange={updateField}
                        className="sr-only"
                      />

                      <span className="flex min-w-0 flex-wrap items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                            formData.periodType ===
                            option.value
                              ? "bg-[#1f55cf] text-white"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <CalendarDays className="h-4 w-4" />
                        </span>

                        <span>
                          <span className="block text-sm font-extrabold text-[#0b1220] dark:text-white">
                            {option.label}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {
                              option.description
                            }
                          </span>
                        </span>
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>

            {formData.periodType ===
            "MONTHLY" ? (
              <FormField
                label="Month"
                icon={
                  <CalendarDays className="h-4 w-4" />
                }
              >
                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={updateField}
                  className="budget-form-input pl-10"
                  required
                />
              </FormField>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Start date"
                  icon={
                    <CalendarDays className="h-4 w-4" />
                  }
                >
                  <input
                    type="date"
                    name="startDate"
                    value={
                      formData.startDate
                    }
                    onChange={updateField}
                    className="budget-form-input pl-10"
                    required
                  />
                </FormField>

                <FormField
                  label="End date"
                  icon={
                    <CalendarDays className="h-4 w-4" />
                  }
                >
                  <input
                    type="date"
                    name="endDate"
                    value={
                      formData.endDate
                    }
                    onChange={updateField}
                    min={
                      formData.startDate ||
                      undefined
                    }
                    className="budget-form-input pl-10"
                    required
                  />
                </FormField>
              </div>
            )}

            <FormField
              label="Warning threshold"
              icon={
                <Gauge className="h-4 w-4" />
              }
              description="The budget enters Warning status when this percentage is reached."
            >
              <div className="relative">
                <input
                  type="number"
                  name="warningThreshold"
                  value={
                    formData.warningThreshold
                  }
                  onChange={updateField}
                  min={
                    BUDGET_WARNING_THRESHOLD_MIN
                  }
                  max={
                    BUDGET_WARNING_THRESHOLD_MAX
                  }
                  step="1"
                  className="budget-form-input pl-10 pr-12"
                  required
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                  %
                </span>
              </div>
            </FormField>
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
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <PiggyBank className="h-4 w-4" />
              )}

              {submitting
                ? editing
                  ? "Saving changes..."
                  : "Creating budget..."
                : editing
                  ? "Save changes"
                  : "Create budget"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function PreviewMetric({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-extrabold text-[#0b1220] dark:text-white">
        {value}
      </p>
    </div>
  );
}

function FormField({
  label,
  icon,
  description,
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

      {description && (
        <span className="mt-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </span>
      )}
    </label>
  );
}
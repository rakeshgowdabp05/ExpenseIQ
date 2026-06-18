import {
    CalendarDays,
    CircleAlert,
    CircleDollarSign,
    HandCoins,
    Landmark,
    ReceiptText,
    X,
  } from "lucide-react";
  import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import { goalService } from "../services/goalService";
  import { getApiErrorMessage } from "../utils/apiError";
  
  function getToday() {
    const date = new Date();
  
    const year = date.getFullYear();
  
    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");
  
    const day = String(
      date.getDate(),
    ).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }
  
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
  
  export default function GoalContributionModal({
    goal,
    accounts,
    onClose,
    onSaved,
  }) {
    const [formData, setFormData] =
      useState({
        sourceAccountPublicId: "",
        amount: "",
        contributionDate:
          getToday(),
        note: "",
        referenceNumber: "",
      });
  
    const [submitting, setSubmitting] =
      useState(false);
  
    const [errorMessage, setErrorMessage] =
      useState("");
  
    const matchingAccounts =
      useMemo(
        () =>
          accounts.filter(
            (account) =>
              account.active &&
              account.currencyCode ===
                goal.currencyCode,
          ),
        [
          accounts,
          goal.currencyCode,
        ],
      );
  
    const selectedAccount =
      useMemo(
        () =>
          matchingAccounts.find(
            (account) =>
              account.publicId ===
              formData.sourceAccountPublicId,
          ) ?? null,
        [
          matchingAccounts,
          formData.sourceAccountPublicId,
        ],
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
      const amount = Number(
        formData.amount,
      );
  
      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return "Contribution amount must be greater than zero.";
      }
  
      if (
        amount >
        Number(goal.remainingAmount)
      ) {
        return "Contribution amount cannot exceed the remaining goal amount.";
      }
  
      if (
        selectedAccount &&
        amount >
          Number(
            selectedAccount.currentBalance,
          )
      ) {
        return "The selected account does not have enough available balance.";
      }
  
      if (!formData.contributionDate) {
        return "Contribution date is required.";
      }
  
      if (
        formData.contributionDate >
        getToday()
      ) {
        return "Contribution date cannot be in the future.";
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
  
      try {
        await goalService.addContribution(
          goal.publicId,
          {
            sourceAccountPublicId:
              formData.sourceAccountPublicId ||
              null,
            amount: Number(
              formData.amount,
            ),
            contributionDate:
              formData.contributionDate,
            note:
              formData.note.trim() ||
              null,
            referenceNumber:
              formData.referenceNumber.trim() ||
              null,
          },
        );
  
        await onSaved(
          formData.sourceAccountPublicId
            ? "Contribution recorded and source account balance updated."
            : "Manual contribution recorded successfully.",
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to record the contribution.",
          ),
        );
      } finally {
        setSubmitting(false);
      }
    }
  
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close contribution form"
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <HandCoins className="h-5 w-5" />
              </div>
  
              <div>
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-emerald-600 dark:text-emerald-300">
                  Goal contribution
                </p>
  
                <h2 className="mt-1.5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
                  Add to {goal.name}
                </h2>
  
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  Remaining:{" "}
                  <strong className="font-extrabold text-[#0b1220] dark:text-white">
                    {formatCurrency(
                      goal.remainingAmount,
                      goal.currencyCode,
                    )}
                  </strong>
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
                label="Funding source"
                icon={
                  <Landmark className="h-4 w-4" />
                }
              >
                <select
                  name="sourceAccountPublicId"
                  value={
                    formData.sourceAccountPublicId
                  }
                  onChange={updateField}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#0b1220] outline-none transition focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                >
                  <option value="">
                    Manual contribution - no account deduction
                  </option>
  
                  {matchingAccounts.map(
                    (account) => (
                      <option
                        key={
                          account.publicId
                        }
                        value={
                          account.publicId
                        }
                      >
                        {account.name} -{" "}
                        {formatCurrency(
                          account.currentBalance,
                          account.currencyCode,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </FormField>
  
              <div
                className={`rounded-xl border px-4 py-3 text-xs leading-6 ${
                  selectedAccount
                    ? "border-blue-100 bg-blue-50 text-slate-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-slate-300"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                }`}
              >
                {selectedAccount
                  ? `The contribution will be deducted atomically from ${selectedAccount.name}.`
                  : "Manual contributions increase goal progress without changing any financial account balance."}
              </div>
  
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Contribution amount"
                  icon={
                    <CircleDollarSign className="h-4 w-4" />
                  }
                >
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={updateField}
                    min="0.01"
                    max={
                      goal.remainingAmount
                    }
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                  />
                </FormField>
  
                <FormField
                  label="Contribution date"
                  icon={
                    <CalendarDays className="h-4 w-4" />
                  }
                >
                  <input
                    type="date"
                    name="contributionDate"
                    value={
                      formData.contributionDate
                    }
                    onChange={updateField}
                    max={getToday()}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#0b1220] outline-none transition focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                  />
                </FormField>
              </div>
  
              <FormField
                label="Reference number"
                icon={
                  <ReceiptText className="h-4 w-4" />
                }
              >
                <input
                  type="text"
                  name="referenceNumber"
                  value={
                    formData.referenceNumber
                  }
                  onChange={updateField}
                  maxLength={100}
                  placeholder="Optional bank or payment reference"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                />
              </FormField>
  
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold text-slate-600 dark:text-slate-300">
                  Note
                </span>
  
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={updateField}
                  maxLength={255}
                  rows={3}
                  placeholder="Optional contribution note"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                />
              </label>
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
                disabled={
                  submitting ||
                  Number(
                    goal.remainingAmount,
                  ) <= 0
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(5,150,105,0.2)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HandCoins className="h-4 w-4" />
  
                {submitting
                  ? "Recording contribution..."
                  : "Record contribution"}
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
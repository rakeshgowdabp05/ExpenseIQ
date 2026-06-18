import {
    Building2,
    CreditCard,
    X,
  } from "lucide-react";
  import { useState } from "react";
  import {
    ACCOUNT_TYPE_OPTIONS,
  } from "../config/accountOptions";
  import { accountService } from "../services/accountService";
  import { getApiErrorMessage } from "../utils/apiError";
  
  function createInitialFormData(account) {
    if (account) {
      return {
        name: account.name ?? "",
        accountType: account.accountType ?? "",
        currencyCode:
          account.currencyCode ?? "",
        openingBalance:
          account.openingBalance ?? "",
        institutionName:
          account.institutionName ?? "",
        accountNumberLastFour:
          account.accountNumberLastFour ?? "",
        includeInTotal:
          account.includeInTotal ?? true,
      };
    }
  
    return {
      name: "",
      accountType: "",
      currencyCode: "",
      openingBalance: "",
      institutionName: "",
      accountNumberLastFour: "",
      includeInTotal: true,
    };
  }
  
  export default function AccountFormModal({
    account,
    onClose,
    onSaved,
  }) {
    const editing = Boolean(account);
  
    const [formData, setFormData] = useState(
      () => createInitialFormData(account),
    );
  
    const [submitting, setSubmitting] =
      useState(false);
  
    const [errorMessage, setErrorMessage] =
      useState("");
  
    function updateField(event) {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;
  
      setFormData((currentData) => ({
        ...currentData,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      }));
    }
  
    function updateCurrency(event) {
      const value = event.target.value
        .replace(/[^A-Za-z]/g, "")
        .slice(0, 3)
        .toUpperCase();
  
      setFormData((currentData) => ({
        ...currentData,
        currencyCode: value,
      }));
    }
  
    function updateLastFour(event) {
      const value = event.target.value
        .replace(/\D/g, "")
        .slice(0, 4);
  
      setFormData((currentData) => ({
        ...currentData,
        accountNumberLastFour: value,
      }));
    }
  
    async function handleSubmit(event) {
      event.preventDefault();
      setErrorMessage("");
      setSubmitting(true);
  
      try {
        if (editing) {
          await accountService.updateAccount(
            account.publicId,
            {
              name: formData.name.trim(),
              accountType:
                formData.accountType,
              institutionName:
                formData.institutionName.trim() ||
                null,
              accountNumberLastFour:
                formData.accountNumberLastFour ||
                null,
              includeInTotal:
                formData.includeInTotal,
            },
          );
        } else {
          await accountService.createAccount({
            name: formData.name.trim(),
            accountType:
              formData.accountType,
            currencyCode:
              formData.currencyCode,
            openingBalance:
              formData.openingBalance,
            institutionName:
              formData.institutionName.trim() ||
              null,
            accountNumberLastFour:
              formData.accountNumberLastFour ||
              null,
            includeInTotal:
              formData.includeInTotal,
          });
        }
  
        await onSaved();
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            editing
              ? "Unable to update the account."
              : "Unable to create the account.",
          ),
        );
      } finally {
        setSubmitting(false);
      }
    }
  
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
        <button
          type="button"
          aria-label="Close account form"
          onClick={onClose}
          className="absolute inset-0"
        />
  
        <div className="relative z-10 max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 dark:border-slate-700 dark:bg-[#0d1627]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2457d6] dark:bg-blue-500/10 dark:text-cyan-300">
                <CreditCard className="h-5 w-5" />
              </div>
  
              <h2 className="mt-4 text-2xl font-black">
                {editing
                  ? "Edit account"
                  : "Add financial account"}
              </h2>
  
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {editing
                  ? "Update the account details controlled by your profile."
                  : "Create an account using your real opening balance."}
              </p>
            </div>
  
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
  
          {errorMessage && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {errorMessage}
            </div>
          )}
  
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            <FormField
              label="Account name"
              required
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={updateField}
                required
                minLength={2}
                maxLength={100}
                placeholder="Example: Primary bank account"
                className="account-form-input"
              />
            </FormField>
  
            <FormField
              label="Account type"
              required
            >
              <select
                name="accountType"
                value={formData.accountType}
                onChange={updateField}
                required
                className="account-form-input"
              >
                <option value="">
                  Select an account type
                </option>
  
                {ACCOUNT_TYPE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </FormField>
  
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Currency code"
                required
              >
                <input
                  type="text"
                  name="currencyCode"
                  value={formData.currencyCode}
                  onChange={updateCurrency}
                  required
                  disabled={editing}
                  minLength={3}
                  maxLength={3}
                  placeholder="INR"
                  className="account-form-input disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-800"
                />
              </FormField>
  
              <FormField
                label="Opening balance"
                required
              >
                <input
                  type="number"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={updateField}
                  required
                  disabled={editing}
                  step="0.01"
                  placeholder="0.00"
                  className="account-form-input disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-800"
                />
              </FormField>
            </div>
  
            <FormField label="Institution name">
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
  
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={updateField}
                  maxLength={150}
                  placeholder="Optional bank or provider"
                  className="account-form-input pl-11"
                />
              </div>
            </FormField>
  
            <FormField label="Account number last four digits">
              <input
                type="text"
                name="accountNumberLastFour"
                value={
                  formData.accountNumberLastFour
                }
                onChange={updateLastFour}
                inputMode="numeric"
                maxLength={4}
                placeholder="Optional"
                className="account-form-input"
              />
            </FormField>
  
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <input
                type="checkbox"
                name="includeInTotal"
                checked={
                  formData.includeInTotal
                }
                onChange={updateField}
                className="mt-1 h-4 w-4 accent-[#2457d6]"
              />
  
              <span>
                <span className="block text-sm font-bold">
                  Include in total balance
                </span>
  
                <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Include this account in future
                  dashboard balance calculations.
                </span>
              </span>
            </label>
  
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
  
              <button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-xl bg-[#2457d6] px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  function FormField({
    label,
    required,
    children,
  }) {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-bold">
          {label}
  
          {required && (
            <span className="ml-1 text-rose-500">
              *
            </span>
          )}
        </span>
  
        {children}
      </label>
    );
  }
import {
    FolderTree,
    X,
  } from "lucide-react";
  import { useState } from "react";
  import {
    CATEGORY_COLOR_OPTIONS,
    CATEGORY_ICON_OPTIONS,
    CATEGORY_TYPE_OPTIONS,
  } from "../config/categoryOptions";
  import { categoryService } from "../services/categoryService";
  import { getApiErrorMessage } from "../utils/apiError";
  
  const inputClassName =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#2457d6] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
  
  function createInitialFormData(category) {
    if (category) {
      return {
        name: category.name ?? "",
        categoryType:
          category.categoryType ?? "EXPENSE",
        iconKey:
          category.iconKey ?? "ELLIPSIS",
        colorKey:
          category.colorKey ?? "SLATE",
      };
    }
  
    return {
      name: "",
      categoryType: "EXPENSE",
      iconKey: "ELLIPSIS",
      colorKey: "BLUE",
    };
  }
  
  export default function CategoryFormModal({
    category,
    onClose,
    onSaved,
  }) {
    const editing = Boolean(category);
  
    const [formData, setFormData] = useState(
      () => createInitialFormData(category),
    );
  
    const [submitting, setSubmitting] =
      useState(false);
  
    const [errorMessage, setErrorMessage] =
      useState("");
  
    function updateField(event) {
      const {
        name,
        value,
      } = event.target;
  
      setFormData((currentData) => ({
        ...currentData,
        [name]: value,
      }));
    }
  
    function selectIcon(iconKey) {
      setFormData((currentData) => ({
        ...currentData,
        iconKey,
      }));
    }
  
    function selectColor(colorKey) {
      setFormData((currentData) => ({
        ...currentData,
        colorKey,
      }));
    }
  
    async function handleSubmit(event) {
      event.preventDefault();
  
      setSubmitting(true);
      setErrorMessage("");
  
      const requestData = {
        name: formData.name.trim(),
        categoryType:
          formData.categoryType,
        iconKey: formData.iconKey,
        colorKey: formData.colorKey,
      };
  
      try {
        if (editing) {
          await categoryService.updateCategory(
            category.publicId,
            requestData,
          );
        } else {
          await categoryService.createCategory(
            requestData,
          );
        }
  
        await onSaved();
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error,
            editing
              ? "Unable to update the category."
              : "Unable to create the category.",
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
          aria-label="Close category form"
          onClick={onClose}
          className="absolute inset-0"
        />
  
        <div className="relative z-10 max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 dark:border-slate-700 dark:bg-[#0d1627]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2457d6] dark:bg-blue-500/10 dark:text-cyan-300">
                <FolderTree className="h-5 w-5" />
              </div>
  
              <h2 className="mt-4 text-2xl font-black">
                {editing
                  ? "Edit custom category"
                  : "Create custom category"}
              </h2>
  
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                Custom categories are available only
                inside your authenticated financial
                workspace.
              </p>
            </div>
  
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
  
          {errorMessage && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {errorMessage}
            </div>
          )}
  
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Category name"
                required
              >
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={updateField}
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Example: Online subscriptions"
                  className={inputClassName}
                />
              </FormField>
  
              <FormField
                label="Category type"
                required
              >
                <select
                  name="categoryType"
                  value={formData.categoryType}
                  onChange={updateField}
                  required
                  className={inputClassName}
                >
                  {CATEGORY_TYPE_OPTIONS.map(
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
            </div>
  
            <FormField
              label="Category icon"
              required
            >
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {CATEGORY_ICON_OPTIONS.map(
                  (option) => {
                    const Icon = option.icon;
                    const selected =
                      formData.iconKey ===
                      option.value;
  
                    return (
                      <button
                        key={option.value}
                        type="button"
                        title={option.label}
                        aria-label={
                          option.label
                        }
                        onClick={() =>
                          selectIcon(option.value)
                        }
                        className={`flex aspect-square items-center justify-center rounded-xl border transition ${
                          selected
                            ? "border-[#2457d6] bg-blue-50 text-[#2457d6] ring-4 ring-blue-600/10 dark:bg-blue-500/10 dark:text-cyan-300"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  },
                )}
              </div>
            </FormField>
  
            <FormField
              label="Category colour"
              required
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORY_COLOR_OPTIONS.map(
                  (option) => {
                    const selected =
                      formData.colorKey ===
                      option.value;
  
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          selectColor(
                            option.value,
                          )
                        }
                        className={`flex h-11 items-center gap-3 rounded-xl border px-3 text-left text-xs font-bold transition ${
                          selected
                            ? `${option.selectedClass} ring-4`
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full ${option.swatchClass}`}
                        />
  
                        {option.label}
                      </button>
                    );
                  },
                )}
              </div>
            </FormField>
  
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
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
                    : "Create category"}
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
      <div>
        <p className="mb-2 text-sm font-bold">
          {label}
  
          {required && (
            <span className="ml-1 text-rose-500">
              *
            </span>
          )}
        </p>
  
        {children}
      </div>
    );
  }
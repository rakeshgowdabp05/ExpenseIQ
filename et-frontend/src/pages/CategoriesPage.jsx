import {
  Archive,
  Edit3,
  EllipsisVertical,
  FolderTree,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import CategoryFormModal from "../components/CategoryFormModal";
import CategoryIcon from "../components/CategoryIcon";
import {
  getCategoryColorOption,
  getCategoryTypeLabel,
} from "../config/categoryOptions";
import { categoryService } from "../services/categoryService";
import { getApiErrorMessage } from "../utils/apiError";
import PageToastBridge from "../components/PageToastBridge";

const TYPE_FILTERS = [
  {
    value: "ALL",
    label: "All types",
  },
  {
    value: "EXPENSE",
    label: "Expenses",
  },
  {
    value: "INCOME",
    label: "Income",
  },
];

const STATUS_FILTERS = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
  },
  {
    value: "ALL",
    label: "All statuses",
  },
];

const CATEGORY_SKELETON_KEYS = [
  "category-skeleton-1",
  "category-skeleton-2",
  "category-skeleton-3",
  "category-skeleton-4",
  "category-skeleton-5",
  "category-skeleton-6",
];

function getTypeParameter(typeFilter) {
  return typeFilter === "ALL"
    ? undefined
    : typeFilter;
}

function getActiveParameter(statusFilter) {
  if (statusFilter === "ACTIVE") {
    return true;
  }

  if (statusFilter === "ARCHIVED") {
    return false;
  }

  return undefined;
}

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState([]);

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ACTIVE");

  const [searchText, setSearchText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [formState, setFormState] =
    useState(null);

  const [
    actionCategoryId,
    setActionCategoryId,
  ] = useState(null);

  useEffect(() => {
    let cancelled = false;

    categoryService
      .getCategories(
        getTypeParameter(typeFilter),
        getActiveParameter(statusFilter),
      )
      .then((result) => {
        if (cancelled) {
          return;
        }

        setCategories(result);
        setErrorMessage("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to load transaction categories.",
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
  }, [typeFilter, statusFilter]);

  const visibleCategories =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return categories;
      }

      return categories.filter(
        (category) => {
          const searchableValues = [
            category.name,
            category.categoryType,
            category.iconKey,
            category.colorKey,
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
    }, [categories, searchText]);

  const systemCategories =
    useMemo(
      () =>
        visibleCategories.filter(
          (category) =>
            category.systemDefined,
        ),
      [visibleCategories],
    );

  const customCategories =
    useMemo(
      () =>
        visibleCategories.filter(
          (category) =>
            !category.systemDefined,
        ),
      [visibleCategories],
    );

  const expenseCount =
    visibleCategories.filter(
      (category) =>
        category.categoryType ===
        "EXPENSE",
    ).length;

  const incomeCount =
    visibleCategories.filter(
      (category) =>
        category.categoryType ===
        "INCOME",
    ).length;

  async function loadCategories() {
    setLoading(true);
    setErrorMessage("");

    try {
      const result =
        await categoryService.getCategories(
          getTypeParameter(typeFilter),
          getActiveParameter(
            statusFilter,
          ),
        );

      setCategories(result);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to load transaction categories.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function changeTypeFilter(
    nextFilter,
  ) {
    if (nextFilter === typeFilter) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setTypeFilter(nextFilter);
  }

  function changeStatusFilter(
    nextFilter,
  ) {
    if (nextFilter === statusFilter) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setStatusFilter(nextFilter);
  }

  async function handleFormSaved() {
    const editing = Boolean(
      formState?.category,
    );

    setFormState(null);

    setSuccessMessage(
      editing
        ? "Custom category updated successfully."
        : "Custom category created successfully.",
    );

    await loadCategories();
  }

  async function handleStatusChange(
    category,
  ) {
    setActionCategoryId(
      category.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await categoryService.updateCategoryStatus(
        category.publicId,
        !category.active,
      );

      setSuccessMessage(
        category.active
          ? "Custom category deactivated."
          : "Custom category activated.",
      );

      await loadCategories();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to update the category status.",
        ),
      );
    } finally {
      setActionCategoryId(null);
    }
  }

  async function handleArchive(
    category,
  ) {
    const confirmed = window.confirm(
      `Archive "${category.name}"? Existing transaction records will remain unchanged.`,
    );

    if (!confirmed) {
      return;
    }

    setActionCategoryId(
      category.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await categoryService.archiveCategory(
        category.publicId,
      );

      setSuccessMessage(
        "Custom category archived successfully.",
      );

      await loadCategories();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to archive the category.",
        ),
      );
    } finally {
      setActionCategoryId(null);
    }
  }

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
            Transaction organisation
          </p>

          <h1 className="mt-3 text-[2.15rem] font-extrabold tracking-[-0.045em] text-[#080808] dark:text-white sm:text-[2.5rem]">
            Categories
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Use protected system categories
            or create categories that reflect
            your real income and spending
            activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setFormState({
              category: null,
            })
          }
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1848b5]"
        >
          <Plus className="h-4 w-4" />
          Create category
        </button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Visible categories"
          value={visibleCategories.length}
        />

        <SummaryCard
          label="Expense categories"
          value={expenseCount}
          tone="expense"
        />

        <SummaryCard
          label="Income categories"
          value={incomeCount}
          tone="income"
        />

        <SummaryCard
          label="Your custom categories"
          value={customCategories.length}
          tone="primary"
        />
      </section>

      <section className="mt-6 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[auto_auto_1fr_auto] xl:items-center">
          <FilterGroup
            items={TYPE_FILTERS}
            selectedValue={typeFilter}
            onChange={changeTypeFilter}
          />

          <FilterGroup
            items={STATUS_FILTERS}
            selectedValue={
              statusFilter
            }
            onChange={
              changeStatusFilter
            }
          />

          <div className="relative xl:ml-auto xl:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value,
                )
              }
              placeholder="Search categories"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={loadCategories}
            disabled={loading}
            aria-label="Refresh categories"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0b1424] dark:text-slate-300"
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

      <section className="mt-8">
        {loading ? (
          <CategorySkeletons />
        ) : visibleCategories.length ===
          0 ? (
          <EmptyCategories
            filtered={Boolean(
              searchText.trim(),
            )}
            onCreate={() =>
              setFormState({
                category: null,
              })
            }
          />
        ) : (
          <div className="space-y-10">
            {systemCategories.length >
              0 && (
              <CategorySection
                title="System categories"
                description="Available to every account and protected from modification."
                categories={
                  systemCategories
                }
                actionCategoryId={
                  actionCategoryId
                }
                onEdit={() => {}}
                onStatusChange={() => {}}
                onArchive={() => {}}
              />
            )}

            {customCategories.length >
              0 && (
              <CategorySection
                title="Your custom categories"
                description="Created and managed only inside your authenticated workspace."
                categories={
                  customCategories
                }
                actionCategoryId={
                  actionCategoryId
                }
                onEdit={(category) =>
                  setFormState({
                    category,
                  })
                }
                onStatusChange={
                  handleStatusChange
                }
                onArchive={
                  handleArchive
                }
              />
            )}
          </div>
        )}
      </section>

      {formState && (
        <CategoryFormModal
          key={
            formState.category
              ?.publicId ??
            "new-category"
          }
          category={
            formState.category
          }
          onClose={() =>
            setFormState(null)
          }
          onSaved={
            handleFormSaved
          }
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "neutral",
}) {
  const toneClasses = {
    neutral:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    primary:
      "bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300",
    income:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    expense:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  };

  return (
    <article className="rounded-[1.3rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-[1.8rem] font-extrabold leading-none tracking-[-0.035em] text-[#080808] tabular-nums dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <FolderTree className="h-4 w-4" />
        </div>
      </div>
    </article>
  );
}

function FilterGroup({
  items,
  selectedValue,
  onChange,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() =>
            onChange(item.value)
          }
          className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
            selectedValue ===
            item.value
              ? "bg-[#1f55cf] text-white shadow-[0_7px_15px_rgba(31,85,207,0.18)]"
              : "bg-[#f1f5f9] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}


function CategorySection({
  title,
  description,
  categories,
  actionCategoryId,
  onEdit,
  onStatusChange,
  onArchive,
}) {
  return (
    <div>
      <div>
        <h2 className="text-[1.45rem] font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map(
          (category) => (
            <CategoryCard
              key={
                category.publicId
              }
              category={category}
              actionPending={
                actionCategoryId ===
                category.publicId
              }
              onEdit={() =>
                onEdit(category)
              }
              onStatusChange={() =>
                onStatusChange(
                  category,
                )
              }
              onArchive={() =>
                onArchive(category)
              }
            />
          ),
        )}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  actionPending,
  onEdit,
  onStatusChange,
  onArchive,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const colorOption =
    getCategoryColorOption(
      category.colorKey,
    );

  const badgeClass =
    colorOption?.badgeClass ??
    "bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300";

  return (
    <article className="relative rounded-[1.45rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.075)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${badgeClass}`}
        >
          <CategoryIcon
            iconKey={
              category.iconKey
            }
            className="h-5 w-5"
          />
        </div>

        {category.systemDefined ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <LockKeyhole className="h-4 w-4" />
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (currentValue) =>
                    !currentValue,
                )
              }
              aria-label="Category actions"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#1f55cf] dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <EllipsisVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#101a2c]">
                <CategoryActionButton
                  icon={Edit3}
                  label="Edit category"
                  disabled={
                    actionPending
                  }
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                />

                <CategoryActionButton
                  icon={
                    category.active
                      ? ToggleLeft
                      : ToggleRight
                  }
                  label={
                    category.active
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

                {category.active && (
                  <CategoryActionButton
                    icon={Archive}
                    label="Archive category"
                    danger
                    disabled={
                      actionPending
                    }
                    onClick={() => {
                      setMenuOpen(false);
                      onArchive();
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-lg font-extrabold tracking-[-0.02em] text-[#0b1220] dark:text-white">
            {category.name}
          </h3>

          <CategoryStatusBadge
            active={category.active}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <CategoryTypeBadge
            categoryType={
              category.categoryType
            }
          />

          {category.systemDefined && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[0.62rem] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <LockKeyhole className="h-3 w-3" />
              System
            </span>
          )}
        </div>

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs dark:border-slate-800">
          <CategoryDetail
            label="Type"
            value={getCategoryTypeLabel(
              category.categoryType,
            )}
          />

          <CategoryDetail
            label="Icon"
            value={
              category.iconKey
            }
          />

          <CategoryDetail
            label="Colour"
            value={
              colorOption?.label ??
              category.colorKey
            }
          />
        </div>
      </div>
    </article>
  );
}

function CategoryTypeBadge({
  categoryType,
}) {
  const income =
    categoryType === "INCOME";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-wide ${
        income
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
      }`}
    >
      {getCategoryTypeLabel(
        categoryType,
      )}
    </span>
  );
}

function CategoryStatusBadge({
  active,
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-wide ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {active
        ? "Active"
        : "Archived"}
    </span>
  );
}

function CategoryDetail({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="max-w-44 truncate font-extrabold text-[#0b1220] dark:text-white">
        {value}
      </span>
    </div>
  );
}

function CategoryActionButton({
  icon: Icon,
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
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function EmptyCategories({
  filtered,
  onCreate,
}) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_14px_40px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
        <FolderTree className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
        {filtered
          ? "No matching categories"
          : "No categories available"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {filtered
          ? "Change your search text or category filters."
          : "Create a custom category that reflects how you organise real income and spending."}
      </p>

      {!filtered && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:bg-[#1848b5]"
        >
          <Plus className="h-4 w-4" />
          Create first category
        </button>
      )}
    </div>
  );
}

function CategorySkeletons() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {CATEGORY_SKELETON_KEYS.map(
        (key) => (
          <div
            key={key}
            className="animate-pulse rounded-[1.45rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#101a2c]"
          >
            <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-6 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="mt-3 h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />

            <div className="mt-7 h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ),
      )}
    </div>
  );
}
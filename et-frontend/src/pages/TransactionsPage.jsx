import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,

  CircleDollarSign,
  Download,
  Edit3,
  FileImage,
  Filter,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import TransactionFormModal from "../components/TransactionFormModal";
import {
  DEFAULT_TRANSACTION_PAGE_SIZE,
  TRANSACTION_PAGE_SIZE_OPTIONS,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  getTransactionStatusLabel,
  getTransactionTypeLabel,
} from "../config/transactionOptions";
import { accountService } from "../services/accountService";
import { categoryService } from "../services/categoryService";
import { transactionService } from "../services/transactionService";

import { getApiErrorMessage } from "../utils/apiError";
import PageToastBridge from "../components/PageToastBridge";

const EMPTY_FILTERS = Object.freeze({
  type: "",
  status: "POSTED",
  accountPublicId: "",
  categoryPublicId: "",
  fromDate: "",
  toDate: "",
  search: "",
});

const EMPTY_PAGE = Object.freeze({
  content: [],
  page: 0,
  size: DEFAULT_TRANSACTION_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
});

const TRANSACTION_SKELETON_KEYS = [
  "transaction-skeleton-1",
  "transaction-skeleton-2",
  "transaction-skeleton-3",
  "transaction-skeleton-4",
  "transaction-skeleton-5",
];

function formatCurrency(
  value,
  currencyCode,
) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return `${currencyCode} ${value}`;
  }

  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(numericValue);
  } catch {
    return `${currencyCode} ${numericValue.toFixed(
      2,
    )}`;
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const [year, month, day] =
    dateValue
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return new Intl.DateTimeFormat(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function getTransactionTitle(
  transaction,
) {
  return (
    transaction.merchantName ||
    transaction.description ||
    transaction.category?.name ||
    getTransactionTypeLabel(
      transaction.transactionType,
    )
  );
}

function getAmountPrefix(
  transactionType,
) {
  if (transactionType === "INCOME") {
    return "+";
  }

  if (transactionType === "EXPENSE") {
    return "−";
  }

  return "";
}

function getAmountClass(
  transactionType,
  transactionStatus,
) {
  if (
    transactionStatus ===
    "CANCELLED"
  ) {
    return "text-slate-400 line-through dark:text-slate-500";
  }

  if (
    transactionType === "INCOME"
  ) {
    return "text-emerald-600 dark:text-emerald-300";
  }

  if (
    transactionType === "EXPENSE"
  ) {
    return "text-rose-600 dark:text-rose-300";
  }

  return "text-[#1f55cf] dark:text-blue-300";
}

function getAccountRoute(
  transaction,
) {
  if (
    transaction.transactionType ===
    "TRANSFER"
  ) {
    return `${
      transaction.account?.name ??
      "Unknown"
    } → ${
      transaction.destinationAccount
        ?.name ?? "Unknown"
    }`;
  }

  return (
    transaction.account?.name ??
    "Unknown account"
  );
}

function countAppliedFilters(
  filters,
) {
  return Object.values(filters).filter(
    (value) => value !== "",
  ).length;
}


export default function TransactionsPage() {
  const [accounts, setAccounts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [
    transactionPage,
    setTransactionPage,
  ] = useState(EMPTY_PAGE);

  const [
    draftFilters,
    setDraftFilters,
  ] = useState({
    ...EMPTY_FILTERS,
  });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState({
    ...EMPTY_FILTERS,
  });

  const [page, setPage] =
    useState(0);

  const [pageSize, setPageSize] =
    useState(
      DEFAULT_TRANSACTION_PAGE_SIZE,
    );

  const [loading, setLoading] =
    useState(true);

  const [
    dependenciesLoading,
    setDependenciesLoading,
  ] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [formState, setFormState] =
    useState(null);

  const [
    actionTransactionId,
    setActionTransactionId,
  ] = useState(null);

  const [
    receiptActionTransactionId,
    setReceiptActionTransactionId,
  ] = useState(null);

  const [
    receiptUploadTarget,
    setReceiptUploadTarget,
  ] = useState(null);

  const receiptInputRef =
    useRef(null);
useEffect(() => {
    let cancelled = false;

    Promise.all([
      accountService.getAccounts(),
      categoryService.getCategories(),
    ])
      .then(
        ([
          accountData,
          categoryData,
        ]) => {
          if (cancelled) {
            return;
          }

          setAccounts(accountData);
          setCategories(categoryData);
        },
      )
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to load account and category options.",
          ),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setDependenciesLoading(
            false,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    transactionService
      .getTransactions({
        ...appliedFilters,
        page,
        size: pageSize,
      })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setTransactionPage(result);
        setErrorMessage("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to load transactions.",
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
  }, [
    appliedFilters,
    page,
    pageSize,
  ]);

  const activeAccounts =
    useMemo(
      () =>
        accounts.filter(
          (account) =>
            account.active,
        ),
      [accounts],
    );

  const filteredCategoryOptions =
    useMemo(() => {
      if (
        draftFilters.type ===
          "INCOME" ||
        draftFilters.type ===
          "EXPENSE"
      ) {
        return categories.filter(
          (category) =>
            category.categoryType ===
            draftFilters.type,
        );
      }

      return categories;
    }, [
      categories,
      draftFilters.type,
    ]);

  const appliedFilterCount =
    countAppliedFilters(
      appliedFilters,
    );

  async function loadDependencies() {
    setDependenciesLoading(true);

    try {
      const [
        accountData,
        categoryData,
      ] = await Promise.all([
        accountService.getAccounts(),
        categoryService.getCategories(),
      ]);

      setAccounts(accountData);
      setCategories(categoryData);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to refresh account and category options.",
        ),
      );
    } finally {
      setDependenciesLoading(false);
    }
  }

  async function loadTransactions() {
    setLoading(true);

    try {
      const result =
        await transactionService.getTransactions(
          {
            ...appliedFilters,
            page,
            size: pageSize,
          },
        );

      setTransactionPage(result);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to load transactions.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    setErrorMessage("");

    await Promise.all([
      loadTransactions(),
      loadDependencies(),
    ]);
  }

  function updateDraftFilter(
    event,
  ) {
    const { name, value } =
      event.target;

    setDraftFilters(
      (currentFilters) => {
        if (
          name === "type" &&
          value === "TRANSFER"
        ) {
          return {
            ...currentFilters,
            type: value,
            categoryPublicId: "",
          };
        }

        return {
          ...currentFilters,
          [name]: value,
        };
      },
    );
  }

  function applyFilters(event) {
    event.preventDefault();

    if (
      draftFilters.fromDate &&
      draftFilters.toDate &&
      draftFilters.fromDate >
        draftFilters.toDate
    ) {
      setErrorMessage(
        "The start date cannot be after the end date.",
      );

      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setPage(0);

    setAppliedFilters({
      ...draftFilters,
      search:
        draftFilters.search.trim(),
    });
  }

  function resetFilters() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    setDraftFilters({
      ...EMPTY_FILTERS,
    });

    setAppliedFilters({
      ...EMPTY_FILTERS,
    });

    setPage(0);
  }

  function changePage(nextPage) {
    if (
      nextPage < 0 ||
      nextPage >=
        transactionPage.totalPages ||
      nextPage === page
    ) {
      return;
    }

    setLoading(true);
    setPage(nextPage);
  }

  function changePageSize(event) {
    const nextSize = Number(
      event.target.value,
    );

    setLoading(true);
    setPage(0);
    setPageSize(nextSize);
  }

  async function handleFormSaved(
    message,
  ) {
    const editing = Boolean(
      formState?.transaction,
    );

    setFormState(null);

    setSuccessMessage(
      message ||
        (editing
          ? "Transaction updated successfully."
          : "Transaction created successfully."),
    );

    if (!editing && page !== 0) {
      setLoading(true);
      setPage(0);

      await loadDependencies();

      return;
    }

    await refreshAll();
  }

  function requestReceiptUpload(
    transaction,
  ) {
    setReceiptUploadTarget(
      transaction,
    );

    receiptInputRef.current?.click();
  }

  async function handleReceiptFileSelected(
    event,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (
      !file ||
      !receiptUploadTarget
    ) {
      return;
    }

    setReceiptActionTransactionId(
      receiptUploadTarget.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result =
        await transactionService.uploadReceipt(
          receiptUploadTarget.publicId,
          file,
        );

      setSuccessMessage(
        result.message ||
          "Receipt attached successfully.",
      );

      await refreshAll();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to attach receipt.",
        ),
      );
    } finally {
      setReceiptActionTransactionId(null);
      setReceiptUploadTarget(null);
    }
  }

  async function handleDownloadReceipt(
    transaction,
  ) {
    setReceiptActionTransactionId(
      transaction.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const receiptFile =
        await transactionService.downloadReceipt(
          transaction.publicId,
        );

      const url =
        window.URL.createObjectURL(
          receiptFile.blob,
        );

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        receiptFile.fileName ||
        "transaction-receipt";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to download receipt.",
        ),
      );
    } finally {
      setReceiptActionTransactionId(null);
    }
  }

  async function handleDeleteReceipt(
    transaction,
  ) {
    const confirmed =
      window.confirm(
        "Delete this receipt attachment?",
      );

    if (!confirmed) {
      return;
    }

    setReceiptActionTransactionId(
      transaction.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result =
        await transactionService.deleteReceipt(
          transaction.publicId,
        );

      setSuccessMessage(
        result.message ||
          "Receipt deleted successfully.",
      );

      await refreshAll();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to delete receipt.",
        ),
      );
    } finally {
      setReceiptActionTransactionId(null);
    }
  }

  async function handleCancelTransaction(
    transaction,
  ) {
    const confirmed =
      window.confirm(
        `Cancel this ${getTransactionTypeLabel(
          transaction.transactionType,
        ).toLowerCase()} transaction? Its balance impact will be reversed.`,
      );

    if (!confirmed) {
      return;
    }

    setActionTransactionId(
      transaction.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result =
        await transactionService.cancelTransaction(
          transaction.publicId,
        );

      setSuccessMessage(
        result.message ||
          "Transaction cancelled successfully.",
      );

      if (
        transactionPage.content
          .length === 1 &&
        page > 0
      ) {
        setLoading(true);

        setPage(
          (currentPage) =>
            currentPage - 1,
        );

        await loadDependencies();
      } else {
        await refreshAll();
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to cancel the transaction.",
        ),
      );
    } finally {
      setActionTransactionId(null);
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

      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.19em] text-[#1f55cf] dark:text-blue-300">
            Money activity
          </p>

          <h1 className="mt-3 text-[2.15rem] font-extrabold tracking-[-0.045em] text-[#080808] dark:text-white sm:text-[2.5rem]">
            Transactions
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Record and review income,
            expenses, and transfers using
            your real accounts and
            categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setFormState({
              transaction: null,
            })
          }
          disabled={
            dependenciesLoading ||
            activeAccounts.length === 0
          }
          title={
            activeAccounts.length === 0
              ? "Create an active account first"
              : "Add transaction"
          }
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1848b5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add transaction
        </button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Matching records"
          value={
            transactionPage.totalElements
          }
        />

        <SummaryCard
          label="Current page"
          value={
            transactionPage.totalPages ===
            0
              ? "0 of 0"
              : `${
                  transactionPage.page +
                  1
                } of ${
                  transactionPage.totalPages
                }`
          }
          textValue
        />

        <SummaryCard
          label="Applied filters"
          value={
            appliedFilterCount
          }
        />
      </section>

      <section className="mt-6 rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-6">
        <form
          onSubmit={applyFilters}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
                <Filter className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-[#0b1220] dark:text-white">
                  Filter transactions
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Narrow the transaction
                  history using real record
                  fields.
                </p>
              </div>
            </div>

            {appliedFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-[#1f55cf] dark:text-slate-400 dark:hover:text-blue-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              label="Type"
              name="type"
              value={
                draftFilters.type
              }
              onChange={
                updateDraftFilter
              }
            >
              <option value="">
                All types
              </option>

              {TRANSACTION_TYPE_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </FilterSelect>

            <FilterSelect
              label="Status"
              name="status"
              value={
                draftFilters.status
              }
              onChange={
                updateDraftFilter
              }
            >
              <option value="">
                All statuses
              </option>

              {TRANSACTION_STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </FilterSelect>

            <FilterSelect
              label="Account"
              name="accountPublicId"
              value={
                draftFilters.accountPublicId
              }
              onChange={
                updateDraftFilter
              }
            >
              <option value="">
                All accounts
              </option>

              {accounts.map(
                (account) => (
                  <option
                    key={
                      account.publicId
                    }
                    value={
                      account.publicId
                    }
                  >
                    {account.name} ·{" "}
                    {
                      account.currencyCode
                    }
                  </option>
                ),
              )}
            </FilterSelect>

            <FilterSelect
              label="Category"
              name="categoryPublicId"
              value={
                draftFilters.categoryPublicId
              }
              onChange={
                updateDraftFilter
              }
              disabled={
                draftFilters.type ===
                "TRANSFER"
              }
            >
              <option value="">
                All categories
              </option>

              {filteredCategoryOptions.map(
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
            </FilterSelect>

            <FilterInput
              label="From date"
              type="date"
              name="fromDate"
              value={
                draftFilters.fromDate
              }
              onChange={
                updateDraftFilter
              }
            />

            <FilterInput
              label="To date"
              type="date"
              name="toDate"
              value={
                draftFilters.toDate
              }
              onChange={
                updateDraftFilter
              }
            />

            <div className="md:col-span-2 xl:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-extrabold text-slate-600 dark:text-slate-300">
                  Search
                </span>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    name="search"
                    value={
                      draftFilters.search
                    }
                    onChange={
                      updateDraftFilter
                    }
                    placeholder="Merchant, description, reference, account or category"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={refreshAll}
              disabled={
                loading ||
                dependenciesLoading
              }
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0b1424] dark:text-slate-200"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ||
                  dependenciesLoading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

            <button
              type="submit"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-5 text-sm font-extrabold text-white transition hover:bg-[#1848b5]"
            >
              <Filter className="h-4 w-4" />
              Apply filters
            </button>
          </div>
        </form>
      </section>


      <section className="mt-6 overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#101a2c]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-[#0b1220] dark:text-white">
              Transaction history
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Sorted by transaction date
              and creation time, newest
              first.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400">
            Rows

            <select
              value={pageSize}
              onChange={
                changePageSize
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-extrabold text-slate-700 outline-none transition focus:border-[#1f55cf] dark:border-slate-700 dark:bg-[#0b1424] dark:text-slate-200"
            >
              {TRANSACTION_PAGE_SIZE_OPTIONS.map(
                (size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        {loading ? (
          <TransactionSkeletons />
        ) : transactionPage.empty ? (
          <EmptyTransactions
            filtered={
              appliedFilterCount > 0
            }
            canCreate={
              activeAccounts.length >
              0
            }
            onCreate={() =>
              setFormState({
                transaction: null,
              })
            }
            onReset={resetFilters}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1040px] border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-left text-[0.67rem] font-extrabold uppercase tracking-[0.08em] text-slate-500 dark:bg-[#0b1424] dark:text-slate-400">
                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Transaction
                    </th>

                    <th className="px-6 py-4">
                      Account
                    </th>

                    <th className="px-6 py-4">
                      Category
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Receipt
                    </th>

                    <th className="px-6 py-4 text-right">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transactionPage.content.map(
                    (transaction) => (
                      <TransactionTableRow
                        key={
                          transaction.publicId
                        }
                        transaction={
                          transaction
                        }
                        actionPending={
                          actionTransactionId ===
                          transaction.publicId
                        }
                        onEdit={() =>
                          setFormState({
                            transaction,
                          })
                        }
                        onCancel={() =>
                          handleCancelTransaction(
                            transaction,
                          )
                        }
                        receiptActionPending={
                          receiptActionTransactionId ===
                          transaction.publicId
                        }
                        onUploadReceipt={() =>
                          requestReceiptUpload(
                            transaction,
                          )
                        }
                        onDownloadReceipt={() =>
                          handleDownloadReceipt(
                            transaction,
                          )
                        }
                        onDeleteReceipt={() =>
                          handleDeleteReceipt(
                            transaction,
                          )
                        }
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 lg:hidden dark:divide-slate-800">
              {transactionPage.content.map(
                (transaction) => (
                  <TransactionMobileCard
                    key={
                      transaction.publicId
                    }
                    transaction={
                      transaction
                    }
                    actionPending={
                      actionTransactionId ===
                      transaction.publicId
                    }
                    onEdit={() =>
                      setFormState({
                        transaction,
                      })
                    }
                    onCancel={() =>
                      handleCancelTransaction(
                        transaction,
                      )
                    }
                    receiptActionPending={
                      receiptActionTransactionId ===
                      transaction.publicId
                    }
                    onUploadReceipt={() =>
                      requestReceiptUpload(
                        transaction,
                      )
                    }
                    onDownloadReceipt={() =>
                      handleDownloadReceipt(
                        transaction,
                      )
                    }
                    onDeleteReceipt={() =>
                      handleDeleteReceipt(
                        transaction,
                      )
                    }
                  />
                ),
              )}
            </div>
          </>
        )}

        {!loading &&
          !transactionPage.empty && (
            <PaginationBar
              pageData={
                transactionPage
              }
              onPageChange={
                changePage
              }
            />
          )}
      </section>

      <input
        ref={receiptInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        onChange={handleReceiptFileSelected}
        className="sr-only"
      />

      {formState && (
        <TransactionFormModal
          key={
            formState.transaction
              ?.publicId ??
            "new-transaction"
          }
          transaction={
            formState.transaction
          }
          accounts={accounts}
          categories={categories}
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
  textValue = false,
}) {
  return (
    <article className="rounded-[1.3rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#101a2c]">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p
        className={`mt-3 font-extrabold tracking-[-0.03em] text-[#080808] dark:text-white ${
          textValue
            ? "text-lg"
            : "text-[1.8rem] tabular-nums"
        }`}
      >
        {value}
      </p>
    </article>
  );
}

function FilterSelect({
  label,
  children,
  disabled = false,
  ...selectProperties
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <select
        {...selectProperties}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#0b1220] outline-none transition focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white dark:disabled:bg-slate-800"
      >
        {children}
      </select>
    </label>
  );
}

function FilterInput({
  label,
  ...inputProperties
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <div className="relative">
        <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          {...inputProperties}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-[#0b1220] outline-none transition focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
        />
      </div>
    </label>
  );
}

function TransactionTableRow({
  transaction,
  actionPending,
  onEdit,
  onCancel,
  receiptActionPending,
  onUploadReceipt,
  onDownloadReceipt,
  onDeleteReceipt,
}) {
  return (
    <tr className="border-t border-slate-100 transition hover:bg-[#f8fafc] dark:border-slate-800 dark:hover:bg-[#0b1424]">
      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
        {formatDate(
          transaction.transactionDate,
        )}
      </td>

      <td className="max-w-72 px-6 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <TransactionTypeIcon
            transactionType={
              transaction.transactionType
            }
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[#0b1220] dark:text-white">
              {getTransactionTitle(
                transaction,
              )}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {transaction.referenceNumber ||
                transaction.description ||
                getTransactionTypeLabel(
                  transaction.transactionType,
                )}
            </p>
          </div>
        </div>
      </td>

      <td className="max-w-56 px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <p className="truncate">
          {getAccountRoute(
            transaction,
          )}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {
            transaction.currencyCode
          }
        </p>
      </td>

      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
        {transaction.category?.name ??
          (transaction.transactionType ===
          "TRANSFER"
            ? "Transfer"
            : "-")}
      </td>

      <td className="px-6 py-4">
        <TransactionStatusBadge
          transactionStatus={
            transaction.transactionStatus
          }
        />
      </td>

      <td className="px-6 py-4">
        <TransactionReceiptControls
          transaction={transaction}
          actionPending={receiptActionPending}
          onUpload={onUploadReceipt}
          onDownload={onDownloadReceipt}
          onDelete={onDeleteReceipt}
        />
      </td>

      <td
        className={`whitespace-nowrap px-6 py-4 text-right text-sm font-extrabold tabular-nums ${getAmountClass(
          transaction.transactionType,
          transaction.transactionStatus,
        )}`}
      >
        {getAmountPrefix(
          transaction.transactionType,
        )}

        {formatCurrency(
          transaction.amount,
          transaction.currencyCode,
        )}
      </td>

      <td className="px-6 py-4 text-right">
        {transaction.transactionStatus ===
        "POSTED" ? (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              disabled={
                actionPending
              }
              aria-label="Edit transaction"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-[#1f55cf] disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              <Edit3 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={
                actionPending
              }
              aria-label="Cancel transaction"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            No actions
          </span>
        )}
      </td>
    </tr>
  );
}

function TransactionMobileCard({
  transaction,
  actionPending,
  onEdit,
  onCancel,
  receiptActionPending,
  onUploadReceipt,
  onDownloadReceipt,
  onDeleteReceipt,
}) {
  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <TransactionTypeIcon
            transactionType={
              transaction.transactionType
            }
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[#0b1220] dark:text-white">
              {getTransactionTitle(
                transaction,
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatDate(
                transaction.transactionDate,
              )}
            </p>
          </div>
        </div>

        <p
          className={`shrink-0 text-sm font-extrabold tabular-nums ${getAmountClass(
            transaction.transactionType,
            transaction.transactionStatus,
          )}`}
        >
          {getAmountPrefix(
            transaction.transactionType,
          )}

          {formatCurrency(
            transaction.amount,
            transaction.currencyCode,
          )}
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-[#f8fafc] p-4 text-xs dark:bg-[#0b1424] sm:grid-cols-2">
        <MobileDetail
          label="Account"
          value={getAccountRoute(
            transaction,
          )}
        />

        <MobileDetail
          label="Category"
          value={
            transaction.category?.name ??
            (transaction.transactionType ===
            "TRANSFER"
              ? "Transfer"
              : "-")
          }
        />

        <MobileDetail
          label="Reference"
          value={
            transaction.referenceNumber ||
            "-"
          }
        />

        <div>
          <p className="text-slate-500 dark:text-slate-400">
            Status
          </p>

          <div className="mt-1">
            <TransactionStatusBadge
              transactionStatus={
                transaction.transactionStatus
              }
            />
          </div>
        </div>

        <div>
          <p className="text-slate-500 dark:text-slate-400">
            Receipt
          </p>

          <div className="mt-1">
            <TransactionReceiptControls
              transaction={transaction}
              actionPending={receiptActionPending}
              onUpload={onUploadReceipt}
              onDownload={onDownloadReceipt}
              onDelete={onDeleteReceipt}
              compact
            />
          </div>
        </div>
      </div>

      {transaction.description && (
        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {transaction.description}
        </p>
      )}

      {transaction.transactionStatus ===
        "POSTED" && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={
              actionPending
            }
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={
              actionPending
            }
            className="flex h-9 items-center gap-2 rounded-lg bg-rose-50 px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}

function TransactionReceiptControls({
  transaction,
  actionPending,
  onUpload,
  onDownload,
  onDelete,
  compact = false,
}) {
  const hasReceipt =
    Boolean(transaction.receipt);

  const buttonClassName =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300";

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-1"
          : "flex items-center gap-1"
      }
    >
      <span
        className={
          hasReceipt
            ? "inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[0.65rem] font-extrabold text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300"
            : "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[0.65rem] font-extrabold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }
      >
        <FileImage className="h-3.5 w-3.5" />
        {hasReceipt
          ? "Attached"
          : "No receipt"}
      </span>

      {hasReceipt && (
        <button
          type="button"
          onClick={onDownload}
          disabled={actionPending}
          title="Download receipt"
          className={buttonClassName}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={onUpload}
        disabled={actionPending}
        title={
          hasReceipt
            ? "Replace receipt"
            : "Upload receipt"
        }
        className={buttonClassName}
      >
        <UploadCloud className="h-3.5 w-3.5" />
      </button>

      {hasReceipt && (
        <button
          type="button"
          onClick={onDelete}
          disabled={actionPending}
          title="Delete receipt"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function TransactionTypeIcon({
  transactionType,
}) {
  if (
    transactionType === "INCOME"
  ) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
        <ArrowDownLeft className="h-4 w-4" />
      </span>
    );
  }

  if (
    transactionType === "TRANSFER"
  ) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
        <ArrowRightLeft className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
      <ArrowUpRight className="h-4 w-4" />
    </span>
  );
}

function TransactionStatusBadge({
  transactionStatus,
}) {
  const posted =
    transactionStatus === "POSTED";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[0.6rem] font-extrabold uppercase tracking-wide ${
        posted
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {getTransactionStatusLabel(
        transactionStatus,
      )}
    </span>
  );
}

function MobileDetail({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate font-extrabold text-[#0b1220] dark:text-white">
        {value}
      </p>
    </div>
  );
}

function PaginationBar({
  pageData,
  onPageChange,
}) {
  const firstRecord =
    pageData.page *
      pageData.size +
    1;

  const lastRecord = Math.min(
    (pageData.page + 1) *
      pageData.size,
    pageData.totalElements,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {firstRecord}-
        {lastRecord} of{" "}
        {pageData.totalElements}
      </p>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            onPageChange(
              pageData.page - 1,
            )
          }
          disabled={pageData.first}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </button>

        <span className="min-w-20 text-center text-xs font-extrabold text-[#0b1220] dark:text-white">
          {pageData.page + 1} /{" "}
          {pageData.totalPages}
        </span>

        <button
          type="button"
          onClick={() =>
            onPageChange(
              pageData.page + 1,
            )
          }
          disabled={pageData.last}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmptyTransactions({
  filtered,
  canCreate,
  onCreate,
  onReset,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
        <CircleDollarSign className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
        {filtered
          ? "No matching transactions"
          : "No transactions recorded"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {filtered
          ? "Change or reset the filters to view other transaction records."
          : canCreate
            ? "Record your first real income, expense, or transfer."
            : "Create an active financial account before recording transactions."}
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {filtered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-extrabold text-slate-700 transition hover:border-[#1f55cf] hover:text-[#1f55cf] dark:border-slate-700 dark:text-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            Reset filters
          </button>
        )}

        {!filtered &&
          canCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-5 text-sm font-extrabold text-white transition hover:bg-[#1848b5]"
            >
              <Plus className="h-4 w-4" />
              Add first transaction
            </button>
          )}
      </div>
    </div>
  );
}

function TransactionSkeletons() {
  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {TRANSACTION_SKELETON_KEYS.map(
        (key) => (
          <div
            key={key}
            className="animate-pulse px-6 py-5"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />

              <div className="flex-1">
                <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-2 h-3 w-1/5 rounded bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}
import {
  Building2,
  CircleDollarSign,
  CreditCard,
  Edit3,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AccountFormModal from "../components/AccountFormModal";
import {
  getAccountTypeLabel,
} from "../config/accountOptions";
import { accountService } from "../services/accountService";
import { getApiErrorMessage } from "../utils/apiError";
import PageToastBridge from "../components/PageToastBridge";

const ACCOUNT_FILTERS = [
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
    label: "All accounts",
  },
];

const ACCOUNT_SKELETON_KEYS = [
  "account-skeleton-1",
  "account-skeleton-2",
  "account-skeleton-3",
];

function getActiveParameter(filter) {
  if (filter === "ACTIVE") {
    return true;
  }

  if (filter === "ARCHIVED") {
    return false;
  }

  return undefined;
}

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

export default function AccountsPage() {
  const [accounts, setAccounts] =
    useState([]);

  const [filter, setFilter] =
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
    actionAccountId,
    setActionAccountId,
  ] = useState(null);

  useEffect(() => {
    let cancelled = false;

    accountService
      .getAccounts(
        getActiveParameter(filter),
      )
      .then((result) => {
        if (cancelled) {
          return;
        }

        setAccounts(result);
        setErrorMessage("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to load financial accounts.",
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
  }, [filter]);

  const visibleAccounts =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return accounts;
      }

      return accounts.filter(
        (account) => {
          const searchableValues = [
            account.name,
            account.accountType,
            account.currencyCode,
            account.institutionName,
            account.accountNumberLastFour,
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
    }, [accounts, searchText]);

  const includedAccountCount =
    visibleAccounts.filter(
      (account) =>
        account.includeInTotal,
    ).length;

  async function loadAccounts() {
    setLoading(true);
    setErrorMessage("");

    try {
      const result =
        await accountService.getAccounts(
          getActiveParameter(filter),
        );

      setAccounts(result);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to load financial accounts.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(
    nextFilter,
  ) {
    if (nextFilter === filter) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setFilter(nextFilter);
  }

  async function handleFormSaved() {
    const editing = Boolean(
      formState?.account,
    );

    setFormState(null);

    setSuccessMessage(
      editing
        ? "Financial account updated successfully."
        : "Financial account created successfully.",
    );

    await loadAccounts();
  }

  async function handleStatusChange(
    account,
  ) {
    setActionAccountId(
      account.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await accountService.updateAccountStatus(
        account.publicId,
        !account.active,
      );

      setSuccessMessage(
        account.active
          ? "Financial account deactivated."
          : "Financial account activated.",
      );

      await loadAccounts();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to update the account status.",
        ),
      );
    } finally {
      setActionAccountId(null);
    }
  }

  async function handleArchive(
    account,
  ) {
    const confirmed =
      window.confirm(
        `Archive "${account.name}"? The account will no longer be included in totals.`,
      );

    if (!confirmed) {
      return;
    }

    setActionAccountId(
      account.publicId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await accountService.archiveAccount(
        account.publicId,
      );

      setSuccessMessage(
        "Financial account archived successfully.",
      );

      await loadAccounts();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to archive the account.",
        ),
      );
    } finally {
      setActionAccountId(null);
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
            Financial foundation
          </p>

          <h1 className="mt-3 text-[2.15rem] font-extrabold tracking-[-0.045em] text-[#080808] dark:text-white sm:text-[2.5rem]">
            Accounts
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Create and manage the real
            accounts used to calculate your
            balances and transaction history.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setFormState({
              account: null,
            })
          }
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1848b5]"
        >
          <Plus className="h-4 w-4" />
          Add account
        </button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Visible accounts"
          value={visibleAccounts.length}
        />

        <SummaryCard
          label="Included in totals"
          value={includedAccountCount}
        />

        <SummaryCard
          label="Current filter"
          value={
            ACCOUNT_FILTERS.find(
              (item) =>
                item.value === filter,
            )?.label ?? filter
          }
          textValue
        />
      </section>

      <section className="mt-6 rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_FILTERS.map(
              (item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    handleFilterChange(
                      item.value,
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                    filter === item.value
                      ? "bg-[#1f55cf] text-white shadow-[0_7px_15px_rgba(31,85,207,0.18)]"
                      : "bg-[#f1f5f9] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value,
                  )
                }
                placeholder="Search accounts"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-[#0b1220] outline-none transition placeholder:text-slate-400 focus:border-[#1f55cf] focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-[#0b1424] dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={loadAccounts}
              disabled={loading}
              aria-label="Refresh accounts"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#1f55cf] hover:text-[#1f55cf] disabled:opacity-50 dark:border-slate-700 dark:bg-[#0b1424] dark:text-slate-300"
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

      <section className="mt-6">
        {loading ? (
          <AccountSkeletons />
        ) : visibleAccounts.length === 0 ? (
          <EmptyAccounts
            filtered={Boolean(
              searchText.trim(),
            )}
            onCreate={() =>
              setFormState({
                account: null,
              })
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleAccounts.map(
              (account, index) => (
                <AccountCard
                  key={account.publicId}
                  account={account}
                  index={index}
                  actionPending={
                    actionAccountId ===
                    account.publicId
                  }
                  onEdit={() =>
                    setFormState({
                      account,
                    })
                  }
                  onStatusChange={() =>
                    handleStatusChange(
                      account,
                    )
                  }
                  onArchive={() =>
                    handleArchive(account)
                  }
                />
              ),
            )}
          </div>
        )}
      </section>

      {formState && (
        <AccountFormModal
          key={
            formState.account?.publicId ??
            "new-account"
          }
          account={formState.account}
          onClose={() =>
            setFormState(null)
          }
          onSaved={handleFormSaved}
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


function AccountCard({
  account,
  index,
  actionPending,
  onEdit,
  onStatusChange,
  onArchive,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.04,
        duration: 0.35,
      }}
      whileHover={{
        y: -3,
      }}
      className="relative rounded-[1.45rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition dark:border-slate-800 dark:bg-[#101a2c]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
          <WalletCards className="h-5 w-5" />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (currentValue) =>
                  !currentValue,
              )
            }
            aria-label="Account actions"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#1f55cf] dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#101a2c]">
              <AccountActionButton
                icon={Edit3}
                label="Edit account"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              />

              <AccountActionButton
                icon={
                  account.active
                    ? EyeOff
                    : Eye
                }
                label={
                  account.active
                    ? "Deactivate"
                    : "Activate"
                }
                disabled={actionPending}
                onClick={() => {
                  setMenuOpen(false);
                  onStatusChange();
                }}
              />

              {account.active && (
                <AccountActionButton
                  icon={Trash2}
                  label="Archive account"
                  danger
                  disabled={actionPending}
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive();
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-lg font-extrabold tracking-[-0.02em] text-[#0b1220] dark:text-white">
            {account.name}
          </h2>

          <StatusBadge
            active={account.active}
          />
        </div>

        <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {getAccountTypeLabel(
            account.accountType,
          )}
        </p>

        <p className="mt-6 text-[1.75rem] font-extrabold tracking-[-0.035em] text-[#080808] tabular-nums dark:text-white">
          {formatCurrency(
            account.currentBalance,
            account.currencyCode,
          )}
        </p>

        <p className="mt-1 text-[0.7rem] font-medium text-slate-500 dark:text-slate-400">
          Current balance
        </p>

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs dark:border-slate-800">
          <AccountDetail
            icon={Building2}
            label="Institution"
            value={
              account.institutionName ||
              "Not provided"
            }
          />

          <AccountDetail
            icon={CreditCard}
            label="Account ending"
            value={
              account.accountNumberLastFour
                ? `•••• ${account.accountNumberLastFour}`
                : "Not provided"
            }
          />

          <AccountDetail
            icon={CircleDollarSign}
            label="Included in total"
            value={
              account.includeInTotal
                ? "Yes"
                : "No"
            }
          />
        </div>
      </div>
    </motion.article>
  );
}

function StatusBadge({ active }) {
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

function AccountActionButton({
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
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-extrabold transition disabled:opacity-50 ${
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

function AccountDetail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex min-w-0 items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </span>

      <span className="max-w-40 truncate font-extrabold text-[#0b1220] dark:text-white">
        {value}
      </span>
    </div>
  );
}

function EmptyAccounts({
  filtered,
  onCreate,
}) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_14px_40px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-[#101a2c]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
        <WalletCards className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
        {filtered
          ? "No matching accounts"
          : "No accounts available"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {filtered
          ? "Change your search text or selected account filter."
          : "Add the first account you actually use. Its values will be saved through the secured backend API."}
      </p>

      {!filtered && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:bg-[#1848b5]"
        >
          <Plus className="h-4 w-4" />
          Add first account
        </button>
      )}
    </div>
  );
}

function AccountSkeletons() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {ACCOUNT_SKELETON_KEYS.map(
        (key) => (
          <div
            key={key}
            className="animate-pulse rounded-[1.45rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#101a2c]"
          >
            <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-6 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="mt-3 h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />

            <div className="mt-7 h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="mt-7 h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ),
      )}
    </div>
  );
}
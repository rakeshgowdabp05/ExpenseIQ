export const TRANSACTION_TYPE_OPTIONS = Object.freeze([
  {
    value: "EXPENSE",
    label: "Expense",
    description: "Money paid from one account",
  },
  {
    value: "INCOME",
    label: "Income",
    description: "Money received into one account",
  },
  {
    value: "TRANSFER",
    label: "Transfer",
    description: "Money moved between two accounts",
  },
]);

export const TRANSACTION_STATUS_OPTIONS = Object.freeze([
  {
    value: "POSTED",
    label: "Posted",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
]);

export const DEFAULT_TRANSACTION_PAGE_SIZE = 20;

export const TRANSACTION_PAGE_SIZE_OPTIONS = Object.freeze([
  10,
  DEFAULT_TRANSACTION_PAGE_SIZE,
  50,
]);

export const TRANSACTION_FORM_LIMITS = Object.freeze({
  merchantName: 120,
  description: 255,
  referenceNumber: 100,
});

export function getTransactionTypeLabel(transactionType) {
  return (
    TRANSACTION_TYPE_OPTIONS.find(
      (option) => option.value === transactionType,
    )?.label ?? transactionType
  );
}

export function getTransactionStatusLabel(transactionStatus) {
  return (
    TRANSACTION_STATUS_OPTIONS.find(
      (option) => option.value === transactionStatus,
    )?.label ?? transactionStatus
  );
}

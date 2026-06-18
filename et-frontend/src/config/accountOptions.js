export const ACCOUNT_TYPE_OPTIONS = Object.freeze([
    {
      value: "CASH",
      label: "Cash",
    },
    {
      value: "BANK_ACCOUNT",
      label: "Bank account",
    },
    {
      value: "SAVINGS_ACCOUNT",
      label: "Savings account",
    },
    {
      value: "CREDIT_CARD",
      label: "Credit card",
    },
    {
      value: "DIGITAL_WALLET",
      label: "Digital wallet",
    },
    {
      value: "INVESTMENT_ACCOUNT",
      label: "Investment account",
    },
    {
      value: "LOAN_ACCOUNT",
      label: "Loan account",
    },
    {
      value: "OTHER",
      label: "Other",
    },
  ]);
  
  export function getAccountTypeLabel(accountType) {
    const option = ACCOUNT_TYPE_OPTIONS.find(
      (item) => item.value === accountType,
    );
  
    return option?.label ?? accountType;
  }
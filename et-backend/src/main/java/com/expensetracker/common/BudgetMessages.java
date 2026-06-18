package com.expensetracker.common;

public final class BudgetMessages {

    public static final String CREATED =
            "Budget created successfully.";

    public static final String UPDATED =
            "Budget updated successfully.";

    public static final String STATUS_UPDATED =
            "Budget status updated successfully.";

    public static final String ARCHIVED =
            "Budget archived successfully.";

    public static final String FETCHED =
            "Budget fetched successfully.";

    public static final String LIST_FETCHED =
            "Budgets fetched successfully.";

    public static final String SUMMARY_FETCHED =
            "Budget summary fetched successfully.";

    public static final String BUDGET_NOT_FOUND =
            "Budget was not found.";

    public static final String USER_NOT_FOUND =
            "Authenticated user could not be resolved.";

    public static final String CATEGORY_NOT_FOUND =
            "The selected category was not found.";

    public static final String CATEGORY_MUST_BE_EXPENSE =
            "Budgets can only be connected to expense categories.";

    public static final String CATEGORY_INACTIVE =
            "The selected expense category is inactive.";

    public static final String MONTH_REQUIRED =
            "A month in yyyy-MM format is required for a monthly budget.";

    public static final String INVALID_MONTH =
            "The supplied month must use yyyy-MM format.";

    public static final String CUSTOM_DATES_REQUIRED =
            "Start date and end date are required for a custom budget.";

    public static final String INVALID_DATE_RANGE =
            "The budget end date cannot be before its start date.";

    public static final String OVERLAPPING_BUDGET =
            "A budget already exists for this category, currency, and selected period. Edit the existing budget limit or choose a different category/period.";

    public static final String NAME_REQUIRED =
            "Budget name is required.";

    public static final String NAME_TOO_LONG =
            "Budget name must not exceed 120 characters.";

    public static final String LIMIT_REQUIRED =
            "Budget limit amount is required.";

    public static final String LIMIT_POSITIVE =
            "Budget limit amount must be greater than zero.";

    public static final String CURRENCY_REQUIRED =
            "Currency code is required.";

    public static final String CURRENCY_INVALID =
            "Currency code must contain exactly three uppercase letters.";

    public static final String PERIOD_REQUIRED =
            "Budget period type is required.";

    public static final String WARNING_THRESHOLD_INVALID =
            "Warning threshold must be between 1 and 100.";

    private BudgetMessages() {
        throw new IllegalStateException(
                "Utility class"
        );
    }
}
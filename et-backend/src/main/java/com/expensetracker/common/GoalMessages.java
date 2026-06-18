package com.expensetracker.common;

public final class GoalMessages {

    public static final String CREATED =
            "Savings goal created successfully.";

    public static final String UPDATED =
            "Savings goal updated successfully.";

    public static final String STATUS_UPDATED =
            "Savings goal status updated successfully.";

    public static final String ARCHIVED =
            "Savings goal archived successfully.";

    public static final String FETCHED =
            "Savings goal fetched successfully.";

    public static final String LIST_FETCHED =
            "Savings goals fetched successfully.";

    public static final String SUMMARY_FETCHED =
            "Savings goals summary fetched successfully.";

    public static final String CONTRIBUTION_CREATED =
            "Goal contribution recorded successfully.";

    public static final String CONTRIBUTIONS_FETCHED =
            "Goal contributions fetched successfully.";

    public static final String CONTRIBUTION_CANCELLED =
            "Goal contribution cancelled successfully.";

    public static final String GOAL_NOT_FOUND =
            "Savings goal was not found.";

    public static final String CONTRIBUTION_NOT_FOUND =
            "Goal contribution was not found.";

    public static final String USER_NOT_FOUND =
            "Authenticated user account was not found.";

    public static final String ACCOUNT_NOT_FOUND =
            "The selected source account was not found.";

    public static final String DUPLICATE_NAME =
            "An active savings goal with this name already exists.";

    public static final String NAME_REQUIRED =
            "Savings goal name is required.";

    public static final String NAME_LENGTH =
            "Savings goal name must contain between 2 and 120 characters.";

    public static final String DESCRIPTION_TOO_LONG =
            "Savings goal description must not exceed 500 characters.";

    public static final String TARGET_AMOUNT_REQUIRED =
            "Target amount is required.";

    public static final String TARGET_AMOUNT_POSITIVE =
            "Target amount must be greater than zero.";

    public static final String MONEY_FORMAT_INVALID =
            "Amount supports up to 17 whole digits and 2 decimal places.";

    public static final String CURRENCY_REQUIRED =
            "Currency code is required.";

    public static final String CURRENCY_INVALID =
            "Currency code must contain exactly three uppercase letters.";

    public static final String TARGET_DATE_REQUIRED =
            "Target date is required.";

    public static final String TARGET_DATE_PAST =
            "Target date cannot be earlier than today.";

    public static final String TARGET_BELOW_CURRENT_AMOUNT =
            "Target amount cannot be lower than the amount already saved.";

    public static final String CURRENCY_CHANGE_NOT_ALLOWED =
            "Currency cannot be changed after contributions have been recorded.";

    public static final String STATUS_REQUIRED =
            "Savings goal status is required.";

    public static final String STATUS_CHANGE_INVALID =
            "The requested savings goal status change is not allowed.";

    public static final String OVERDUE_STATUS_AUTOMATIC =
            "Overdue status is calculated automatically from the target date.";

    public static final String ARCHIVE_STATUS_MANAGED_SEPARATELY =
            "Archive the savings goal using the archive operation.";

    public static final String GOAL_PAUSED =
            "Contributions cannot be added while the savings goal is paused.";

    public static final String GOAL_COMPLETED =
            "Contributions cannot be added after the savings goal is completed.";

    public static final String CONTRIBUTION_AMOUNT_REQUIRED =
            "Contribution amount is required.";

    public static final String CONTRIBUTION_AMOUNT_POSITIVE =
            "Contribution amount must be greater than zero.";

    public static final String CONTRIBUTION_DATE_REQUIRED =
            "Contribution date is required.";

    public static final String CONTRIBUTION_DATE_FUTURE =
            "Contribution date cannot be in the future.";

    public static final String NOTE_TOO_LONG =
            "Contribution note must not exceed 255 characters.";

    public static final String REFERENCE_TOO_LONG =
            "Contribution reference must not exceed 100 characters.";

    public static final String CONTRIBUTION_EXCEEDS_REMAINING =
            "Contribution amount cannot exceed the remaining goal amount.";

    public static final String ACCOUNT_INACTIVE =
            "Inactive financial accounts cannot fund savings goals.";

    public static final String ACCOUNT_CURRENCY_MISMATCH =
            "The source account currency must match the savings goal currency.";

    public static final String INSUFFICIENT_ACCOUNT_BALANCE =
            "The selected account does not have enough available balance.";

    public static final String CONTRIBUTION_ALREADY_CANCELLED =
            "The goal contribution is already cancelled.";

    public static final String GOAL_NOT_FULLY_FUNDED =
            "A savings goal can be completed only after reaching its target amount.";

    private GoalMessages() {
        throw new IllegalStateException(
                "GoalMessages cannot be instantiated."
        );
    }
}
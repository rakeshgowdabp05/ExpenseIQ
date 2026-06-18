package com.expensetracker.common;

public final class TransactionSuggestionMessages {

    public static final String FETCHED =
            "Transaction suggestions fetched successfully.";

    public static final String LIMIT_INVALID =
            "Suggestion limit must be between 1 and 20.";

    private TransactionSuggestionMessages() {
        throw new IllegalStateException(
                "TransactionSuggestionMessages cannot be instantiated."
        );
    }
}
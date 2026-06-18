package com.expensetracker.common;

public final class AuditMessages {

    public static final String ACCOUNT_CREATED =
            "Financial account created.";

    public static final String ACCOUNT_UPDATED =
            "Financial account updated.";

    public static final String ACCOUNT_ACTIVATED =
            "Financial account activated.";

    public static final String ACCOUNT_DEACTIVATED =
            "Financial account deactivated.";

    public static final String ACCOUNT_ARCHIVED =
            "Financial account archived.";

    public static final String CATEGORY_CREATED =
            "Transaction category created.";

    public static final String CATEGORY_UPDATED =
            "Transaction category updated.";

    public static final String CATEGORY_ACTIVATED =
            "Transaction category activated.";

    public static final String CATEGORY_DEACTIVATED =
            "Transaction category deactivated.";

    public static final String CATEGORY_ARCHIVED =
            "Transaction category archived.";

    public static final String TRANSACTION_CREATED =
            "Financial transaction created.";

    public static final String TRANSACTION_UPDATED =
            "Financial transaction updated.";

    public static final String TRANSACTION_CANCELLED =
            "Financial transaction cancelled.";

    private AuditMessages() {
        throw new IllegalStateException(
                "AuditMessages cannot be instantiated."
        );
    }
}

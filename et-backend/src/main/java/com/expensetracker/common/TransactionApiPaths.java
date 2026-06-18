package com.expensetracker.common;

public final class TransactionApiPaths {

    public static final String BASE_PATH =
            "/api/v1/transactions";

    public static final String BY_PUBLIC_ID =
            "/{publicId}";

    public static final String SUGGESTIONS =
            "/suggestions";

    public static final String RECEIPT =
            "/receipt";

    public static final String RECEIPT_FILE =
            "/receipt/file";

    private TransactionApiPaths() {
        throw new IllegalStateException(
                "TransactionApiPaths cannot be instantiated."
        );
    }
}
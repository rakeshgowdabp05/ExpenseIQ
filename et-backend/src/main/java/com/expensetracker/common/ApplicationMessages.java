package com.expensetracker.common;

public final class ApplicationMessages {

    public static final String REGISTRATION_SUCCESS =
            "User registered successfully.";

    public static final String LOGIN_SUCCESS =
            "Login successful.";

    public static final String TOKEN_REFRESH_SUCCESS =
            "Authentication tokens refreshed successfully.";

    public static final String LOGOUT_SUCCESS =
            "Logout successful.";

    public static final String CURRENT_USER_FETCH_SUCCESS =
            "Authenticated user profile fetched successfully.";

    public static final String DASHBOARD_FETCH_SUCCESS =
            "Financial dashboard fetched successfully.";

    public static final String ACCOUNT_LIST_FETCH_SUCCESS =
            "Financial accounts fetched successfully.";

    public static final String ACCOUNT_FETCH_SUCCESS =
            "Financial account fetched successfully.";

    public static final String ACCOUNT_CREATE_SUCCESS =
            "Financial account created successfully.";

    public static final String ACCOUNT_UPDATE_SUCCESS =
            "Financial account updated successfully.";

    public static final String ACCOUNT_STATUS_UPDATE_SUCCESS =
            "Financial account status updated successfully.";

    public static final String ACCOUNT_ARCHIVE_SUCCESS =
            "Financial account archived successfully.";

    public static final String CATEGORY_LIST_FETCH_SUCCESS =
            "Transaction categories fetched successfully.";

    public static final String CATEGORY_FETCH_SUCCESS =
            "Transaction category fetched successfully.";

    public static final String CATEGORY_CREATE_SUCCESS =
            "Transaction category created successfully.";

    public static final String CATEGORY_UPDATE_SUCCESS =
            "Transaction category updated successfully.";

    public static final String CATEGORY_STATUS_UPDATE_SUCCESS =
            "Transaction category status updated successfully.";

    public static final String CATEGORY_ARCHIVE_SUCCESS =
            "Transaction category archived successfully.";

    public static final String TRANSACTION_LIST_FETCH_SUCCESS =
            "Financial transactions fetched successfully.";

    public static final String TRANSACTION_FETCH_SUCCESS =
            "Financial transaction fetched successfully.";

    public static final String TRANSACTION_CREATE_SUCCESS =
            "Financial transaction created successfully.";

    public static final String TRANSACTION_UPDATE_SUCCESS =
            "Financial transaction updated successfully.";

    public static final String TRANSACTION_CANCEL_SUCCESS =
            "Financial transaction cancelled successfully.";

    public static final String RECEIPT_UPLOAD_SUCCESS =
            "Receipt attachment uploaded successfully.";

    public static final String RECEIPT_FETCH_SUCCESS =
            "Receipt attachment fetched successfully.";

    public static final String RECEIPT_DELETE_SUCCESS =
            "Receipt attachment deleted successfully.";

    public static final String RECEIPT_NOT_FOUND =
            "Receipt attachment was not found.";

    public static final String RECEIPT_FILE_NOT_FOUND =
            "Receipt file was not found in storage.";

    public static final String RECEIPT_EMPTY_FILE =
            "Receipt file is required.";

    public static final String RECEIPT_FILE_TOO_LARGE =
            "Receipt file exceeds the configured upload limit.";

    public static final String RECEIPT_FILE_TYPE_NOT_ALLOWED =
            "Receipt file type is not allowed.";

    public static final String RECEIPT_FILE_NAME_INVALID =
            "Receipt file name is invalid.";

    public static final String RECEIPT_STORAGE_NOT_CONFIGURED =
            "Receipt storage path is not configured.";

    public static final String RECEIPT_STORAGE_FAILED =
            "Receipt storage operation failed.";

    public static final String INVALID_CREDENTIALS =
            "Invalid email address or password.";

    public static final String LOGIN_RATE_LIMIT_EXCEEDED =
            "Too many sign-in attempts. Please wait and try again.";

    public static final String ACCOUNT_TEMPORARILY_LOCKED =
            "This account is temporarily locked because of repeated failed sign-in attempts. Please try again later.";

    public static final String INVALID_REFRESH_TOKEN =
            "Refresh token is invalid, expired, or revoked.";

    public static final String INVALID_OAUTH_LOGIN_CODE =
            "Social login code is invalid, expired, or already used.";

    public static final String OAUTH_PROFILE_INCOMPLETE =
            "The social provider did not return a valid user profile.";

    public static final String OAUTH_EMAIL_REQUIRED =
            "The social provider must share a verified email address.";

    public static final String EMAIL_ALREADY_REGISTERED =
            "An account already exists with this email address.";

    public static final String DEFAULT_ROLE_NOT_AVAILABLE =
            "The default user role is not available.";

    public static final String USER_ACCOUNT_NOT_FOUND =
            "Authenticated user account was not found.";

    public static final String FINANCIAL_ACCOUNT_NOT_FOUND =
            "Financial account was not found.";

    public static final String TRANSACTION_CATEGORY_NOT_FOUND =
            "Transaction category was not found.";

    public static final String FINANCIAL_TRANSACTION_NOT_FOUND =
            "Financial transaction was not found.";

    public static final String ACCOUNT_NAME_ALREADY_EXISTS =
            "A financial account with this name already exists.";

    public static final String CATEGORY_NAME_ALREADY_EXISTS =
            "A visible category with this name and type already exists.";

    public static final String
            SYSTEM_CATEGORY_MODIFICATION_FORBIDDEN =
            "System-defined categories cannot be modified.";

    public static final String CATEGORY_OWNERSHIP_REQUIRED =
            "Only the owner can modify this category.";

    public static final String TRANSACTION_ACCOUNT_REQUIRED =
            "A financial account is required for the transaction.";

    public static final String TRANSACTION_ACCOUNT_INACTIVE =
            "Inactive financial accounts cannot receive new transactions.";

    public static final String TRANSACTION_CATEGORY_REQUIRED =
            "Income and expense transactions require a category.";

    public static final String TRANSACTION_CATEGORY_INACTIVE =
            "Inactive categories cannot be used for new transactions.";

    public static final String
            TRANSACTION_CATEGORY_TYPE_MISMATCH =
            "The selected category type does not match the transaction type.";

    public static final String TRANSFER_DESTINATION_REQUIRED =
            "Transfer transactions require a destination account.";

    public static final String TRANSFER_CATEGORY_NOT_ALLOWED =
            "Transfer transactions cannot use an income or expense category.";

    public static final String
            TRANSFER_SAME_ACCOUNT_FORBIDDEN =
            "The source and destination accounts must be different.";

    public static final String TRANSFER_CURRENCY_MISMATCH =
            "Transfers are currently supported only between accounts using the same currency.";

    public static final String
            NON_TRANSFER_DESTINATION_NOT_ALLOWED =
            "Only transfer transactions can have a destination account.";

    public static final String TRANSACTION_ALREADY_CANCELLED =
            "The financial transaction is already cancelled.";

    public static final String TRANSACTION_PAGE_INVALID =
            "Page number must be zero or greater.";

    public static final String TRANSACTION_PAGE_SIZE_INVALID =
            "Page size must be between 1 and 100.";

    public static final String TRANSACTION_DATE_RANGE_INVALID =
            "The from-date cannot be after the to-date.";

    public static final String INVALID_REQUEST_BODY =
            "Request body contains an invalid value.";

    public static final String INVALID_REQUEST_PARAMETER =
            "Request parameter contains an invalid value.";

    public static final String VALIDATION_FAILED =
            "Request validation failed.";

    public static final String UNEXPECTED_ERROR =
            "An unexpected error occurred.";

    private ApplicationMessages() {
        throw new IllegalStateException(
                "ApplicationMessages cannot be instantiated."
        );
    }
}
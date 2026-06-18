package com.expensetracker.service;

import com.expensetracker.dto.AccountCreateRequest;
import com.expensetracker.dto.AccountResponse;
import com.expensetracker.dto.AccountStatusUpdateRequest;
import com.expensetracker.dto.AccountUpdateRequest;

import java.util.List;

public interface FinancialAccountService {

    List<AccountResponse> getAccounts(
            String authenticatedEmail,
            Boolean active
    );

    AccountResponse getAccount(
            String authenticatedEmail,
            String publicId
    );

    AccountResponse createAccount(
            String authenticatedEmail,
            AccountCreateRequest request
    );

    AccountResponse updateAccount(
            String authenticatedEmail,
            String publicId,
            AccountUpdateRequest request
    );

    AccountResponse updateStatus(
            String authenticatedEmail,
            String publicId,
            AccountStatusUpdateRequest request
    );

    void archiveAccount(
            String authenticatedEmail,
            String publicId
    );
}
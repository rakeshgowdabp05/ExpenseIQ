package com.expensetracker.service;

import com.expensetracker.dto.PagedResponse;
import com.expensetracker.dto.TransactionCreateRequest;
import com.expensetracker.dto.TransactionResponse;
import com.expensetracker.dto.TransactionUpdateRequest;
import com.expensetracker.entity.TransactionStatus;
import com.expensetracker.entity.TransactionType;

import java.time.LocalDate;

public interface FinancialTransactionService {

    PagedResponse<TransactionResponse> getTransactions(
            String authenticatedEmail,
            TransactionType transactionType,
            TransactionStatus transactionStatus,
            String accountPublicId,
            String categoryPublicId,
            LocalDate fromDate,
            LocalDate toDate,
            String search,
            int page,
            int size
    );

    TransactionResponse getTransaction(
            String authenticatedEmail,
            String publicId
    );

    TransactionResponse createTransaction(
            String authenticatedEmail,
            TransactionCreateRequest request
    );

    TransactionResponse updateTransaction(
            String authenticatedEmail,
            String publicId,
            TransactionUpdateRequest request
    );

    void cancelTransaction(
            String authenticatedEmail,
            String publicId
    );
}
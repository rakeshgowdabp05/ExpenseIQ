package com.expensetracker.service;

import com.expensetracker.dto.TransactionSuggestionResponse;
import com.expensetracker.entity.TransactionType;

import java.util.List;

public interface TransactionSuggestionService {

    List<TransactionSuggestionResponse> getSuggestions(
            String authenticatedEmail,
            TransactionType transactionType,
            String query,
            int limit
    );
}
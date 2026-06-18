package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.TransactionSuggestionMessages;
import com.expensetracker.dto.TransactionSuggestionResponse;
import com.expensetracker.entity.TransactionType;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.TransactionSuggestionJdbcRepository;
import com.expensetracker.service.TransactionSuggestionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionSuggestionServiceImpl
        implements TransactionSuggestionService {

    private static final int MIN_LIMIT = 1;

    private static final int MAX_LIMIT = 20;

    private final TransactionSuggestionJdbcRepository repository;

    public TransactionSuggestionServiceImpl(
            TransactionSuggestionJdbcRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionSuggestionResponse> getSuggestions(
            String authenticatedEmail,
            TransactionType transactionType,
            String query,
            int limit
    ) {
        validateLimit(limit);

        Long userId =
                repository
                        .findUserIdByEmail(
                                authenticatedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                ApplicationMessages
                                                        .USER_ACCOUNT_NOT_FOUND
                                        )
                        );

        return repository.findSuggestions(
                userId,
                transactionType,
                query,
                limit
        );
    }

    private void validateLimit(int limit) {
        if (
                limit < MIN_LIMIT
                || limit > MAX_LIMIT
        ) {
            throw new BadRequestException(
                    TransactionSuggestionMessages.LIMIT_INVALID
            );
        }
    }
}
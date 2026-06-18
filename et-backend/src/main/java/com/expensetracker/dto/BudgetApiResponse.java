package com.expensetracker.dto;

import java.time.Instant;

public record BudgetApiResponse<T>(

        boolean success,

        String message,

        T data,

        Instant timestamp
) {

    public static <T> BudgetApiResponse<T> success(
            String message,
            T data
    ) {
        return new BudgetApiResponse<>(
                true,
                message,
                data,
                Instant.now()
        );
    }
}
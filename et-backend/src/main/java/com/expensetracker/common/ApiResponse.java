package com.expensetracker.common;

import java.time.Instant;

public record ApiResponse<T>(

        boolean success,
        String message,
        T data,
        Instant timestamp
) {
}
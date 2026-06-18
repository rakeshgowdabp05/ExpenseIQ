package com.expensetracker.exception;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(

        boolean success,
        String message,
        Map<String, String> errors,
        Instant timestamp
) {
}
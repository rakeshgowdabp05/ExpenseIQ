package com.expensetracker.exception;

import com.expensetracker.dto.BudgetApiResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ResponseStatusExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<BudgetApiResponse<Void>>
            handleResponseStatusException(
                    ResponseStatusException exception
            ) {

        String message = exception.getReason();

        if (
                message == null
                || message.isBlank()
        ) {
            message =
                    exception
                            .getStatusCode()
                            .toString();
        }

        BudgetApiResponse<Void> response =
                new BudgetApiResponse<>(
                        false,
                        message,
                        null,
                        Instant.now()
                );

        return ResponseEntity
                .status(
                        exception.getStatusCode()
                )
                .body(response);
    }
}
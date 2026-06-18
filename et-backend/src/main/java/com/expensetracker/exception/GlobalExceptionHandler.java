package com.expensetracker.exception;

import com.expensetracker.common.ApplicationMessages;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    GlobalExceptionHandler.class
            );

    private final Clock clock;

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleValidationException(
            MethodArgumentNotValidException exception
    ) {
        Map<String, String> errors =
                new LinkedHashMap<>();

        for (
                FieldError fieldError
                : exception
                .getBindingResult()
                .getFieldErrors()
        ) {
            errors.putIfAbsent(
                    fieldError.getField(),
                    fieldError.getDefaultMessage()
            );
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new ApiErrorResponse(
                                false,
                                ApplicationMessages
                                        .VALIDATION_FAILED,
                                errors,
                                clock.instant()
                        )
                );
    }

    @ExceptionHandler(
            HttpMessageNotReadableException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleUnreadableRequest(
            HttpMessageNotReadableException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        createErrorResponse(
                                ApplicationMessages
                                        .INVALID_REQUEST_BODY
                        )
                );
    }

    @ExceptionHandler(
            MethodArgumentTypeMismatchException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleParameterTypeMismatch(
            MethodArgumentTypeMismatchException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        createErrorResponse(
                                ApplicationMessages
                                        .INVALID_REQUEST_PARAMETER
                        )
                );
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse>
    handleBadRequestException(
            BadRequestException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        createErrorResponse(
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse>
    handleConflictException(
            ConflictException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        createErrorResponse(
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(
            ResourceNotFoundException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleResourceNotFoundException(
            ResourceNotFoundException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        createErrorResponse(
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(
            UnauthorizedException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleUnauthorizedException(
            UnauthorizedException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(
                        createErrorResponse(
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(
            ForbiddenOperationException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleForbiddenOperationException(
            ForbiddenOperationException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        createErrorResponse(
                                exception.getMessage()
                        )
                );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse>
    handleUnexpectedException(
            Exception exception
    ) {
        LOGGER.error(
                "Unhandled application exception",
                exception
        );

        return ResponseEntity
                .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                )
                .body(
                        createErrorResponse(
                                ApplicationMessages
                                        .UNEXPECTED_ERROR
                        )
                );
    }

    private ApiErrorResponse createErrorResponse(
            String message
    ) {
        return new ApiErrorResponse(
                false,
                message,
                Map.of(),
                clock.instant()
        );
    }
}
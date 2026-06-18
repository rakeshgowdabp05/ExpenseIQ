package com.expensetracker.common;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
@RequiredArgsConstructor
public class ApiResponseFactory {

    private final Clock clock;

    public <T> ApiResponse<T> success(
            String message,
            T data
    ) {
        return new ApiResponse<>(
                true,
                message,
                data,
                clock.instant()
        );
    }
}
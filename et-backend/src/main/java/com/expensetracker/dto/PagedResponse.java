package com.expensetracker.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record PagedResponse<T>(

        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        boolean empty
) {

    public static <T> PagedResponse<T> from(
            Page<T> pageResult
    ) {
        return new PagedResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast(),
                pageResult.isEmpty()
        );
    }
}
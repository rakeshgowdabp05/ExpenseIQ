package com.expensetracker.dto;

import org.springframework.core.io.Resource;

public record TransactionReceiptFile(

        String fileName,
        String contentType,
        long contentLength,
        Resource resource
) {
}

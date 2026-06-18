package com.expensetracker.dto;

import java.time.Instant;

public record TransactionReceiptResponse(

        String publicId,
        String originalFileName,
        String contentType,
        long fileSizeBytes,
        String sha256Hash,
        Instant uploadedAt
) {
}

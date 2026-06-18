package com.expensetracker.mapper;

import com.expensetracker.dto.TransactionReceiptResponse;
import com.expensetracker.entity.TransactionReceiptAttachment;
import org.springframework.stereotype.Component;

@Component
public class TransactionReceiptMapper {

    public TransactionReceiptResponse toResponse(
            TransactionReceiptAttachment receipt
    ) {
        if (receipt == null) {
            return null;
        }

        return new TransactionReceiptResponse(
                receipt.getPublicId(),
                receipt.getOriginalFileName(),
                receipt.getContentType(),
                receipt.getFileSizeBytes(),
                receipt.getSha256Hash(),
                receipt.getUploadedAt()
        );
    }
}

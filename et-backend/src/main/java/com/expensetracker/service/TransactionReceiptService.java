package com.expensetracker.service;

import com.expensetracker.dto.TransactionReceiptFile;
import com.expensetracker.dto.TransactionReceiptResponse;
import org.springframework.web.multipart.MultipartFile;

public interface TransactionReceiptService {

    TransactionReceiptResponse uploadReceipt(
            String authenticatedEmail,
            String transactionPublicId,
            MultipartFile file
    );

    TransactionReceiptResponse getReceipt(
            String authenticatedEmail,
            String transactionPublicId
    );

    TransactionReceiptFile downloadReceipt(
            String authenticatedEmail,
            String transactionPublicId
    );

    void deleteReceipt(
            String authenticatedEmail,
            String transactionPublicId
    );
}

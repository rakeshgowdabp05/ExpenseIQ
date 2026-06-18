package com.expensetracker.mapper;

import com.expensetracker.dto.TransactionAccountSummaryResponse;
import com.expensetracker.dto.TransactionCategorySummaryResponse;
import com.expensetracker.dto.TransactionReceiptResponse;
import com.expensetracker.dto.TransactionResponse;
import com.expensetracker.entity.FinancialAccount;
import com.expensetracker.entity.FinancialTransaction;
import com.expensetracker.entity.TransactionCategory;
import com.expensetracker.entity.TransactionReceiptAttachment;
import org.springframework.stereotype.Component;

@Component
public class FinancialTransactionMapper {

    public TransactionResponse toResponse(
            FinancialTransaction transaction
    ) {
        return new TransactionResponse(
                transaction.getPublicId(),
                transaction.getTransactionType(),
                transaction.getTransactionStatus(),
                toAccountSummary(
                        transaction.getAccount()
                ),
                toAccountSummary(
                        transaction.getDestinationAccount()
                ),
                toCategorySummary(
                        transaction.getCategory()
                ),
                transaction.getAmount(),
                transaction.getCurrencyCode(),
                transaction.getTransactionDate(),
                transaction.getMerchantName(),
                transaction.getDescription(),
                transaction.getReferenceNumber(),
                toReceiptSummary(
                        transaction.getReceiptAttachment()
                ),
                transaction.getCancelledAt(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }

    private TransactionAccountSummaryResponse
    toAccountSummary(FinancialAccount account) {
        if (account == null) {
            return null;
        }

        return new TransactionAccountSummaryResponse(
                account.getPublicId(),
                account.getName(),
                account.getAccountType(),
                account.getCurrencyCode()
        );
    }

    private TransactionCategorySummaryResponse
    toCategorySummary(TransactionCategory category) {
        if (category == null) {
            return null;
        }

        return new TransactionCategorySummaryResponse(
                category.getPublicId(),
                category.getName(),
                category.getCategoryType(),
                category.getIconKey(),
                category.getColorKey(),
                category.isSystemDefined()
        );
    }

    private TransactionReceiptResponse
    toReceiptSummary(
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

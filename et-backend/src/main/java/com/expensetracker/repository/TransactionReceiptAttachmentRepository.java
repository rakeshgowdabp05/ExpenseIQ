package com.expensetracker.repository;

import com.expensetracker.entity.TransactionReceiptAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionReceiptAttachmentRepository
        extends JpaRepository<
                TransactionReceiptAttachment,
                Long
        > {

    Optional<TransactionReceiptAttachment>
    findByTransactionId(Long transactionId);

    Optional<TransactionReceiptAttachment>
    findByTransactionPublicIdAndUserId(
            String transactionPublicId,
            Long userId
    );
}

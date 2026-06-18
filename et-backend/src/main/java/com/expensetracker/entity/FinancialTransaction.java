package com.expensetracker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "financial_transactions")
public class FinancialTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "public_id",
            nullable = false,
            unique = true,
            length = 36
    )
    private String publicId;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "transaction_type",
            nullable = false,
            length = 20
    )
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "transaction_status",
            nullable = false,
            length = 20
    )
    private TransactionStatus transactionStatus;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "account_id",
            nullable = false
    )
    private FinancialAccount account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_account_id")
    private FinancialAccount destinationAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private TransactionCategory category;

    @Column(
            name = "amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal amount;

    @Column(
            name = "currency_code",
            nullable = false,
            length = 3
    )
    private String currencyCode;

    @Column(
            name = "transaction_date",
            nullable = false
    )
    private LocalDate transactionDate;

    @Column(
            name = "merchant_name",
            length = 120
    )
    private String merchantName;

    @Column(
            name = "description",
            length = 255
    )
    private String description;

    @Column(
            name = "reference_number",
            length = 100
    )
    private String referenceNumber;

    @OneToOne(
            mappedBy = "transaction",
            fetch = FetchType.LAZY
    )
    private TransactionReceiptAttachment receiptAttachment;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @UpdateTimestamp
    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    @Version
    @Column(
            name = "version",
            nullable = false
    )
    private Long version;

    public FinancialTransaction() {
    }

    @PrePersist
    private void beforeInsert() {
        if (publicId == null || publicId.isBlank()) {
            publicId = UUID.randomUUID().toString();
        }

        normalizeFields();
    }

    @PreUpdate
    private void beforeUpdate() {
        normalizeFields();
    }

    private void normalizeFields() {
        if (currencyCode != null) {
            currencyCode = currencyCode
                    .trim()
                    .toUpperCase(Locale.ROOT);
        }

        merchantName = normalizeOptionalText(
                merchantName
        );

        description = normalizeOptionalText(
                description
        );

        referenceNumber = normalizeOptionalText(
                referenceNumber
        );
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(
            TransactionType transactionType
    ) {
        this.transactionType = transactionType;
    }

    public TransactionStatus getTransactionStatus() {
        return transactionStatus;
    }

    public void setTransactionStatus(
            TransactionStatus transactionStatus
    ) {
        this.transactionStatus = transactionStatus;
    }

    public FinancialAccount getAccount() {
        return account;
    }

    public void setAccount(FinancialAccount account) {
        this.account = account;
    }

    public FinancialAccount getDestinationAccount() {
        return destinationAccount;
    }

    public void setDestinationAccount(
            FinancialAccount destinationAccount
    ) {
        this.destinationAccount = destinationAccount;
    }

    public TransactionCategory getCategory() {
        return category;
    }

    public void setCategory(
            TransactionCategory category
    ) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(
            LocalDate transactionDate
    ) {
        this.transactionDate = transactionDate;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(
            String referenceNumber
    ) {
        this.referenceNumber = referenceNumber;
    }

    public TransactionReceiptAttachment
    getReceiptAttachment() {
        return receiptAttachment;
    }

    public void setReceiptAttachment(
            TransactionReceiptAttachment
                    receiptAttachment
    ) {
        this.receiptAttachment =
                receiptAttachment;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Instant cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
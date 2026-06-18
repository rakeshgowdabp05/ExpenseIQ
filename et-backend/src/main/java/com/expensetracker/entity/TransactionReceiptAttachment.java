package com.expensetracker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transaction_receipt_attachments")
public class TransactionReceiptAttachment {

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

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "transaction_id",
            nullable = false,
            unique = true
    )
    private FinancialTransaction transaction;

    @Column(
            name = "original_file_name",
            nullable = false,
            length = 255
    )
    private String originalFileName;

    @Column(
            name = "stored_file_name",
            nullable = false,
            unique = true,
            length = 180
    )
    private String storedFileName;

    @Column(
            name = "storage_path",
            nullable = false,
            length = 600
    )
    private String storagePath;

    @Column(
            name = "content_type",
            nullable = false,
            length = 120
    )
    private String contentType;

    @Column(
            name = "file_size_bytes",
            nullable = false
    )
    private long fileSizeBytes;

    @Column(
            name = "sha256_hash",
            nullable = false,
            length = 64
    )
    private String sha256Hash;

    @CreationTimestamp
    @Column(
            name = "uploaded_at",
            nullable = false,
            updatable = false
    )
    private Instant uploadedAt;

    @Version
    @Column(
            name = "version",
            nullable = false
    )
    private Long version;

    @PrePersist
    private void beforeInsert() {
        if (publicId == null || publicId.isBlank()) {
            publicId = UUID.randomUUID().toString();
        }
    }

    public Long getId() {
        return id;
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

    public FinancialTransaction getTransaction() {
        return transaction;
    }

    public void setTransaction(
            FinancialTransaction transaction
    ) {
        this.transaction = transaction;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(
            String originalFileName
    ) {
        this.originalFileName = originalFileName;
    }

    public String getStoredFileName() {
        return storedFileName;
    }

    public void setStoredFileName(
            String storedFileName
    ) {
        this.storedFileName = storedFileName;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(
            long fileSizeBytes
    ) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public String getSha256Hash() {
        return sha256Hash;
    }

    public void setSha256Hash(String sha256Hash) {
        this.sha256Hash = sha256Hash;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public Long getVersion() {
        return version;
    }
}

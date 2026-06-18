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
@Table(name = "goal_contributions")
public class GoalContribution {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
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

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "goal_id",
            nullable = false
    )
    private SavingsGoal goal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_account_id")
    private FinancialAccount sourceAccount;

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
            name = "contribution_date",
            nullable = false
    )
    private LocalDate contributionDate;

    @Column(
            name = "note",
            length = 255
    )
    private String note;

    @Column(
            name = "reference_number",
            length = 100
    )
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private GoalContributionStatus status;

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

    public GoalContribution() {
    }

    @PrePersist
    private void beforeInsert() {
        if (
                publicId == null
                || publicId.isBlank()
        ) {
            publicId =
                    UUID.randomUUID().toString();
        }

        if (status == null) {
            status =
                    GoalContributionStatus.POSTED;
        }

        normalizeFields();
    }

    @PreUpdate
    private void beforeUpdate() {
        normalizeFields();
    }

    private void normalizeFields() {
        if (currencyCode != null) {
            currencyCode =
                    currencyCode
                            .trim()
                            .toUpperCase(
                                    Locale.ROOT
                            );
        }

        note = normalizeOptionalText(note);

        referenceNumber =
                normalizeOptionalText(
                        referenceNumber
                );
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (
                value == null
                || value.isBlank()
        ) {
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

    public void setPublicId(
            String publicId
    ) {
        this.publicId = publicId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SavingsGoal getGoal() {
        return goal;
    }

    public void setGoal(
            SavingsGoal goal
    ) {
        this.goal = goal;
    }

    public FinancialAccount
    getSourceAccount() {
        return sourceAccount;
    }

    public void setSourceAccount(
            FinancialAccount sourceAccount
    ) {
        this.sourceAccount = sourceAccount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(
            BigDecimal amount
    ) {
        this.amount = amount;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(
            String currencyCode
    ) {
        this.currencyCode = currencyCode;
    }

    public LocalDate getContributionDate() {
        return contributionDate;
    }

    public void setContributionDate(
            LocalDate contributionDate
    ) {
        this.contributionDate =
                contributionDate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(
            String referenceNumber
    ) {
        this.referenceNumber =
                referenceNumber;
    }

    public GoalContributionStatus getStatus() {
        return status;
    }

    public void setStatus(
            GoalContributionStatus status
    ) {
        this.status = status;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(
            Instant cancelledAt
    ) {
        this.cancelledAt = cancelledAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            Instant createdAt
    ) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            Instant updatedAt
    ) {
        this.updatedAt = updatedAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(
            Long version
    ) {
        this.version = version;
    }
}
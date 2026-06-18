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
@Table(name = "savings_goals")
public class SavingsGoal {

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

    @Column(
            name = "name",
            nullable = false,
            length = 120
    )
    private String name;

    @Column(
            name = "description",
            length = 500
    )
    private String description;

    @Column(
            name = "target_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal targetAmount;

    @Column(
            name = "current_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal currentAmount;

    @Column(
            name = "currency_code",
            nullable = false,
            length = 3
    )
    private String currencyCode;

    @Column(
            name = "target_date",
            nullable = false
    )
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private GoalStatus status;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "archived_at")
    private Instant archivedAt;

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

    public SavingsGoal() {
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

        if (currentAmount == null) {
            currentAmount =
                    BigDecimal.ZERO;
        }

        if (status == null) {
            status =
                    GoalStatus.IN_PROGRESS;
        }

        normalizeFields();
    }

    @PreUpdate
    private void beforeUpdate() {
        normalizeFields();
    }

    private void normalizeFields() {
        if (name != null) {
            name = name.trim();
        }

        description =
                normalizeOptionalText(
                        description
                );

        if (currencyCode != null) {
            currencyCode =
                    currencyCode
                            .trim()
                            .toUpperCase(
                                    Locale.ROOT
                            );
        }
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(
            BigDecimal targetAmount
    ) {
        this.targetAmount = targetAmount;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(
            BigDecimal currentAmount
    ) {
        this.currentAmount = currentAmount;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(
            String currencyCode
    ) {
        this.currencyCode = currencyCode;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(
            LocalDate targetDate
    ) {
        this.targetDate = targetDate;
    }

    public GoalStatus getStatus() {
        return status;
    }

    public void setStatus(
            GoalStatus status
    ) {
        this.status = status;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(
            Instant completedAt
    ) {
        this.completedAt = completedAt;
    }

    public Instant getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(
            Instant archivedAt
    ) {
        this.archivedAt = archivedAt;
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
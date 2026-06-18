package com.expensetracker.entity;

import com.expensetracker.entity.AccountType;
import com.expensetracker.entity.User;
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
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(
        name = "financial_accounts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_financial_accounts_public_id",
                        columnNames = "public_id"
                ),
                @UniqueConstraint(
                        name = "uk_financial_accounts_user_name",
                        columnNames = {
                                "user_id",
                                "name"
                        }
                )
        }
)
public class FinancialAccount {

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

    @Column(
            name = "name",
            nullable = false,
            length = 100
    )
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "account_type",
            nullable = false,
            length = 40
    )
    private AccountType accountType;

    @Column(
            name = "currency_code",
            nullable = false,
            length = 3
    )
    private String currencyCode;

    @Column(
            name = "opening_balance",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal openingBalance;

    @Column(
            name = "current_balance",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal currentBalance;

    @Column(
            name = "institution_name",
            length = 150
    )
    private String institutionName;

    @Column(
            name = "account_number_last_four",
            length = 4
    )
    private String accountNumberLastFour;

    @Column(
            name = "include_in_total",
            nullable = false
    )
    private boolean includeInTotal;

    @Column(
            name = "active",
            nullable = false
    )
    private boolean active;

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

    public FinancialAccount() {
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
        if (name != null) {
            name = name.trim();
        }

        if (currencyCode != null) {
            currencyCode = currencyCode
                    .trim()
                    .toUpperCase(Locale.ROOT);
        }

        institutionName = normalizeOptionalText(
                institutionName
        );

        accountNumberLastFour = normalizeOptionalText(
                accountNumberLastFour
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(
            BigDecimal openingBalance
    ) {
        this.openingBalance = openingBalance;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(
            BigDecimal currentBalance
    ) {
        this.currentBalance = currentBalance;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(
            String institutionName
    ) {
        this.institutionName = institutionName;
    }

    public String getAccountNumberLastFour() {
        return accountNumberLastFour;
    }

    public void setAccountNumberLastFour(
            String accountNumberLastFour
    ) {
        this.accountNumberLastFour =
                accountNumberLastFour;
    }

    public boolean isIncludeInTotal() {
        return includeInTotal;
    }

    public void setIncludeInTotal(
            boolean includeInTotal
    ) {
        this.includeInTotal = includeInTotal;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

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

    @Column(
            name = "email",
            nullable = false,
            unique = true,
            length = 255
    )
    private String email;

    @Column(
            name = "password_hash",
            nullable = false,
            length = 100
    )
    private String passwordHash;

    @Column(
            name = "first_name",
            nullable = false,
            length = 100
    )
    private String firstName;

    @Column(
            name = "last_name",
            length = 100
    )
    private String lastName;

    @Column(
            name = "phone",
            length = 20
    )
    private String phone;

    @Column(
            name = "registration_region_code",
            length = 40
    )
    private String registrationRegionCode;

    @Column(
            name = "registration_region_label",
            length = 80
    )
    private String registrationRegionLabel;

    @Column(
            name = "registration_latitude",
            precision = 8,
            scale = 5
    )
    private BigDecimal registrationLatitude;

    @Column(
            name = "registration_longitude",
            precision = 8,
            scale = 5
    )
    private BigDecimal registrationLongitude;

    @Column(
            name = "registration_timezone",
            length = 80
    )
    private String registrationTimezone;

    @Column(
            name = "registration_location_source",
            length = 30
    )
    private String registrationLocationSource;

    @Column(
            name = "registration_location_captured_at"
    )
    private Instant registrationLocationCapturedAt;

    @Column(
            name = "preferred_currency",
            length = 3
    )
    private String preferredCurrency;

    @Column(
            name = "preferred_timezone",
            length = 80
    )
    private String preferredTimezone;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "date_format",
            nullable = false,
            length = 30
    )
    private DateFormatPreference dateFormat =
            DateFormatPreference.DD_MM_YYYY;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "theme_preference",
            nullable = false,
            length = 20
    )
    private ThemePreference themePreference =
            ThemePreference.SYSTEM;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "account_status",
            nullable = false,
            length = 30
    )
    private AccountStatus accountStatus;

    @Column(
            name = "email_verified",
            nullable = false
    )
    private boolean emailVerified;

    @Column(
            name = "failed_login_attempts",
            nullable = false
    )
    private int failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(
                    name = "user_id",
                    nullable = false
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "role_id",
                    nullable = false
            )
    )
    private Set<Role> roles =
            new HashSet<>();

    public User() {
    }

    @PrePersist
    private void beforeInsert() {
        if (
                publicId == null
                || publicId.isBlank()
        ) {
            publicId =
                    UUID.randomUUID()
                            .toString();
        }

        if (dateFormat == null) {
            dateFormat =
                    DateFormatPreference
                            .DD_MM_YYYY;
        }

        if (themePreference == null) {
            themePreference =
                    ThemePreference.SYSTEM;
        }

        normalizeValues();
    }

    @PreUpdate
    private void beforeUpdate() {
        normalizeValues();
    }

    private void normalizeValues() {
        normalizeEmail();

        preferredCurrency =
                normalizeUppercase(
                        preferredCurrency
                );

        preferredTimezone =
                normalizeOptionalText(
                        preferredTimezone
                );
    }

    private void normalizeEmail() {
        if (email != null) {
            email =
                    email.trim()
                            .toLowerCase(
                                    Locale.ROOT
                            );
        }
    }

    private String normalizeUppercase(
            String value
    ) {
        if (
                value == null
                || value.isBlank()
        ) {
            return null;
        }

        return value.trim()
                .toUpperCase(Locale.ROOT);
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

    public void addRole(Role role) {
        if (role != null) {
            roles.add(role);
        }
    }

    public void removeRole(Role role) {
        if (role != null) {
            roles.remove(role);
        }
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

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(
            String passwordHash
    ) {
        this.passwordHash = passwordHash;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(
            String firstName
    ) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(
            String lastName
    ) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(
            String phone
    ) {
        this.phone = phone;
    }

    public String getRegistrationRegionCode() {
        return registrationRegionCode;
    }

    public void setRegistrationRegionCode(
            String registrationRegionCode
    ) {
        this.registrationRegionCode =
                registrationRegionCode;
    }

    public String getRegistrationRegionLabel() {
        return registrationRegionLabel;
    }

    public void setRegistrationRegionLabel(
            String registrationRegionLabel
    ) {
        this.registrationRegionLabel =
                registrationRegionLabel;
    }

    public BigDecimal getRegistrationLatitude() {
        return registrationLatitude;
    }

    public void setRegistrationLatitude(
            BigDecimal registrationLatitude
    ) {
        this.registrationLatitude =
                registrationLatitude;
    }

    public BigDecimal getRegistrationLongitude() {
        return registrationLongitude;
    }

    public void setRegistrationLongitude(
            BigDecimal registrationLongitude
    ) {
        this.registrationLongitude =
                registrationLongitude;
    }

    public String getRegistrationTimezone() {
        return registrationTimezone;
    }

    public void setRegistrationTimezone(
            String registrationTimezone
    ) {
        this.registrationTimezone =
                registrationTimezone;
    }

    public String getRegistrationLocationSource() {
        return registrationLocationSource;
    }

    public void setRegistrationLocationSource(
            String registrationLocationSource
    ) {
        this.registrationLocationSource =
                registrationLocationSource;
    }

    public Instant getRegistrationLocationCapturedAt() {
        return registrationLocationCapturedAt;
    }

    public void setRegistrationLocationCapturedAt(
            Instant registrationLocationCapturedAt
    ) {
        this.registrationLocationCapturedAt =
                registrationLocationCapturedAt;
    }

    public String getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(
            String preferredCurrency
    ) {
        this.preferredCurrency =
                preferredCurrency;
    }

    public String getPreferredTimezone() {
        return preferredTimezone;
    }

    public void setPreferredTimezone(
            String preferredTimezone
    ) {
        this.preferredTimezone =
                preferredTimezone;
    }

    public DateFormatPreference getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(
            DateFormatPreference dateFormat
    ) {
        this.dateFormat = dateFormat;
    }

    public ThemePreference getThemePreference() {
        return themePreference;
    }

    public void setThemePreference(
            ThemePreference themePreference
    ) {
        this.themePreference =
                themePreference;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(
            AccountStatus accountStatus
    ) {
        this.accountStatus =
                accountStatus;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(
            boolean emailVerified
    ) {
        this.emailVerified =
                emailVerified;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(
            int failedLoginAttempts
    ) {
        this.failedLoginAttempts =
                failedLoginAttempts;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(
            Instant lockedUntil
    ) {
        this.lockedUntil = lockedUntil;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(
            Instant lastLoginAt
    ) {
        this.lastLoginAt = lastLoginAt;
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

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(
            Set<Role> roles
    ) {
        this.roles =
                roles == null
                        ? new HashSet<>()
                        : new HashSet<>(
                                roles
                        );
    }
}
package com.expensetracker.entity;

import com.expensetracker.entity.User;
import com.expensetracker.entity.CategoryColorKey;
import com.expensetracker.entity.CategoryIconKey;
import com.expensetracker.entity.CategoryType;
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

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transaction_categories")
public class TransactionCategory {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(
            name = "name",
            nullable = false,
            length = 80
    )
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "category_type",
            nullable = false,
            length = 20
    )
    private CategoryType categoryType;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "icon_key",
            nullable = false,
            length = 40
    )
    private CategoryIconKey iconKey;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "color_key",
            nullable = false,
            length = 30
    )
    private CategoryColorKey colorKey;

    @Column(
            name = "system_defined",
            nullable = false
    )
    private boolean systemDefined;

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

    public TransactionCategory() {
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

    public CategoryType getCategoryType() {
        return categoryType;
    }

    public void setCategoryType(
            CategoryType categoryType
    ) {
        this.categoryType = categoryType;
    }

    public CategoryIconKey getIconKey() {
        return iconKey;
    }

    public void setIconKey(
            CategoryIconKey iconKey
    ) {
        this.iconKey = iconKey;
    }

    public CategoryColorKey getColorKey() {
        return colorKey;
    }

    public void setColorKey(
            CategoryColorKey colorKey
    ) {
        this.colorKey = colorKey;
    }

    public boolean isSystemDefined() {
        return systemDefined;
    }

    public void setSystemDefined(
            boolean systemDefined
    ) {
        this.systemDefined = systemDefined;
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
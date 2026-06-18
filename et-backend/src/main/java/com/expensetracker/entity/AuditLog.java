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
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

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

    @Enumerated(EnumType.STRING)
    @Column(
            name = "module",
            nullable = false,
            length = 60
    )
    private AuditModule module;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "action",
            nullable = false,
            length = 60
    )
    private AuditAction action;

    @Column(
            name = "entity_public_id",
            nullable = false,
            length = 36
    )
    private String entityPublicId;

    @Column(
            name = "entity_label",
            length = 160
    )
    private String entityLabel;

    @Column(
            name = "description",
            nullable = false,
            length = 255
    )
    private String description;

    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    public AuditLog() {
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
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
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

    public void setUser(
            User user
    ) {
        this.user = user;
    }

    public AuditModule getModule() {
        return module;
    }

    public void setModule(
            AuditModule module
    ) {
        this.module = module;
    }

    public AuditAction getAction() {
        return action;
    }

    public void setAction(
            AuditAction action
    ) {
        this.action = action;
    }

    public String getEntityPublicId() {
        return entityPublicId;
    }

    public void setEntityPublicId(
            String entityPublicId
    ) {
        this.entityPublicId = entityPublicId;
    }

    public String getEntityLabel() {
        return entityLabel;
    }

    public void setEntityLabel(
            String entityLabel
    ) {
        this.entityLabel = entityLabel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            Instant createdAt
    ) {
        this.createdAt = createdAt;
    }
}

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

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_notifications")
public class AppNotification {

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
            name = "notification_type",
            nullable = false,
            length = 50
    )
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "severity",
            nullable = false,
            length = 20
    )
    private NotificationSeverity severity;

    @Column(
            name = "title",
            nullable = false,
            length = 160
    )
    private String title;

    @Column(
            name = "message",
            nullable = false,
            length = 1000
    )
    private String message;

    @Column(
            name = "source_type",
            length = 50
    )
    private String sourceType;

    @Column(
            name = "source_public_id",
            length = 36
    )
    private String sourcePublicId;

    @Column(
            name = "action_url",
            length = 255
    )
    private String actionUrl;

    @Column(
            name = "dedupe_key",
            nullable = false,
            length = 255
    )
    private String dedupeKey;

    @Column(name = "read_at")
    private Instant readAt;

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

    @PrePersist
    private void beforeInsert() {
        if (
                publicId == null ||
                publicId.isBlank()
        ) {
            publicId = UUID.randomUUID().toString();
        }

        normalizeFields();
    }

    @PreUpdate
    private void beforeUpdate() {
        normalizeFields();
    }

    private void normalizeFields() {
        title = normalizeRequiredText(title);
        message = normalizeRequiredText(message);
        sourceType = normalizeOptionalText(sourceType);
        sourcePublicId = normalizeOptionalText(sourcePublicId);
        actionUrl = normalizeOptionalText(actionUrl);
        dedupeKey = normalizeRequiredText(dedupeKey);
    }

    private String normalizeRequiredText(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    public Long getId() {
        return id;
    }

    public String getPublicId() {
        return publicId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public NotificationSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(NotificationSeverity severity) {
        this.severity = severity;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public String getSourcePublicId() {
        return sourcePublicId;
    }

    public void setSourcePublicId(String sourcePublicId) {
        this.sourcePublicId = sourcePublicId;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public String getDedupeKey() {
        return dedupeKey;
    }

    public void setDedupeKey(String dedupeKey) {
        this.dedupeKey = dedupeKey;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public Instant getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(Instant archivedAt) {
        this.archivedAt = archivedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

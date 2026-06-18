CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,
    module VARCHAR(60) NOT NULL,
    action VARCHAR(60) NOT NULL,
    entity_public_id VARCHAR(36) NOT NULL,
    entity_label VARCHAR(160),
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT uk_audit_logs_public_id
        UNIQUE (public_id),

    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
);

CREATE INDEX idx_audit_logs_user_created
    ON audit_logs (user_id, created_at DESC);

CREATE INDEX idx_audit_logs_module_action
    ON audit_logs (module, action);

CREATE INDEX idx_audit_logs_entity
    ON audit_logs (entity_public_id);

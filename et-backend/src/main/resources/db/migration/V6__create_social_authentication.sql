CREATE TABLE social_identities (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_social_identity_provider_subject
        UNIQUE (provider, provider_subject),
    CONSTRAINT uk_social_identity_user_provider
        UNIQUE (user_id, provider),
    CONSTRAINT fk_social_identity_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_social_identity_user_id
    ON social_identities (user_id);

CREATE TABLE oauth_login_codes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider VARCHAR(30) NOT NULL,
    code_hash VARCHAR(64) NOT NULL,
    issued_at TIMESTAMP(6) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    used_at TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_oauth_login_code_hash UNIQUE (code_hash),
    CONSTRAINT fk_oauth_login_code_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_oauth_login_code_user_id
    ON oauth_login_codes (user_id);
CREATE INDEX idx_oauth_login_code_expires_at
    ON oauth_login_codes (expires_at);

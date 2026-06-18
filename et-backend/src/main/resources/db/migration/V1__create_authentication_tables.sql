CREATE TABLE roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    system_role BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uk_roles_code UNIQUE (code)
);

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    account_status VARCHAR(30) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP(6),
    last_login_at TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_public_id UNIQUE (public_id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_failed_login_attempts
        CHECK (failed_login_attempts >= 0),
    CONSTRAINT chk_users_account_status
        CHECK (
            account_status IN (
                'PENDING_VERIFICATION',
                'ACTIVE',
                'LOCKED',
                'INACTIVE'
            )
        )
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE RESTRICT
);

CREATE TABLE refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    device_name VARCHAR(150),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    issued_at TIMESTAMP(6) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    revoked_at TIMESTAMP(6),
    replaced_by_token_id BIGINT,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT uk_refresh_tokens_public_id UNIQUE (public_id),
    CONSTRAINT uk_refresh_tokens_token_hash UNIQUE (token_hash),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_refresh_tokens_replacement
        FOREIGN KEY (replaced_by_token_id)
        REFERENCES refresh_tokens (id)
        ON DELETE SET NULL,

    CONSTRAINT chk_refresh_tokens_expiry
        CHECK (expires_at > issued_at)
);

CREATE INDEX idx_users_account_status
    ON users (account_status);

CREATE INDEX idx_refresh_tokens_user
    ON refresh_tokens (user_id);

CREATE INDEX idx_refresh_tokens_expiry
    ON refresh_tokens (expires_at);

CREATE INDEX idx_refresh_tokens_user_revoked_expiry
    ON refresh_tokens (user_id, revoked_at, expires_at);

INSERT INTO roles (
    code,
    display_name,
    description,
    system_role,
    active
)
VALUES
    (
        'USER',
        'User',
        'Standard personal finance application user',
        TRUE,
        TRUE
    ),
    (
        'ADMIN',
        'Administrator',
        'Application administration role',
        TRUE,
        TRUE
    );
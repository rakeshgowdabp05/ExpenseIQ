CREATE TABLE app_notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,

    notification_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,

    title VARCHAR(160) NOT NULL,
    message VARCHAR(1000) NOT NULL,

    source_type VARCHAR(50) NULL,
    source_public_id CHAR(36) NULL,
    action_url VARCHAR(255) NULL,

    dedupe_key VARCHAR(255) NOT NULL,

    read_at DATETIME(6) NULL,
    archived_at DATETIME(6) NULL,

    created_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6),

    updated_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    version BIGINT NOT NULL DEFAULT 0,

    active_dedupe_key VARCHAR(255)
        GENERATED ALWAYS AS (
            CASE
                WHEN archived_at IS NULL
                    THEN dedupe_key
                ELSE NULL
            END
        ) STORED,

    CONSTRAINT pk_app_notifications
        PRIMARY KEY (id),

    CONSTRAINT uk_app_notifications_public_id
        UNIQUE (public_id),

    CONSTRAINT uk_app_notifications_user_active_dedupe
        UNIQUE (
            user_id,
            active_dedupe_key
        ),

    CONSTRAINT fk_app_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_app_notifications_type
        CHECK (
            notification_type IN (
                'BUDGET_WARNING',
                'BUDGET_EXCEEDED',
                'GOAL_DEADLINE',
                'LARGE_EXPENSE',
                'MONTHLY_SUMMARY',
                'SYSTEM'
            )
        ),

    CONSTRAINT chk_app_notifications_severity
        CHECK (
            severity IN (
                'INFO',
                'SUCCESS',
                'WARNING',
                'DANGER'
            )
        )
) ENGINE = InnoDB;

CREATE INDEX idx_app_notifications_user_created
    ON app_notifications (
        user_id,
        archived_at,
        created_at
    );

CREATE INDEX idx_app_notifications_user_unread
    ON app_notifications (
        user_id,
        archived_at,
        read_at
    );

CREATE INDEX idx_app_notifications_source
    ON app_notifications (
        source_type,
        source_public_id
    );

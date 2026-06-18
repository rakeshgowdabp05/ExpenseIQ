CREATE TABLE savings_goals (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,

    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NULL,

    target_amount DECIMAL(19, 2) NOT NULL,
    current_amount DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    currency_code CHAR(3) NOT NULL,

    target_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',

    completed_at DATETIME(6) NULL,
    archived_at DATETIME(6) NULL,

    created_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6),

    updated_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    version BIGINT NOT NULL DEFAULT 0,

    active_name_key VARCHAR(120)
        GENERATED ALWAYS AS (
            CASE
                WHEN status <> 'ARCHIVED'
                    THEN LOWER(TRIM(name))
                ELSE NULL
            END
        ) STORED,

    CONSTRAINT pk_savings_goals
        PRIMARY KEY (id),

    CONSTRAINT uk_savings_goals_public_id
        UNIQUE (public_id),

    CONSTRAINT uk_savings_goals_user_active_name
        UNIQUE (
            user_id,
            active_name_key
        ),

    CONSTRAINT fk_savings_goals_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_savings_goals_name
        CHECK (
            CHAR_LENGTH(TRIM(name))
            BETWEEN 2 AND 120
        ),

    CONSTRAINT chk_savings_goals_target_amount
        CHECK (target_amount > 0),

    CONSTRAINT chk_savings_goals_current_amount
        CHECK (
            current_amount >= 0
            AND current_amount <= target_amount
        ),

    CONSTRAINT chk_savings_goals_currency
        CHECK (
            CHAR_LENGTH(currency_code) = 3
        ),

    CONSTRAINT chk_savings_goals_status
        CHECK (
            status IN (
                'IN_PROGRESS',
                'PAUSED',
                'COMPLETED',
                'OVERDUE',
                'ARCHIVED'
            )
        )
) ENGINE = InnoDB;

CREATE INDEX idx_savings_goals_user_status
    ON savings_goals (
        user_id,
        status
    );

CREATE INDEX idx_savings_goals_user_target_date
    ON savings_goals (
        user_id,
        target_date
    );

CREATE INDEX idx_savings_goals_user_currency
    ON savings_goals (
        user_id,
        currency_code
    );
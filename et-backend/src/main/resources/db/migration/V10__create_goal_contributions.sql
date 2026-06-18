CREATE TABLE goal_contributions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,

    user_id BIGINT NOT NULL,
    goal_id BIGINT NOT NULL,
    source_account_id BIGINT NULL,

    amount DECIMAL(19, 2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    contribution_date DATE NOT NULL,

    note VARCHAR(255) NULL,
    reference_number VARCHAR(100) NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'POSTED',
    cancelled_at DATETIME(6) NULL,

    created_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6),

    updated_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT pk_goal_contributions
        PRIMARY KEY (id),

    CONSTRAINT uk_goal_contributions_public_id
        UNIQUE (public_id),

    CONSTRAINT fk_goal_contributions_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_goal_contributions_goal
        FOREIGN KEY (goal_id)
        REFERENCES savings_goals (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_goal_contributions_source_account
        FOREIGN KEY (source_account_id)
        REFERENCES financial_accounts (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_goal_contributions_amount
        CHECK (amount > 0),

    CONSTRAINT chk_goal_contributions_currency
        CHECK (
            CHAR_LENGTH(currency_code) = 3
        ),

    CONSTRAINT chk_goal_contributions_status
        CHECK (
            status IN (
                'POSTED',
                'CANCELLED'
            )
        ),

    CONSTRAINT chk_goal_contributions_cancelled_at
        CHECK (
            (
                status = 'POSTED'
                AND cancelled_at IS NULL
            )
            OR
            (
                status = 'CANCELLED'
                AND cancelled_at IS NOT NULL
            )
        )
) ENGINE = InnoDB;

CREATE INDEX idx_goal_contributions_goal_status_date
    ON goal_contributions (
        goal_id,
        status,
        contribution_date
    );

CREATE INDEX idx_goal_contributions_user_date
    ON goal_contributions (
        user_id,
        contribution_date
    );

CREATE INDEX idx_goal_contributions_source_account
    ON goal_contributions (
        source_account_id
    );
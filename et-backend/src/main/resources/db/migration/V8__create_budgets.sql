CREATE TABLE budgets (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,
    category_id BIGINT NULL,

    name VARCHAR(120) NOT NULL,
    limit_amount DECIMAL(19, 2) NOT NULL,
    currency_code CHAR(3) NOT NULL,

    period_type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    warning_threshold SMALLINT NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,
    archived BOOLEAN NOT NULL DEFAULT FALSE,

    version BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT pk_budgets
        PRIMARY KEY (id),

    CONSTRAINT uq_budgets_public_id
        UNIQUE (public_id),

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id)
        REFERENCES users (id),

    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id)
        REFERENCES transaction_categories (id),

    CONSTRAINT chk_budgets_limit_positive
        CHECK (limit_amount > 0),

    CONSTRAINT chk_budgets_currency
        CHECK (CHAR_LENGTH(currency_code) = 3),

    CONSTRAINT chk_budgets_period_type
        CHECK (period_type IN ('MONTHLY', 'CUSTOM')),

    CONSTRAINT chk_budgets_date_range
        CHECK (end_date >= start_date),

    CONSTRAINT chk_budgets_warning_threshold
        CHECK (
            warning_threshold >= 1
            AND warning_threshold <= 100
        )
);

CREATE INDEX idx_budgets_user_period
    ON budgets (
        user_id,
        start_date,
        end_date
    );

CREATE INDEX idx_budgets_user_active
    ON budgets (
        user_id,
        active,
        archived
    );

CREATE INDEX idx_budgets_category
    ON budgets (
        category_id
    );

CREATE INDEX idx_budgets_currency
    ON budgets (
        user_id,
        currency_code
    );
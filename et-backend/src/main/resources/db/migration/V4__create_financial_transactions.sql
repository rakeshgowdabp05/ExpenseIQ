CREATE TABLE financial_transactions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,

    transaction_type VARCHAR(20) NOT NULL,
    transaction_status VARCHAR(20) NOT NULL,

    account_id BIGINT NOT NULL,
    destination_account_id BIGINT NULL,
    category_id BIGINT NULL,

    amount DECIMAL(19, 2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    transaction_date DATE NOT NULL,

    merchant_name VARCHAR(120) NULL,
    description VARCHAR(255) NULL,
    reference_number VARCHAR(100) NULL,

    cancelled_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT pk_financial_transactions
        PRIMARY KEY (id),

    CONSTRAINT uk_financial_transactions_public_id
        UNIQUE (public_id),

    CONSTRAINT fk_financial_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_financial_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES financial_accounts (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_financial_transactions_destination_account
        FOREIGN KEY (destination_account_id)
        REFERENCES financial_accounts (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_financial_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES transaction_categories (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_financial_transactions_type
        CHECK (
            transaction_type IN (
                'INCOME',
                'EXPENSE',
                'TRANSFER'
            )
        ),

    CONSTRAINT chk_financial_transactions_status
        CHECK (
            transaction_status IN (
                'POSTED',
                'CANCELLED'
            )
        ),

    CONSTRAINT chk_financial_transactions_amount
        CHECK (amount > 0),

    CONSTRAINT chk_financial_transactions_currency
        CHECK (CHAR_LENGTH(currency_code) = 3),

    CONSTRAINT chk_financial_transactions_account_pair
        CHECK (
            destination_account_id IS NULL
            OR destination_account_id <> account_id
        ),

    CONSTRAINT chk_financial_transactions_relationships
        CHECK (
            (
                transaction_type = 'TRANSFER'
                AND destination_account_id IS NOT NULL
                AND category_id IS NULL
            )
            OR
            (
                transaction_type IN ('INCOME', 'EXPENSE')
                AND destination_account_id IS NULL
                AND category_id IS NOT NULL
            )
        ),

    CONSTRAINT chk_financial_transactions_cancelled_at
        CHECK (
            (
                transaction_status = 'POSTED'
                AND cancelled_at IS NULL
            )
            OR
            (
                transaction_status = 'CANCELLED'
                AND cancelled_at IS NOT NULL
            )
        )
) ENGINE = InnoDB;

CREATE INDEX idx_financial_transactions_user_date
    ON financial_transactions (
        user_id,
        transaction_date,
        created_at
    );

CREATE INDEX idx_financial_transactions_user_type_status
    ON financial_transactions (
        user_id,
        transaction_type,
        transaction_status
    );

CREATE INDEX idx_financial_transactions_account
    ON financial_transactions (
        account_id,
        transaction_date
    );

CREATE INDEX idx_financial_transactions_destination_account
    ON financial_transactions (
        destination_account_id,
        transaction_date
    );

CREATE INDEX idx_financial_transactions_category
    ON financial_transactions (
        category_id,
        transaction_date
    );
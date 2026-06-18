CREATE TABLE financial_accounts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(40) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,

    opening_balance DECIMAL(19, 2) NOT NULL,
    current_balance DECIMAL(19, 2) NOT NULL,

    institution_name VARCHAR(150) NULL,
    account_number_last_four VARCHAR(4) NULL,

    include_in_total BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT pk_financial_accounts
        PRIMARY KEY (id),

    CONSTRAINT uk_financial_accounts_public_id
        UNIQUE (public_id),

    CONSTRAINT uk_financial_accounts_user_name
        UNIQUE (user_id, name),

    CONSTRAINT fk_financial_accounts_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_financial_accounts_name_length
        CHECK (CHAR_LENGTH(TRIM(name)) BETWEEN 2 AND 100),

    CONSTRAINT ck_financial_accounts_currency_length
        CHECK (CHAR_LENGTH(currency_code) = 3),

    CONSTRAINT ck_financial_accounts_last_four_length
        CHECK (
            account_number_last_four IS NULL
            OR CHAR_LENGTH(account_number_last_four) = 4
        )
) ENGINE = InnoDB;

CREATE INDEX idx_financial_accounts_user_active
    ON financial_accounts (user_id, active);

CREATE INDEX idx_financial_accounts_user_type
    ON financial_accounts (user_id, account_type);

CREATE INDEX idx_financial_accounts_user_created
    ON financial_accounts (user_id, created_at);
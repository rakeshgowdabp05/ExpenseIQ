CREATE TABLE transaction_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(36) NOT NULL,

    user_id BIGINT NULL,

    name VARCHAR(80) NOT NULL,
    category_type VARCHAR(20) NOT NULL,
    icon_key VARCHAR(40) NOT NULL,
    color_key VARCHAR(30) NOT NULL,

    system_defined BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6),

    updated_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    version BIGINT NOT NULL DEFAULT 0,

    owner_scope_id BIGINT
        GENERATED ALWAYS AS (
            COALESCE(user_id, 0)
        ) STORED,

    CONSTRAINT pk_transaction_categories
        PRIMARY KEY (id),

    CONSTRAINT uk_transaction_categories_public_id
        UNIQUE (public_id),

    CONSTRAINT uk_transaction_categories_scope_type_name
        UNIQUE (
            owner_scope_id,
            category_type,
            name
        ),

    CONSTRAINT fk_transaction_categories_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_transaction_categories_owner
        CHECK (
            (
                system_defined = TRUE
                AND user_id IS NULL
            )
            OR
            (
                system_defined = FALSE
                AND user_id IS NOT NULL
            )
        ),

    CONSTRAINT chk_transaction_categories_type
        CHECK (
            category_type IN (
                'EXPENSE',
                'INCOME'
            )
        ),

    CONSTRAINT chk_transaction_categories_name
        CHECK (
            CHAR_LENGTH(TRIM(name))
            BETWEEN 2 AND 80
        ),

    CONSTRAINT chk_transaction_categories_icon
        CHECK (
            icon_key IN (
                'UTENSILS',
                'CAR',
                'HOUSE',
                'SHOPPING_BAG',
                'HEART_PULSE',
                'BOOK_OPEN',
                'GAMEPAD',
                'RECEIPT',
                'PLANE',
                'BRIEFCASE',
                'BUILDING',
                'TRENDING_UP',
                'GIFT',
                'COINS',
                'WALLET',
                'ELLIPSIS'
            )
        ),

    CONSTRAINT chk_transaction_categories_color
        CHECK (
            color_key IN (
                'SLATE',
                'BLUE',
                'CYAN',
                'EMERALD',
                'AMBER',
                'ORANGE',
                'ROSE',
                'VIOLET',
                'INDIGO',
                'PINK',
                'LIME'
            )
        )
) ENGINE = InnoDB;

CREATE INDEX idx_transaction_categories_user
    ON transaction_categories (
        user_id,
        active
    );

CREATE INDEX idx_transaction_categories_type
    ON transaction_categories (
        category_type,
        active
    );

CREATE INDEX idx_transaction_categories_visibility
    ON transaction_categories (
        system_defined,
        user_id,
        category_type,
        active
    );

INSERT INTO transaction_categories (
    public_id,
    user_id,
    name,
    category_type,
    icon_key,
    color_key,
    system_defined,
    active
)
VALUES
    (
        UUID(),
        NULL,
        'Food & Dining',
        'EXPENSE',
        'UTENSILS',
        'ORANGE',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Transport',
        'EXPENSE',
        'CAR',
        'BLUE',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Housing',
        'EXPENSE',
        'HOUSE',
        'INDIGO',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Shopping',
        'EXPENSE',
        'SHOPPING_BAG',
        'PINK',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Healthcare',
        'EXPENSE',
        'HEART_PULSE',
        'ROSE',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Education',
        'EXPENSE',
        'BOOK_OPEN',
        'CYAN',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Entertainment',
        'EXPENSE',
        'GAMEPAD',
        'VIOLET',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Bills & Utilities',
        'EXPENSE',
        'RECEIPT',
        'AMBER',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Travel',
        'EXPENSE',
        'PLANE',
        'EMERALD',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Other Expense',
        'EXPENSE',
        'ELLIPSIS',
        'SLATE',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Salary',
        'INCOME',
        'BRIEFCASE',
        'BLUE',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Business Income',
        'INCOME',
        'BUILDING',
        'INDIGO',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Investment Returns',
        'INCOME',
        'TRENDING_UP',
        'EMERALD',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Gifts Received',
        'INCOME',
        'GIFT',
        'PINK',
        TRUE,
        TRUE
    ),
    (
        UUID(),
        NULL,
        'Other Income',
        'INCOME',
        'COINS',
        'AMBER',
        TRUE,
        TRUE
    );
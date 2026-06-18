CREATE TABLE transaction_receipt_attachments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    public_id VARCHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,
    transaction_id BIGINT NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(180) NOT NULL,
    storage_path VARCHAR(600) NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_transaction_receipt_public_id UNIQUE (public_id),
    CONSTRAINT uk_transaction_receipt_transaction UNIQUE (transaction_id),
    CONSTRAINT uk_transaction_receipt_stored_name UNIQUE (stored_file_name),
    CONSTRAINT fk_transaction_receipt_user
        FOREIGN KEY (user_id)
        REFERENCES users (id),
    CONSTRAINT fk_transaction_receipt_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES financial_transactions (id)
);

CREATE INDEX idx_transaction_receipt_user_uploaded_at
    ON transaction_receipt_attachments (user_id, uploaded_at);

CREATE INDEX idx_transaction_receipt_hash
    ON transaction_receipt_attachments (sha256_hash);

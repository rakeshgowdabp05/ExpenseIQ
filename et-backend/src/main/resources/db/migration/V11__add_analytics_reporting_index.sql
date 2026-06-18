CREATE INDEX idx_financial_transactions_analytics
    ON financial_transactions (
        user_id,
        transaction_status,
        transaction_date,
        currency_code,
        transaction_type
    );
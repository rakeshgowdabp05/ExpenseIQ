ALTER TABLE users
    ADD COLUMN preferred_currency CHAR(3) NULL
        AFTER registration_location_captured_at,

    ADD COLUMN preferred_timezone VARCHAR(80) NULL
        AFTER preferred_currency,

    ADD COLUMN date_format VARCHAR(30) NOT NULL
        DEFAULT 'DD_MM_YYYY'
        AFTER preferred_timezone,

    ADD COLUMN theme_preference VARCHAR(20) NOT NULL
        DEFAULT 'SYSTEM'
        AFTER date_format;

UPDATE users
SET preferred_timezone =
    CASE
        WHEN registration_timezone = 'Asia/Calcutta'
            THEN 'Asia/Kolkata'
        ELSE registration_timezone
    END
WHERE registration_timezone IS NOT NULL
  AND TRIM(registration_timezone) <> '';

ALTER TABLE users
    ADD CONSTRAINT chk_users_preferred_currency
        CHECK (
            preferred_currency IS NULL
            OR CHAR_LENGTH(preferred_currency) = 3
        ),

    ADD CONSTRAINT chk_users_date_format
        CHECK (
            date_format IN (
                'DD_MM_YYYY',
                'MM_DD_YYYY',
                'YYYY_MM_DD'
            )
        ),

    ADD CONSTRAINT chk_users_theme_preference
        CHECK (
            theme_preference IN (
                'SYSTEM',
                'LIGHT',
                'DARK'
            )
        );
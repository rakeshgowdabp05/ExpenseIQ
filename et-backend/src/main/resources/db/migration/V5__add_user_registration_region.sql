ALTER TABLE users
    ADD COLUMN registration_region_code VARCHAR(40) NULL AFTER phone,
    ADD COLUMN registration_region_label VARCHAR(80) NULL AFTER registration_region_code,
    ADD COLUMN registration_latitude DECIMAL(8, 5) NULL AFTER registration_region_label,
    ADD COLUMN registration_longitude DECIMAL(8, 5) NULL AFTER registration_latitude,
    ADD COLUMN registration_timezone VARCHAR(80) NULL AFTER registration_longitude,
    ADD COLUMN registration_location_source VARCHAR(30) NULL AFTER registration_timezone,
    ADD COLUMN registration_location_captured_at TIMESTAMP(6) NULL AFTER registration_location_source;

ALTER TABLE users
    ADD CONSTRAINT chk_users_registration_latitude
        CHECK (
            registration_latitude IS NULL
            OR registration_latitude BETWEEN -90.00000 AND 90.00000
        ),
    ADD CONSTRAINT chk_users_registration_longitude
        CHECK (
            registration_longitude IS NULL
            OR registration_longitude BETWEEN -180.00000 AND 180.00000
        );

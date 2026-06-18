ALTER TABLE users
    MODIFY registration_region_code VARCHAR(80);

ALTER TABLE users
    MODIFY registration_region_label VARCHAR(255);

ALTER TABLE users
    MODIFY registration_location_source VARCHAR(60);
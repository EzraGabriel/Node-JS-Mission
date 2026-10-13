USE videobelajar;

ALTER TABLE users
    ADD COLUMN verification_token CHAR(36) NULL UNIQUE,
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

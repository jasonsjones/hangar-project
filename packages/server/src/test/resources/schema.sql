CREATE TABLE IF NOT EXISTS users (
    id         UUID         PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name  VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credentials (
    id           UUID         PRIMARY KEY,
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider     VARCHAR(32)  NOT NULL,
    secret       VARCHAR(255),
    provider_uid VARCHAR(255),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, provider),
    UNIQUE (provider, provider_uid)
);

CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);

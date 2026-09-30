-- +goose Up
-- +goose StatementBegin

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (core identity)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT,
    display_name    TEXT NOT NULL DEFAULT '',
    avatar_url      TEXT,
    timezone        TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    locale          TEXT NOT NULL DEFAULT 'en-IN',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    account_status  TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
    winter_arc_start_date DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider-based identity (Google, Apple, GitHub, email+password)
CREATE TABLE user_identities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider            TEXT NOT NULL CHECK (provider IN ('google', 'email', 'github', 'apple')),
    provider_user_id    TEXT,
    email               TEXT,
    access_token        TEXT,
    refresh_token       TEXT,
    token_expires_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_user_id)
);

-- Refresh tokens (stored hashed, not raw)
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent  TEXT,
    ip_address  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspace preferences
CREATE TABLE workspace_preferences (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    enabled_modules         JSONB NOT NULL DEFAULT '["home","inbox","finance","time","learning","food","health","goals","milestones","cognitive","ai","journal","analytics","reports"]',
    pinned_sidebar_modules  JSONB NOT NULL DEFAULT '["home","inbox","time","learning","goals"]',
    default_view            TEXT NOT NULL DEFAULT 'home',
    dashboard_order         JSONB NOT NULL DEFAULT '["ai","time","finance","health","learning","goals","milestones","cognitive"]',
    quick_actions           JSONB NOT NULL DEFAULT '["inbox","finance","time","learning","journal"]',
    theme_preference        TEXT NOT NULL DEFAULT 'warm-hearth',
    onboarding_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_identities_user_id ON user_identities(user_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_identities_updated_at BEFORE UPDATE ON user_identities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_prefs_updated_at BEFORE UPDATE ON workspace_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS workspace_preferences;
DROP TABLE IF EXISTS user_identities;
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS update_updated_at_column();
-- +goose StatementEnd

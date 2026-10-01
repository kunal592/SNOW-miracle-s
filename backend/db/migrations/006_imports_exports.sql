-- +goose Up
-- +goose StatementBegin

CREATE TABLE imports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source              TEXT NOT NULL DEFAULT 'chatgpt' CHECK (source IN ('chatgpt', 'csv', 'json', 'manual')),
    raw_content         TEXT NOT NULL,
    extracted_data      JSONB NOT NULL DEFAULT '{}',
    conflicts           JSONB NOT NULL DEFAULT '[]',
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'applied', 'rejected')),
    applied_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_imports_user ON imports(user_id, status);

CREATE TRIGGER update_imports_updated_at BEFORE UPDATE ON imports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS imports;
-- +goose StatementEnd

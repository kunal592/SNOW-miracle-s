-- +goose Up
-- +goose StatementBegin

-- Universal Inbox
CREATE TABLE inbox_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_text        TEXT NOT NULL,
    source          TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'voice', 'import', 'api')),
    status          TEXT NOT NULL DEFAULT 'raw' CHECK (status IN ('raw', 'processing', 'needs_review', 'approved', 'rejected')),
    tags            TEXT[],
    audio_url       TEXT,
    image_url       TEXT,
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Extractions (intermediate, never directly mutates DB)
CREATE TABLE ai_extractions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inbox_entry_id      UUID REFERENCES inbox_entries(id) ON DELETE SET NULL,
    model               TEXT NOT NULL,
    model_version       TEXT,
    extracted_data      JSONB NOT NULL,
    confidence          DECIMAL(4,3) CHECK (confidence BETWEEN 0 AND 1),
    suggested_action    TEXT,
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'applied')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories (customizable per user)
CREATE TABLE expense_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    icon_name       TEXT,
    color_hex       TEXT,
    monthly_budget  DECIMAL(12,2),
    is_system       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert system categories (no user_id = shared defaults)
INSERT INTO expense_categories (name, icon_name, color_hex, is_system) VALUES
    ('Transport', 'Car', '#f59e0b', TRUE),
    ('Food', 'Utensils', '#ef4444', TRUE),
    ('Housing', 'Home', '#8b5cf6', TRUE),
    ('Subscriptions', 'CreditCard', '#06b6d4', TRUE),
    ('Personal Care', 'Heart', '#ec4899', TRUE),
    ('Learning', 'BookOpen', '#10b981', TRUE),
    ('Work', 'Briefcase', '#6366f1', TRUE),
    ('Health', 'Activity', '#f97316', TRUE),
    ('Entertainment', 'Tv', '#84cc16', TRUE),
    ('Utilities', 'Zap', '#eab308', TRUE),
    ('Other', 'MoreHorizontal', '#9ca3af', TRUE);

-- Expenses
CREATE TABLE expenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES expense_categories(id),
    amount          DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency        TEXT NOT NULL DEFAULT 'INR',
    description     TEXT NOT NULL DEFAULT '',
    expense_date    DATE NOT NULL,
    payment_method  TEXT CHECK (payment_method IN ('UPI', 'Cash', 'Card', 'NetBanking', 'Other')),
    is_consumption  BOOLEAN NOT NULL DEFAULT FALSE,
    source          TEXT NOT NULL DEFAULT 'manual',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Consumption items (tracks how a purchase is consumed over time)
CREATE TABLE consumption_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expense_id          UUID REFERENCES expenses(id) ON DELETE SET NULL,
    item_name           TEXT NOT NULL,
    category_id         UUID REFERENCES expense_categories(id),
    total_amount        DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
    start_date          DATE NOT NULL,
    expected_end_date   DATE NOT NULL,
    duration_days       INTEGER NOT NULL CHECK (duration_days > 0),
    daily_cost          DECIMAL(12,4) GENERATED ALWAYS AS (total_amount / duration_days) STORED,
    allocation_method   TEXT NOT NULL DEFAULT 'Equal daily' CHECK (allocation_method IN ('Equal daily', 'Per quantity', 'Per usage', 'Subscription period')),
    quantity            DECIMAL(10,3),
    unit                TEXT,
    status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Consumption allocations (daily ledger derived from consumption items)
CREATE TABLE consumption_allocations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumption_item_id     UUID NOT NULL REFERENCES consumption_items(id) ON DELETE CASCADE,
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allocation_date         DATE NOT NULL,
    allocated_amount        DECIMAL(12,4) NOT NULL,
    UNIQUE (consumption_item_id, allocation_date)
);

-- Fuel (special vehicle tracking)
CREATE TABLE fuel_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expense_id          UUID REFERENCES expenses(id) ON DELETE SET NULL,
    vehicle_name        TEXT NOT NULL DEFAULT 'My Vehicle',
    litres              DECIMAL(8,3) NOT NULL CHECK (litres > 0),
    odometer_km         DECIMAL(10,2) NOT NULL CHECK (odometer_km > 0),
    previous_odometer   DECIMAL(10,2),
    distance_km         DECIMAL(10,2) GENERATED ALWAYS AS (
                            CASE WHEN previous_odometer IS NOT NULL 
                            THEN odometer_km - previous_odometer 
                            ELSE NULL END
                        ) STORED,
    fuel_price_per_litre DECIMAL(8,2),
    fuel_date           DATE NOT NULL,
    station_name        TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inbox_user_id ON inbox_entries(user_id);
CREATE INDEX idx_inbox_status ON inbox_entries(user_id, status);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(user_id, expense_date DESC);
CREATE INDEX idx_consumption_user_id ON consumption_items(user_id);
CREATE INDEX idx_consumption_status ON consumption_items(user_id, status);
CREATE INDEX idx_consumption_alloc_item ON consumption_allocations(consumption_item_id);
CREATE INDEX idx_consumption_alloc_date ON consumption_allocations(user_id, allocation_date DESC);
CREATE INDEX idx_fuel_user_id ON fuel_entries(user_id);

CREATE TRIGGER update_inbox_updated_at BEFORE UPDATE ON inbox_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consumption_updated_at BEFORE UPDATE ON consumption_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fuel_updated_at BEFORE UPDATE ON fuel_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS consumption_allocations;
DROP TABLE IF EXISTS fuel_entries;
DROP TABLE IF EXISTS consumption_items;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS expense_categories;
DROP TABLE IF EXISTS ai_extractions;
DROP TABLE IF EXISTS inbox_entries;
-- +goose StatementEnd

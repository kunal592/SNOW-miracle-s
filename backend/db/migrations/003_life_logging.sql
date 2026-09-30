-- +goose Up
-- +goose StatementBegin

-- Time tracking
CREATE TABLE time_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity        TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('Work', 'Learning', 'Health', 'Personal', 'Commute', 'Entertainment', 'Sleep', 'Other')),
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ,
    duration_secs   INTEGER GENERATED ALWAYS AS (
                        CASE WHEN end_time IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER
                        ELSE NULL END
                    ) STORED,
    is_deep_work    BOOLEAN NOT NULL DEFAULT FALSE,
    notes           TEXT,
    project_id      UUID,
    entry_date      DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning sessions
CREATE TABLE learning_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic           TEXT NOT NULL,
    category        TEXT,
    duration_secs   INTEGER NOT NULL CHECK (duration_secs > 0),
    started_at      TIMESTAMPTZ NOT NULL,
    ended_at        TIMESTAMPTZ,
    project_id      UUID,
    project_name    TEXT,
    notes           TEXT,
    key_takeaway    TEXT,
    session_date    DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Food entries
CREATE TABLE food_entries (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type                   TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Snack', 'Dinner')),
    description                 TEXT NOT NULL,
    calories                    INTEGER,
    protein_grams               DECIMAL(8,2),
    cost                        DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_consumption_based        BOOLEAN NOT NULL DEFAULT FALSE,
    consumption_daily_alloc     DECIMAL(12,4),
    entry_date                  DATE NOT NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health entries (daily snapshot)
CREATE TABLE health_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date      DATE NOT NULL,
    sleep_hours     DECIMAL(4,2),
    sleep_quality   TEXT CHECK (sleep_quality IN ('Poor', 'Fair', 'Good', 'Optimal')),
    water_liters    DECIMAL(5,2),
    workout_done    BOOLEAN NOT NULL DEFAULT FALSE,
    workout_type    TEXT,
    steps_count     INTEGER,
    weight_kg       DECIMAL(6,2),
    energy_level    SMALLINT CHECK (energy_level BETWEEN 1 AND 10),
    mood_level      SMALLINT CHECK (mood_level BETWEEN 1 AND 10),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, entry_date)
);

-- Journal entries
CREATE TABLE journal_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date          DATE NOT NULL,
    mood_rating         SMALLINT CHECK (mood_rating BETWEEN 1 AND 10),
    energy_rating       SMALLINT CHECK (energy_rating BETWEEN 1 AND 10),
    what_happened       TEXT,
    what_went_well      TEXT,
    what_went_wrong     TEXT,
    tomorrow_priority   TEXT,
    tags                TEXT[],
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, entry_date)
);

CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, entry_date DESC);
CREATE INDEX idx_learning_sessions_user_date ON learning_sessions(user_id, session_date DESC);
CREATE INDEX idx_food_entries_user_date ON food_entries(user_id, entry_date DESC);
CREATE INDEX idx_health_entries_user_date ON health_entries(user_id, entry_date DESC);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);

CREATE TRIGGER update_time_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_updated_at BEFORE UPDATE ON learning_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_updated_at BEFORE UPDATE ON food_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_updated_at BEFORE UPDATE ON health_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS health_entries;
DROP TABLE IF EXISTS food_entries;
DROP TABLE IF EXISTS learning_sessions;
DROP TABLE IF EXISTS time_entries;
-- +goose StatementEnd

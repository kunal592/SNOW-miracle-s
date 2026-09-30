-- +goose Up
-- +goose StatementBegin

-- Cognitive questions library
CREATE TABLE cognitive_questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category            TEXT NOT NULL CHECK (category IN ('Logical', 'Analytical', 'Critical', 'Operational', 'Observational', 'Numerical', 'Systems Thinking', 'Problem Solving')),
    difficulty          SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    question            TEXT NOT NULL,
    context_data        TEXT,
    hints               JSONB NOT NULL DEFAULT '[]',
    correct_answer      TEXT NOT NULL,
    explanation         TEXT NOT NULL,
    skills              TEXT[] NOT NULL DEFAULT '{}',
    estimated_time_mins INTEGER NOT NULL DEFAULT 5,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cognitive attempts by users
CREATE TABLE cognitive_attempts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id         UUID NOT NULL REFERENCES cognitive_questions(id) ON DELETE CASCADE,
    attempt_number      SMALLINT NOT NULL DEFAULT 1,
    user_answer         TEXT NOT NULL,
    is_correct          BOOLEAN NOT NULL DEFAULT FALSE,
    is_assisted         BOOLEAN NOT NULL DEFAULT FALSE,
    hints_requested     SMALLINT NOT NULL DEFAULT 0,
    time_taken_secs     INTEGER NOT NULL,
    reasoning_score     DECIMAL(5,2) CHECK (reasoning_score BETWEEN 0 AND 100),
    ai_feedback         JSONB,
    started_at          TIMESTAMPTZ NOT NULL,
    completed_at        TIMESTAMPTZ NOT NULL,
    attempt_date        DATE NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-skill stats (aggregate performance profile)
CREATE TABLE cognitive_skill_stats (
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill                   TEXT NOT NULL CHECK (skill IN ('Logical', 'Analytical', 'Critical', 'Operational', 'Observational', 'Numerical', 'Systems Thinking', 'Problem Solving')),
    attempts_total          INTEGER NOT NULL DEFAULT 0,
    correct_count           INTEGER NOT NULL DEFAULT 0,
    independent_solves      INTEGER NOT NULL DEFAULT 0,
    hint_assisted_solves    INTEGER NOT NULL DEFAULT 0,
    avg_reasoning_score     DECIMAL(5,2) DEFAULT 0,
    avg_time_secs           DECIMAL(8,2) DEFAULT 0,
    skill_level             INTEGER NOT NULL DEFAULT 1,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, skill)
);

-- AI System tables
CREATE TABLE ai_insights (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module              TEXT NOT NULL CHECK (module IN ('Finance', 'Time', 'Learning', 'Health', 'Milestones', 'Cognitive')),
    title               TEXT NOT NULL,
    fact                TEXT NOT NULL,
    interpretation      TEXT NOT NULL,
    hypothesis          TEXT,
    recommendation      TEXT,
    confidence          DECIMAL(4,3) CHECK (confidence BETWEEN 0 AND 1),
    confidence_reason   TEXT,
    confidence_level    TEXT CHECK (confidence_level IN ('High', 'Moderate', 'Low')),
    underlying_data     JSONB NOT NULL DEFAULT '[]',
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_memory (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category    TEXT NOT NULL CHECK (category IN ('Goals', 'Preferences', 'Patterns', 'Milestones', 'Financial Rules', 'Learning History')),
    memory_text TEXT NOT NULL,
    source      TEXT NOT NULL DEFAULT 'system',
    confidence  DECIMAL(4,3) CHECK (confidence BETWEEN 0 AND 1),
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_activity_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action              TEXT NOT NULL,
    module              TEXT,
    input_reference     TEXT,
    output_reference    TEXT,
    model               TEXT,
    details             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('checkpoint', 'consumption', 'inbox', 'system', 'cognitive', 'ai')),
    action_route    TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cognitive_attempts_user ON cognitive_attempts(user_id, attempt_date DESC);
CREATE INDEX idx_cognitive_attempts_question ON cognitive_attempts(question_id);
CREATE INDEX idx_cognitive_skill_stats_user ON cognitive_skill_stats(user_id);
CREATE INDEX idx_ai_insights_user ON ai_insights(user_id, created_at DESC);
CREATE INDEX idx_ai_memory_user ON ai_memory(user_id, status);
CREATE INDEX idx_ai_activity_user ON ai_activity_log(user_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

CREATE TRIGGER update_ai_memory_updated_at BEFORE UPDATE ON ai_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS ai_activity_log;
DROP TABLE IF EXISTS ai_memory;
DROP TABLE IF EXISTS ai_insights;
DROP TABLE IF EXISTS cognitive_skill_stats;
DROP TABLE IF EXISTS cognitive_attempts;
DROP TABLE IF EXISTS cognitive_questions;
-- +goose StatementEnd

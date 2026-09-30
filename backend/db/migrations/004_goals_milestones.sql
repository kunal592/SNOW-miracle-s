-- +goose Up
-- +goose StatementBegin

-- Goals (hierarchical)
CREATE TABLE goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_goal_id  UUID REFERENCES goals(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT NOT NULL DEFAULT 'Skills' CHECK (category IN ('Career', 'Finance', 'Health', 'Mindset', 'Skills')),
    goal_type       TEXT NOT NULL DEFAULT 'qualitative' CHECK (goal_type IN ('quantitative', 'qualitative')),
    target_value    DECIMAL(15,4),
    current_value   DECIMAL(15,4) DEFAULT 0,
    unit            TEXT,
    start_date      DATE NOT NULL,
    target_date     DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'On Track', 'At Risk', 'Completed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goal metrics (flexible key-value for progress tracking)
CREATE TABLE goal_metrics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id     UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    label       TEXT NOT NULL,
    current_val DECIMAL(15,4) NOT NULL DEFAULT 0,
    target_val  DECIMAL(15,4) NOT NULL,
    unit        TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    description         TEXT,
    milestone_type      TEXT NOT NULL DEFAULT 'Checkpoint' CHECK (milestone_type IN ('Checkpoint', 'Review', 'Deadline', 'Personal')),
    due_at              TIMESTAMPTZ NOT NULL,
    status              TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Today', 'Completed', 'Overdue')),
    reflection_questions TEXT[],
    checkpoint_config   JSONB DEFAULT '{"enabled": true}',
    completed_at        TIMESTAMPTZ,
    is_snoozed          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goal ↔ Milestone link (many-to-many)
CREATE TABLE milestone_goals (
    milestone_id    UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    goal_id         UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    PRIMARY KEY (milestone_id, goal_id)
);

-- Milestone checklists
CREATE TABLE milestone_checklist_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id    UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    task            TEXT NOT NULL,
    done            BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      SMALLINT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checkpoint completions
CREATE TABLE checkpoints (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id        UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at        DATE NOT NULL,
    what_went_well      TEXT,
    what_went_wrong     TEXT,
    what_should_change  TEXT,
    next_priority       TEXT,
    stats_snapshot      JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_parent ON goals(parent_goal_id);
CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_due_at ON milestones(user_id, due_at);
CREATE INDEX idx_checkpoints_milestone ON checkpoints(milestone_id);

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS checkpoints;
DROP TABLE IF EXISTS milestone_checklist_items;
DROP TABLE IF EXISTS milestone_goals;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS goal_metrics;
DROP TABLE IF EXISTS goals;
-- +goose StatementEnd

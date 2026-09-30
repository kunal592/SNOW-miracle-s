package milestones

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type Milestone struct {
	ID                  uuid.UUID        `json:"id"`
	UserID              uuid.UUID        `json:"userId"`
	Title               string           `json:"title"`
	Description         *string          `json:"description,omitempty"`
	MilestoneType       string           `json:"milestoneType"`
	DueAt               time.Time        `json:"dueAt"`
	Status              string           `json:"status"`
	ReflectionQuestions []string         `json:"reflectionQuestions"`
	CompletedAt         *time.Time       `json:"completedAt,omitempty"`
	IsSnoozed           bool             `json:"isSnoozed"`
	Checklist           []*ChecklistItem `json:"checklist,omitempty"`
	LinkedGoalIDs       []uuid.UUID      `json:"linkedGoalIds,omitempty"`
	Checkpoint          *Checkpoint      `json:"checkpoint,omitempty"`
	CreatedAt           time.Time        `json:"createdAt"`
	UpdatedAt           time.Time        `json:"updatedAt"`
}

type ChecklistItem struct {
	ID          uuid.UUID `json:"id"`
	MilestoneID uuid.UUID `json:"milestoneId"`
	Task        string    `json:"task"`
	Done        bool      `json:"done"`
	SortOrder   int       `json:"sortOrder"`
}

type Checkpoint struct {
	ID               uuid.UUID `json:"id"`
	MilestoneID      uuid.UUID `json:"milestoneId"`
	UserID           uuid.UUID `json:"userId"`
	CompletedAt      string    `json:"completedAt"`
	WhatWentWell     *string   `json:"whatWentWell,omitempty"`
	WhatWentWrong    *string   `json:"whatWentWrong,omitempty"`
	WhatShouldChange *string   `json:"whatShouldChange,omitempty"`
	NextPriority     *string   `json:"nextPriority,omitempty"`
	CreatedAt        time.Time `json:"createdAt"`
}

type CreateMilestoneRequest struct {
	Title               string    `json:"title" binding:"required"`
	Description         *string   `json:"description"`
	MilestoneType       string    `json:"milestoneType"`
	DueAt               time.Time `json:"dueAt" binding:"required"`
	ReflectionQuestions []string  `json:"reflectionQuestions"`
	LinkedGoalIDs       []string  `json:"linkedGoalIds"`
}

type UpdateMilestoneRequest struct {
	Title         *string    `json:"title"`
	Description   *string    `json:"description"`
	MilestoneType *string    `json:"milestoneType"`
	DueAt         *time.Time `json:"dueAt"`
	Status        *string    `json:"status"`
	IsSnoozed     *bool      `json:"isSnoozed"`
}

type CompleteCheckpointRequest struct {
	WhatWentWell     *string `json:"whatWentWell"`
	WhatWentWrong    *string `json:"whatWentWrong"`
	WhatShouldChange *string `json:"whatShouldChange"`
	NextPriority     *string `json:"nextPriority"`
}

type AddChecklistRequest struct {
	Task string `json:"task" binding:"required"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) Create(ctx context.Context, userID string, req CreateMilestoneRequest) (*Milestone, error) {
	mType := req.MilestoneType
	if mType == "" {
		mType = "Checkpoint"
	}
	questions := req.ReflectionQuestions
	if questions == nil {
		questions = []string{}
	}

	var m Milestone
	query := `
		INSERT INTO milestones (
			user_id, title, description, milestone_type, due_at, reflection_questions
		) VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, title, description, milestone_type, due_at, status,
		          reflection_questions, completed_at, is_snoozed, created_at, updated_at`

	err := s.db.QueryRow(ctx, query,
		userID, req.Title, req.Description, mType, req.DueAt, questions,
	).Scan(
		&m.ID, &m.UserID, &m.Title, &m.Description, &m.MilestoneType, &m.DueAt, &m.Status,
		&m.ReflectionQuestions, &m.CompletedAt, &m.IsSnoozed, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create milestone: %w", err)
	}

	// Link goals if provided
	for _, gid := range req.LinkedGoalIDs {
		_, _ = s.db.Exec(ctx,
			`INSERT INTO milestone_goals (milestone_id, goal_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			m.ID, gid)
	}

	return s.GetByID(ctx, userID, m.ID.String())
}

func (s *Service) List(ctx context.Context, userID string, status, milestoneType string) ([]*Milestone, error) {
	query := `
		SELECT id, user_id, title, description, milestone_type, due_at, status,
		       reflection_questions, completed_at, is_snoozed, created_at, updated_at
		FROM milestones
		WHERE user_id = $1`
	args := []interface{}{userID}
	n := 2

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", n)
		args = append(args, status)
		n++
	}
	if milestoneType != "" {
		query += fmt.Sprintf(" AND milestone_type = $%d", n)
		args = append(args, milestoneType)
		n++
	}

	query += " ORDER BY due_at ASC"

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*Milestone
	for rows.Next() {
		var m Milestone
		if err := rows.Scan(
			&m.ID, &m.UserID, &m.Title, &m.Description, &m.MilestoneType, &m.DueAt, &m.Status,
			&m.ReflectionQuestions, &m.CompletedAt, &m.IsSnoozed, &m.CreatedAt, &m.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &m)
	}

	if list == nil {
		list = []*Milestone{}
	}
	return list, nil
}

func (s *Service) GetByID(ctx context.Context, userID, id string) (*Milestone, error) {
	var m Milestone
	query := `
		SELECT id, user_id, title, description, milestone_type, due_at, status,
		       reflection_questions, completed_at, is_snoozed, created_at, updated_at
		FROM milestones WHERE id = $1 AND user_id = $2`

	err := s.db.QueryRow(ctx, query, id, userID).Scan(
		&m.ID, &m.UserID, &m.Title, &m.Description, &m.MilestoneType, &m.DueAt, &m.Status,
		&m.ReflectionQuestions, &m.CompletedAt, &m.IsSnoozed, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("milestone not found")
	}

	// Fetch checklist
	crows, err := s.db.Query(ctx,
		`SELECT id, milestone_id, task, done, sort_order
		 FROM milestone_checklist_items WHERE milestone_id = $1 ORDER BY sort_order ASC, id ASC`, id)
	if err == nil {
		defer crows.Close()
		for crows.Next() {
			var ci ChecklistItem
			_ = crows.Scan(&ci.ID, &ci.MilestoneID, &ci.Task, &ci.Done, &ci.SortOrder)
			m.Checklist = append(m.Checklist, &ci)
		}
	}
	if m.Checklist == nil {
		m.Checklist = []*ChecklistItem{}
	}

	// Fetch linked goal IDs
	grows, err := s.db.Query(ctx,
		`SELECT goal_id FROM milestone_goals WHERE milestone_id = $1`, id)
	if err == nil {
		defer grows.Close()
		for grows.Next() {
			var gid uuid.UUID
			_ = grows.Scan(&gid)
			m.LinkedGoalIDs = append(m.LinkedGoalIDs, gid)
		}
	}
	if m.LinkedGoalIDs == nil {
		m.LinkedGoalIDs = []uuid.UUID{}
	}

	// Fetch checkpoint reflection if completed
	var cp Checkpoint
	cperr := s.db.QueryRow(ctx,
		`SELECT id, milestone_id, user_id, to_char(completed_at, 'YYYY-MM-DD'),
		        what_went_well, what_went_wrong, what_should_change, next_priority, created_at
		 FROM checkpoints WHERE milestone_id = $1`, id,
	).Scan(
		&cp.ID, &cp.MilestoneID, &cp.UserID, &cp.CompletedAt,
		&cp.WhatWentWell, &cp.WhatWentWrong, &cp.WhatShouldChange, &cp.NextPriority, &cp.CreatedAt,
	)
	if cperr == nil {
		m.Checkpoint = &cp
	}

	return &m, nil
}

func (s *Service) Update(ctx context.Context, userID, id string, req UpdateMilestoneRequest) (*Milestone, error) {
	if req.Title != nil {
		_, _ = s.db.Exec(ctx, `UPDATE milestones SET title = $1 WHERE id = $2 AND user_id = $3`, *req.Title, id, userID)
	}
	if req.Description != nil {
		_, _ = s.db.Exec(ctx, `UPDATE milestones SET description = $1 WHERE id = $2 AND user_id = $3`, *req.Description, id, userID)
	}
	if req.MilestoneType != nil {
		_, _ = s.db.Exec(ctx, `UPDATE milestones SET milestone_type = $1 WHERE id = $2 AND user_id = $3`, *req.MilestoneType, id, userID)
	}
	if req.DueAt != nil {
		_, _ = s.db.Exec(ctx, `UPDATE milestones SET due_at = $1 WHERE id = $2 AND user_id = $3`, *req.DueAt, id, userID)
	}
	if req.Status != nil {
		_, _ = s.db.Exec(ctx, `UPDATE milestones SET status = $1 WHERE id = $2 AND user_id = $3`, *req.Status, id, userID)
	}
	if req.IsSnoozed != nil {
		_, _ = s.db.Exec(ctx, `UPDATE milestones SET is_snoozed = $1 WHERE id = $2 AND user_id = $3`, *req.IsSnoozed, id, userID)
	}
	return s.GetByID(ctx, userID, id)
}

func (s *Service) Delete(ctx context.Context, userID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM milestones WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

// CompleteCheckpoint marks the milestone completed and stores the reflection checkpoint
func (s *Service) CompleteCheckpoint(ctx context.Context, userID, id string, req CompleteCheckpointRequest) (*Milestone, error) {
	now := time.Now()
	_, err := s.db.Exec(ctx,
		`UPDATE milestones SET status = 'Completed', completed_at = $1 WHERE id = $2 AND user_id = $3`,
		now, id, userID)
	if err != nil {
		return nil, err
	}

	today := now.Format("2006-01-02")
	_, err = s.db.Exec(ctx,
		`INSERT INTO checkpoints (
			milestone_id, user_id, completed_at, what_went_well, what_went_wrong, what_should_change, next_priority
		) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		id, userID, today, req.WhatWentWell, req.WhatWentWrong, req.WhatShouldChange, req.NextPriority)
	if err != nil {
		return nil, fmt.Errorf("record checkpoint: %w", err)
	}

	return s.GetByID(ctx, userID, id)
}

func (s *Service) AddChecklistItem(ctx context.Context, milestoneID string, task string) (*ChecklistItem, error) {
	var item ChecklistItem
	query := `
		INSERT INTO milestone_checklist_items (milestone_id, task)
		VALUES ($1, $2)
		RETURNING id, milestone_id, task, done, sort_order`

	err := s.db.QueryRow(ctx, query, milestoneID, task).Scan(
		&item.ID, &item.MilestoneID, &item.Task, &item.Done, &item.SortOrder)
	if err != nil {
		return nil, fmt.Errorf("add checklist item: %w", err)
	}
	return &item, nil
}

func (s *Service) ToggleChecklistItem(ctx context.Context, itemID string) (*ChecklistItem, error) {
	var item ChecklistItem
	query := `
		UPDATE milestone_checklist_items
		SET done = NOT done
		WHERE id = $1
		RETURNING id, milestone_id, task, done, sort_order`

	err := s.db.QueryRow(ctx, query, itemID).Scan(
		&item.ID, &item.MilestoneID, &item.Task, &item.Done, &item.SortOrder)
	if err != nil {
		return nil, fmt.Errorf("toggle checklist item: %w", err)
	}
	return &item, nil
}

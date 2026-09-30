package goals

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type Goal struct {
	ID           uuid.UUID   `json:"id"`
	UserID       uuid.UUID   `json:"userId"`
	ParentGoalID *uuid.UUID  `json:"parentGoalId,omitempty"`
	Title        string      `json:"title"`
	Description  *string     `json:"description,omitempty"`
	Category     string      `json:"category"`
	GoalType     string      `json:"goalType"`
	TargetValue  *float64    `json:"targetValue,omitempty"`
	CurrentValue *float64    `json:"currentValue,omitempty"`
	Unit         *string     `json:"unit,omitempty"`
	StartDate    string      `json:"startDate"`
	TargetDate   string      `json:"targetDate"`
	Status       string      `json:"status"`
	ProgressPct  float64     `json:"progressPct"`
	SubGoals     []*Goal     `json:"subGoals,omitempty"`
	Metrics      []*Metric   `json:"metrics,omitempty"`
	CreatedAt    time.Time   `json:"createdAt"`
	UpdatedAt    time.Time   `json:"updatedAt"`
}

type Metric struct {
	ID         uuid.UUID `json:"id"`
	GoalID     uuid.UUID `json:"goalId"`
	Label      string    `json:"label"`
	CurrentVal float64   `json:"currentVal"`
	TargetVal  float64   `json:"targetVal"`
	Unit       *string   `json:"unit,omitempty"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateGoalRequest struct {
	ParentGoalID *string  `json:"parentGoalId"`
	Title        string   `json:"title" binding:"required"`
	Description  *string  `json:"description"`
	Category     string   `json:"category"`
	GoalType     string   `json:"goalType"`
	TargetValue  *float64 `json:"targetValue"`
	CurrentValue *float64 `json:"currentValue"`
	Unit         *string  `json:"unit"`
	StartDate    string   `json:"startDate" binding:"required"`
	TargetDate   string   `json:"targetDate" binding:"required"`
	Status       string   `json:"status"`
}

type UpdateGoalRequest struct {
	Title        *string  `json:"title"`
	Description  *string  `json:"description"`
	Category     *string  `json:"category"`
	CurrentValue *float64 `json:"currentValue"`
	TargetValue  *float64 `json:"targetValue"`
	TargetDate   *string  `json:"targetDate"`
	Status       *string  `json:"status"`
}

type AddMetricRequest struct {
	Label      string  `json:"label" binding:"required"`
	CurrentVal float64 `json:"currentVal"`
	TargetVal  float64 `json:"targetVal" binding:"required"`
	Unit       *string `json:"unit"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) Create(ctx context.Context, userID string, req CreateGoalRequest) (*Goal, error) {
	category := req.Category
	if category == "" {
		category = "Skills"
	}
	goalType := req.GoalType
	if goalType == "" {
		goalType = "qualitative"
	}
	status := req.Status
	if status == "" {
		status = "Not Started"
	}

	var g Goal
	query := `
		INSERT INTO goals (
			user_id, parent_goal_id, title, description, category, goal_type,
			target_value, current_value, unit, start_date, target_date, status
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, user_id, parent_goal_id, title, description, category, goal_type,
		          target_value, current_value, unit, to_char(start_date, 'YYYY-MM-DD'),
		          to_char(target_date, 'YYYY-MM-DD'), status, created_at, updated_at`

	err := s.db.QueryRow(ctx, query,
		userID, req.ParentGoalID, req.Title, req.Description, category, goalType,
		req.TargetValue, req.CurrentValue, req.Unit, req.StartDate, req.TargetDate, status,
	).Scan(
		&g.ID, &g.UserID, &g.ParentGoalID, &g.Title, &g.Description, &g.Category, &g.GoalType,
		&g.TargetValue, &g.CurrentValue, &g.Unit, &g.StartDate, &g.TargetDate, &g.Status,
		&g.CreatedAt, &g.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create goal: %w", err)
	}

	g.ProgressPct = calculateProgress(g.TargetValue, g.CurrentValue)
	return &g, nil
}

func (s *Service) List(ctx context.Context, userID string, category, status string) ([]*Goal, error) {
	query := `
		SELECT id, user_id, parent_goal_id, title, description, category, goal_type,
		       target_value, current_value, unit, to_char(start_date, 'YYYY-MM-DD'),
		       to_char(target_date, 'YYYY-MM-DD'), status, created_at, updated_at
		FROM goals
		WHERE user_id = $1`
	args := []interface{}{userID}
	n := 2

	if category != "" {
		query += fmt.Sprintf(" AND category = $%d", n)
		args = append(args, category)
		n++
	}
	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", n)
		args = append(args, status)
		n++
	}

	query += " ORDER BY target_date ASC, created_at DESC"

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var goals []*Goal
	for rows.Next() {
		var g Goal
		if err := rows.Scan(
			&g.ID, &g.UserID, &g.ParentGoalID, &g.Title, &g.Description, &g.Category, &g.GoalType,
			&g.TargetValue, &g.CurrentValue, &g.Unit, &g.StartDate, &g.TargetDate, &g.Status,
			&g.CreatedAt, &g.UpdatedAt,
		); err != nil {
			return nil, err
		}
		g.ProgressPct = calculateProgress(g.TargetValue, g.CurrentValue)
		goals = append(goals, &g)
	}

	if goals == nil {
		goals = []*Goal{}
	}
	return goals, nil
}

func (s *Service) GetByID(ctx context.Context, userID, id string) (*Goal, error) {
	var g Goal
	query := `
		SELECT id, user_id, parent_goal_id, title, description, category, goal_type,
		       target_value, current_value, unit, to_char(start_date, 'YYYY-MM-DD'),
		       to_char(target_date, 'YYYY-MM-DD'), status, created_at, updated_at
		FROM goals WHERE id = $1 AND user_id = $2`

	err := s.db.QueryRow(ctx, query, id, userID).Scan(
		&g.ID, &g.UserID, &g.ParentGoalID, &g.Title, &g.Description, &g.Category, &g.GoalType,
		&g.TargetValue, &g.CurrentValue, &g.Unit, &g.StartDate, &g.TargetDate, &g.Status,
		&g.CreatedAt, &g.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("goal not found")
	}

	g.ProgressPct = calculateProgress(g.TargetValue, g.CurrentValue)

	// Fetch metrics
	mrows, err := s.db.Query(ctx,
		`SELECT id, goal_id, label, current_val, target_val, unit, updated_at
		 FROM goal_metrics WHERE goal_id = $1`, id)
	if err == nil {
		defer mrows.Close()
		for mrows.Next() {
			var m Metric
			_ = mrows.Scan(&m.ID, &m.GoalID, &m.Label, &m.CurrentVal, &m.TargetVal, &m.Unit, &m.UpdatedAt)
			g.Metrics = append(g.Metrics, &m)
		}
	}
	if g.Metrics == nil {
		g.Metrics = []*Metric{}
	}

	// Fetch subgoals
	srows, err := s.db.Query(ctx,
		`SELECT id, user_id, parent_goal_id, title, description, category, goal_type,
		        target_value, current_value, unit, to_char(start_date, 'YYYY-MM-DD'),
		        to_char(target_date, 'YYYY-MM-DD'), status, created_at, updated_at
		 FROM goals WHERE parent_goal_id = $1 ORDER BY target_date ASC`, id)
	if err == nil {
		defer srows.Close()
		for srows.Next() {
			var sg Goal
			_ = srows.Scan(
				&sg.ID, &sg.UserID, &sg.ParentGoalID, &sg.Title, &sg.Description, &sg.Category, &sg.GoalType,
				&sg.TargetValue, &sg.CurrentValue, &sg.Unit, &sg.StartDate, &sg.TargetDate, &sg.Status,
				&sg.CreatedAt, &sg.UpdatedAt,
			)
			sg.ProgressPct = calculateProgress(sg.TargetValue, sg.CurrentValue)
			g.SubGoals = append(g.SubGoals, &sg)
		}
	}
	if g.SubGoals == nil {
		g.SubGoals = []*Goal{}
	}

	return &g, nil
}

func (s *Service) Update(ctx context.Context, userID, id string, req UpdateGoalRequest) (*Goal, error) {
	if req.Title != nil {
		_, _ = s.db.Exec(ctx, `UPDATE goals SET title = $1 WHERE id = $2 AND user_id = $3`, *req.Title, id, userID)
	}
	if req.Description != nil {
		_, _ = s.db.Exec(ctx, `UPDATE goals SET description = $1 WHERE id = $2 AND user_id = $3`, *req.Description, id, userID)
	}
	if req.Category != nil {
		_, _ = s.db.Exec(ctx, `UPDATE goals SET category = $1 WHERE id = $2 AND user_id = $3`, *req.Category, id, userID)
	}
	if req.CurrentValue != nil {
		_, _ = s.db.Exec(ctx, `UPDATE goals SET current_value = $1 WHERE id = $2 AND user_id = $3`, *req.CurrentValue, id, userID)
	}
	if req.TargetValue != nil {
		_, _ = s.db.Exec(ctx, `UPDATE goals SET target_value = $1 WHERE id = $2 AND user_id = $3`, *req.TargetValue, id, userID)
	}
	if req.TargetDate != nil {
		_, _ = s.db.Exec(ctx, `UPDATE goals SET target_date = $1 WHERE id = $2 AND user_id = $3`, *req.TargetDate, id, userID)
	}
	if req.Status != nil {
		_, _ = s.db.Exec(ctx, `UPDATE goals SET status = $1 WHERE id = $2 AND user_id = $3`, *req.Status, id, userID)
	}
	return s.GetByID(ctx, userID, id)
}

func (s *Service) Delete(ctx context.Context, userID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM goals WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

func (s *Service) AddMetric(ctx context.Context, userID, goalID string, req AddMetricRequest) (*Metric, error) {
	var m Metric
	query := `
		INSERT INTO goal_metrics (goal_id, label, current_val, target_val, unit)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, goal_id, label, current_val, target_val, unit, updated_at`

	err := s.db.QueryRow(ctx, query, goalID, req.Label, req.CurrentVal, req.TargetVal, req.Unit).Scan(
		&m.ID, &m.GoalID, &m.Label, &m.CurrentVal, &m.TargetVal, &m.Unit, &m.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("add metric: %w", err)
	}
	return &m, nil
}

func calculateProgress(target, current *float64) float64 {
	if target == nil || *target <= 0 || current == nil {
		return 0.0
	}
	pct := (*current / *target) * 100.0
	if pct > 100.0 {
		return 100.0
	}
	if pct < 0.0 {
		return 0.0
	}
	return pct
}

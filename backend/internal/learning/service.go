package learning

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type Session struct {
	ID           uuid.UUID  `json:"id"`
	UserID       uuid.UUID  `json:"userId"`
	Topic        string     `json:"topic"`
	Category     *string    `json:"category,omitempty"`
	DurationSecs int        `json:"durationSecs"`
	StartedAt    time.Time  `json:"startedAt"`
	EndedAt      *time.Time `json:"endedAt,omitempty"`
	ProjectID    *uuid.UUID `json:"projectId,omitempty"`
	ProjectName  *string    `json:"projectName,omitempty"`
	Notes        *string    `json:"notes,omitempty"`
	KeyTakeaway  *string    `json:"keyTakeaway,omitempty"`
	SessionDate  string     `json:"sessionDate"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

type CreateSessionRequest struct {
	Topic        string     `json:"topic" binding:"required"`
	Category     *string    `json:"category"`
	DurationSecs int        `json:"durationSecs" binding:"required,gt=0"`
	StartedAt    *time.Time `json:"startedAt"`
	EndedAt      *time.Time `json:"endedAt"`
	ProjectID    *string    `json:"projectId"`
	ProjectName  *string    `json:"projectName"`
	Notes        *string    `json:"notes"`
	KeyTakeaway  *string    `json:"keyTakeaway"`
	SessionDate  *string    `json:"sessionDate"`
}

type UpdateSessionRequest struct {
	Topic        *string `json:"topic"`
	Category     *string `json:"category"`
	DurationSecs *int    `json:"durationSecs"`
	Notes        *string `json:"notes"`
	KeyTakeaway  *string `json:"keyTakeaway"`
}

type ListParams struct {
	Category  string
	StartDate string
	EndDate   string
	Limit     int
	Offset    int
}

type Summary struct {
	TotalSessions int                 `json:"totalSessions"`
	TotalHours    float64             `json:"totalHours"`
	TopTopics     []TopicBreakdown    `json:"topTopics"`
}

type TopicBreakdown struct {
	Topic      string  `json:"topic"`
	TotalSecs  int     `json:"totalSecs"`
	Sessions   int     `json:"sessions"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) Create(ctx context.Context, userID string, req CreateSessionRequest) (*Session, error) {
	startedAt := time.Now()
	if req.StartedAt != nil {
		startedAt = *req.StartedAt
	}

	sessionDate := startedAt.Format("2006-01-02")
	if req.SessionDate != nil && *req.SessionDate != "" {
		sessionDate = *req.SessionDate
	}

	var sess Session
	query := `
		INSERT INTO learning_sessions (
			user_id, topic, category, duration_secs, started_at, ended_at,
			project_id, project_name, notes, key_takeaway, session_date
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, user_id, topic, category, duration_secs, started_at, ended_at,
		          project_id, project_name, notes, key_takeaway, to_char(session_date, 'YYYY-MM-DD'),
		          created_at, updated_at`

	err := s.db.QueryRow(ctx, query,
		userID, req.Topic, req.Category, req.DurationSecs, startedAt, req.EndedAt,
		req.ProjectID, req.ProjectName, req.Notes, req.KeyTakeaway, sessionDate,
	).Scan(
		&sess.ID, &sess.UserID, &sess.Topic, &sess.Category, &sess.DurationSecs, &sess.StartedAt, &sess.EndedAt,
		&sess.ProjectID, &sess.ProjectName, &sess.Notes, &sess.KeyTakeaway, &sess.SessionDate,
		&sess.CreatedAt, &sess.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create learning session: %w", err)
	}
	return &sess, nil
}

func (s *Service) List(ctx context.Context, userID string, p ListParams) ([]*Session, int, error) {
	if p.Limit <= 0 {
		p.Limit = 50
	}

	query := `
		SELECT id, user_id, topic, category, duration_secs, started_at, ended_at,
		       project_id, project_name, notes, key_takeaway, to_char(session_date, 'YYYY-MM-DD'),
		       created_at, updated_at
		FROM learning_sessions
		WHERE user_id = $1`
	args := []interface{}{userID}
	n := 2

	if p.Category != "" {
		query += fmt.Sprintf(" AND category = $%d", n)
		args = append(args, p.Category)
		n++
	}
	if p.StartDate != "" {
		query += fmt.Sprintf(" AND session_date >= $%d", n)
		args = append(args, p.StartDate)
		n++
	}
	if p.EndDate != "" {
		query += fmt.Sprintf(" AND session_date <= $%d", n)
		args = append(args, p.EndDate)
		n++
	}

	query += fmt.Sprintf(" ORDER BY session_date DESC, started_at DESC LIMIT $%d OFFSET $%d", n, n+1)
	args = append(args, p.Limit, p.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var sessions []*Session
	for rows.Next() {
		var sess Session
		if err := rows.Scan(
			&sess.ID, &sess.UserID, &sess.Topic, &sess.Category, &sess.DurationSecs, &sess.StartedAt, &sess.EndedAt,
			&sess.ProjectID, &sess.ProjectName, &sess.Notes, &sess.KeyTakeaway, &sess.SessionDate,
			&sess.CreatedAt, &sess.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		sessions = append(sessions, &sess)
	}

	var total int
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM learning_sessions WHERE user_id = $1`, userID).Scan(&total)

	if sessions == nil {
		sessions = []*Session{}
	}
	return sessions, total, nil
}

func (s *Service) GetByID(ctx context.Context, userID, id string) (*Session, error) {
	var sess Session
	query := `
		SELECT id, user_id, topic, category, duration_secs, started_at, ended_at,
		       project_id, project_name, notes, key_takeaway, to_char(session_date, 'YYYY-MM-DD'),
		       created_at, updated_at
		FROM learning_sessions WHERE id = $1 AND user_id = $2`

	err := s.db.QueryRow(ctx, query, id, userID).Scan(
		&sess.ID, &sess.UserID, &sess.Topic, &sess.Category, &sess.DurationSecs, &sess.StartedAt, &sess.EndedAt,
		&sess.ProjectID, &sess.ProjectName, &sess.Notes, &sess.KeyTakeaway, &sess.SessionDate,
		&sess.CreatedAt, &sess.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("not found")
	}
	return &sess, nil
}

func (s *Service) Update(ctx context.Context, userID, id string, req UpdateSessionRequest) (*Session, error) {
	if req.Topic != nil {
		_, _ = s.db.Exec(ctx, `UPDATE learning_sessions SET topic = $1 WHERE id = $2 AND user_id = $3`, *req.Topic, id, userID)
	}
	if req.Category != nil {
		_, _ = s.db.Exec(ctx, `UPDATE learning_sessions SET category = $1 WHERE id = $2 AND user_id = $3`, *req.Category, id, userID)
	}
	if req.DurationSecs != nil {
		_, _ = s.db.Exec(ctx, `UPDATE learning_sessions SET duration_secs = $1 WHERE id = $2 AND user_id = $3`, *req.DurationSecs, id, userID)
	}
	if req.Notes != nil {
		_, _ = s.db.Exec(ctx, `UPDATE learning_sessions SET notes = $1 WHERE id = $2 AND user_id = $3`, *req.Notes, id, userID)
	}
	if req.KeyTakeaway != nil {
		_, _ = s.db.Exec(ctx, `UPDATE learning_sessions SET key_takeaway = $1 WHERE id = $2 AND user_id = $3`, *req.KeyTakeaway, id, userID)
	}
	return s.GetByID(ctx, userID, id)
}

func (s *Service) Delete(ctx context.Context, userID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM learning_sessions WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

func (s *Service) GetSummary(ctx context.Context, userID string) (*Summary, error) {
	summary := &Summary{
		TopTopics: []TopicBreakdown{},
	}

	var totalSecs int
	_ = s.db.QueryRow(ctx,
		`SELECT COUNT(*), COALESCE(SUM(duration_secs), 0)
		 FROM learning_sessions WHERE user_id = $1`,
		userID,
	).Scan(&summary.TotalSessions, &totalSecs)
	summary.TotalHours = float64(totalSecs) / 3600.0

	rows, err := s.db.Query(ctx,
		`SELECT topic, SUM(duration_secs) as total_secs, COUNT(*) as count
		 FROM learning_sessions
		 WHERE user_id = $1
		 GROUP BY topic
		 ORDER BY total_secs DESC
		 LIMIT 5`,
		userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var tb TopicBreakdown
			_ = rows.Scan(&tb.Topic, &tb.TotalSecs, &tb.Sessions)
			summary.TopTopics = append(summary.TopTopics, tb)
		}
	}

	return summary, nil
}

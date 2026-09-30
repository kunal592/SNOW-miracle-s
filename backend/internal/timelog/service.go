package timelog

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type Entry struct {
	ID           uuid.UUID  `json:"id"`
	UserID       uuid.UUID  `json:"userId"`
	Activity     string     `json:"activity"`
	Category     string     `json:"category"`
	StartTime    time.Time  `json:"startTime"`
	EndTime      *time.Time `json:"endTime,omitempty"`
	DurationSecs *int       `json:"durationSecs,omitempty"`
	IsDeepWork   bool       `json:"isDeepWork"`
	Notes        *string    `json:"notes,omitempty"`
	ProjectID    *uuid.UUID `json:"projectId,omitempty"`
	EntryDate    string     `json:"entryDate"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

type CreateEntryRequest struct {
	Activity   string     `json:"activity" binding:"required"`
	Category   string     `json:"category"`
	StartTime  *time.Time `json:"startTime"`
	EndTime    *time.Time `json:"endTime"`
	IsDeepWork bool       `json:"isDeepWork"`
	Notes      *string    `json:"notes"`
	ProjectID  *string    `json:"projectId"`
	EntryDate  *string    `json:"entryDate"`
}

type UpdateEntryRequest struct {
	Activity   *string    `json:"activity"`
	Category   *string    `json:"category"`
	EndTime    *time.Time `json:"endTime"`
	IsDeepWork *bool      `json:"isDeepWork"`
	Notes      *string    `json:"notes"`
}

type ListParams struct {
	Date      string
	StartDate string
	EndDate   string
	Category  string
	Limit     int
	Offset    int
}

type DailySummary struct {
	Date          string             `json:"date"`
	TotalSecs     int                `json:"totalSecs"`
	DeepWorkSecs  int                `json:"deepWorkSecs"`
	ByCategory    []CategoryBreakdown`json:"byCategory"`
}

type CategoryBreakdown struct {
	Category   string `json:"category"`
	TotalSecs  int    `json:"totalSecs"`
	Percentage float64`json:"percentage"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) Create(ctx context.Context, userID string, req CreateEntryRequest) (*Entry, error) {
	category := req.Category
	if category == "" {
		category = "Other"
	}

	startTime := time.Now()
	if req.StartTime != nil {
		startTime = *req.StartTime
	}

	entryDate := startTime.Format("2006-01-02")
	if req.EntryDate != nil && *req.EntryDate != "" {
		entryDate = *req.EntryDate
	}

	var entry Entry
	query := `
		INSERT INTO time_entries (
			user_id, activity, category, start_time, end_time, is_deep_work, notes, project_id, entry_date
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, user_id, activity, category, start_time, end_time, duration_secs,
		          is_deep_work, notes, project_id, to_char(entry_date, 'YYYY-MM-DD'), created_at, updated_at`

	err := s.db.QueryRow(ctx, query,
		userID, req.Activity, category, startTime, req.EndTime, req.IsDeepWork, req.Notes, req.ProjectID, entryDate,
	).Scan(
		&entry.ID, &entry.UserID, &entry.Activity, &entry.Category, &entry.StartTime, &entry.EndTime,
		&entry.DurationSecs, &entry.IsDeepWork, &entry.Notes, &entry.ProjectID, &entry.EntryDate,
		&entry.CreatedAt, &entry.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create time entry: %w", err)
	}
	return &entry, nil
}

// StopTimer sets end_time on the currently running entry
func (s *Service) StopTimer(ctx context.Context, userID, id string) (*Entry, error) {
	now := time.Now()
	query := `
		UPDATE time_entries
		SET end_time = $1
		WHERE id = $2 AND user_id = $3 AND end_time IS NULL
		RETURNING id, user_id, activity, category, start_time, end_time, duration_secs,
		          is_deep_work, notes, project_id, to_char(entry_date, 'YYYY-MM-DD'), created_at, updated_at`

	var entry Entry
	err := s.db.QueryRow(ctx, query, now, id, userID).Scan(
		&entry.ID, &entry.UserID, &entry.Activity, &entry.Category, &entry.StartTime, &entry.EndTime,
		&entry.DurationSecs, &entry.IsDeepWork, &entry.Notes, &entry.ProjectID, &entry.EntryDate,
		&entry.CreatedAt, &entry.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("active timer not found or already stopped")
	}
	return &entry, nil
}

// GetActiveTimer returns the currently running entry if any
func (s *Service) GetActiveTimer(ctx context.Context, userID string) (*Entry, error) {
	var entry Entry
	query := `
		SELECT id, user_id, activity, category, start_time, end_time, duration_secs,
		       is_deep_work, notes, project_id, to_char(entry_date, 'YYYY-MM-DD'), created_at, updated_at
		FROM time_entries
		WHERE user_id = $1 AND end_time IS NULL
		ORDER BY start_time DESC LIMIT 1`

	err := s.db.QueryRow(ctx, query, userID).Scan(
		&entry.ID, &entry.UserID, &entry.Activity, &entry.Category, &entry.StartTime, &entry.EndTime,
		&entry.DurationSecs, &entry.IsDeepWork, &entry.Notes, &entry.ProjectID, &entry.EntryDate,
		&entry.CreatedAt, &entry.UpdatedAt,
	)
	if err != nil {
		return nil, nil // No active timer
	}
	return &entry, nil
}

// List returns entries with filtering
func (s *Service) List(ctx context.Context, userID string, p ListParams) ([]*Entry, int, error) {
	if p.Limit <= 0 {
		p.Limit = 50
	}

	query := `
		SELECT id, user_id, activity, category, start_time, end_time, duration_secs,
		       is_deep_work, notes, project_id, to_char(entry_date, 'YYYY-MM-DD'), created_at, updated_at
		FROM time_entries
		WHERE user_id = $1`
	args := []interface{}{userID}
	n := 2

	if p.Date != "" {
		query += fmt.Sprintf(" AND entry_date = $%d", n)
		args = append(args, p.Date)
		n++
	}
	if p.StartDate != "" {
		query += fmt.Sprintf(" AND entry_date >= $%d", n)
		args = append(args, p.StartDate)
		n++
	}
	if p.EndDate != "" {
		query += fmt.Sprintf(" AND entry_date <= $%d", n)
		args = append(args, p.EndDate)
		n++
	}
	if p.Category != "" {
		query += fmt.Sprintf(" AND category = $%d", n)
		args = append(args, p.Category)
		n++
	}

	query += fmt.Sprintf(" ORDER BY start_time DESC LIMIT $%d OFFSET $%d", n, n+1)
	args = append(args, p.Limit, p.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var entries []*Entry
	for rows.Next() {
		var e Entry
		if err := rows.Scan(
			&e.ID, &e.UserID, &e.Activity, &e.Category, &e.StartTime, &e.EndTime,
			&e.DurationSecs, &e.IsDeepWork, &e.Notes, &e.ProjectID, &e.EntryDate,
			&e.CreatedAt, &e.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		entries = append(entries, &e)
	}

	var total int
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM time_entries WHERE user_id = $1`, userID).Scan(&total)

	if entries == nil {
		entries = []*Entry{}
	}
	return entries, total, nil
}

// GetByID
func (s *Service) GetByID(ctx context.Context, userID, id string) (*Entry, error) {
	var e Entry
	query := `
		SELECT id, user_id, activity, category, start_time, end_time, duration_secs,
		       is_deep_work, notes, project_id, to_char(entry_date, 'YYYY-MM-DD'), created_at, updated_at
		FROM time_entries WHERE id = $1 AND user_id = $2`

	err := s.db.QueryRow(ctx, query, id, userID).Scan(
		&e.ID, &e.UserID, &e.Activity, &e.Category, &e.StartTime, &e.EndTime,
		&e.DurationSecs, &e.IsDeepWork, &e.Notes, &e.ProjectID, &e.EntryDate,
		&e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("not found")
	}
	return &e, nil
}

// Update
func (s *Service) Update(ctx context.Context, userID, id string, req UpdateEntryRequest) (*Entry, error) {
	if req.Activity != nil {
		_, _ = s.db.Exec(ctx, `UPDATE time_entries SET activity = $1 WHERE id = $2 AND user_id = $3`, *req.Activity, id, userID)
	}
	if req.Category != nil {
		_, _ = s.db.Exec(ctx, `UPDATE time_entries SET category = $1 WHERE id = $2 AND user_id = $3`, *req.Category, id, userID)
	}
	if req.EndTime != nil {
		_, _ = s.db.Exec(ctx, `UPDATE time_entries SET end_time = $1 WHERE id = $2 AND user_id = $3`, *req.EndTime, id, userID)
	}
	if req.IsDeepWork != nil {
		_, _ = s.db.Exec(ctx, `UPDATE time_entries SET is_deep_work = $1 WHERE id = $2 AND user_id = $3`, *req.IsDeepWork, id, userID)
	}
	if req.Notes != nil {
		_, _ = s.db.Exec(ctx, `UPDATE time_entries SET notes = $1 WHERE id = $2 AND user_id = $3`, *req.Notes, id, userID)
	}
	return s.GetByID(ctx, userID, id)
}

// Delete
func (s *Service) Delete(ctx context.Context, userID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM time_entries WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

// GetDailySummary
func (s *Service) GetDailySummary(ctx context.Context, userID, date string) (*DailySummary, error) {
	summary := &DailySummary{
		Date:       date,
		ByCategory: []CategoryBreakdown{},
	}

	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_secs), 0),
		        COALESCE(SUM(CASE WHEN is_deep_work THEN duration_secs ELSE 0 END), 0)
		 FROM time_entries
		 WHERE user_id = $1 AND entry_date = $2`,
		userID, date,
	).Scan(&summary.TotalSecs, &summary.DeepWorkSecs)

	rows, err := s.db.Query(ctx,
		`SELECT category, COALESCE(SUM(duration_secs), 0)
		 FROM time_entries
		 WHERE user_id = $1 AND entry_date = $2
		 GROUP BY category ORDER BY SUM(duration_secs) DESC`,
		userID, date,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var cb CategoryBreakdown
			_ = rows.Scan(&cb.Category, &cb.TotalSecs)
			if summary.TotalSecs > 0 {
				cb.Percentage = (float64(cb.TotalSecs) / float64(summary.TotalSecs)) * 100
			}
			summary.ByCategory = append(summary.ByCategory, cb)
		}
	}

	return summary, nil
}

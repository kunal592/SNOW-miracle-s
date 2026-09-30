package inbox

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type Entry struct {
	ID          uuid.UUID  `json:"id"`
	UserID      uuid.UUID  `json:"userId"`
	RawText     string     `json:"rawText"`
	Source      string     `json:"source"`
	Status      string     `json:"status"`
	Tags        []string   `json:"tags"`
	AudioURL    *string    `json:"audioUrl,omitempty"`
	ImageURL    *string    `json:"imageUrl,omitempty"`
	ProcessedAt *time.Time `json:"processedAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type CreateEntryRequest struct {
	RawText  string   `json:"rawText" binding:"required,min=1"`
	Source   string   `json:"source"`
	Tags     []string `json:"tags"`
	AudioURL *string  `json:"audioUrl"`
	ImageURL *string  `json:"imageUrl"`
}

type UpdateEntryRequest struct {
	RawText *string  `json:"rawText"`
	Status  *string  `json:"status"`
	Tags    []string `json:"tags"`
}

type ListParams struct {
	Status string
	Limit  int
	Offset int
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) Create(ctx context.Context, userID string, req CreateEntryRequest) (*Entry, error) {
	source := req.Source
	validSources := map[string]bool{"manual": true, "voice": true, "import": true, "api": true}
	if !validSources[source] {
		source = "manual"
	}
	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	var e Entry
	err := s.db.QueryRow(ctx,
		`INSERT INTO inbox_entries (user_id, raw_text, source, tags, audio_url, image_url)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, user_id, raw_text, source, status, tags, audio_url, image_url, processed_at, created_at, updated_at`,
		userID, req.RawText, source, tags, req.AudioURL, req.ImageURL,
	).Scan(&e.ID, &e.UserID, &e.RawText, &e.Source, &e.Status, &e.Tags,
		&e.AudioURL, &e.ImageURL, &e.ProcessedAt, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("create inbox entry: %w", err)
	}
	return &e, nil
}

func (s *Service) List(ctx context.Context, userID string, p ListParams) ([]*Entry, int, error) {
	if p.Limit <= 0 {
		p.Limit = 50
	}
	if p.Limit > 200 {
		p.Limit = 200
	}

	query := `SELECT id, user_id, raw_text, source, status, tags, audio_url, image_url, processed_at, created_at, updated_at
	          FROM inbox_entries WHERE user_id = $1`
	args := []interface{}{userID}
	n := 2

	if p.Status != "" {
		query += fmt.Sprintf(" AND status = $%d", n)
		args = append(args, p.Status)
		n++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", n, n+1)
	args = append(args, p.Limit, p.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var entries []*Entry
	for rows.Next() {
		var e Entry
		if err := rows.Scan(&e.ID, &e.UserID, &e.RawText, &e.Source, &e.Status, &e.Tags,
			&e.AudioURL, &e.ImageURL, &e.ProcessedAt, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, 0, err
		}
		entries = append(entries, &e)
	}

	// Count
	var total int
	countQ := `SELECT COUNT(*) FROM inbox_entries WHERE user_id = $1`
	countArgs := []interface{}{userID}
	if p.Status != "" {
		countQ += " AND status = $2"
		countArgs = append(countArgs, p.Status)
	}
	_ = s.db.QueryRow(ctx, countQ, countArgs...).Scan(&total)

	if entries == nil {
		entries = []*Entry{}
	}
	return entries, total, nil
}

func (s *Service) GetByID(ctx context.Context, userID, id string) (*Entry, error) {
	var e Entry
	err := s.db.QueryRow(ctx,
		`SELECT id, user_id, raw_text, source, status, tags, audio_url, image_url, processed_at, created_at, updated_at
		 FROM inbox_entries WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(&e.ID, &e.UserID, &e.RawText, &e.Source, &e.Status, &e.Tags,
		&e.AudioURL, &e.ImageURL, &e.ProcessedAt, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("not found: %w", err)
	}
	return &e, nil
}

func (s *Service) Update(ctx context.Context, userID, id string, req UpdateEntryRequest) (*Entry, error) {
	if req.RawText != nil {
		_, err := s.db.Exec(ctx, `UPDATE inbox_entries SET raw_text = $1 WHERE id = $2 AND user_id = $3`, *req.RawText, id, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.Status != nil {
		now := time.Now()
		var processedAt *time.Time
		if *req.Status == "approved" || *req.Status == "rejected" {
			processedAt = &now
		}
		_, err := s.db.Exec(ctx, `UPDATE inbox_entries SET status = $1, processed_at = $2 WHERE id = $3 AND user_id = $4`,
			*req.Status, processedAt, id, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.Tags != nil {
		_, err := s.db.Exec(ctx, `UPDATE inbox_entries SET tags = $1 WHERE id = $2 AND user_id = $3`, req.Tags, id, userID)
		if err != nil {
			return nil, err
		}
	}
	return s.GetByID(ctx, userID, id)
}

func (s *Service) Delete(ctx context.Context, userID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM inbox_entries WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

// MarkProcessed marks an entry as processed with a given status
func (s *Service) MarkProcessed(ctx context.Context, userID, id, status string) (*Entry, error) {
	now := time.Now()
	_, err := s.db.Exec(ctx,
		`UPDATE inbox_entries SET status = $1, processed_at = $2 WHERE id = $3 AND user_id = $4`,
		status, now, id, userID)
	if err != nil {
		return nil, err
	}
	return s.GetByID(ctx, userID, id)
}

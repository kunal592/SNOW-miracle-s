package importer

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type CandidateData struct {
	Goals       []CandidateGoal      `json:"goals"`
	Expenses    []CandidateExpense   `json:"expenses"`
	Milestones  []CandidateMilestone `json:"milestones"`
	TimeEntries []CandidateTimeEntry `json:"timeEntries"`
}

type CandidateGoal struct {
	Title      string   `json:"title"`
	Category   string   `json:"category"`
	TargetDate string   `json:"targetDate"`
	TargetVal  *float64 `json:"targetVal,omitempty"`
	Unit       *string  `json:"unit,omitempty"`
}

type CandidateExpense struct {
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	ExpenseDate string  `json:"expenseDate"`
}

type CandidateMilestone struct {
	Title         string `json:"title"`
	MilestoneType string `json:"milestoneType"`
	DueAt         string `json:"dueAt"`
}

type CandidateTimeEntry struct {
	Activity   string `json:"activity"`
	DurationM  int    `json:"durationM"`
	IsDeepWork bool   `json:"isDeepWork"`
	EntryDate  string `json:"entryDate"`
}

type Conflict struct {
	Type           string   `json:"type"` // "potential_conflict", "duplicate"
	EntityType     string   `json:"entityType"`
	ExistingID     string   `json:"existingId"`
	ExistingTitle  string   `json:"existing"`
	ImportedTitle  string   `json:"imported"`
	ActionRequired bool     `json:"actionRequired"`
	Options        []string `json:"options"` // ["keep_existing", "use_imported", "keep_both"]
}

type ImportRecord struct {
	ID            uuid.UUID     `json:"id"`
	UserID        uuid.UUID     `json:"userId"`
	Source        string        `json:"source"`
	RawContent    string        `json:"rawContent"`
	ExtractedData CandidateData `json:"extractedData"`
	Conflicts     []Conflict    `json:"conflicts"`
	Status        string        `json:"status"`
	AppliedAt     *time.Time    `json:"appliedAt,omitempty"`
	CreatedAt     time.Time     `json:"createdAt"`
	UpdatedAt     time.Time     `json:"updatedAt"`
}

type ParseRequest struct {
	RawContent string `json:"rawContent" binding:"required"`
	Source     string `json:"source"`
}

type ApplyRequest struct {
	Resolutions map[string]string `json:"resolutions"` // map of importedTitle -> option ("keep_existing" / "use_imported" / "keep_both")
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// ParseChatGPTContent extracts structured items from markdown / text / json
func (s *Service) ParseChatGPTContent(ctx context.Context, userID, rawContent, source string) (*ImportRecord, error) {
	if source == "" {
		source = "chatgpt"
	}

	candidates := CandidateData{
		Goals:       []CandidateGoal{},
		Expenses:    []CandidateExpense{},
		Milestones:  []CandidateMilestone{},
		TimeEntries: []CandidateTimeEntry{},
	}

	// 1. Try parsing directly as JSON if provided in JSON structure
	var directJSON CandidateData
	trimmed := strings.TrimSpace(rawContent)
	if strings.HasPrefix(trimmed, "{") && json.Unmarshal([]byte(trimmed), &directJSON) == nil {
		candidates = directJSON
	} else {
		// Heuristic regex parsing across text lines
		s.extractFromText(rawContent, &candidates)
	}

	// 2. Conflict detection against existing goals
	conflicts := s.detectConflicts(ctx, userID, candidates)

	// 3. Save to imports table
	extractedJSON, _ := json.Marshal(candidates)
	conflictsJSON, _ := json.Marshal(conflicts)

	var rec ImportRecord
	query := `
		INSERT INTO imports (user_id, source, raw_content, extracted_data, conflicts, status)
		VALUES ($1, $2, $3, $4, $5, 'reviewed')
		RETURNING id, user_id, source, raw_content, status, created_at, updated_at`

	err := s.db.QueryRow(ctx, query, userID, source, rawContent, extractedJSON, conflictsJSON).Scan(
		&rec.ID, &rec.UserID, &rec.Source, &rec.RawContent, &rec.Status, &rec.CreatedAt, &rec.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create import record: %w", err)
	}

	rec.ExtractedData = candidates
	rec.Conflicts = conflicts
	return &rec, nil
}

func (s *Service) extractFromText(text string, c *CandidateData) {
	lines := strings.Split(text, "\n")
	today := time.Now().Format("2006-01-02")
	targetDefault := time.Now().AddDate(0, 3, 0).Format("2006-01-02")

	// Regex patterns
	// Goal patterns: "Goal: Learn Go", "1. Goal - Run a marathon"
	goalRe := regexp.MustCompile(`(?i)(?:goal|target):\s*(.+)`)
	// Expense patterns: "₹500 for groceries", "Spent 1200 on books", "Expense: 450 dinner"
	expRe := regexp.MustCompile(`(?i)(?:spent|expense|paid|cost)?\s*(?:₹|rs\.?|inr|\$)?\s*(\d+(?:\.\d+)?)\s*(?:on|for|:|-)?\s*(.+)`)
	// Milestone patterns: "Milestone: Launch Beta by 2026-12-01"
	mileRe := regexp.MustCompile(`(?i)(?:milestone|checkpoint):\s*(.+)`)
	// Time patterns: "Worked 3 hours on Go", "2h deep work on API"
	timeRe := regexp.MustCompile(`(?i)(?:worked|logged|time)?\s*(\d+(?:\.\d+)?)\s*(?:h|hrs|hours|m|mins)\s*(?:on|for)?\s*(.+)`)

	for _, line := range lines {
		l := strings.TrimSpace(line)
		if len(l) < 3 {
			continue
		}

		if m := goalRe.FindStringSubmatch(l); len(m) > 1 {
			title := cleanTitle(m[1])
			c.Goals = append(c.Goals, CandidateGoal{
				Title:      title,
				Category:   "Skills",
				TargetDate: targetDefault,
			})
			continue
		}

		if m := mileRe.FindStringSubmatch(l); len(m) > 1 {
			title := cleanTitle(m[1])
			c.Milestones = append(c.Milestones, CandidateMilestone{
				Title:         title,
				MilestoneType: "Checkpoint",
				DueAt:         time.Now().AddDate(0, 1, 0).Format(time.RFC3339),
			})
			continue
		}

		if m := expRe.FindStringSubmatch(l); len(m) > 2 {
			amt, err := strconv.ParseFloat(m[1], 64)
			desc := cleanTitle(m[2])
			if err == nil && amt > 0 && len(desc) > 1 && !strings.Contains(strings.ToLower(desc), "hours") {
				c.Expenses = append(c.Expenses, CandidateExpense{
					Amount:      amt,
					Description: desc,
					Category:    "Other",
					ExpenseDate: today,
				})
				continue
			}
		}

		if m := timeRe.FindStringSubmatch(l); len(m) > 2 {
			dur, err := strconv.ParseFloat(m[1], 64)
			act := cleanTitle(m[2])
			if err == nil && dur > 0 && len(act) > 1 {
				mins := int(dur * 60)
				c.TimeEntries = append(c.TimeEntries, CandidateTimeEntry{
					Activity:   act,
					DurationM:  mins,
					IsDeepWork: strings.Contains(strings.ToLower(l), "deep"),
					EntryDate:  today,
				})
				continue
			}
		}
	}
}

func (s *Service) detectConflicts(ctx context.Context, userID string, candidates CandidateData) []Conflict {
	conflicts := []Conflict{}

	// Check goals against existing goals in DB
	rows, err := s.db.Query(ctx, `SELECT id, title FROM goals WHERE user_id = $1`, userID)
	if err == nil {
		defer rows.Close()
		existingGoals := make(map[string]string)
		for rows.Next() {
			var id, title string
			if err := rows.Scan(&id, &title); err == nil {
				existingGoals[strings.ToLower(strings.TrimSpace(title))] = id
			}
		}

		for _, cg := range candidates.Goals {
			normTitle := strings.ToLower(strings.TrimSpace(cg.Title))
			for exTitle, exID := range existingGoals {
				if normTitle == exTitle || strings.Contains(normTitle, exTitle) || strings.Contains(exTitle, normTitle) {
					conflicts = append(conflicts, Conflict{
						Type:           "potential_conflict",
						EntityType:     "goal",
						ExistingID:     exID,
						ExistingTitle:  exTitle,
						ImportedTitle:  cg.Title,
						ActionRequired: true,
						Options:        []string{"keep_existing", "use_imported", "keep_both"},
					})
				}
			}
		}
	}

	return conflicts
}

func cleanTitle(s string) string {
	s = strings.TrimLeft(s, "*-•#1234567890. ")
	return strings.TrimSpace(s)
}

// ApplyImport executes candidate records into database
func (s *Service) ApplyImport(ctx context.Context, userID, importID string, req ApplyRequest) (map[string]int, error) {
	var extractedJSON []byte
	var status string
	err := s.db.QueryRow(ctx,
		`SELECT extracted_data, status FROM imports WHERE id = $1 AND user_id = $2`,
		importID, userID,
	).Scan(&extractedJSON, &status)
	if err != nil {
		return nil, fmt.Errorf("import record not found")
	}

	if status == "applied" {
		return nil, fmt.Errorf("import has already been applied")
	}

	var candidates CandidateData
	if err := json.Unmarshal(extractedJSON, &candidates); err != nil {
		return nil, fmt.Errorf("corrupt extracted data")
	}

	counts := map[string]int{
		"goals":       0,
		"expenses":    0,
		"milestones":  0,
		"timeEntries": 0,
	}

	today := time.Now().Format("2006-01-02")

	// 1. Commit Goals
	for _, g := range candidates.Goals {
		action := req.Resolutions[g.Title]
		if action == "keep_existing" {
			continue
		}

		targetDate := g.TargetDate
		if targetDate == "" {
			targetDate = time.Now().AddDate(0, 3, 0).Format("2006-01-02")
		}
		category := g.Category
		if category == "" {
			category = "Skills"
		}

		_, err := s.db.Exec(ctx,
			`INSERT INTO goals (user_id, title, category, start_date, target_date, status)
			 VALUES ($1, $2, $3, $4, $5, 'Not Started')`,
			userID, g.Title, category, today, targetDate,
		)
		if err == nil {
			counts["goals"]++
		}
	}

	// 2. Commit Expenses
	for _, e := range candidates.Expenses {
		expDate := e.ExpenseDate
		if expDate == "" {
			expDate = today
		}
		_, err := s.db.Exec(ctx,
			`INSERT INTO expenses (user_id, amount, description, expense_date, source)
			 VALUES ($1, $2, $3, $4, 'chatgpt_import')`,
			userID, e.Amount, e.Description, expDate,
		)
		if err == nil {
			counts["expenses"]++
		}
	}

	// 3. Commit Milestones
	for _, m := range candidates.Milestones {
		dueAt := m.DueAt
		if dueAt == "" {
			dueAt = time.Now().AddDate(0, 1, 0).Format(time.RFC3339)
		}
		mType := m.MilestoneType
		if mType == "" {
			mType = "Checkpoint"
		}
		_, err := s.db.Exec(ctx,
			`INSERT INTO milestones (user_id, title, milestone_type, due_at, status)
			 VALUES ($1, $2, $3, $4, 'Upcoming')`,
			userID, m.Title, mType, dueAt,
		)
		if err == nil {
			counts["milestones"]++
		}
	}

	// 4. Commit Time Entries
	for _, t := range candidates.TimeEntries {
		entryDate := t.EntryDate
		if entryDate == "" {
			entryDate = today
		}
		start := time.Now().Add(-time.Duration(t.DurationM) * time.Minute)
		now := time.Now()
		_, err := s.db.Exec(ctx,
			`INSERT INTO time_entries (user_id, activity, start_time, end_time, is_deep_work, entry_date)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			userID, t.Activity, start, now, t.IsDeepWork, entryDate,
		)
		if err == nil {
			counts["timeEntries"]++
		}
	}

	// Mark import record as applied
	_, _ = s.db.Exec(ctx,
		`UPDATE imports SET status = 'applied', applied_at = NOW() WHERE id = $1`,
		importID,
	)

	return counts, nil
}

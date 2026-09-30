package supervisor

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type Insight struct {
	ID               uuid.UUID        `json:"id"`
	UserID           uuid.UUID        `json:"userId"`
	Module           string           `json:"module"`
	Title            string           `json:"title"`
	Fact             string           `json:"fact"`
	Interpretation   string           `json:"interpretation"`
	Hypothesis       *string          `json:"hypothesis,omitempty"`
	Recommendation   *string          `json:"recommendation,omitempty"`
	Confidence       float64          `json:"confidence"`
	ConfidenceReason *string          `json:"confidenceReason,omitempty"`
	ConfidenceLevel  string           `json:"confidenceLevel"`
	UnderlyingData   []map[string]any `json:"underlyingData"`
	ExpiresAt        *time.Time       `json:"expiresAt,omitempty"`
	CreatedAt        time.Time        `json:"createdAt"`
}

type Memory struct {
	ID         uuid.UUID `json:"id"`
	UserID     uuid.UUID `json:"userId"`
	Category   string    `json:"category"`
	MemoryText string    `json:"memoryText"`
	Source     string    `json:"source"`
	Confidence *float64  `json:"confidence,omitempty"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateMemoryRequest struct {
	Category   string   `json:"category" binding:"required"`
	MemoryText string   `json:"memoryText" binding:"required"`
	Source     *string  `json:"source"`
	Confidence *float64 `json:"confidence"`
}

type ActivityLog struct {
	ID              uuid.UUID `json:"id"`
	UserID          uuid.UUID `json:"userId"`
	Action          string    `json:"action"`
	Module          *string   `json:"module,omitempty"`
	InputReference  *string   `json:"inputReference,omitempty"`
	OutputReference *string   `json:"outputReference,omitempty"`
	Model           *string   `json:"model,omitempty"`
	Details         *string   `json:"details,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
}

type Notification struct {
	ID               uuid.UUID  `json:"id"`
	UserID           uuid.UUID  `json:"userId"`
	Title            string     `json:"title"`
	Message          string     `json:"message"`
	NotificationType string     `json:"notificationType"`
	ActionRoute      *string    `json:"actionRoute,omitempty"`
	IsRead           bool       `json:"isRead"`
	ReadAt           *time.Time `json:"readAt,omitempty"`
	CreatedAt        time.Time  `json:"createdAt"`
}

type DailyBrief struct {
	Date                string     `json:"date"`
	Greeting            string     `json:"greeting"`
	TopPriorityToday    string     `json:"topPriorityToday"`
	KeyInsights         []*Insight `json:"keyInsights"`
	DeepWorkTargetHours float64    `json:"deepWorkTargetHours"`
	DailySpendAllowance float64    `json:"dailySpendAllowance"`
	ActiveWarnings      []string   `json:"activeWarnings"`
	RecommendedAction   string     `json:"recommendedAction"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// GenerateInsights analyzes current user metrics and creates truthful, data-backed insights
func (s *Service) GenerateInsights(ctx context.Context, userID string) ([]*Insight, error) {
	insights := []*Insight{}
	today := time.Now().Format("2006-01-02")

	// 1. Analyze Finance & Budget Velocity
	var monthlySpend, monthlyBudget float64
	now := time.Now()
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(amount), 0) FROM expenses
		 WHERE user_id = $1 AND EXTRACT(YEAR FROM expense_date) = $2 AND EXTRACT(MONTH FROM expense_date) = $3`,
		userID, now.Year(), int(now.Month()),
	).Scan(&monthlySpend)

	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(monthly_budget), 0) FROM expense_categories
		 WHERE user_id = $1 AND monthly_budget IS NOT NULL`,
		userID,
	).Scan(&monthlyBudget)

	if monthlyBudget > 0 {
		burnRate := (monthlySpend / monthlyBudget) * 100.0
		expectedRate := (float64(now.Day()) / 30.0) * 100.0

		var ins Insight
		ins.UserID = uuid.MustParse(userID)
		ins.Module = "Finance"
		ins.Confidence = 0.95
		ins.ConfidenceLevel = "High"
		reason := "Calculated directly from confirmed bank & cash expense ledger"
		ins.ConfidenceReason = &reason

		if burnRate > expectedRate+10.0 {
			ins.Title = "Spending velocity running ahead of monthly schedule"
			ins.Fact = fmt.Sprintf("Month-to-date spend is ₹%.2f (%.1f%% of budget) on day %d of the month.", monthlySpend, burnRate, now.Day())
			ins.Interpretation = "Direct capital outflow is outpacing the linear monthly distribution threshold."
			hypo := "Unplanned non-recurring purchases or upfront monthly allocations were logged early."
			ins.Hypothesis = &hypo
			rec := "Audit recent non-essential categories and pause discretionary spending for the next 48 hours."
			ins.Recommendation = &rec
		} else {
			ins.Title = "Capital allocation on track"
			ins.Fact = fmt.Sprintf("Spend is ₹%.2f of ₹%.2f monthly budget (%.1f%% utilized).", monthlySpend, monthlyBudget, burnRate)
			ins.Interpretation = "Monthly financial trajectory is aligned within expected variance."
			rec := "Maintain current procurement discipline."
			ins.Recommendation = &rec
		}

		evidence := []map[string]any{
			{"metric": "monthly_spend", "value": monthlySpend},
			{"metric": "monthly_budget", "value": monthlyBudget},
			{"metric": "burn_rate_pct", "value": burnRate},
		}
		saved, err := s.saveInsight(ctx, userID, ins, evidence)
		if err == nil {
			insights = append(insights, saved)
		}
	}

	// 2. Analyze Deep Work vs Sleep Correlation
	var avgSleep float64
	var totalDeepSecs int
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(AVG(sleep_hours), 0) FROM health_entries
		 WHERE user_id = $1 AND entry_date >= (NOW() - INTERVAL '7 days')::DATE`,
		userID,
	).Scan(&avgSleep)

	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_secs), 0) FROM time_entries
		 WHERE user_id = $1 AND is_deep_work = TRUE AND entry_date >= (NOW() - INTERVAL '7 days')::DATE`,
		userID,
	).Scan(&totalDeepSecs)

	if avgSleep > 0 {
		deepHours := float64(totalDeepSecs) / 3600.0
		var ins Insight
		ins.UserID = uuid.MustParse(userID)
		ins.Module = "Health"
		ins.Confidence = 0.90
		ins.ConfidenceLevel = "High"
		cReason := "Calculated across the past 7 days of synchronized sleep and time logs"
		ins.ConfidenceReason = &cReason

		ins.Title = "Circadian recovery and deep work alignment"
		ins.Fact = fmt.Sprintf("Average 7-day sleep is %.1f hours with %.1f total deep work hours logged.", avgSleep, deepHours)
		if avgSleep >= 7.0 {
			ins.Interpretation = "Optimal sleep foundation is actively buffering cognitive endurance for complex problem solving."
			rec := "Protect your evening wind-down window to keep deep work output consistent."
			ins.Recommendation = &rec
		} else {
			ins.Interpretation = "Sub-7 hour sleep baseline increases cognitive fatigue and reduces sustained deep work blocks."
			hypo := "Late screen time or irregular schedule may be compressing recovery duration."
			ins.Hypothesis = &hypo
			rec := "Shift sleep schedule forward by 45 minutes to restore neuro-attentional stamina."
			ins.Recommendation = &rec
		}

		evidence := []map[string]any{
			{"metric": "avg_sleep_7d", "value": avgSleep},
			{"metric": "deep_work_hours_7d", "value": deepHours},
		}
		saved, err := s.saveInsight(ctx, userID, ins, evidence)
		if err == nil {
			insights = append(insights, saved)
		}
	}

	// 3. Cognitive Skill Focus Area
	var lowestSkill string
	var lowestScore float64 = 999
	rows, err := s.db.Query(ctx,
		`SELECT skill, avg_reasoning_score FROM cognitive_skill_stats WHERE user_id = $1`,
		userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var sk string
			var sc float64
			if err := rows.Scan(&sk, &sc); err == nil {
				if sc < lowestScore {
					lowestScore = sc
					lowestSkill = sk
				}
			}
		}
	}

	if lowestSkill != "" {
		var ins Insight
		ins.UserID = uuid.MustParse(userID)
		ins.Module = "Cognitive"
		ins.Confidence = 0.88
		ins.ConfidenceLevel = "High"
		cReason := "Derived from Cognitive Lab attempts and formal reasoning scores"
		ins.ConfidenceReason = &cReason

		ins.Title = fmt.Sprintf("Target cognitive frontier: %s", lowestSkill)
		ins.Fact = fmt.Sprintf("Average reasoning score in %s is currently %.1f/100.", lowestSkill, lowestScore)
		ins.Interpretation = fmt.Sprintf("Performance in %s exhibits the highest margin for systematic training improvement.", lowestSkill)
		rec := fmt.Sprintf("Complete 1-2 focused challenges in %s during your next high-energy morning block.", lowestSkill)
		ins.Recommendation = &rec

		evidence := []map[string]any{
			{"metric": "skill", "value": lowestSkill},
			{"metric": "avg_reasoning_score", "value": lowestScore},
		}
		saved, err := s.saveInsight(ctx, userID, ins, evidence)
		if err == nil {
			insights = append(insights, saved)
		}
	}

	// Record AI activity audit
	s.LogActivity(ctx, userID, "generate_insights", "supervisor", "metrics_aggregation", fmt.Sprintf("Generated %d insights", len(insights)), "winter-arc-supervisor-v1", "Deterministic mathematical pattern extraction")

	_ = today
	return insights, nil
}

func (s *Service) saveInsight(ctx context.Context, userID string, ins Insight, evidence []map[string]any) (*Insight, error) {
	dataJSON, _ := json.Marshal(evidence)
	expiresAt := time.Now().Add(48 * time.Hour)

	query := `
		INSERT INTO ai_insights (
			user_id, module, title, fact, interpretation, hypothesis, recommendation,
			confidence, confidence_reason, confidence_level, underlying_data, expires_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, user_id, module, title, fact, interpretation, hypothesis, recommendation,
		          confidence, confidence_reason, confidence_level, expires_at, created_at`

	var res Insight
	err := s.db.QueryRow(ctx, query,
		userID, ins.Module, ins.Title, ins.Fact, ins.Interpretation, ins.Hypothesis, ins.Recommendation,
		ins.Confidence, ins.ConfidenceReason, ins.ConfidenceLevel, dataJSON, expiresAt,
	).Scan(
		&res.ID, &res.UserID, &res.Module, &res.Title, &res.Fact, &res.Interpretation, &res.Hypothesis, &res.Recommendation,
		&res.Confidence, &res.ConfidenceReason, &res.ConfidenceLevel, &res.ExpiresAt, &res.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	res.UnderlyingData = evidence
	return &res, nil
}

// GetInsights returns active insights
func (s *Service) GetInsights(ctx context.Context, userID string) ([]*Insight, error) {
	query := `
		SELECT id, user_id, module, title, fact, interpretation, hypothesis, recommendation,
		       confidence, confidence_reason, confidence_level, underlying_data, expires_at, created_at
		FROM ai_insights
		WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY created_at DESC LIMIT 20`

	rows, err := s.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*Insight
	for rows.Next() {
		var ins Insight
		var dataJSON []byte
		if err := rows.Scan(
			&ins.ID, &ins.UserID, &ins.Module, &ins.Title, &ins.Fact, &ins.Interpretation,
			&ins.Hypothesis, &ins.Recommendation, &ins.Confidence, &ins.ConfidenceReason,
			&ins.ConfidenceLevel, &dataJSON, &ins.ExpiresAt, &ins.CreatedAt,
		); err == nil {
			if len(dataJSON) > 0 {
				_ = json.Unmarshal(dataJSON, &ins.UnderlyingData)
			}
			if ins.UnderlyingData == nil {
				ins.UnderlyingData = []map[string]any{}
			}
			list = append(list, &ins)
		}
	}
	if list == nil {
		list = []*Insight{}
	}
	return list, nil
}

// GetDailyBrief aggregates the morning executive briefing
func (s *Service) GetDailyBrief(ctx context.Context, userID string) (*DailyBrief, error) {
	today := time.Now().Format("2006-01-02")
	brief := &DailyBrief{
		Date:                today,
		Greeting:            "Welcome to the Winter Arc. Your Personal OS is active.",
		TopPriorityToday:    "Execute 4 hours of high-leverage deep work and complete daily cognitive training.",
		DeepWorkTargetHours: 4.0,
		DailySpendAllowance: 1200.0,
		ActiveWarnings:      []string{},
		RecommendedAction:   "Complete today's Cognitive Lab challenge before opening email/inbox.",
	}

	// Pull active insights
	insights, err := s.GetInsights(ctx, userID)
	if err == nil && len(insights) > 0 {
		brief.KeyInsights = insights
		for _, ins := range insights {
			if ins.ConfidenceLevel == "High" && ins.Module == "Finance" && ins.Hypothesis != nil {
				brief.ActiveWarnings = append(brief.ActiveWarnings, ins.Fact)
			}
		}
	} else {
		// Generate on the fly if none exist
		newIns, _ := s.GenerateInsights(ctx, userID)
		brief.KeyInsights = newIns
	}

	if brief.KeyInsights == nil {
		brief.KeyInsights = []*Insight{}
	}

	return brief, nil
}

// ---- AI Memory Management --------------------------------------------------

func (s *Service) CreateMemory(ctx context.Context, userID string, req CreateMemoryRequest) (*Memory, error) {
	validCats := map[string]bool{
		"Goals": true, "Preferences": true, "Patterns": true,
		"Milestones": true, "Financial Rules": true, "Learning History": true,
	}
	category := req.Category
	if !validCats[category] {
		category = "Goals"
	}

	source := "user"
	if req.Source != nil && *req.Source != "" {
		source = *req.Source
	}

	var m Memory
	query := `
		INSERT INTO ai_memory (user_id, category, memory_text, source, confidence, status)
		VALUES ($1, $2, $3, $4, $5, 'active')
		RETURNING id, user_id, category, memory_text, source, confidence, status, created_at, updated_at`

	err := s.db.QueryRow(ctx, query, userID, category, req.MemoryText, source, req.Confidence).Scan(
		&m.ID, &m.UserID, &m.Category, &m.MemoryText, &m.Source, &m.Confidence, &m.Status,
		&m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create memory: %w", err)
	}

	s.LogActivity(ctx, userID, "create_memory", "memory", m.ID.String(), req.MemoryText, "supervisor", "Long-term memory anchored")
	return &m, nil
}

func (s *Service) ListMemories(ctx context.Context, userID, status string) ([]*Memory, error) {
	if status == "" {
		status = "active"
	}

	query := `
		SELECT id, user_id, category, memory_text, source, confidence, status, created_at, updated_at
		FROM ai_memory
		WHERE user_id = $1 AND status = $2
		ORDER BY created_at DESC`

	rows, err := s.db.Query(ctx, query, userID, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*Memory
	for rows.Next() {
		var m Memory
		if err := rows.Scan(
			&m.ID, &m.UserID, &m.Category, &m.MemoryText, &m.Source, &m.Confidence, &m.Status,
			&m.CreatedAt, &m.UpdatedAt,
		); err == nil {
			list = append(list, &m)
		}
	}
	if list == nil {
		list = []*Memory{}
	}
	return list, nil
}

func (s *Service) UpdateMemoryStatus(ctx context.Context, userID, id, status string) error {
	_, err := s.db.Exec(ctx, `UPDATE ai_memory SET status = $1 WHERE id = $2 AND user_id = $3`, status, id, userID)
	return err
}

func (s *Service) DeleteMemory(ctx context.Context, userID, id string) error {
	_, err := s.db.Exec(ctx, `DELETE FROM ai_memory WHERE id = $1 AND user_id = $2`, id, userID)
	return err
}

// ---- AI Activity Audit Log -------------------------------------------------

func (s *Service) LogActivity(ctx context.Context, userID, action, module, inputRef, outputRef, model, details string) {
	_, _ = s.db.Exec(ctx,
		`INSERT INTO ai_activity_log (user_id, action, module, input_reference, output_reference, model, details)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		userID, action, module, inputRef, outputRef, model, details,
	)
}

func (s *Service) ListActivity(ctx context.Context, userID string) ([]*ActivityLog, error) {
	query := `
		SELECT id, user_id, action, module, input_reference, output_reference, model, details, created_at
		FROM ai_activity_log
		WHERE user_id = $1
		ORDER BY created_at DESC LIMIT 50`

	rows, err := s.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*ActivityLog
	for rows.Next() {
		var a ActivityLog
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.Action, &a.Module, &a.InputReference, &a.OutputReference,
			&a.Model, &a.Details, &a.CreatedAt,
		); err == nil {
			list = append(list, &a)
		}
	}
	if list == nil {
		list = []*ActivityLog{}
	}
	return list, nil
}

// ---- Notifications ---------------------------------------------------------

func (s *Service) ListNotifications(ctx context.Context, userID string, unreadOnly bool) ([]*Notification, error) {
	query := `
		SELECT id, user_id, title, message, notification_type, action_route, is_read, read_at, created_at
		FROM notifications
		WHERE user_id = $1`
	if unreadOnly {
		query += " AND is_read = FALSE"
	}
	query += " ORDER BY created_at DESC LIMIT 30"

	rows, err := s.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(
			&n.ID, &n.UserID, &n.Title, &n.Message, &n.NotificationType, &n.ActionRoute,
			&n.IsRead, &n.ReadAt, &n.CreatedAt,
		); err == nil {
			list = append(list, &n)
		}
	}
	if list == nil {
		list = []*Notification{}
	}
	return list, nil
}

func (s *Service) MarkNotificationRead(ctx context.Context, userID, id string) error {
	now := time.Now()
	_, err := s.db.Exec(ctx,
		`UPDATE notifications SET is_read = TRUE, read_at = $1 WHERE id = $2 AND user_id = $3`,
		now, id, userID)
	return err
}

package exporter

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// ExportFullBackup gathers all user records across every Personal OS domain
func (s *Service) ExportFullBackup(ctx context.Context, userID string) (map[string]any, error) {
	backup := make(map[string]any)
	backup["exportedAt"] = time.Now().UTC().Format(time.RFC3339)
	backup["version"] = "1.0"

	// Profile & Preferences
	var email, name string
	_ = s.db.QueryRow(ctx, `SELECT email, display_name FROM users WHERE id = $1`, userID).Scan(&email, &name)
	backup["user"] = map[string]string{"email": email, "displayName": name}

	// Goals
	gRows, err := s.db.Query(ctx,
		`SELECT id, title, category, status, progress_pct(target_value, current_value), start_date, target_date
		 FROM (
		     SELECT id, title, category, status, target_value, current_value, start_date, target_date
		     FROM goals WHERE user_id = $1
		 ) sub`,
		userID,
	)
	if err == nil {
		defer gRows.Close()
		goals := []map[string]any{}
		for gRows.Next() {
			var id, title, cat, status, sDate, tDate string
			var prog float64
			_ = gRows.Scan(&id, &title, &cat, &status, &prog, &sDate, &tDate)
			goals = append(goals, map[string]any{
				"id": id, "title": title, "category": cat, "status": status,
				"progress": prog, "startDate": sDate, "targetDate": tDate,
			})
		}
		backup["goals"] = goals
	} else {
		// Fallback simple goals query if stored function progress_pct doesn't exist
		simpleRows, sErr := s.db.Query(ctx, `SELECT id, title, category, status FROM goals WHERE user_id = $1`, userID)
		if sErr == nil {
			defer simpleRows.Close()
			goals := []map[string]any{}
			for simpleRows.Next() {
				var id, title, cat, status string
				_ = simpleRows.Scan(&id, &title, &cat, &status)
				goals = append(goals, map[string]any{"id": id, "title": title, "category": cat, "status": status})
			}
			backup["goals"] = goals
		}
	}

	// Expenses
	eRows, err := s.db.Query(ctx,
		`SELECT e.amount, e.currency, e.description, to_char(e.expense_date, 'YYYY-MM-DD'), COALESCE(c.name, 'Uncategorized')
		 FROM expenses e LEFT JOIN expense_categories c ON c.id = e.category_id WHERE e.user_id = $1`,
		userID,
	)
	if err == nil {
		defer eRows.Close()
		expenses := []map[string]any{}
		for eRows.Next() {
			var amt float64
			var cur, desc, date, cat string
			_ = eRows.Scan(&amt, &cur, &desc, &date, &cat)
			expenses = append(expenses, map[string]any{
				"amount": amt, "currency": cur, "description": desc, "date": date, "category": cat,
			})
		}
		backup["expenses"] = expenses
	}

	// Time Logs
	tRows, err := s.db.Query(ctx,
		`SELECT activity, category, duration_secs, is_deep_work, to_char(entry_date, 'YYYY-MM-DD')
		 FROM time_entries WHERE user_id = $1 ORDER BY entry_date DESC`,
		userID,
	)
	if err == nil {
		defer tRows.Close()
		timeEntries := []map[string]any{}
		for tRows.Next() {
			var act, cat, date string
			var dur *int
			var isDeep bool
			_ = tRows.Scan(&act, &cat, &dur, &isDeep, &date)
			timeEntries = append(timeEntries, map[string]any{
				"activity": act, "category": cat, "durationSecs": dur, "isDeepWork": isDeep, "date": date,
			})
		}
		backup["timeEntries"] = timeEntries
	}

	// Cognitive Profile
	cRows, err := s.db.Query(ctx,
		`SELECT skill, attempts_total, correct_count, avg_reasoning_score, skill_level
		 FROM cognitive_skill_stats WHERE user_id = $1`,
		userID,
	)
	if err == nil {
		defer cRows.Close()
		cogSkills := []map[string]any{}
		for cRows.Next() {
			var skill string
			var attempts, correct, level int
			var score float64
			_ = cRows.Scan(&skill, &attempts, &correct, &score, &level)
			cogSkills = append(cogSkills, map[string]any{
				"skill": skill, "attempts": attempts, "correct": correct, "score": score, "level": level,
			})
		}
		backup["cognitiveSkills"] = cogSkills
	}

	return backup, nil
}

// ExportCSV generates raw spreadsheet tabular data
func (s *Service) ExportCSV(ctx context.Context, userID, exportType string) ([]byte, string, error) {
	buf := new(bytes.Buffer)
	writer := csv.NewWriter(buf)

	if exportType == "time" {
		_ = writer.Write([]string{"Date", "Activity", "Category", "DurationMinutes", "DeepWork"})
		rows, err := s.db.Query(ctx,
			`SELECT to_char(entry_date, 'YYYY-MM-DD'), activity, category, COALESCE(duration_secs, 0)/60, is_deep_work
			 FROM time_entries WHERE user_id = $1 ORDER BY entry_date DESC`,
			userID,
		)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var date, act, cat string
				var mins int
				var isDeep bool
				_ = rows.Scan(&date, &act, &cat, &mins, &isDeep)
				_ = writer.Write([]string{date, act, cat, fmt.Sprintf("%d", mins), fmt.Sprintf("%t", isDeep)})
			}
		}
		writer.Flush()
		return buf.Bytes(), "snow_time_logs.csv", nil
	}

	// Default: expenses
	_ = writer.Write([]string{"Date", "Description", "Category", "Amount", "Currency", "IsConsumption"})
	rows, err := s.db.Query(ctx,
		`SELECT to_char(e.expense_date, 'YYYY-MM-DD'), e.description, COALESCE(c.name, 'Uncategorized'), e.amount, e.currency, e.is_consumption
		 FROM expenses e LEFT JOIN expense_categories c ON c.id = e.category_id
		 WHERE e.user_id = $1 ORDER BY e.expense_date DESC`,
		userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var date, desc, cat, cur string
			var amt float64
			var isCons bool
			_ = rows.Scan(&date, &desc, &cat, &amt, &cur, &isCons)
			_ = writer.Write([]string{date, desc, cat, fmt.Sprintf("%.2f", amt), cur, fmt.Sprintf("%t", isCons)})
		}
	}
	writer.Flush()
	return buf.Bytes(), "snow_expenses.csv", nil
}

// ExportMarkdownReport formats executive Markdown report
func (s *Service) ExportMarkdownReport(ctx context.Context, userID string) (string, error) {
	var totalSpend float64
	var deepSecs int
	now := time.Now()
	today := now.Format("2006-01-02")

	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(amount), 0) FROM expenses
		 WHERE user_id = $1 AND EXTRACT(YEAR FROM expense_date) = $2 AND EXTRACT(MONTH FROM expense_date) = $3`,
		userID, now.Year(), int(now.Month()),
	).Scan(&totalSpend)

	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_secs), 0) FROM time_entries
		 WHERE user_id = $1 AND is_deep_work = TRUE AND entry_date >= (NOW() - INTERVAL '30 days')::DATE`,
		userID,
	).Scan(&deepSecs)

	report := fmt.Sprintf(`# SNOW — Winter Arc Executive Intelligence Report
**Generated:** %s  
**Status:** Systems Operational  

---

## 1. Capital Allocation & Financial Trajectory
* **Month-to-Date Direct Spend:** ₹%.2f
* **Cadence:** Linear budget monitoring active

## 2. Deep Work & Neuro-Attentional Output
* **Last 30 Days Deep Work:** %.1f hours
* **Target:** 4.0h daily execution block

## 3. Cognitive Systems Status
* **Engine:** Active
* **Framework:** Logical, Analytical, Critical, Operational, Observational, Numerical, Systems Thinking, Problem Solving.

---
*Report compiled automatically by SNOW Personal Operating System backend.*
`, today, totalSpend, float64(deepSecs)/3600.0)

	return report, nil
}

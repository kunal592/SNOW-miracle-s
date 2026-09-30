package analytics

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type DailyMetrics struct {
	Date               string          `json:"date"`
	DirectExpense      float64         `json:"directExpense"`
	ConsumptionBurn    float64         `json:"consumptionBurn"`
	TotalSpend         float64         `json:"totalSpend"`
	TotalLoggedSecs    int             `json:"totalLoggedSecs"`
	DeepWorkSecs       int             `json:"deepWorkSecs"`
	DeepWorkRatio      float64         `json:"deepWorkRatio"`
	TotalLearningSecs  int             `json:"totalLearningSecs"`
	LearningSessions   int             `json:"learningSessions"`
	LearningTopics     []string        `json:"learningTopics"`
	SleepHours         *float64        `json:"sleepHours,omitempty"`
	SleepQuality       *string         `json:"sleepQuality,omitempty"`
	WaterLiters        *float64        `json:"waterLiters,omitempty"`
	WorkoutDone        bool            `json:"workoutDone"`
	EnergyLevel        *int            `json:"energyLevel,omitempty"`
	MoodLevel          *int            `json:"moodLevel,omitempty"`
	InboxPendingCount  int             `json:"inboxPendingCount"`
	ActiveGoalsCount   int             `json:"activeGoalsCount"`
	UpcomingMilestones int             `json:"upcomingMilestones"`
}

type WeeklyOverview struct {
	StartDate          string          `json:"startDate"`
	EndDate            string          `json:"endDate"`
	TotalSpend         float64         `json:"totalSpend"`
	DailySpendTrend    []MetricTrend   `json:"dailySpendTrend"`
	TotalDeepWorkSecs  int             `json:"totalDeepWorkSecs"`
	DailyDeepWorkTrend []MetricTrend   `json:"dailyDeepWorkTrend"`
	TotalLearningSecs  int             `json:"totalLearningSecs"`
	WorkoutDaysCount   int             `json:"workoutDaysCount"`
	AvgSleepHours      float64         `json:"avgSleepHours"`
	TopCategories      []CategoryShare `json:"topCategories"`
}

type MetricTrend struct {
	Date  string  `json:"date"`
	Value float64 `json:"value"`
}

type CategoryShare struct {
	Name       string  `json:"name"`
	Amount     float64 `json:"amount"`
	Percentage float64 `json:"percentage"`
}

type MonthlyAnalytics struct {
	Year                   int                        `json:"year"`
	Month                  int                        `json:"month"`
	DaysInMonth            int                        `json:"daysInMonth"`
	CurrentDay             int                        `json:"currentDay"`
	TotalDirectSpend       float64                    `json:"totalDirectSpend"`
	TotalConsumptionBurn   float64                    `json:"totalConsumptionBurn"`
	NetFinancialOutflow    float64                    `json:"netFinancialOutflow"`
	TotalBudget            float64                    `json:"totalBudget"`
	BudgetBurnRatePct      float64                    `json:"budgetBurnRatePct"`
	ExpectedBurnRatePct    float64                    `json:"expectedBurnRatePct"`
	BudgetStatus           string                     `json:"budgetStatus"` // "Under Budget", "On Track", "Over Budget"
	CategoryBreakdown      []CategoryBudgetComparison `json:"categoryBreakdown"`
	TotalDeepWorkHours     float64                    `json:"totalDeepWorkHours"`
	TotalLearningHours     float64                    `json:"totalLearningHours"`
	AvgSleepHours          float64                    `json:"avgSleepHours"`
	WorkoutConsistencyPct  float64                    `json:"workoutConsistencyPct"`
}

type CategoryBudgetComparison struct {
	CategoryName string   `json:"categoryName"`
	Spent        float64  `json:"spent"`
	Budget       *float64 `json:"budget,omitempty"`
	PercentUsed  *float64 `json:"percentUsed,omitempty"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// GetDailyRollup compiles deterministic cross-module daily snapshot
func (s *Service) GetDailyRollup(ctx context.Context, userID, date string) (*DailyMetrics, error) {
	m := &DailyMetrics{
		Date:           date,
		LearningTopics: []string{},
	}

	// 1. Direct expenses on this date
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = $1 AND expense_date = $2::DATE`,
		userID, date,
	).Scan(&m.DirectExpense)

	// 2. Active consumption items daily cost for this date
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(daily_cost), 0) FROM consumption_items
		 WHERE user_id = $1 AND status = 'active'
		   AND start_date <= $2::DATE AND expected_end_date >= $2::DATE`,
		userID, date,
	).Scan(&m.ConsumptionBurn)
	m.TotalSpend = m.DirectExpense + m.ConsumptionBurn

	// 3. Time logging (total & deep work)
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_secs), 0),
		        COALESCE(SUM(CASE WHEN is_deep_work THEN duration_secs ELSE 0 END), 0)
		 FROM time_entries WHERE user_id = $1 AND entry_date = $2::DATE`,
		userID, date,
	).Scan(&m.TotalLoggedSecs, &m.DeepWorkSecs)

	if m.TotalLoggedSecs > 0 {
		m.DeepWorkRatio = float64(m.DeepWorkSecs) / float64(m.TotalLoggedSecs)
	}

	// 4. Learning
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_secs), 0), COUNT(*)
		 FROM learning_sessions WHERE user_id = $1 AND session_date = $2::DATE`,
		userID, date,
	).Scan(&m.TotalLearningSecs, &m.LearningSessions)

	tRows, err := s.db.Query(ctx,
		`SELECT DISTINCT topic FROM learning_sessions WHERE user_id = $1 AND session_date = $2::DATE LIMIT 5`,
		userID, date,
	)
	if err == nil {
		defer tRows.Close()
		for tRows.Next() {
			var top string
			if err := tRows.Scan(&top); err == nil {
				m.LearningTopics = append(m.LearningTopics, top)
			}
		}
	}

	// 5. Health entry
	_ = s.db.QueryRow(ctx,
		`SELECT sleep_hours, sleep_quality, water_liters, workout_done, energy_level, mood_level
		 FROM health_entries WHERE user_id = $1 AND entry_date = $2::DATE`,
		userID, date,
	).Scan(&m.SleepHours, &m.SleepQuality, &m.WaterLiters, &m.WorkoutDone, &m.EnergyLevel, &m.MoodLevel)

	// 6. Inbox & Goals & Milestones
	_ = s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM inbox_entries WHERE user_id = $1 AND status IN ('raw', 'needs_review')`,
		userID,
	).Scan(&m.InboxPendingCount)

	_ = s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM goals WHERE user_id = $1 AND status IN ('In Progress', 'On Track', 'At Risk')`,
		userID,
	).Scan(&m.ActiveGoalsCount)

	_ = s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM milestones WHERE user_id = $1 AND status IN ('Upcoming', 'Today')`,
		userID,
	).Scan(&m.UpcomingMilestones)

	return m, nil
}

// GetWeeklyOverview computes trend aggregations over a 7-day window
func (s *Service) GetWeeklyOverview(ctx context.Context, userID, endDate string) (*WeeklyOverview, error) {
	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		end = time.Now()
		endDate = end.Format("2006-01-02")
	}
	start := end.AddDate(0, 0, -6)
	startDate := start.Format("2006-01-02")

	wo := &WeeklyOverview{
		StartDate:          startDate,
		EndDate:            endDate,
		DailySpendTrend:    []MetricTrend{},
		DailyDeepWorkTrend: []MetricTrend{},
		TopCategories:      []CategoryShare{},
	}

	// Daily spend trend
	sRows, err := s.db.Query(ctx,
		`SELECT to_char(expense_date, 'YYYY-MM-DD') as d, COALESCE(SUM(amount), 0)
		 FROM expenses
		 WHERE user_id = $1 AND expense_date BETWEEN $2::DATE AND $3::DATE
		 GROUP BY d ORDER BY d`,
		userID, startDate, endDate,
	)
	if err == nil {
		defer sRows.Close()
		for sRows.Next() {
			var mt MetricTrend
			_ = sRows.Scan(&mt.Date, &mt.Value)
			wo.DailySpendTrend = append(wo.DailySpendTrend, mt)
			wo.TotalSpend += mt.Value
		}
	}

	// Daily deep work trend
	dRows, err := s.db.Query(ctx,
		`SELECT to_char(entry_date, 'YYYY-MM-DD') as d, COALESCE(SUM(duration_secs), 0)
		 FROM time_entries
		 WHERE user_id = $1 AND is_deep_work = TRUE AND entry_date BETWEEN $2::DATE AND $3::DATE
		 GROUP BY d ORDER BY d`,
		userID, startDate, endDate,
	)
	if err == nil {
		defer dRows.Close()
		for dRows.Next() {
			var mt MetricTrend
			_ = dRows.Scan(&mt.Date, &mt.Value)
			wo.DailyDeepWorkTrend = append(wo.DailyDeepWorkTrend, mt)
			wo.TotalDeepWorkSecs += int(mt.Value)
		}
	}

	// Total learning seconds in week
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_secs), 0) FROM learning_sessions
		 WHERE user_id = $1 AND session_date BETWEEN $2::DATE AND $3::DATE`,
		userID, startDate, endDate,
	).Scan(&wo.TotalLearningSecs)

	// Workouts count & Sleep avg
	_ = s.db.QueryRow(ctx,
		`SELECT COUNT(CASE WHEN workout_done THEN 1 END), COALESCE(AVG(sleep_hours), 0)
		 FROM health_entries
		 WHERE user_id = $1 AND entry_date BETWEEN $2::DATE AND $3::DATE`,
		userID, startDate, endDate,
	).Scan(&wo.WorkoutDaysCount, &wo.AvgSleepHours)

	// Top expense categories
	catRows, err := s.db.Query(ctx,
		`SELECT COALESCE(c.name, 'Other'), SUM(e.amount)
		 FROM expenses e
		 LEFT JOIN expense_categories c ON c.id = e.category_id
		 WHERE e.user_id = $1 AND e.expense_date BETWEEN $2::DATE AND $3::DATE
		 GROUP BY c.name ORDER BY SUM(e.amount) DESC LIMIT 5`,
		userID, startDate, endDate,
	)
	if err == nil {
		defer catRows.Close()
		for catRows.Next() {
			var cs CategoryShare
			_ = catRows.Scan(&cs.Name, &cs.Amount)
			if wo.TotalSpend > 0 {
				cs.Percentage = (cs.Amount / wo.TotalSpend) * 100.0
			}
			wo.TopCategories = append(wo.TopCategories, cs)
		}
	}

	return wo, nil
}

// GetMonthlyAnalytics computes full month budget, burn velocity, and health consistency
func (s *Service) GetMonthlyAnalytics(ctx context.Context, userID string, year, month int) (*MonthlyAnalytics, error) {
	t := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	daysInMonth := time.Date(year, time.Month(month+1), 0, 0, 0, 0, 0, time.UTC).Day()
	now := time.Now()

	currentDay := daysInMonth
	if now.Year() == year && int(now.Month()) == month {
		currentDay = now.Day()
	}

	ma := &MonthlyAnalytics{
		Year:              year,
		Month:             month,
		DaysInMonth:       daysInMonth,
		CurrentDay:        currentDay,
		CategoryBreakdown: []CategoryBudgetComparison{},
	}

	// Direct expenses for month
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(amount), 0) FROM expenses
		 WHERE user_id = $1 AND EXTRACT(YEAR FROM expense_date) = $2 AND EXTRACT(MONTH FROM expense_date) = $3`,
		userID, year, month,
	).Scan(&ma.TotalDirectSpend)

	// Consumption items active in this month
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(daily_cost * LEAST($4, duration_days)), 0)
		 FROM consumption_items
		 WHERE user_id = $1 AND status = 'active'
		   AND EXTRACT(YEAR FROM start_date) <= $2 AND EXTRACT(MONTH FROM start_date) <= $3`,
		userID, year, month, currentDay,
	).Scan(&ma.TotalConsumptionBurn)

	ma.NetFinancialOutflow = ma.TotalDirectSpend + ma.TotalConsumptionBurn

	// Total budget across categories
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(monthly_budget), 0)
		 FROM expense_categories
		 WHERE user_id = $1 AND monthly_budget IS NOT NULL`,
		userID,
	).Scan(&ma.TotalBudget)

	// Budget burn rate and status
	if ma.TotalBudget > 0 {
		ma.BudgetBurnRatePct = (ma.NetFinancialOutflow / ma.TotalBudget) * 100.0
		ma.ExpectedBurnRatePct = (float64(currentDay) / float64(daysInMonth)) * 100.0

		if ma.BudgetBurnRatePct > 100.0 {
			ma.BudgetStatus = "Over Budget"
		} else if ma.BudgetBurnRatePct > ma.ExpectedBurnRatePct+5.0 {
			ma.BudgetStatus = "Running Fast"
		} else {
			ma.BudgetStatus = "On Track"
		}
	} else {
		ma.BudgetStatus = "No Budget Set"
	}

	// Categories breakdown with budget vs actual
	cRows, err := s.db.Query(ctx,
		`SELECT c.name, COALESCE(SUM(e.amount), 0) as spent, c.monthly_budget
		 FROM expense_categories c
		 LEFT JOIN expenses e ON e.category_id = c.id
		      AND EXTRACT(YEAR FROM e.expense_date) = $2 AND EXTRACT(MONTH FROM e.expense_date) = $3
		 WHERE c.user_id = $1 OR c.user_id IS NULL
		 GROUP BY c.name, c.monthly_budget ORDER BY spent DESC`,
		userID, year, month,
	)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var comp CategoryBudgetComparison
			_ = cRows.Scan(&comp.CategoryName, &comp.Spent, &comp.Budget)
			if comp.Budget != nil && *comp.Budget > 0 {
				pct := (comp.Spent / *comp.Budget) * 100.0
				comp.PercentUsed = &pct
			}
			ma.CategoryBreakdown = append(ma.CategoryBreakdown, comp)
		}
	}

	// Hours logged: Deep work & Learning
	var deepSecs, learnSecs int
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_secs), 0) FROM time_entries
		 WHERE user_id = $1 AND is_deep_work = TRUE
		   AND EXTRACT(YEAR FROM entry_date) = $2 AND EXTRACT(MONTH FROM entry_date) = $3`,
		userID, year, month,
	).Scan(&deepSecs)
	ma.TotalDeepWorkHours = float64(deepSecs) / 3600.0

	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_secs), 0) FROM learning_sessions
		 WHERE user_id = $1 AND EXTRACT(YEAR FROM session_date) = $2 AND EXTRACT(MONTH FROM session_date) = $3`,
		userID, year, month,
	).Scan(&learnSecs)
	ma.TotalLearningHours = float64(learnSecs) / 3600.0

	// Health averages
	var workoutDays int
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(AVG(sleep_hours), 0), COUNT(CASE WHEN workout_done THEN 1 END)
		 FROM health_entries
		 WHERE user_id = $1 AND EXTRACT(YEAR FROM entry_date) = $2 AND EXTRACT(MONTH FROM entry_date) = $3`,
		userID, year, month,
	).Scan(&ma.AvgSleepHours, &workoutDays)

	if currentDay > 0 {
		ma.WorkoutConsistencyPct = (float64(workoutDays) / float64(currentDay)) * 100.0
	}

	_ = t // touch t
	return ma, nil
}

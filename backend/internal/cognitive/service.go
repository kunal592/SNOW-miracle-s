package cognitive

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type QuestionPublic struct {
	ID                uuid.UUID `json:"id"`
	Category          string    `json:"category"`
	Difficulty        int       `json:"difficulty"`
	Question          string    `json:"question"`
	ContextData       *string   `json:"contextData,omitempty"`
	HintsCount        int       `json:"hintsCount"`
	Skills            []string  `json:"skills"`
	EstimatedTimeMins int       `json:"estimatedTimeMins"`
}

type QuestionInternal struct {
	ID                uuid.UUID `json:"id"`
	Category          string    `json:"category"`
	Difficulty        int       `json:"difficulty"`
	Question          string    `json:"question"`
	ContextData       *string   `json:"contextData"`
	Hints             []string  `json:"hints"`
	CorrectAnswer     string    `json:"correctAnswer"`
	Explanation       string    `json:"explanation"`
	Skills            []string  `json:"skills"`
	EstimatedTimeMins int       `json:"estimatedTimeMins"`
	IsActive          bool      `json:"isActive"`
}

type Attempt struct {
	ID             uuid.UUID       `json:"id"`
	UserID         uuid.UUID       `json:"userId"`
	QuestionID     uuid.UUID       `json:"questionId"`
	AttemptNumber  int             `json:"attemptNumber"`
	UserAnswer     string          `json:"userAnswer"`
	IsCorrect      bool            `json:"isCorrect"`
	IsAssisted     bool            `json:"isAssisted"`
	HintsRequested int             `json:"hintsRequested"`
	TimeTakenSecs  int             `json:"timeTakenSecs"`
	ReasoningScore float64         `json:"reasoningScore"`
	AIFeedback     *AttemptFeedback`json:"aiFeedback,omitempty"`
	StartedAt      time.Time       `json:"startedAt"`
	CompletedAt    time.Time       `json:"completedAt"`
	AttemptDate    string          `json:"attemptDate"`
	CreatedAt      time.Time       `json:"createdAt"`
}

type AttemptFeedback struct {
	IsCorrect      bool    `json:"isCorrect"`
	CorrectAnswer  string  `json:"correctAnswer"`
	Explanation    string  `json:"explanation"`
	ReasoningScore float64 `json:"reasoningScore"`
	FeedbackNotes  string  `json:"feedbackNotes"`
}

type SubmitAttemptRequest struct {
	UserAnswer     string `json:"userAnswer" binding:"required"`
	HintsRequested int    `json:"hintsRequested"`
	TimeTakenSecs  int    `json:"timeTakenSecs" binding:"required,gt=0"`
}

type SkillStat struct {
	Skill              string  `json:"skill"`
	AttemptsTotal      int     `json:"attemptsTotal"`
	CorrectCount       int     `json:"correctCount"`
	AccuracyPct        float64 `json:"accuracyPct"`
	IndependentSolves  int     `json:"independentSolves"`
	HintAssistedSolves int     `json:"hintAssistedSolves"`
	AvgReasoningScore  float64 `json:"avgReasoningScore"`
	AvgTimeSecs        float64 `json:"avgTimeSecs"`
	SkillLevel         int     `json:"skillLevel"`
}

type CognitiveProfile struct {
	OverallScore       float64     `json:"overallScore"`
	TotalSolves        int         `json:"totalSolves"`
	IndependentRatePct float64     `json:"independentRatePct"`
	StrongestSkill     string      `json:"strongestSkill"`
	FocusArea          string      `json:"focusArea"`
	Skills             []SkillStat `json:"skills"`
}

var AllCategories = []string{
	"Logical",
	"Analytical",
	"Critical",
	"Operational",
	"Observational",
	"Numerical",
	"Systems Thinking",
	"Problem Solving",
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	s := &Service{db: db}
	// Auto seed questions on startup if table is empty
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_ = s.SeedQuestionsIfEmpty(ctx)
	}()
	return s
}

// SeedQuestionsIfEmpty seeds initial high-quality reasoning challenges
func (s *Service) SeedQuestionsIfEmpty(ctx context.Context) error {
	var count int
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM cognitive_questions`).Scan(&count)
	if count > 0 {
		return nil
	}

	seeds := []struct {
		category    string
		diff        int
		question    string
		contextData string
		hints       []string
		answer      string
		explanation string
		skills      []string
		estMins     int
	}{
		{
			category: "Logical",
			diff:     3,
			question: "In a tech firm, every architect is an engineer. Some engineers are managers. No manager is an intern. If Kunal is an architect and Vikram is an intern, can Vikram be managed by Kunal if Kunal is also a manager?",
			contextData: "Premise 1: Architect ⊆ Engineer\nPremise 2: Some Engineer ∩ Manager ≠ ∅\nPremise 3: Manager ∩ Intern = ∅",
			hints: []string{
				"Look at the direct relationship between Manager and Intern.",
				"Premise 3 strictly prohibits any manager from being an intern, but what about a manager MANAGING an intern?",
				"Managing someone does not make them a manager. Therefore, a manager CAN manage an intern.",
			},
			answer: "Yes",
			explanation: "Premise 3 states no manager IS an intern. It does NOT state a manager cannot MANAGE an intern. Since Kunal is a manager and Vikram is an intern, Kunal can validly manage Vikram.",
			skills: []string{"Deductive Reasoning", "Set Theory", "Formal Logic"},
			estMins: 4,
		},
		{
			category: "Analytical",
			diff:     3,
			question: "A SaaS system with 99.9% monthly availability objective has consumed 35 minutes of downtime in the first 20 days of a 30-day month. How many minutes of downtime budget remain for the final 10 days?",
			contextData: "Total month duration = 30 days = 43,200 minutes.\n99.9% uptime requirement means 0.1% max allowable downtime.",
			hints: []string{
				"Calculate total allowable monthly downtime: 43,200 × 0.001.",
				"43,200 × 0.001 = 43.2 minutes.",
				"Subtract already consumed downtime: 43.2 - 35.",
			},
			answer: "8.2",
			explanation: "Total monthly minutes = 30 * 24 * 60 = 43,200. Max downtime allowed = 43,200 * 0.001 = 43.2 minutes. Remaining budget = 43.2 - 35 = 8.2 minutes.",
			skills: []string{"SLA Calculation", "Precision Math", "Operational SLA"},
			estMins: 3,
		},
		{
			category: "Critical",
			diff:     4,
			question: "An experiment shows that startup founders who wake up at 5:00 AM have 34% higher ARR than those who wake up after 8:00 AM. A venture capitalist concludes that mandating a 5:00 AM wake-up routine will directly accelerate a portfolio company's revenue growth. What is the fundamental logical fallacy in the VC's deduction?",
			contextData: "Study size: 1,200 founders over 24 months. Observed metric: ARR vs self-reported wake time.",
			hints: []string{
				"Think about the difference between correlation and causation.",
				"Could disciplined work habits or preexisting market advantages cause both early wake times and higher ARR?",
				"Confusing correlation with causation (cum hoc ergo propter hoc).",
			},
			answer: "Correlation does not imply causation",
			explanation: "The deduction commits the false cause fallacy (cum hoc ergo propter hoc). Early rising is correlated with high ARR, but both could be driven by underlying confounders like discipline, industry sector, or work hours.",
			skills: []string{"Fallacy Identification", "Causal Inference", "Scientific Method"},
			estMins: 4,
		},
		{
			category: "Numerical",
			diff:     2,
			question: "If an athlete's resting metabolic rate consumes 1,800 kcal/day and each kilometer run burns 75 kcal, how many kilometers must they run to achieve an energy expenditure of 2,400 kcal in a single day?",
			contextData: "RMR: 1,800 kcal\nBurn rate: 75 kcal/km\nTarget: 2,400 kcal",
			hints: []string{
				"Find the net calories needed above RMR: 2,400 - 1,800.",
				"Divide the difference (600 kcal) by burn rate per km (75 kcal/km).",
			},
			answer: "8",
			explanation: "Deficit to achieve = 2,400 - 1,800 = 600 kcal. Distance = 600 / 75 = 8 km.",
			skills: []string{"Linear Rate", "Caloric Math", "Metabolic Budgeting"},
			estMins: 2,
		},
		{
			category: "Systems Thinking",
			diff:     4,
			question: "In a microservice mesh, Service A calls Service B with a timeout of 2 seconds and 3 retries with exponential backoff. During a database slowdown on B, latency spikes to 2.5s. As retries flood Service B, its latency worsens and cascades into Service A thread exhaustion. What systems engineering archetype describes this feedback loop?",
			contextData: "Components: Client -> Service A -> Service B -> DB. Mechanism: Timeout retries amplification.",
			hints: []string{
				"Think about positive feedback loops that amplify the original disturbance.",
				"It is often referred to as a retry storm or cascading failure / tragedy of the commons.",
			},
			answer: "Cascading failure",
			explanation: "This is a classic cascading failure driven by a reinforcing feedback loop (Retry Storm). Retries intended to mitigate transient errors instead amplify the load on an already degraded dependency.",
			skills: []string{"Feedback Loops", "Failure Modes", "Resilience Engineering"},
			estMins: 5,
		},
		{
			category: "Operational",
			diff:     3,
			question: "You have 3 critical tasks today: Task A (2h duration, deadline in 3h, penalty $500), Task B (4h duration, deadline in 5h, penalty $1000), Task C (1h duration, deadline in 2h, penalty $300). Working sequentially without preemption, which execution order minimizes total financial penalty?",
			contextData: "Current time: 0h.\nTask A: duration 2h, due 3h, penalty $500\nTask B: duration 4h, due 5h, penalty $1000\nTask C: duration 1h, due 2h, penalty $300",
			hints: []string{
				"Calculate total penalties for permutations: [C, A, B], [A, C, B], [C, B, A] etc.",
				"If C (finish at 1h) -> A (finish at 3h) -> B (finish at 7h). B is late by 2h -> penalty $1000.",
				"If C -> B (finish at 5h, on time) -> A (finish at 7h, late) -> penalty $500.",
			},
			answer: "C, B, A",
			explanation: "Order C (1h) finishes at 1h (on time). Then B (4h) finishes at 5h (exactly on time). Then A (2h) finishes at 7h (late, penalty $500). Total penalty = $500, which is the mathematical minimum.",
			skills: []string{"Scheduling", "Optimization", "Opportunity Cost"},
			estMins: 5,
		},
		{
			category: "Observational",
			diff:     3,
			question: "Consider the sequence: 3, 5, 9, 17, 33, 65, ... What is the next number in this pattern?",
			contextData: "Examine the delta between consecutive terms: 2, 4, 8, 16, 32...",
			hints: []string{
				"Difference between consecutive numbers doubles each time.",
				"Delta from 65 will be 32 * 2 = 64.",
				"65 + 64 = 129.",
			},
			answer: "129",
			explanation: "Each term is obtained by adding powers of 2 (2, 4, 8, 16, 32, 64) or alternatively by 2n - 1. 65 + 64 = 129.",
			skills: []string{"Pattern Recognition", "Sequence Analysis"},
			estMins: 2,
		},
		{
			category: "Problem Solving",
			diff:     3,
			question: "You have two empty jugs with capacities of 3 litres and 5 litres, and an unlimited water supply. What is the minimum number of steps required to measure exactly 4 litres?",
			contextData: "Allowed operations: Fill a jug completely, Empty a jug completely, Pour from one jug to another until full or empty.",
			hints: []string{
				"Standard Die Hard water jug puzzle.",
				"Step 1: Fill 5L jug (5, 0). Step 2: Pour from 5L to 3L (2, 3). Step 3: Empty 3L (2, 0).",
				"Step 4: Pour 2L into 3L (0, 2). Step 5: Fill 5L (5, 2). Step 6: Pour from 5L into 3L until full (requires 1L, leaving 4L in 5L jug!).",
			},
			answer: "6",
			explanation: "Steps: (1) Fill 5L [5,0]; (2) Pour 5L to 3L [2,3]; (3) Empty 3L [2,0]; (4) Pour 2L to 3L [0,2]; (5) Fill 5L [5,2]; (6) Pour 5L to 3L to fill it [4,3]. Exactly 4L remains in the 5L jug in 6 steps.",
			skills: []string{"State Search", "Algorithmic Thinking", "Constraint Satisfaction"},
			estMins: 4,
		},
	}

	for _, seed := range seeds {
		hintsJSON, _ := json.Marshal(seed.hints)
		_, _ = s.db.Exec(ctx,
			`INSERT INTO cognitive_questions (
				category, difficulty, question, context_data, hints, correct_answer, explanation, skills, estimated_time_mins
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			seed.category, seed.diff, seed.question, seed.contextData, hintsJSON, seed.answer, seed.explanation, seed.skills, seed.estMins,
		)
	}
	return nil
}

// ListQuestions returns public question descriptions (stripping correct answer/solution)
func (s *Service) ListQuestions(ctx context.Context, category string, difficulty int) ([]*QuestionPublic, error) {
	query := `
		SELECT id, category, difficulty, question, context_data, jsonb_array_length(hints), skills, estimated_time_mins
		FROM cognitive_questions
		WHERE is_active = TRUE`
	args := []interface{}{}
	n := 1

	if category != "" {
		query += fmt.Sprintf(" AND category = $%d", n)
		args = append(args, category)
		n++
	}
	if difficulty > 0 {
		query += fmt.Sprintf(" AND difficulty = $%d", n)
		args = append(args, difficulty)
		n++
	}
	query += " ORDER BY difficulty ASC, category ASC"

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*QuestionPublic
	for rows.Next() {
		var q QuestionPublic
		if err := rows.Scan(
			&q.ID, &q.Category, &q.Difficulty, &q.Question, &q.ContextData,
			&q.HintsCount, &q.Skills, &q.EstimatedTimeMins,
		); err != nil {
			return nil, err
		}
		list = append(list, &q)
	}
	if list == nil {
		list = []*QuestionPublic{}
	}
	return list, nil
}

// GetQuestionByID returns public view
func (s *Service) GetQuestionByID(ctx context.Context, id string) (*QuestionPublic, error) {
	var q QuestionPublic
	query := `
		SELECT id, category, difficulty, question, context_data, jsonb_array_length(hints), skills, estimated_time_mins
		FROM cognitive_questions
		WHERE id = $1 AND is_active = TRUE`

	err := s.db.QueryRow(ctx, query, id).Scan(
		&q.ID, &q.Category, &q.Difficulty, &q.Question, &q.ContextData,
		&q.HintsCount, &q.Skills, &q.EstimatedTimeMins,
	)
	if err != nil {
		return nil, fmt.Errorf("question not found")
	}
	return &q, nil
}

// RequestHint returns hint at index
func (s *Service) RequestHint(ctx context.Context, questionID string, hintIndex int) (string, int, error) {
	var hintsJSON []byte
	err := s.db.QueryRow(ctx,
		`SELECT hints FROM cognitive_questions WHERE id = $1 AND is_active = TRUE`,
		questionID,
	).Scan(&hintsJSON)
	if err != nil {
		return "", 0, fmt.Errorf("question not found")
	}

	var hints []string
	_ = json.Unmarshal(hintsJSON, &hints)
	if hintIndex < 0 || hintIndex >= len(hints) {
		return "", len(hints), fmt.Errorf("no more hints available")
	}

	return hints[hintIndex], len(hints), nil
}

// SubmitAttempt evaluates answer and updates user's cognitive skill stats
func (s *Service) SubmitAttempt(ctx context.Context, userID, questionID string, req SubmitAttemptRequest) (*Attempt, error) {
	var q QuestionInternal
	var hintsJSON []byte
	query := `
		SELECT id, category, difficulty, question, context_data, hints, correct_answer, explanation, skills, estimated_time_mins, is_active
		FROM cognitive_questions WHERE id = $1`

	err := s.db.QueryRow(ctx, query, questionID).Scan(
		&q.ID, &q.Category, &q.Difficulty, &q.Question, &q.ContextData, &hintsJSON,
		&q.CorrectAnswer, &q.Explanation, &q.Skills, &q.EstimatedTimeMins, &q.IsActive,
	)
	if err != nil {
		return nil, fmt.Errorf("question not found")
	}

	// Determine correctness
	isCorrect := evaluateAnswer(req.UserAnswer, q.CorrectAnswer)
	isAssisted := req.HintsRequested > 0

	// Reasoning score computation (0 - 100)
	var reasoningScore float64
	if isCorrect {
		reasoningScore = 100.0

		// Hint penalty: -15% per hint
		penalty := float64(req.HintsRequested) * 15.0
		reasoningScore -= penalty
		if reasoningScore < 40.0 {
			reasoningScore = 40.0
		}

		// Time factor: bonus for under estimated time
		estSecs := q.EstimatedTimeMins * 60
		if req.TimeTakenSecs <= estSecs {
			timeBonus := (1.0 - float64(req.TimeTakenSecs)/float64(estSecs)) * 10.0
			reasoningScore = math.Min(100.0, reasoningScore+timeBonus)
		} else if req.TimeTakenSecs > estSecs*2 {
			reasoningScore = math.Max(25.0, reasoningScore-10.0)
		}
	} else {
		reasoningScore = 0.0
	}

	feedback := AttemptFeedback{
		IsCorrect:      isCorrect,
		CorrectAnswer:  q.CorrectAnswer,
		Explanation:    q.Explanation,
		ReasoningScore: math.Round(reasoningScore*10) / 10,
	}
	if isCorrect {
		if isAssisted {
			feedback.FeedbackNotes = fmt.Sprintf("Correct! Solved with %d hint(s) in %ds. Review explanation to master independent solving.", req.HintsRequested, req.TimeTakenSecs)
		} else {
			feedback.FeedbackNotes = fmt.Sprintf("Flawless independent solve in %ds! Outstanding analytical execution.", req.TimeTakenSecs)
		}
	} else {
		feedback.FeedbackNotes = "Incorrect on this attempt. Study the formal reasoning breakdown above to build your model."
	}

	feedbackJSON, _ := json.Marshal(feedback)
	now := time.Now()
	startedAt := now.Add(-time.Duration(req.TimeTakenSecs) * time.Second)
	attemptDate := now.Format("2006-01-02")

	// Get next attempt number for this question
	var nextAttemptNum int
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(MAX(attempt_number), 0) + 1 FROM cognitive_attempts WHERE user_id = $1 AND question_id = $2`,
		userID, questionID,
	).Scan(&nextAttemptNum)

	var att Attempt
	insertQuery := `
		INSERT INTO cognitive_attempts (
			user_id, question_id, attempt_number, user_answer, is_correct, is_assisted,
			hints_requested, time_taken_secs, reasoning_score, ai_feedback,
			started_at, completed_at, attempt_date
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, user_id, question_id, attempt_number, user_answer, is_correct, is_assisted,
		          hints_requested, time_taken_secs, reasoning_score, started_at, completed_at,
		          to_char(attempt_date, 'YYYY-MM-DD'), created_at`

	err = s.db.QueryRow(ctx, insertQuery,
		userID, questionID, nextAttemptNum, req.UserAnswer, isCorrect, isAssisted,
		req.HintsRequested, req.TimeTakenSecs, feedback.ReasoningScore, feedbackJSON,
		startedAt, now, attemptDate,
	).Scan(
		&att.ID, &att.UserID, &att.QuestionID, &att.AttemptNumber, &att.UserAnswer, &att.IsCorrect, &att.IsAssisted,
		&att.HintsRequested, &att.TimeTakenSecs, &att.ReasoningScore, &att.StartedAt, &att.CompletedAt,
		&att.AttemptDate, &att.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("record attempt: %w", err)
	}
	att.AIFeedback = &feedback

	// Update cognitive_skill_stats for this skill category
	s.updateSkillStats(ctx, userID, q.Category, isCorrect, isAssisted, feedback.ReasoningScore, req.TimeTakenSecs)

	return &att, nil
}

func (s *Service) updateSkillStats(ctx context.Context, userID, skill string, isCorrect, isAssisted bool, score float64, timeSecs int) {
	incCorrect := 0
	incIndep := 0
	incAssisted := 0
	if isCorrect {
		incCorrect = 1
		if isAssisted {
			incAssisted = 1
		} else {
			incIndep = 1
		}
	}

	query := `
		INSERT INTO cognitive_skill_stats (
			user_id, skill, attempts_total, correct_count, independent_solves,
			hint_assisted_solves, avg_reasoning_score, avg_time_secs, skill_level
		) VALUES ($1, $2, 1, $3, $4, $5, $6, $7, 1)
		ON CONFLICT (user_id, skill) DO UPDATE SET
			attempts_total = cognitive_skill_stats.attempts_total + 1,
			correct_count = cognitive_skill_stats.correct_count + $3,
			independent_solves = cognitive_skill_stats.independent_solves + $4,
			hint_assisted_solves = cognitive_skill_stats.hint_assisted_solves + $5,
			avg_reasoning_score = ((cognitive_skill_stats.avg_reasoning_score * cognitive_skill_stats.attempts_total) + $6) / (cognitive_skill_stats.attempts_total + 1),
			avg_time_secs = ((cognitive_skill_stats.avg_time_secs * cognitive_skill_stats.attempts_total) + $7) / (cognitive_skill_stats.attempts_total + 1),
			skill_level = LEAST(10, GREATEST(1,
				1 + ((cognitive_skill_stats.correct_count + $3) / 2)
			)),
			updated_at = NOW()`

	_, _ = s.db.Exec(ctx, query, userID, skill, incCorrect, incIndep, incAssisted, score, timeSecs)
}

// GetProfile computes radar statistics across all 8 skill dimensions
func (s *Service) GetProfile(ctx context.Context, userID string) (*CognitiveProfile, error) {
	rows, err := s.db.Query(ctx,
		`SELECT skill, attempts_total, correct_count, independent_solves, hint_assisted_solves,
		        avg_reasoning_score, avg_time_secs, skill_level
		 FROM cognitive_skill_stats WHERE user_id = $1`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	statMap := make(map[string]SkillStat)
	for rows.Next() {
		var st SkillStat
		if err := rows.Scan(
			&st.Skill, &st.AttemptsTotal, &st.CorrectCount, &st.IndependentSolves,
			&st.HintAssistedSolves, &st.AvgReasoningScore, &st.AvgTimeSecs, &st.SkillLevel,
		); err == nil {
			if st.AttemptsTotal > 0 {
				st.AccuracyPct = (float64(st.CorrectCount) / float64(st.AttemptsTotal)) * 100.0
			}
			statMap[st.Skill] = st
		}
	}

	profile := &CognitiveProfile{
		Skills: []SkillStat{},
	}

	var scoreSum float64
	var totalSolves, totalIndep int
	var minScore = 999.0
	var maxScore = -1.0

	for _, cat := range AllCategories {
		st, exists := statMap[cat]
		if !exists {
			st = SkillStat{
				Skill:      cat,
				SkillLevel: 1,
			}
		}
		profile.Skills = append(profile.Skills, st)

		scoreSum += st.AvgReasoningScore
		totalSolves += st.CorrectCount
		totalIndep += st.IndependentSolves

		if st.AvgReasoningScore > maxScore {
			maxScore = st.AvgReasoningScore
			profile.StrongestSkill = cat
		}
		if st.AvgReasoningScore < minScore {
			minScore = st.AvgReasoningScore
			profile.FocusArea = cat
		}
	}

	profile.TotalSolves = totalSolves
	profile.OverallScore = math.Round((scoreSum/float64(len(AllCategories)))*10) / 10
	if totalSolves > 0 {
		profile.IndependentRatePct = math.Round((float64(totalIndep)/float64(totalSolves))*1000) / 10
	}

	return profile, nil
}

// GetDailyChallenge recommends an adaptive question for today
func (s *Service) GetDailyChallenge(ctx context.Context, userID string) (*QuestionPublic, error) {
	// Pick an active question the user has not yet solved correctly
	query := `
		SELECT q.id, q.category, q.difficulty, q.question, q.context_data,
		       jsonb_array_length(q.hints), q.skills, q.estimated_time_mins
		FROM cognitive_questions q
		WHERE q.is_active = TRUE
		  AND q.id NOT IN (
		      SELECT question_id FROM cognitive_attempts WHERE user_id = $1 AND is_correct = TRUE
		  )
		ORDER BY q.difficulty ASC, q.created_at ASC
		LIMIT 1`

	var q QuestionPublic
	err := s.db.QueryRow(ctx, query, userID).Scan(
		&q.ID, &q.Category, &q.Difficulty, &q.Question, &q.ContextData,
		&q.HintsCount, &q.Skills, &q.EstimatedTimeMins,
	)
	if err != nil {
		// Fallback to any active question
		return s.GetFirstActiveQuestion(ctx)
	}
	return &q, nil
}

func (s *Service) GetFirstActiveQuestion(ctx context.Context) (*QuestionPublic, error) {
	var q QuestionPublic
	query := `
		SELECT id, category, difficulty, question, context_data,
		       jsonb_array_length(hints), skills, estimated_time_mins
		FROM cognitive_questions WHERE is_active = TRUE LIMIT 1`

	err := s.db.QueryRow(ctx, query).Scan(
		&q.ID, &q.Category, &q.Difficulty, &q.Question, &q.ContextData,
		&q.HintsCount, &q.Skills, &q.EstimatedTimeMins,
	)
	if err != nil {
		return nil, fmt.Errorf("no questions available")
	}
	return &q, nil
}

func (s *Service) ListAttempts(ctx context.Context, userID string) ([]*Attempt, error) {
	query := `
		SELECT id, user_id, question_id, attempt_number, user_answer, is_correct, is_assisted,
		       hints_requested, time_taken_secs, reasoning_score, ai_feedback, started_at, completed_at,
		       to_char(attempt_date, 'YYYY-MM-DD'), created_at
		FROM cognitive_attempts
		WHERE user_id = $1
		ORDER BY created_at DESC LIMIT 50`

	rows, err := s.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*Attempt
	for rows.Next() {
		var a Attempt
		var fbJSON []byte
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.QuestionID, &a.AttemptNumber, &a.UserAnswer, &a.IsCorrect, &a.IsAssisted,
			&a.HintsRequested, &a.TimeTakenSecs, &a.ReasoningScore, &fbJSON, &a.StartedAt, &a.CompletedAt,
			&a.AttemptDate, &a.CreatedAt,
		); err == nil {
			if len(fbJSON) > 0 {
				var fb AttemptFeedback
				_ = json.Unmarshal(fbJSON, &fb)
				a.AIFeedback = &fb
			}
			list = append(list, &a)
		}
	}
	if list == nil {
		list = []*Attempt{}
	}
	return list, nil
}

func evaluateAnswer(userAns, correctAns string) bool {
	u := strings.TrimSpace(strings.ToLower(userAns))
	c := strings.TrimSpace(strings.ToLower(correctAns))

	if u == c {
		return true
	}

	// Normalizing numeric answers (e.g. "8.0" vs "8", "8 km" vs "8")
	uClean := strings.ReplaceAll(strings.ReplaceAll(u, "km", ""), " ", "")
	cClean := strings.ReplaceAll(strings.ReplaceAll(c, "km", ""), " ", "")
	return uClean == cClean
}

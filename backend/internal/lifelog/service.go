package lifelog

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Food Types ------------------------------------------------------------

type FoodEntry struct {
	ID                    uuid.UUID `json:"id"`
	UserID                uuid.UUID `json:"userId"`
	MealType              string    `json:"mealType"`
	Description           string    `json:"description"`
	Calories              *int      `json:"calories,omitempty"`
	ProteinGrams          *float64  `json:"proteinGrams,omitempty"`
	Cost                  float64   `json:"cost"`
	IsConsumptionBased    bool      `json:"isConsumptionBased"`
	ConsumptionDailyAlloc *float64  `json:"consumptionDailyAlloc,omitempty"`
	EntryDate             string    `json:"entryDate"`
	CreatedAt             time.Time `json:"createdAt"`
	UpdatedAt             time.Time `json:"updatedAt"`
}

type CreateFoodRequest struct {
	MealType              string   `json:"mealType" binding:"required"`
	Description           string   `json:"description" binding:"required"`
	Calories              *int     `json:"calories"`
	ProteinGrams          *float64 `json:"proteinGrams"`
	Cost                  *float64 `json:"cost"`
	IsConsumptionBased    bool     `json:"isConsumptionBased"`
	ConsumptionDailyAlloc *float64 `json:"consumptionDailyAlloc"`
	EntryDate             string   `json:"entryDate" binding:"required"`
}

// ---- Health Types ----------------------------------------------------------

type HealthEntry struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"userId"`
	EntryDate    string    `json:"entryDate"`
	SleepHours   *float64  `json:"sleepHours,omitempty"`
	SleepQuality *string   `json:"sleepQuality,omitempty"`
	WaterLiters  *float64  `json:"waterLiters,omitempty"`
	WorkoutDone  bool      `json:"workoutDone"`
	WorkoutType  *string   `json:"workoutType,omitempty"`
	StepsCount   *int      `json:"stepsCount,omitempty"`
	WeightKG     *float64  `json:"weightKg,omitempty"`
	EnergyLevel  *int      `json:"energyLevel,omitempty"`
	MoodLevel    *int      `json:"moodLevel,omitempty"`
	Notes        *string   `json:"notes,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type UpsertHealthRequest struct {
	EntryDate    string   `json:"entryDate" binding:"required"`
	SleepHours   *float64 `json:"sleepHours"`
	SleepQuality *string  `json:"sleepQuality"`
	WaterLiters  *float64 `json:"waterLiters"`
	WorkoutDone  *bool    `json:"workoutDone"`
	WorkoutType  *string  `json:"workoutType"`
	StepsCount   *int     `json:"stepsCount"`
	WeightKG     *float64 `json:"weightKg"`
	EnergyLevel  *int     `json:"energyLevel"`
	MoodLevel    *int     `json:"moodLevel"`
	Notes        *string  `json:"notes"`
}

// ---- Journal Types ---------------------------------------------------------

type JournalEntry struct {
	ID               uuid.UUID `json:"id"`
	UserID           uuid.UUID `json:"userId"`
	EntryDate        string    `json:"entryDate"`
	MoodRating       *int      `json:"moodRating,omitempty"`
	EnergyRating     *int      `json:"energyRating,omitempty"`
	WhatHappened     *string   `json:"whatHappened,omitempty"`
	WhatWentWell     *string   `json:"whatWentWell,omitempty"`
	WhatWentWrong    *string   `json:"whatWentWrong,omitempty"`
	TomorrowPriority *string   `json:"tomorrowPriority,omitempty"`
	Tags             []string  `json:"tags"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type UpsertJournalRequest struct {
	EntryDate        string   `json:"entryDate" binding:"required"`
	MoodRating       *int     `json:"moodRating"`
	EnergyRating     *int     `json:"energyRating"`
	WhatHappened     *string  `json:"whatHappened"`
	WhatWentWell     *string  `json:"whatWentWell"`
	WhatWentWrong    *string  `json:"whatWentWrong"`
	TomorrowPriority *string  `json:"tomorrowPriority"`
	Tags             []string `json:"tags"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// Food CRUD
func (s *Service) CreateFood(ctx context.Context, userID string, req CreateFoodRequest) (*FoodEntry, error) {
	cost := 0.0
	if req.Cost != nil {
		cost = *req.Cost
	}

	var f FoodEntry
	query := `
		INSERT INTO food_entries (
			user_id, meal_type, description, calories, protein_grams, cost,
			is_consumption_based, consumption_daily_alloc, entry_date
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, user_id, meal_type, description, calories, protein_grams, cost,
		          is_consumption_based, consumption_daily_alloc, to_char(entry_date, 'YYYY-MM-DD'),
		          created_at, updated_at`

	err := s.db.QueryRow(ctx, query,
		userID, req.MealType, req.Description, req.Calories, req.ProteinGrams, cost,
		req.IsConsumptionBased, req.ConsumptionDailyAlloc, req.EntryDate,
	).Scan(
		&f.ID, &f.UserID, &f.MealType, &f.Description, &f.Calories, &f.ProteinGrams, &f.Cost,
		&f.IsConsumptionBased, &f.ConsumptionDailyAlloc, &f.EntryDate,
		&f.CreatedAt, &f.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create food entry: %w", err)
	}
	return &f, nil
}

func (s *Service) ListFood(ctx context.Context, userID, date string) ([]*FoodEntry, error) {
	query := `
		SELECT id, user_id, meal_type, description, calories, protein_grams, cost,
		       is_consumption_based, consumption_daily_alloc, to_char(entry_date, 'YYYY-MM-DD'),
		       created_at, updated_at
		FROM food_entries
		WHERE user_id = $1`
	args := []interface{}{userID}

	if date != "" {
		query += " AND entry_date = $2"
		args = append(args, date)
	}
	query += " ORDER BY entry_date DESC, created_at ASC"

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*FoodEntry
	for rows.Next() {
		var f FoodEntry
		if err := rows.Scan(
			&f.ID, &f.UserID, &f.MealType, &f.Description, &f.Calories, &f.ProteinGrams, &f.Cost,
			&f.IsConsumptionBased, &f.ConsumptionDailyAlloc, &f.EntryDate,
			&f.CreatedAt, &f.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &f)
	}
	if list == nil {
		list = []*FoodEntry{}
	}
	return list, nil
}

func (s *Service) DeleteFood(ctx context.Context, userID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM food_entries WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

// Health Upsert & Get
func (s *Service) UpsertHealth(ctx context.Context, userID string, req UpsertHealthRequest) (*HealthEntry, error) {
	workoutDone := false
	if req.WorkoutDone != nil {
		workoutDone = *req.WorkoutDone
	}

	query := `
		INSERT INTO health_entries (
			user_id, entry_date, sleep_hours, sleep_quality, water_liters,
			workout_done, workout_type, steps_count, weight_kg, energy_level, mood_level, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (user_id, entry_date) DO UPDATE SET
			sleep_hours = EXCLUDED.sleep_hours,
			sleep_quality = EXCLUDED.sleep_quality,
			water_liters = EXCLUDED.water_liters,
			workout_done = EXCLUDED.workout_done,
			workout_type = EXCLUDED.workout_type,
			steps_count = EXCLUDED.steps_count,
			weight_kg = EXCLUDED.weight_kg,
			energy_level = EXCLUDED.energy_level,
			mood_level = EXCLUDED.mood_level,
			notes = EXCLUDED.notes,
			updated_at = NOW()
		RETURNING id, user_id, to_char(entry_date, 'YYYY-MM-DD'), sleep_hours, sleep_quality, water_liters,
		          workout_done, workout_type, steps_count, weight_kg, energy_level, mood_level, notes,
		          created_at, updated_at`

	var h HealthEntry
	err := s.db.QueryRow(ctx, query,
		userID, req.EntryDate, req.SleepHours, req.SleepQuality, req.WaterLiters,
		workoutDone, req.WorkoutType, req.StepsCount, req.WeightKG, req.EnergyLevel, req.MoodLevel, req.Notes,
	).Scan(
		&h.ID, &h.UserID, &h.EntryDate, &h.SleepHours, &h.SleepQuality, &h.WaterLiters,
		&h.WorkoutDone, &h.WorkoutType, &h.StepsCount, &h.WeightKG, &h.EnergyLevel, &h.MoodLevel, &h.Notes,
		&h.CreatedAt, &h.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("upsert health entry: %w", err)
	}
	return &h, nil
}

func (s *Service) GetHealthByDate(ctx context.Context, userID, date string) (*HealthEntry, error) {
	var h HealthEntry
	query := `
		SELECT id, user_id, to_char(entry_date, 'YYYY-MM-DD'), sleep_hours, sleep_quality, water_liters,
		       workout_done, workout_type, steps_count, weight_kg, energy_level, mood_level, notes,
		       created_at, updated_at
		FROM health_entries WHERE user_id = $1 AND entry_date = $2`

	err := s.db.QueryRow(ctx, query, userID, date).Scan(
		&h.ID, &h.UserID, &h.EntryDate, &h.SleepHours, &h.SleepQuality, &h.WaterLiters,
		&h.WorkoutDone, &h.WorkoutType, &h.StepsCount, &h.WeightKG, &h.EnergyLevel, &h.MoodLevel, &h.Notes,
		&h.CreatedAt, &h.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("health entry not found")
	}
	return &h, nil
}

// Journal Upsert & Get
func (s *Service) UpsertJournal(ctx context.Context, userID string, req UpsertJournalRequest) (*JournalEntry, error) {
	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	query := `
		INSERT INTO journal_entries (
			user_id, entry_date, mood_rating, energy_rating, what_happened,
			what_went_well, what_went_wrong, tomorrow_priority, tags
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (user_id, entry_date) DO UPDATE SET
			mood_rating = EXCLUDED.mood_rating,
			energy_rating = EXCLUDED.energy_rating,
			what_happened = EXCLUDED.what_happened,
			what_went_well = EXCLUDED.what_went_well,
			what_went_wrong = EXCLUDED.what_went_wrong,
			tomorrow_priority = EXCLUDED.tomorrow_priority,
			tags = EXCLUDED.tags,
			updated_at = NOW()
		RETURNING id, user_id, to_char(entry_date, 'YYYY-MM-DD'), mood_rating, energy_rating,
		          what_happened, what_went_well, what_went_wrong, tomorrow_priority, tags,
		          created_at, updated_at`

	var j JournalEntry
	err := s.db.QueryRow(ctx, query,
		userID, req.EntryDate, req.MoodRating, req.EnergyRating, req.WhatHappened,
		req.WhatWentWell, req.WhatWentWrong, req.TomorrowPriority, tags,
	).Scan(
		&j.ID, &j.UserID, &j.EntryDate, &j.MoodRating, &j.EnergyRating,
		&j.WhatHappened, &j.WhatWentWell, &j.WhatWentWrong, &j.TomorrowPriority, &j.Tags,
		&j.CreatedAt, &j.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("upsert journal entry: %w", err)
	}
	return &j, nil
}

func (s *Service) GetJournalByDate(ctx context.Context, userID, date string) (*JournalEntry, error) {
	var j JournalEntry
	query := `
		SELECT id, user_id, to_char(entry_date, 'YYYY-MM-DD'), mood_rating, energy_rating,
		       what_happened, what_went_well, what_went_wrong, tomorrow_priority, tags,
		       created_at, updated_at
		FROM journal_entries WHERE user_id = $1 AND entry_date = $2`

	err := s.db.QueryRow(ctx, query, userID, date).Scan(
		&j.ID, &j.UserID, &j.EntryDate, &j.MoodRating, &j.EnergyRating,
		&j.WhatHappened, &j.WhatWentWell, &j.WhatWentWrong, &j.TomorrowPriority, &j.Tags,
		&j.CreatedAt, &j.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("journal entry not found")
	}
	return &j, nil
}

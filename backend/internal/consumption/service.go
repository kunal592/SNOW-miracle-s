package consumption

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type Item struct {
	ID               uuid.UUID  `json:"id"`
	UserID           uuid.UUID  `json:"userId"`
	ItemName         string     `json:"itemName"`
	CategoryID       *uuid.UUID `json:"categoryId,omitempty"`
	CategoryName     *string    `json:"categoryName,omitempty"`
	TotalAmount      float64    `json:"totalAmount"`
	StartDate        string     `json:"startDate"`
	ExpectedEndDate  string     `json:"expectedEndDate"`
	DurationDays     int        `json:"durationDays"`
	DailyCost        float64    `json:"dailyCost"`
	AllocationMethod string     `json:"allocationMethod"`
	Quantity         *float64   `json:"quantity,omitempty"`
	Unit             *string    `json:"unit,omitempty"`
	Status           string     `json:"status"`
	Notes            *string    `json:"notes,omitempty"`
	CreatedAt        time.Time  `json:"createdAt"`
	UpdatedAt        time.Time  `json:"updatedAt"`
}

type CreateItemRequest struct {
	ItemName         string   `json:"itemName" binding:"required"`
	CategoryID       *string  `json:"categoryId"`
	TotalAmount      float64  `json:"totalAmount" binding:"required,gt=0"`
	StartDate        string   `json:"startDate" binding:"required"`
	ExpectedEndDate  string   `json:"expectedEndDate" binding:"required"`
	AllocationMethod string   `json:"allocationMethod"`
	Quantity         *float64 `json:"quantity"`
	Unit             *string  `json:"unit"`
	Notes            *string  `json:"notes"`
}

type UpdateItemRequest struct {
	ItemName        *string  `json:"itemName"`
	Status          *string  `json:"status"`
	ExpectedEndDate *string  `json:"expectedEndDate"`
	Notes           *string  `json:"notes"`
}

type Allocation struct {
	ID                uuid.UUID `json:"id"`
	ConsumptionItemID uuid.UUID `json:"consumptionItemId"`
	ItemName          string    `json:"itemName"`
	AllocationDate    string    `json:"allocationDate"`
	AllocatedAmount   float64   `json:"allocatedAmount"`
}

type FuelEntry struct {
	ID                 uuid.UUID `json:"id"`
	UserID             uuid.UUID `json:"userId"`
	ExpenseID          *uuid.UUID`json:"expenseId,omitempty"`
	VehicleName        string    `json:"vehicleName"`
	Litres             float64   `json:"litres"`
	OdometerKM         float64   `json:"odometerKm"`
	PreviousOdometer   *float64  `json:"previousOdometer,omitempty"`
	DistanceKM         *float64  `json:"distanceKm,omitempty"`
	FuelPricePerLitre  *float64  `json:"fuelPricePerLitre,omitempty"`
	FuelDate           string    `json:"fuelDate"`
	StationName        *string   `json:"stationName,omitempty"`
	Notes              *string   `json:"notes,omitempty"`
	CreatedAt          time.Time `json:"createdAt"`
}

type CreateFuelRequest struct {
	VehicleName       string   `json:"vehicleName"`
	Litres            float64  `json:"litres" binding:"required,gt=0"`
	OdometerKM        float64  `json:"odometerKm" binding:"required,gt=0"`
	FuelPricePerLitre *float64 `json:"fuelPricePerLitre"`
	FuelDate          string   `json:"fuelDate" binding:"required"`
	StationName       *string  `json:"stationName"`
	Notes             *string  `json:"notes"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// CreateItem inserts a consumption item and calculates duration
func (s *Service) CreateItem(ctx context.Context, userID string, req CreateItemRequest) (*Item, error) {
	start, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid startDate, use YYYY-MM-DD")
	}
	end, err := time.Parse("2006-01-02", req.ExpectedEndDate)
	if err != nil {
		return nil, fmt.Errorf("invalid expectedEndDate, use YYYY-MM-DD")
	}

	durationDays := int(end.Sub(start).Hours()/24) + 1
	if durationDays <= 0 {
		durationDays = 1
	}

	method := req.AllocationMethod
	if method == "" {
		method = "Equal daily"
	}

	var item Item
	query := `
		INSERT INTO consumption_items (
			user_id, item_name, category_id, total_amount, start_date, expected_end_date,
			duration_days, allocation_method, quantity, unit, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, user_id, item_name, category_id, total_amount,
		          to_char(start_date, 'YYYY-MM-DD'), to_char(expected_end_date, 'YYYY-MM-DD'),
		          duration_days, daily_cost, allocation_method, quantity, unit, status, notes,
		          created_at, updated_at`

	err = s.db.QueryRow(ctx, query,
		userID, req.ItemName, req.CategoryID, req.TotalAmount, req.StartDate, req.ExpectedEndDate,
		durationDays, method, req.Quantity, req.Unit, req.Notes,
	).Scan(
		&item.ID, &item.UserID, &item.ItemName, &item.CategoryID, &item.TotalAmount,
		&item.StartDate, &item.ExpectedEndDate, &item.DurationDays, &item.DailyCost,
		&item.AllocationMethod, &item.Quantity, &item.Unit, &item.Status, &item.Notes,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("insert consumption item: %w", err)
	}

	return &item, nil
}

// ListItems returns all active or filtered consumption items
func (s *Service) ListItems(ctx context.Context, userID string, status string) ([]*Item, error) {
	query := `
		SELECT c.id, c.user_id, c.item_name, c.category_id, ec.name, c.total_amount,
		       to_char(c.start_date, 'YYYY-MM-DD'), to_char(c.expected_end_date, 'YYYY-MM-DD'),
		       c.duration_days, c.daily_cost, c.allocation_method, c.quantity, c.unit, c.status, c.notes,
		       c.created_at, c.updated_at
		FROM consumption_items c
		LEFT JOIN expense_categories ec ON ec.id = c.category_id
		WHERE c.user_id = $1`
	args := []interface{}{userID}

	if status != "" {
		query += " AND c.status = $2"
		args = append(args, status)
	}
	query += " ORDER BY c.created_at DESC"

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*Item
	for rows.Next() {
		var item Item
		if err := rows.Scan(
			&item.ID, &item.UserID, &item.ItemName, &item.CategoryID, &item.CategoryName, &item.TotalAmount,
			&item.StartDate, &item.ExpectedEndDate, &item.DurationDays, &item.DailyCost,
			&item.AllocationMethod, &item.Quantity, &item.Unit, &item.Status, &item.Notes,
			&item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, &item)
	}

	if items == nil {
		items = []*Item{}
	}
	return items, nil
}

// GetItemByID returns a single item
func (s *Service) GetItemByID(ctx context.Context, userID, id string) (*Item, error) {
	var item Item
	query := `
		SELECT c.id, c.user_id, c.item_name, c.category_id, ec.name, c.total_amount,
		       to_char(c.start_date, 'YYYY-MM-DD'), to_char(c.expected_end_date, 'YYYY-MM-DD'),
		       c.duration_days, c.daily_cost, c.allocation_method, c.quantity, c.unit, c.status, c.notes,
		       c.created_at, c.updated_at
		FROM consumption_items c
		LEFT JOIN expense_categories ec ON ec.id = c.category_id
		WHERE c.id = $1 AND c.user_id = $2`

	err := s.db.QueryRow(ctx, query, id, userID).Scan(
		&item.ID, &item.UserID, &item.ItemName, &item.CategoryID, &item.CategoryName, &item.TotalAmount,
		&item.StartDate, &item.ExpectedEndDate, &item.DurationDays, &item.DailyCost,
		&item.AllocationMethod, &item.Quantity, &item.Unit, &item.Status, &item.Notes,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("item not found")
	}
	return &item, nil
}

// UpdateItem updates editable fields
func (s *Service) UpdateItem(ctx context.Context, userID, id string, req UpdateItemRequest) (*Item, error) {
	if req.ItemName != nil {
		_, _ = s.db.Exec(ctx, `UPDATE consumption_items SET item_name = $1 WHERE id = $2 AND user_id = $3`, *req.ItemName, id, userID)
	}
	if req.Status != nil {
		_, _ = s.db.Exec(ctx, `UPDATE consumption_items SET status = $1 WHERE id = $2 AND user_id = $3`, *req.Status, id, userID)
	}
	if req.Notes != nil {
		_, _ = s.db.Exec(ctx, `UPDATE consumption_items SET notes = $1 WHERE id = $2 AND user_id = $3`, *req.Notes, id, userID)
	}
	return s.GetItemByID(ctx, userID, id)
}

// DeleteItem removes a consumption item
func (s *Service) DeleteItem(ctx context.Context, userID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM consumption_items WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

// GetDailyBurnRate computes total daily consumption cost for active items on a given date
func (s *Service) GetDailyBurnRate(ctx context.Context, userID string, date string) (float64, error) {
	var total float64
	query := `
		SELECT COALESCE(SUM(daily_cost), 0)
		FROM consumption_items
		WHERE user_id = $1 AND status = 'active'
		  AND start_date <= $2::DATE AND expected_end_date >= $2::DATE`
	err := s.db.QueryRow(ctx, query, userID, date).Scan(&total)
	return total, err
}

// ---- Fuel Management --------------------------------------------------------

func (s *Service) CreateFuelEntry(ctx context.Context, userID string, req CreateFuelRequest) (*FuelEntry, error) {
	vehicle := req.VehicleName
	if vehicle == "" {
		vehicle = "My Vehicle"
	}

	// Fetch previous odometer reading for this vehicle
	var prevOdo *float64
	var lastOdo float64
	err := s.db.QueryRow(ctx,
		`SELECT odometer_km FROM fuel_entries
		 WHERE user_id = $1 AND vehicle_name = $2
		 ORDER BY fuel_date DESC, created_at DESC LIMIT 1`,
		userID, vehicle,
	).Scan(&lastOdo)
	if err == nil {
		prevOdo = &lastOdo
	}

	var f FuelEntry
	query := `
		INSERT INTO fuel_entries (
			user_id, vehicle_name, litres, odometer_km, previous_odometer,
			fuel_price_per_litre, fuel_date, station_name, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, user_id, expense_id, vehicle_name, litres, odometer_km,
		          previous_odometer, distance_km, fuel_price_per_litre,
		          to_char(fuel_date, 'YYYY-MM-DD'), station_name, notes, created_at`

	err = s.db.QueryRow(ctx, query,
		userID, vehicle, req.Litres, req.OdometerKM, prevOdo,
		req.FuelPricePerLitre, req.FuelDate, req.StationName, req.Notes,
	).Scan(
		&f.ID, &f.UserID, &f.ExpenseID, &f.VehicleName, &f.Litres, &f.OdometerKM,
		&f.PreviousOdometer, &f.DistanceKM, &f.FuelPricePerLitre,
		&f.FuelDate, &f.StationName, &f.Notes, &f.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create fuel entry: %w", err)
	}

	return &f, nil
}

func (s *Service) ListFuelEntries(ctx context.Context, userID string) ([]*FuelEntry, error) {
	query := `
		SELECT id, user_id, expense_id, vehicle_name, litres, odometer_km,
		       previous_odometer, distance_km, fuel_price_per_litre,
		       to_char(fuel_date, 'YYYY-MM-DD'), station_name, notes, created_at
		FROM fuel_entries
		WHERE user_id = $1
		ORDER BY fuel_date DESC, created_at DESC`

	rows, err := s.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*FuelEntry
	for rows.Next() {
		var f FuelEntry
		if err := rows.Scan(
			&f.ID, &f.UserID, &f.ExpenseID, &f.VehicleName, &f.Litres, &f.OdometerKM,
			&f.PreviousOdometer, &f.DistanceKM, &f.FuelPricePerLitre,
			&f.FuelDate, &f.StationName, &f.Notes, &f.CreatedAt,
		); err != nil {
			return nil, err
		}
		entries = append(entries, &f)
	}

	if entries == nil {
		entries = []*FuelEntry{}
	}
	return entries, nil
}

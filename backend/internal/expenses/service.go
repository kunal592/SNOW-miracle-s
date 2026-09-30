package expenses

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types -----------------------------------------------------------------

type Category struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	IconName      *string   `json:"iconName,omitempty"`
	ColorHex      *string   `json:"colorHex,omitempty"`
	MonthlyBudget *float64  `json:"monthlyBudget,omitempty"`
	IsSystem      bool      `json:"isSystem"`
}

type Expense struct {
	ID            uuid.UUID  `json:"id"`
	UserID        uuid.UUID  `json:"userId"`
	CategoryID    *uuid.UUID `json:"categoryId,omitempty"`
	CategoryName  *string    `json:"categoryName,omitempty"`
	Amount        float64    `json:"amount"`
	Currency      string     `json:"currency"`
	Description   string     `json:"description"`
	ExpenseDate   string     `json:"expenseDate"`
	PaymentMethod *string    `json:"paymentMethod,omitempty"`
	IsConsumption bool       `json:"isConsumption"`
	Source        string     `json:"source"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

type CreateExpenseRequest struct {
	CategoryID    *string  `json:"categoryId"`
	Amount        float64  `json:"amount" binding:"required,gt=0"`
	Currency      string   `json:"currency"`
	Description   string   `json:"description"`
	ExpenseDate   string   `json:"expenseDate" binding:"required"`
	PaymentMethod *string  `json:"paymentMethod"`
	IsConsumption bool     `json:"isConsumption"`
	Source        string   `json:"source"`
}

type UpdateExpenseRequest struct {
	CategoryID    *string  `json:"categoryId"`
	Amount        *float64 `json:"amount"`
	Description   *string  `json:"description"`
	ExpenseDate   *string  `json:"expenseDate"`
	PaymentMethod *string  `json:"paymentMethod"`
}

type ListExpenseParams struct {
	StartDate  string
	EndDate    string
	CategoryID string
	Limit      int
	Offset     int
}

// Monthly summary
type MonthlySummary struct {
	Year            int                  `json:"year"`
	Month           int                  `json:"month"`
	TotalSpent      float64              `json:"totalSpent"`
	ByCategorySpent []CategorySpent      `json:"byCategorySpent"`
	DailyTotals     []DailyTotal         `json:"dailyTotals"`
}

type CategorySpent struct {
	CategoryID   *uuid.UUID `json:"categoryId"`
	CategoryName string     `json:"categoryName"`
	Amount       float64    `json:"amount"`
	Percentage   float64    `json:"percentage"`
}

type DailyTotal struct {
	Date   string  `json:"date"`
	Amount float64 `json:"amount"`
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// GetCategories returns all categories (system + user-created)
func (s *Service) GetCategories(ctx context.Context, userID string) ([]*Category, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, name, icon_name, color_hex, monthly_budget, is_system
		 FROM expense_categories
		 WHERE user_id = $1 OR user_id IS NULL
		 ORDER BY is_system DESC, name ASC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []*Category
	for rows.Next() {
		var c Category
		if err := rows.Scan(&c.ID, &c.Name, &c.IconName, &c.ColorHex, &c.MonthlyBudget, &c.IsSystem); err != nil {
			return nil, err
		}
		cats = append(cats, &c)
	}
	if cats == nil {
		cats = []*Category{}
	}
	return cats, nil
}

// CreateCategory creates a user-defined category
func (s *Service) CreateCategory(ctx context.Context, userID string, name string, iconName, colorHex *string, budget *float64) (*Category, error) {
	var c Category
	err := s.db.QueryRow(ctx,
		`INSERT INTO expense_categories (user_id, name, icon_name, color_hex, monthly_budget)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, name, icon_name, color_hex, monthly_budget, is_system`,
		userID, name, iconName, colorHex, budget,
	).Scan(&c.ID, &c.Name, &c.IconName, &c.ColorHex, &c.MonthlyBudget, &c.IsSystem)
	if err != nil {
		return nil, fmt.Errorf("create category: %w", err)
	}
	return &c, nil
}

// Create adds a new expense
func (s *Service) Create(ctx context.Context, userID string, req CreateExpenseRequest) (*Expense, error) {
	currency := req.Currency
	if currency == "" {
		currency = "INR"
	}
	source := req.Source
	if source == "" {
		source = "manual"
	}

	var e Expense
	err := s.db.QueryRow(ctx,
		`INSERT INTO expenses (user_id, category_id, amount, currency, description, expense_date, payment_method, is_consumption, source)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING id, user_id, category_id, amount, currency, description,
		           to_char(expense_date, 'YYYY-MM-DD'), payment_method, is_consumption, source, created_at, updated_at`,
		userID, req.CategoryID, req.Amount, currency, req.Description,
		req.ExpenseDate, req.PaymentMethod, req.IsConsumption, source,
	).Scan(&e.ID, &e.UserID, &e.CategoryID, &e.Amount, &e.Currency, &e.Description,
		&e.ExpenseDate, &e.PaymentMethod, &e.IsConsumption, &e.Source, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("create expense: %w", err)
	}
	return &e, nil
}

// List returns expenses with optional filters
func (s *Service) List(ctx context.Context, userID string, p ListExpenseParams) ([]*Expense, int, error) {
	if p.Limit <= 0 {
		p.Limit = 50
	}

	query := `SELECT e.id, e.user_id, e.category_id, c.name, e.amount, e.currency, e.description,
	                 to_char(e.expense_date, 'YYYY-MM-DD'), e.payment_method, e.is_consumption, e.source, e.created_at, e.updated_at
	          FROM expenses e
	          LEFT JOIN expense_categories c ON c.id = e.category_id
	          WHERE e.user_id = $1`
	args := []interface{}{userID}
	n := 2

	if p.StartDate != "" {
		query += fmt.Sprintf(" AND e.expense_date >= $%d", n)
		args = append(args, p.StartDate)
		n++
	}
	if p.EndDate != "" {
		query += fmt.Sprintf(" AND e.expense_date <= $%d", n)
		args = append(args, p.EndDate)
		n++
	}
	if p.CategoryID != "" {
		query += fmt.Sprintf(" AND e.category_id = $%d", n)
		args = append(args, p.CategoryID)
		n++
	}

	query += fmt.Sprintf(" ORDER BY e.expense_date DESC, e.created_at DESC LIMIT $%d OFFSET $%d", n, n+1)
	args = append(args, p.Limit, p.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var expenses []*Expense
	for rows.Next() {
		var e Expense
		if err := rows.Scan(&e.ID, &e.UserID, &e.CategoryID, &e.CategoryName, &e.Amount, &e.Currency,
			&e.Description, &e.ExpenseDate, &e.PaymentMethod, &e.IsConsumption, &e.Source, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, 0, err
		}
		expenses = append(expenses, &e)
	}

	var total int
	_ = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM expenses WHERE user_id = $1`, userID).Scan(&total)

	if expenses == nil {
		expenses = []*Expense{}
	}
	return expenses, total, nil
}

// GetByID fetches a single expense by ID
func (s *Service) GetByID(ctx context.Context, userID, id string) (*Expense, error) {
	var e Expense
	err := s.db.QueryRow(ctx,
		`SELECT e.id, e.user_id, e.category_id, c.name, e.amount, e.currency, e.description,
		        to_char(e.expense_date, 'YYYY-MM-DD'), e.payment_method, e.is_consumption, e.source, e.created_at, e.updated_at
		 FROM expenses e
		 LEFT JOIN expense_categories c ON c.id = e.category_id
		 WHERE e.id = $1 AND e.user_id = $2`,
		id, userID,
	).Scan(&e.ID, &e.UserID, &e.CategoryID, &e.CategoryName, &e.Amount, &e.Currency,
		&e.Description, &e.ExpenseDate, &e.PaymentMethod, &e.IsConsumption, &e.Source, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("not found")
	}
	return &e, nil
}

// Update patches an expense
func (s *Service) Update(ctx context.Context, userID, id string, req UpdateExpenseRequest) (*Expense, error) {
	if req.Amount != nil {
		_, _ = s.db.Exec(ctx, `UPDATE expenses SET amount = $1 WHERE id = $2 AND user_id = $3`, *req.Amount, id, userID)
	}
	if req.Description != nil {
		_, _ = s.db.Exec(ctx, `UPDATE expenses SET description = $1 WHERE id = $2 AND user_id = $3`, *req.Description, id, userID)
	}
	if req.ExpenseDate != nil {
		_, _ = s.db.Exec(ctx, `UPDATE expenses SET expense_date = $1 WHERE id = $2 AND user_id = $3`, *req.ExpenseDate, id, userID)
	}
	if req.PaymentMethod != nil {
		_, _ = s.db.Exec(ctx, `UPDATE expenses SET payment_method = $1 WHERE id = $2 AND user_id = $3`, *req.PaymentMethod, id, userID)
	}
	if req.CategoryID != nil {
		_, _ = s.db.Exec(ctx, `UPDATE expenses SET category_id = $1 WHERE id = $2 AND user_id = $3`, *req.CategoryID, id, userID)
	}
	return s.GetByID(ctx, userID, id)
}

// Delete removes an expense
func (s *Service) Delete(ctx context.Context, userID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM expenses WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

// GetMonthlySummary computes total spend + breakdown by category for a given month
func (s *Service) GetMonthlySummary(ctx context.Context, userID string, year, month int) (*MonthlySummary, error) {
	summary := &MonthlySummary{Year: year, Month: month}

	// Total
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(amount), 0) FROM expenses
		 WHERE user_id = $1 AND EXTRACT(YEAR FROM expense_date) = $2 AND EXTRACT(MONTH FROM expense_date) = $3`,
		userID, year, month,
	).Scan(&summary.TotalSpent)

	// By category
	rows, err := s.db.Query(ctx,
		`SELECT e.category_id, COALESCE(c.name, 'Uncategorized'), SUM(e.amount)
		 FROM expenses e LEFT JOIN expense_categories c ON c.id = e.category_id
		 WHERE e.user_id = $1 AND EXTRACT(YEAR FROM e.expense_date) = $2 AND EXTRACT(MONTH FROM e.expense_date) = $3
		 GROUP BY e.category_id, c.name ORDER BY SUM(e.amount) DESC`,
		userID, year, month,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var cs CategorySpent
			_ = rows.Scan(&cs.CategoryID, &cs.CategoryName, &cs.Amount)
			if summary.TotalSpent > 0 {
				cs.Percentage = (cs.Amount / summary.TotalSpent) * 100
			}
			summary.ByCategorySpent = append(summary.ByCategorySpent, cs)
		}
	}

	// Daily totals
	drows, err := s.db.Query(ctx,
		`SELECT to_char(expense_date, 'YYYY-MM-DD'), SUM(amount)
		 FROM expenses
		 WHERE user_id = $1 AND EXTRACT(YEAR FROM expense_date) = $2 AND EXTRACT(MONTH FROM expense_date) = $3
		 GROUP BY expense_date ORDER BY expense_date`,
		userID, year, month,
	)
	if err == nil {
		defer drows.Close()
		for drows.Next() {
			var dt DailyTotal
			_ = drows.Scan(&dt.Date, &dt.Amount)
			summary.DailyTotals = append(summary.DailyTotals, dt)
		}
	}

	if summary.ByCategorySpent == nil {
		summary.ByCategorySpent = []CategorySpent{}
	}
	if summary.DailyTotals == nil {
		summary.DailyTotals = []DailyTotal{}
	}
	return summary, nil
}

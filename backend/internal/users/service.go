package users

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID                  uuid.UUID `json:"id"`
	Email               string    `json:"email"`
	DisplayName         string    `json:"displayName"`
	AvatarURL           *string   `json:"avatarUrl,omitempty"`
	Timezone            string    `json:"timezone"`
	WinterArcStartDate  *string   `json:"winterArcStartDate,omitempty"`
	OnboardingCompleted bool      `json:"onboardingCompleted"`
	CreatedAt           time.Time `json:"createdAt"`
}

type UpdateProfileRequest struct {
	DisplayName        *string `json:"displayName"`
	Timezone           *string `json:"timezone"`
	AvatarURL          *string `json:"avatarUrl"`
	WinterArcStartDate *string `json:"winterArcStartDate"`
}

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) GetProfile(ctx context.Context, userID string) (*User, error) {
	var user User
	err := s.db.QueryRow(ctx,
		`SELECT id, email, display_name, avatar_url, timezone, 
		        to_char(winter_arc_start_date, 'YYYY-MM-DD'), onboarding_completed, created_at
		 FROM users WHERE id = $1`,
		userID,
	).Scan(&user.ID, &user.Email, &user.DisplayName, &user.AvatarURL,
		&user.Timezone, &user.WinterArcStartDate, &user.OnboardingCompleted, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &user, nil
}

func (s *Service) UpdateProfile(ctx context.Context, userID string, req UpdateProfileRequest) (*User, error) {
	if req.DisplayName != nil {
		_, err := s.db.Exec(ctx, `UPDATE users SET display_name = $1 WHERE id = $2`, *req.DisplayName, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.Timezone != nil {
		_, err := s.db.Exec(ctx, `UPDATE users SET timezone = $1 WHERE id = $2`, *req.Timezone, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.AvatarURL != nil {
		_, err := s.db.Exec(ctx, `UPDATE users SET avatar_url = $1 WHERE id = $2`, *req.AvatarURL, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.WinterArcStartDate != nil {
		_, err := s.db.Exec(ctx, `UPDATE users SET winter_arc_start_date = $1 WHERE id = $2`, *req.WinterArcStartDate, userID)
		if err != nil {
			return nil, err
		}
	}
	return s.GetProfile(ctx, userID)
}

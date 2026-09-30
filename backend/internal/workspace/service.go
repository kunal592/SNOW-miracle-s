package workspace

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Preferences struct {
	UserID                string    `json:"userId"`
	EnabledModules        []string  `json:"enabledModules"`
	PinnedSidebarModules  []string  `json:"pinnedSidebarModules"`
	DefaultView           string    `json:"defaultView"`
	DashboardOrder        []string  `json:"dashboardOrder"`
	QuickActions          []string  `json:"quickActions"`
	ThemePreference       string    `json:"themePreference"`
	OnboardingCompleted   bool      `json:"onboardingCompleted"`
	UpdatedAt             time.Time `json:"updatedAt"`
}

type UpdatePrefsRequest struct {
	EnabledModules       *[]string `json:"enabledModules"`
	PinnedSidebarModules *[]string `json:"pinnedSidebarModules"`
	DefaultView          *string   `json:"defaultView"`
	DashboardOrder       *[]string `json:"dashboardOrder"`
	QuickActions         *[]string `json:"quickActions"`
	ThemePreference      *string   `json:"themePreference"`
	OnboardingCompleted  *bool     `json:"onboardingCompleted"`
}

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) GetPreferences(ctx context.Context, userID string) (*Preferences, error) {
	var prefs Preferences
	var enabledJSON, pinnedJSON, dashboardJSON, quickJSON []byte

	err := s.db.QueryRow(ctx,
		`SELECT user_id::text, enabled_modules, pinned_sidebar_modules, default_view,
		        dashboard_order, quick_actions, theme_preference, onboarding_completed, updated_at
		 FROM workspace_preferences WHERE user_id = $1`,
		userID,
	).Scan(&prefs.UserID, &enabledJSON, &pinnedJSON, &prefs.DefaultView,
		&dashboardJSON, &quickJSON, &prefs.ThemePreference, &prefs.OnboardingCompleted, &prefs.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("workspace preferences not found: %w", err)
	}

	_ = json.Unmarshal(enabledJSON, &prefs.EnabledModules)
	_ = json.Unmarshal(pinnedJSON, &prefs.PinnedSidebarModules)
	_ = json.Unmarshal(dashboardJSON, &prefs.DashboardOrder)
	_ = json.Unmarshal(quickJSON, &prefs.QuickActions)

	return &prefs, nil
}

func (s *Service) UpdatePreferences(ctx context.Context, userID string, req UpdatePrefsRequest) (*Preferences, error) {
	if req.EnabledModules != nil {
		data, _ := json.Marshal(req.EnabledModules)
		_, err := s.db.Exec(ctx, `UPDATE workspace_preferences SET enabled_modules = $1 WHERE user_id = $2`, data, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.PinnedSidebarModules != nil {
		data, _ := json.Marshal(req.PinnedSidebarModules)
		_, err := s.db.Exec(ctx, `UPDATE workspace_preferences SET pinned_sidebar_modules = $1 WHERE user_id = $2`, data, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.DefaultView != nil {
		_, err := s.db.Exec(ctx, `UPDATE workspace_preferences SET default_view = $1 WHERE user_id = $2`, *req.DefaultView, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.DashboardOrder != nil {
		data, _ := json.Marshal(req.DashboardOrder)
		_, err := s.db.Exec(ctx, `UPDATE workspace_preferences SET dashboard_order = $1 WHERE user_id = $2`, data, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.QuickActions != nil {
		data, _ := json.Marshal(req.QuickActions)
		_, err := s.db.Exec(ctx, `UPDATE workspace_preferences SET quick_actions = $1 WHERE user_id = $2`, data, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.ThemePreference != nil {
		_, err := s.db.Exec(ctx, `UPDATE workspace_preferences SET theme_preference = $1 WHERE user_id = $2`, *req.ThemePreference, userID)
		if err != nil {
			return nil, err
		}
	}
	if req.OnboardingCompleted != nil {
		_, err := s.db.Exec(ctx, `UPDATE workspace_preferences SET onboarding_completed = $1 WHERE user_id = $2`, *req.OnboardingCompleted, userID)
		if err != nil {
			return nil, err
		}
	}

	return s.GetPreferences(ctx, userID)
}

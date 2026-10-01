package automation

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

type Service struct {
	db    *pgxpool.Pool
	redis *redis.Client
	log   *zap.Logger
}

func NewService(db *pgxpool.Pool, redisURL string, log *zap.Logger) (*Service, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("invalid redis url: %w", err)
	}

	rdb := redis.NewClient(opts)

	// Quick ping check
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Warn("Redis ping failed, automation will operate with database fallback", zap.Error(err))
	} else {
		log.Info("Automation service connected to Redis")
	}

	return &Service{
		db:    db,
		redis: rdb,
		log:   log,
	}, nil
}

// EvaluateMilestones checks milestone due dates and updates their status
func (s *Service) EvaluateMilestones(ctx context.Context, userID string) (int, error) {
	updatedCount := 0

	// 1. Transition 'Upcoming' to 'Today' if due today
	todayQuery := `
		UPDATE milestones
		SET status = 'Today', updated_at = NOW()
		WHERE user_id = $1 AND status = 'Upcoming'
		  AND due_at::DATE = CURRENT_DATE`
	res, err := s.db.Exec(ctx, todayQuery, userID)
	if err == nil {
		updatedCount += int(res.RowsAffected())
	}

	// 2. Transition non-completed milestones to 'Overdue' if past due_at
	overdueQuery := `
		UPDATE milestones
		SET status = 'Overdue', updated_at = NOW()
		WHERE user_id = $1 AND status IN ('Upcoming', 'Today')
		  AND due_at < NOW()
		RETURNING id, title`

	rows, err := s.db.Query(ctx, overdueQuery, userID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var id, title string
			if err := rows.Scan(&id, &title); err == nil {
				updatedCount++
				// Dispatch notification for overdue milestone
				_, _ = s.db.Exec(ctx,
					`INSERT INTO notifications (user_id, title, message, notification_type, action_route)
					 VALUES ($1, $2, $3, 'checkpoint', $4)`,
					userID,
					fmt.Sprintf("Milestone Overdue: %s", title),
					"This milestone has passed its scheduled checkpoint. Complete your reflection or reschedule.",
					fmt.Sprintf("/milestones/%s", id),
				)
			}
		}
	}

	return updatedCount, nil
}

// ReconcileConsumption marks finished consumable items as completed
func (s *Service) ReconcileConsumption(ctx context.Context, userID string) (int, error) {
	query := `
		UPDATE consumption_items
		SET status = 'completed', updated_at = NOW()
		WHERE user_id = $1 AND status = 'active'
		  AND expected_end_date < CURRENT_DATE
		RETURNING id, item_name`

	rows, err := s.db.Query(ctx, query, userID)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	count := 0
	for rows.Next() {
		var id, itemName string
		if err := rows.Scan(&id, &itemName); err == nil {
			count++
			// Dispatch notification to replenish
			_, _ = s.db.Exec(ctx,
				`INSERT INTO notifications (user_id, title, message, notification_type, action_route)
				 VALUES ($1, $2, $3, 'consumption', '/consumption')`,
				userID,
				fmt.Sprintf("Consumable Depleted: %s", itemName),
				"The planned consumption cycle for this item has completed. Review or log replenishment.",
			)
		}
	}

	return count, nil
}

// CacheSet caches any key with a TTL in Redis
func (s *Service) CacheSet(ctx context.Context, key string, value any, ttl time.Duration) error {
	if s.redis == nil {
		return nil
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return s.redis.Set(ctx, key, data, ttl).Err()
}

// CacheGet reads from Redis
func (s *Service) CacheGet(ctx context.Context, key string, dest any) error {
	if s.redis == nil {
		return fmt.Errorf("redis unavailable")
	}
	val, err := s.redis.Get(ctx, key).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(val, dest)
}

// StartBackgroundTicker runs periodic maintenance tasks
func (s *Service) StartBackgroundTicker(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		s.log.Info("Automation background worker started", zap.Duration("interval", interval))
		for {
			select {
			case <-ctx.Done():
				s.log.Info("Automation worker stopping...")
				return
			case <-ticker.C:
				s.runPeriodicMaintenance(ctx)
			}
		}
	}()
}

func (s *Service) runPeriodicMaintenance(ctx context.Context) {
	// Query all active user IDs
	rows, err := s.db.Query(ctx, `SELECT id FROM users LIMIT 500`)
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err == nil {
			_, _ = s.EvaluateMilestones(ctx, userID)
			_, _ = s.ReconcileConsumption(ctx, userID)
		}
	}
}

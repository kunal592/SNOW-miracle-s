package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/argon2"
)

// ---- Errors ----------------------------------------------------------------

var (
	ErrEmailExists      = errors.New("email already registered")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrTokenExpired     = errors.New("token expired")
	ErrTokenInvalid     = errors.New("token invalid")
	ErrUserNotFound     = errors.New("user not found")
)

// ---- Types -----------------------------------------------------------------

type User struct {
	ID          uuid.UUID `json:"id"`
	Email       string    `json:"email"`
	DisplayName string    `json:"displayName"`
	AvatarURL   *string   `json:"avatarUrl,omitempty"`
	Timezone    string    `json:"timezone"`
	CreatedAt   time.Time `json:"createdAt"`
}

type RegisterRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
	DisplayName string `json:"displayName" binding:"required,min=1"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    int64  `json:"expiresIn"` // seconds
}

type Claims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// ---- Service ---------------------------------------------------------------

type Service struct {
	db            *pgxpool.Pool
	jwtSecret     []byte
	accessExpiry  time.Duration
	refreshExpiry time.Duration
}

func NewService(db *pgxpool.Pool, jwtSecret string, accessExpiry, refreshExpiry time.Duration) *Service {
	return &Service{
		db:            db,
		jwtSecret:     []byte(jwtSecret),
		accessExpiry:  accessExpiry,
		refreshExpiry: refreshExpiry,
	}
}

// RegisterWithEmail creates a new user with email + password
func (s *Service) RegisterWithEmail(ctx context.Context, req RegisterRequest) (*User, *TokenPair, error) {
	// Check if email exists
	var existingID string
	err := s.db.QueryRow(ctx, `SELECT id FROM users WHERE email = $1`, req.Email).Scan(&existingID)
	if err == nil {
		return nil, nil, ErrEmailExists
	}

	// Hash password with Argon2id
	hash, err := hashPassword(req.Password)
	if err != nil {
		return nil, nil, fmt.Errorf("hash password: %w", err)
	}

	// Create user
	var user User
	err = s.db.QueryRow(ctx,
		`INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3)
		 RETURNING id, email, display_name, avatar_url, timezone, created_at`,
		req.Email, hash, req.DisplayName,
	).Scan(&user.ID, &user.Email, &user.DisplayName, &user.AvatarURL, &user.Timezone, &user.CreatedAt)
	if err != nil {
		return nil, nil, fmt.Errorf("create user: %w", err)
	}

	// Create email identity record
	_, err = s.db.Exec(ctx,
		`INSERT INTO user_identities (user_id, provider, email) VALUES ($1, 'email', $2)`,
		user.ID, user.Email,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("create identity: %w", err)
	}

	// Create default workspace preferences
	_, err = s.db.Exec(ctx,
		`INSERT INTO workspace_preferences (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
		user.ID,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("create workspace prefs: %w", err)
	}

	// Issue tokens
	tokens, err := s.issueTokenPair(ctx, user.ID.String(), user.Email)
	if err != nil {
		return nil, nil, err
	}

	return &user, tokens, nil
}

// LoginWithEmail authenticates email + password
func (s *Service) LoginWithEmail(ctx context.Context, req LoginRequest) (*User, *TokenPair, error) {
	var user User
	var passwordHash string

	err := s.db.QueryRow(ctx,
		`SELECT id, email, display_name, avatar_url, timezone, password_hash, created_at
		 FROM users WHERE email = $1 AND account_status = 'active'`,
		req.Email,
	).Scan(&user.ID, &user.Email, &user.DisplayName, &user.AvatarURL, &user.Timezone, &passwordHash, &user.CreatedAt)
	if err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	if !verifyPassword(req.Password, passwordHash) {
		return nil, nil, ErrInvalidCredentials
	}

	tokens, err := s.issueTokenPair(ctx, user.ID.String(), user.Email)
	if err != nil {
		return nil, nil, err
	}

	return &user, tokens, nil
}

// UpsertGoogleUser creates or finds a user from Google OAuth data
func (s *Service) UpsertGoogleUser(ctx context.Context, googleID, email, name, avatarURL string) (*User, *TokenPair, error) {
	// Check if Google identity exists
	var userID uuid.UUID
	err := s.db.QueryRow(ctx,
		`SELECT user_id FROM user_identities WHERE provider = 'google' AND provider_user_id = $1`,
		googleID,
	).Scan(&userID)

	if err == nil {
		// Existing user — load and issue tokens
		var user User
		err = s.db.QueryRow(ctx,
			`SELECT id, email, display_name, avatar_url, timezone, created_at FROM users WHERE id = $1`,
			userID,
		).Scan(&user.ID, &user.Email, &user.DisplayName, &user.AvatarURL, &user.Timezone, &user.CreatedAt)
		if err != nil {
			return nil, nil, ErrUserNotFound
		}

		// Update avatar if changed
		if avatarURL != "" {
			_, _ = s.db.Exec(ctx, `UPDATE users SET avatar_url = $1 WHERE id = $2`, avatarURL, user.ID)
		}

		tokens, err := s.issueTokenPair(ctx, user.ID.String(), user.Email)
		return &user, tokens, err
	}

	// New Google user — check if email already registered
	var existingID uuid.UUID
	emailErr := s.db.QueryRow(ctx, `SELECT id FROM users WHERE email = $1`, email).Scan(&existingID)

	var user User
	if emailErr == nil {
		// Email exists, link Google identity to that account
		user.ID = existingID
		_, err = s.db.Exec(ctx,
			`INSERT INTO user_identities (user_id, provider, provider_user_id, email) VALUES ($1, 'google', $2, $3)
			 ON CONFLICT (provider, provider_user_id) DO NOTHING`,
			existingID, googleID, email,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("link google identity: %w", err)
		}

		err = s.db.QueryRow(ctx,
			`SELECT id, email, display_name, avatar_url, timezone, created_at FROM users WHERE id = $1`,
			existingID,
		).Scan(&user.ID, &user.Email, &user.DisplayName, &user.AvatarURL, &user.Timezone, &user.CreatedAt)
		if err != nil {
			return nil, nil, ErrUserNotFound
		}
	} else {
		// Brand new user
		avURL := sql.NullString{String: avatarURL, Valid: avatarURL != ""}
		_ = avURL
		err = s.db.QueryRow(ctx,
			`INSERT INTO users (email, display_name, avatar_url) VALUES ($1, $2, $3)
			 RETURNING id, email, display_name, avatar_url, timezone, created_at`,
			email, name, avatarURL,
		).Scan(&user.ID, &user.Email, &user.DisplayName, &user.AvatarURL, &user.Timezone, &user.CreatedAt)
		if err != nil {
			return nil, nil, fmt.Errorf("create user: %w", err)
		}

		// Google identity
		_, err = s.db.Exec(ctx,
			`INSERT INTO user_identities (user_id, provider, provider_user_id, email) VALUES ($1, 'google', $2, $3)`,
			user.ID, googleID, email,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("create google identity: %w", err)
		}

		// Default workspace prefs
		_, _ = s.db.Exec(ctx, `INSERT INTO workspace_preferences (user_id) VALUES ($1)`, user.ID)
	}

	tokens, err := s.issueTokenPair(ctx, user.ID.String(), user.Email)
	return &user, tokens, err
}

// RefreshTokens validates a refresh token and issues a new pair
func (s *Service) RefreshTokens(ctx context.Context, rawRefreshToken string) (*TokenPair, error) {
	tokenHash := hashToken(rawRefreshToken)

	var userID string
	var expiresAt time.Time
	var revoked bool
	err := s.db.QueryRow(ctx,
		`SELECT user_id, expires_at, revoked FROM refresh_tokens WHERE token_hash = $1`,
		tokenHash,
	).Scan(&userID, &expiresAt, &revoked)
	if err != nil {
		return nil, ErrTokenInvalid
	}
	if revoked || time.Now().After(expiresAt) {
		return nil, ErrTokenExpired
	}

	// Rotate: revoke old token
	_, _ = s.db.Exec(ctx, `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`, tokenHash)

	// Look up email
	var email string
	_ = s.db.QueryRow(ctx, `SELECT email FROM users WHERE id = $1`, userID).Scan(&email)

	return s.issueTokenPair(ctx, userID, email)
}

// RevokeRefreshToken invalidates a specific refresh token (logout)
func (s *Service) RevokeRefreshToken(ctx context.Context, rawToken string) error {
	tokenHash := hashToken(rawToken)
	_, err := s.db.Exec(ctx, `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`, tokenHash)
	return err
}

// ValidateAccessToken parses and validates a JWT access token
func (s *Service) ValidateAccessToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, ErrTokenInvalid
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrTokenInvalid
	}

	return claims, nil
}

// GetUserByID fetches a user by ID
func (s *Service) GetUserByID(ctx context.Context, id string) (*User, error) {
	var user User
	err := s.db.QueryRow(ctx,
		`SELECT id, email, display_name, avatar_url, timezone, created_at FROM users WHERE id = $1 AND account_status = 'active'`,
		id,
	).Scan(&user.ID, &user.Email, &user.DisplayName, &user.AvatarURL, &user.Timezone, &user.CreatedAt)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return &user, nil
}

// ---- Private helpers -------------------------------------------------------

func (s *Service) issueTokenPair(ctx context.Context, userID, email string) (*TokenPair, error) {
	// Access token (short-lived JWT)
	now := time.Now()
	accessClaims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.accessExpiry)),
			Subject:   userID,
		},
	}
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("sign access token: %w", err)
	}

	// Refresh token (opaque random)
	rawRefresh, err := generateToken(32)
	if err != nil {
		return nil, fmt.Errorf("generate refresh token: %w", err)
	}
	refreshHash := hashToken(rawRefresh)
	expiresAt := now.Add(s.refreshExpiry)

	_, err = s.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, refreshHash, expiresAt,
	)
	if err != nil {
		return nil, fmt.Errorf("store refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: rawRefresh,
		ExpiresIn:    int64(s.accessExpiry.Seconds()),
	}, nil
}

// generateToken creates a cryptographically random hex string
func generateToken(length int) (string, error) {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// hashToken SHA-256 hashes a token for storage
func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

// hashPassword hashes with Argon2id
func hashPassword(password string) (string, error) {
	salt, err := generateToken(16)
	if err != nil {
		return "", err
	}
	saltBytes, _ := hex.DecodeString(salt)
	hash := argon2.IDKey([]byte(password), saltBytes, 2, 64*1024, 4, 32)
	return fmt.Sprintf("$argon2id$%s$%s", salt, hex.EncodeToString(hash)), nil
}

// verifyPassword checks password against stored Argon2id hash
func verifyPassword(password, stored string) bool {
	// Format: $argon2id$<saltHex>$<hashHex>
	parts := strings.Split(stored, "$")
	if len(parts) != 4 || parts[1] != "argon2id" {
		return false
	}
	saltHex := parts[2]
	hashHex := parts[3]

	saltBytes, err := hex.DecodeString(saltHex)
	if err != nil {
		return false
	}
	hash := argon2.IDKey([]byte(password), saltBytes, 2, 64*1024, 4, 32)
	return hex.EncodeToString(hash) == hashHex
}

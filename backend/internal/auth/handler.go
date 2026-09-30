package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kunal/snow/pkg/response"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/idtoken"
)

type Handler struct {
	svc          *Service
	googleConfig *oauth2.Config
	frontendURL  string
}

func NewHandler(svc *Service, googleClientID, googleClientSecret, googleRedirectURL, frontendURL string) *Handler {
	cfg := &oauth2.Config{
		ClientID:     googleClientID,
		ClientSecret: googleClientSecret,
		RedirectURL:  googleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &Handler{
		svc:          svc,
		googleConfig: cfg,
		frontendURL:  frontendURL,
	}
}

// RegisterRoutes registers auth routes under the provided group
func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.Refresh)
		auth.POST("/logout", h.Logout)
		auth.GET("/google", h.GoogleLogin)
		auth.GET("/google/callback", h.GoogleCallback)
		auth.POST("/google/token", h.GoogleIDTokenExchange)
	}
}

// POST /auth/register — email + password sign up
func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	user, tokens, err := h.svc.RegisterWithEmail(c.Request.Context(), req)
	if err != nil {
		if err == ErrEmailExists {
			response.Conflict(c, "EMAIL_EXISTS", "An account with this email already exists")
			return
		}
		response.InternalError(c, "Registration failed")
		return
	}

	response.Created(c, gin.H{"user": user, "tokens": tokens})
}

// POST /auth/login — email + password sign in
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	user, tokens, err := h.svc.LoginWithEmail(c.Request.Context(), req)
	if err != nil {
		if err == ErrInvalidCredentials {
			response.Unauthorized(c, "Invalid email or password")
			return
		}
		response.InternalError(c, "Login failed")
		return
	}

	response.OK(c, gin.H{"user": user, "tokens": tokens})
}

// POST /auth/refresh — rotate refresh token
func (h *Handler) Refresh(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	tokens, err := h.svc.RefreshTokens(c.Request.Context(), body.RefreshToken)
	if err != nil {
		response.Unauthorized(c, "Invalid or expired refresh token")
		return
	}

	response.OK(c, tokens)
}

// POST /auth/logout — revoke refresh token
func (h *Handler) Logout(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refreshToken"`
	}
	_ = c.ShouldBindJSON(&body)
	if body.RefreshToken != "" {
		_ = h.svc.RevokeRefreshToken(c.Request.Context(), body.RefreshToken)
	}
	response.OK(c, gin.H{"message": "Logged out successfully"})
}

// GET /auth/google — redirect to Google OAuth
func (h *Handler) GoogleLogin(c *gin.Context) {
	url := h.googleConfig.AuthCodeURL("csrf-token", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GET /auth/google/callback — Google redirects here after consent
func (h *Handler) GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		response.BadRequest(c, "MISSING_CODE", "Authorization code missing")
		return
	}

	token, err := h.googleConfig.Exchange(c.Request.Context(), code)
	if err != nil {
		response.Unauthorized(c, "Failed to exchange authorization code")
		return
	}

	userInfo, err := fetchGoogleUserInfo(token.AccessToken)
	if err != nil {
		response.InternalError(c, "Failed to get user info from Google")
		return
	}

	user, tokens, err := h.svc.UpsertGoogleUser(c.Request.Context(), userInfo.ID, userInfo.Email, userInfo.Name, userInfo.Picture)
	if err != nil {
		response.InternalError(c, "Failed to authenticate with Google")
		return
	}
	_ = user

	// Redirect frontend with tokens (SPA callback)
	callbackURL := h.frontendURL + "/auth/callback?access_token=" + tokens.AccessToken + "&refresh_token=" + tokens.RefreshToken
	c.Redirect(http.StatusTemporaryRedirect, callbackURL)
}

// POST /auth/google/token — SPA sends Google ID token, get app tokens
func (h *Handler) GoogleIDTokenExchange(c *gin.Context) {
	var body struct {
		IDToken string `json:"idToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	if h.googleConfig.ClientID == "" {
		response.BadRequest(c, "GOOGLE_NOT_CONFIGURED", "Google OAuth is not configured on this server")
		return
	}

	payload, err := idtoken.Validate(c.Request.Context(), body.IDToken, h.googleConfig.ClientID)
	if err != nil {
		response.Unauthorized(c, "Invalid Google ID token")
		return
	}

	googleID := payload.Subject
	email, _ := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)

	user, tokens, err := h.svc.UpsertGoogleUser(c.Request.Context(), googleID, email, name, picture)
	if err != nil {
		response.InternalError(c, "Failed to authenticate with Google")
		return
	}

	response.OK(c, gin.H{"user": user, "tokens": tokens})
}

// RequireAuth middleware — validates Bearer JWT and injects user_id into context
func (h *Handler) RequireAuth(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		response.Unauthorized(c, "Authorization header missing or malformed")
		c.Abort()
		return
	}

	claims, err := h.svc.ValidateAccessToken(authHeader[7:])
	if err != nil {
		response.Unauthorized(c, "Invalid or expired access token")
		c.Abort()
		return
	}

	c.Set("user_id", claims.UserID)
	c.Set("user_email", claims.Email)
	c.Next()
}



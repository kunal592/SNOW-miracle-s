package cognitive

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/kunal/snow/pkg/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	c := rg.Group("/cognitive")
	{
		c.GET("/profile", h.GetProfile)
		c.GET("/daily", h.GetDailyChallenge)
		c.GET("/questions", h.ListQuestions)
		c.GET("/questions/:id", h.GetQuestionByID)
		c.POST("/questions/:id/hint", h.RequestHint)
		c.POST("/questions/:id/attempt", h.SubmitAttempt)
		c.GET("/attempts", h.ListAttempts)
	}
}

// GET /cognitive/profile
func (h *Handler) GetProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	profile, err := h.svc.GetProfile(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to load cognitive profile: "+err.Error())
		return
	}
	response.OK(c, profile)
}

// GET /cognitive/daily
func (h *Handler) GetDailyChallenge(c *gin.Context) {
	userID := c.GetString("user_id")
	q, err := h.svc.GetDailyChallenge(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to fetch daily challenge: "+err.Error())
		return
	}
	response.OK(c, q)
}

// GET /cognitive/questions?category=...&difficulty=...
func (h *Handler) ListQuestions(c *gin.Context) {
	category := c.Query("category")
	diff, _ := strconv.Atoi(c.DefaultQuery("difficulty", "0"))

	questions, err := h.svc.ListQuestions(c.Request.Context(), category, diff)
	if err != nil {
		response.InternalError(c, "Failed to list questions: "+err.Error())
		return
	}
	response.OK(c, questions)
}

// GET /cognitive/questions/:id
func (h *Handler) GetQuestionByID(c *gin.Context) {
	id := c.Param("id")
	q, err := h.svc.GetQuestionByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Question not found")
		return
	}
	response.OK(c, q)
}

type hintReq struct {
	HintIndex int `json:"hintIndex"`
}

// POST /cognitive/questions/:id/hint
func (h *Handler) RequestHint(c *gin.Context) {
	id := c.Param("id")
	var req hintReq
	if err := c.ShouldBindJSON(&req); err != nil {
		req.HintIndex = 0
	}

	hintText, totalHints, err := h.svc.RequestHint(c.Request.Context(), id, req.HintIndex)
	if err != nil {
		response.BadRequest(c, "HINT_UNAVAILABLE", err.Error())
		return
	}

	response.OK(c, gin.H{
		"hintIndex":  req.HintIndex,
		"hintText":   hintText,
		"totalHints": totalHints,
		"hasMore":    req.HintIndex+1 < totalHints,
	})
}

// POST /cognitive/questions/:id/attempt
func (h *Handler) SubmitAttempt(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req SubmitAttemptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	attempt, err := h.svc.SubmitAttempt(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, "Failed to record attempt: "+err.Error())
		return
	}
	response.OK(c, attempt)
}

// GET /cognitive/attempts
func (h *Handler) ListAttempts(c *gin.Context) {
	userID := c.GetString("user_id")
	attempts, err := h.svc.ListAttempts(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to load attempts: "+err.Error())
		return
	}
	response.OK(c, attempts)
}

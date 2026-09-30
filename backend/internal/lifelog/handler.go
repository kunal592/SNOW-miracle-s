package lifelog

import (
	"time"

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
	// Food routes
	food := rg.Group("/food")
	{
		food.POST("", h.CreateFood)
		food.GET("", h.ListFood)
		food.DELETE("/:id", h.DeleteFood)
	}

	// Health routes
	health := rg.Group("/health-log")
	{
		health.POST("", h.UpsertHealth)
		health.GET("/:date", h.GetHealthByDate)
	}

	// Journal routes
	journal := rg.Group("/journal")
	{
		journal.POST("", h.UpsertJournal)
		journal.GET("/:date", h.GetJournalByDate)
	}
}

// POST /food
func (h *Handler) CreateFood(c *gin.Context) {
	var req CreateFoodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	item, err := h.svc.CreateFood(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

// GET /food?date=2026-10-01
func (h *Handler) ListFood(c *gin.Context) {
	userID := c.GetString("user_id")
	date := c.Query("date")

	items, err := h.svc.ListFood(c.Request.Context(), userID, date)
	if err != nil {
		response.InternalError(c, "Failed to list food entries")
		return
	}
	response.OK(c, items)
}

// DELETE /food/:id
func (h *Handler) DeleteFood(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.DeleteFood(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to delete food entry")
		return
	}
	response.NoContent(c)
}

// POST /health-log
func (h *Handler) UpsertHealth(c *gin.Context) {
	var req UpsertHealthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	entry, err := h.svc.UpsertHealth(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, entry)
}

// GET /health-log/:date
func (h *Handler) GetHealthByDate(c *gin.Context) {
	userID := c.GetString("user_id")
	date := c.Param("date")
	if date == "today" {
		date = time.Now().Format("2006-01-02")
	}

	entry, err := h.svc.GetHealthByDate(c.Request.Context(), userID, date)
	if err != nil {
		response.NotFound(c, "Health entry not found for date")
		return
	}
	response.OK(c, entry)
}

// POST /journal
func (h *Handler) UpsertJournal(c *gin.Context) {
	var req UpsertJournalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	entry, err := h.svc.UpsertJournal(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, entry)
}

// GET /journal/:date
func (h *Handler) GetJournalByDate(c *gin.Context) {
	userID := c.GetString("user_id")
	date := c.Param("date")
	if date == "today" {
		date = time.Now().Format("2006-01-02")
	}

	entry, err := h.svc.GetJournalByDate(c.Request.Context(), userID, date)
	if err != nil {
		response.NotFound(c, "Journal entry not found for date")
		return
	}
	response.OK(c, entry)
}

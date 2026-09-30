package timelog

import (
	"net/http"
	"strconv"
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
	t := rg.Group("/time")
	{
		t.POST("", h.Create)
		t.GET("", h.List)
		t.GET("/active", h.GetActiveTimer)
		t.POST("/:id/stop", h.StopTimer)
		t.GET("/summary", h.GetDailySummary)
		t.GET("/:id", h.GetByID)
		t.PATCH("/:id", h.Update)
		t.DELETE("/:id", h.Delete)
	}
}

// POST /time
func (h *Handler) Create(c *gin.Context) {
	var req CreateEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	entry, err := h.svc.Create(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, entry)
}

// GET /time/active
func (h *Handler) GetActiveTimer(c *gin.Context) {
	userID := c.GetString("user_id")
	entry, err := h.svc.GetActiveTimer(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to check active timer")
		return
	}
	if entry == nil {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}
	response.OK(c, entry)
}

// POST /time/:id/stop
func (h *Handler) StopTimer(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	entry, err := h.svc.StopTimer(c.Request.Context(), userID, id)
	if err != nil {
		response.BadRequest(c, "STOP_FAILED", err.Error())
		return
	}
	response.OK(c, entry)
}

// GET /time?date=...&startDate=...&endDate=...&category=...&limit=50&offset=0
func (h *Handler) List(c *gin.Context) {
	userID := c.GetString("user_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	params := ListParams{
		Date:      c.Query("date"),
		StartDate: c.Query("startDate"),
		EndDate:   c.Query("endDate"),
		Category:  c.Query("category"),
		Limit:     limit,
		Offset:    offset,
	}

	items, total, err := h.svc.List(c.Request.Context(), userID, params)
	if err != nil {
		response.InternalError(c, "Failed to list time entries")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": items,
		"meta": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GET /time/:id
func (h *Handler) GetByID(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	entry, err := h.svc.GetByID(c.Request.Context(), userID, id)
	if err != nil {
		response.NotFound(c, "Time entry not found")
		return
	}
	response.OK(c, entry)
}

// PATCH /time/:id
func (h *Handler) Update(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req UpdateEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	entry, err := h.svc.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, "Failed to update time entry")
		return
	}
	response.OK(c, entry)
}

// DELETE /time/:id
func (h *Handler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.Delete(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to delete time entry")
		return
	}
	response.NoContent(c)
}

// GET /time/summary?date=2026-10-01
func (h *Handler) GetDailySummary(c *gin.Context) {
	userID := c.GetString("user_id")
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	summary, err := h.svc.GetDailySummary(c.Request.Context(), userID, date)
	if err != nil {
		response.InternalError(c, "Failed to compute daily time summary")
		return
	}
	response.OK(c, summary)
}

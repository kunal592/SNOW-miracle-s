package learning

import (
	"net/http"
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
	l := rg.Group("/learning")
	{
		l.POST("", h.Create)
		l.GET("", h.List)
		l.GET("/summary", h.GetSummary)
		l.GET("/:id", h.GetByID)
		l.PATCH("/:id", h.Update)
		l.DELETE("/:id", h.Delete)
	}
}

// POST /learning
func (h *Handler) Create(c *gin.Context) {
	var req CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	sess, err := h.svc.Create(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, sess)
}

// GET /learning?category=...&startDate=...&endDate=...&limit=50&offset=0
func (h *Handler) List(c *gin.Context) {
	userID := c.GetString("user_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	params := ListParams{
		Category:  c.Query("category"),
		StartDate: c.Query("startDate"),
		EndDate:   c.Query("endDate"),
		Limit:     limit,
		Offset:    offset,
	}

	items, total, err := h.svc.List(c.Request.Context(), userID, params)
	if err != nil {
		response.InternalError(c, "Failed to list learning sessions")
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

// GET /learning/:id
func (h *Handler) GetByID(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	sess, err := h.svc.GetByID(c.Request.Context(), userID, id)
	if err != nil {
		response.NotFound(c, "Learning session not found")
		return
	}
	response.OK(c, sess)
}

// PATCH /learning/:id
func (h *Handler) Update(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req UpdateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	sess, err := h.svc.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, "Failed to update learning session")
		return
	}
	response.OK(c, sess)
}

// DELETE /learning/:id
func (h *Handler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.Delete(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to delete learning session")
		return
	}
	response.NoContent(c)
}

// GET /learning/summary
func (h *Handler) GetSummary(c *gin.Context) {
	userID := c.GetString("user_id")
	summary, err := h.svc.GetSummary(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to compute learning summary")
		return
	}
	response.OK(c, summary)
}

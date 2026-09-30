package goals

import (
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
	g := rg.Group("/goals")
	{
		g.POST("", h.Create)
		g.GET("", h.List)
		g.GET("/:id", h.GetByID)
		g.PATCH("/:id", h.Update)
		g.DELETE("/:id", h.Delete)
		g.POST("/:id/metrics", h.AddMetric)
	}
}

// POST /goals
func (h *Handler) Create(c *gin.Context) {
	var req CreateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	goal, err := h.svc.Create(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, goal)
}

// GET /goals?category=...&status=...
func (h *Handler) List(c *gin.Context) {
	userID := c.GetString("user_id")
	category := c.Query("category")
	status := c.Query("status")

	items, err := h.svc.List(c.Request.Context(), userID, category, status)
	if err != nil {
		response.InternalError(c, "Failed to list goals")
		return
	}
	response.OK(c, items)
}

// GET /goals/:id
func (h *Handler) GetByID(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	goal, err := h.svc.GetByID(c.Request.Context(), userID, id)
	if err != nil {
		response.NotFound(c, "Goal not found")
		return
	}
	response.OK(c, goal)
}

// PATCH /goals/:id
func (h *Handler) Update(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req UpdateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	goal, err := h.svc.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, "Failed to update goal")
		return
	}
	response.OK(c, goal)
}

// DELETE /goals/:id
func (h *Handler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.Delete(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to delete goal")
		return
	}
	response.NoContent(c)
}

// POST /goals/:id/metrics
func (h *Handler) AddMetric(c *gin.Context) {
	userID := c.GetString("user_id")
	goalID := c.Param("id")

	var req AddMetricRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	metric, err := h.svc.AddMetric(c.Request.Context(), userID, goalID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, metric)
}

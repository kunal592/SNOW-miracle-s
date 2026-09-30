package milestones

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
	m := rg.Group("/milestones")
	{
		m.POST("", h.Create)
		m.GET("", h.List)
		m.GET("/:id", h.GetByID)
		m.PATCH("/:id", h.Update)
		m.DELETE("/:id", h.Delete)
		m.POST("/:id/complete", h.CompleteCheckpoint)
		m.POST("/:id/checklist", h.AddChecklistItem)
		m.PATCH("/checklist/:itemId/toggle", h.ToggleChecklistItem)
	}
}

// POST /milestones
func (h *Handler) Create(c *gin.Context) {
	var req CreateMilestoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	item, err := h.svc.Create(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

// GET /milestones?status=Upcoming&type=Checkpoint
func (h *Handler) List(c *gin.Context) {
	userID := c.GetString("user_id")
	status := c.Query("status")
	mType := c.Query("type")

	items, err := h.svc.List(c.Request.Context(), userID, status, mType)
	if err != nil {
		response.InternalError(c, "Failed to list milestones")
		return
	}
	response.OK(c, items)
}

// GET /milestones/:id
func (h *Handler) GetByID(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	item, err := h.svc.GetByID(c.Request.Context(), userID, id)
	if err != nil {
		response.NotFound(c, "Milestone not found")
		return
	}
	response.OK(c, item)
}

// PATCH /milestones/:id
func (h *Handler) Update(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req UpdateMilestoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	item, err := h.svc.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, "Failed to update milestone")
		return
	}
	response.OK(c, item)
}

// DELETE /milestones/:id
func (h *Handler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.Delete(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to delete milestone")
		return
	}
	response.NoContent(c)
}

// POST /milestones/:id/complete
func (h *Handler) CompleteCheckpoint(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req CompleteCheckpointRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	item, err := h.svc.CompleteCheckpoint(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, item)
}

// POST /milestones/:id/checklist
func (h *Handler) AddChecklistItem(c *gin.Context) {
	id := c.Param("id")

	var req AddChecklistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	item, err := h.svc.AddChecklistItem(c.Request.Context(), id, req.Task)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

// PATCH /milestones/checklist/:itemId/toggle
func (h *Handler) ToggleChecklistItem(c *gin.Context) {
	itemID := c.Param("itemId")

	item, err := h.svc.ToggleChecklistItem(c.Request.Context(), itemID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, item)
}

package supervisor

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
	s := rg.Group("/supervisor")
	{
		s.GET("/brief", h.GetDailyBrief)
		s.GET("/insights", h.GetInsights)
		s.POST("/insights/generate", h.GenerateInsights)
		s.GET("/memory", h.ListMemories)
		s.POST("/memory", h.CreateMemory)
		s.PATCH("/memory/:id/archive", h.ArchiveMemory)
		s.DELETE("/memory/:id", h.DeleteMemory)
		s.GET("/activity", h.ListActivity)
		s.GET("/notifications", h.ListNotifications)
		s.PATCH("/notifications/:id/read", h.MarkNotificationRead)
	}
}

// GET /supervisor/brief
func (h *Handler) GetDailyBrief(c *gin.Context) {
	userID := c.GetString("user_id")
	brief, err := h.svc.GetDailyBrief(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to compile daily brief: "+err.Error())
		return
	}
	response.OK(c, brief)
}

// GET /supervisor/insights
func (h *Handler) GetInsights(c *gin.Context) {
	userID := c.GetString("user_id")
	insights, err := h.svc.GetInsights(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to load insights: "+err.Error())
		return
	}
	response.OK(c, insights)
}

// POST /supervisor/insights/generate
func (h *Handler) GenerateInsights(c *gin.Context) {
	userID := c.GetString("user_id")
	insights, err := h.svc.GenerateInsights(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to generate insights: "+err.Error())
		return
	}
	response.OK(c, insights)
}

// GET /supervisor/memory?status=active
func (h *Handler) ListMemories(c *gin.Context) {
	userID := c.GetString("user_id")
	status := c.DefaultQuery("status", "active")

	memories, err := h.svc.ListMemories(c.Request.Context(), userID, status)
	if err != nil {
		response.InternalError(c, "Failed to load memories: "+err.Error())
		return
	}
	response.OK(c, memories)
}

// POST /supervisor/memory
func (h *Handler) CreateMemory(c *gin.Context) {
	var req CreateMemoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	mem, err := h.svc.CreateMemory(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, "Failed to store memory: "+err.Error())
		return
	}
	response.Created(c, mem)
}

// PATCH /supervisor/memory/:id/archive
func (h *Handler) ArchiveMemory(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.UpdateMemoryStatus(c.Request.Context(), userID, id, "archived"); err != nil {
		response.InternalError(c, "Failed to archive memory")
		return
	}
	response.OK(c, gin.H{"status": "archived"})
}

// DELETE /supervisor/memory/:id
func (h *Handler) DeleteMemory(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.DeleteMemory(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to delete memory")
		return
	}
	response.NoContent(c)
}

// GET /supervisor/activity
func (h *Handler) ListActivity(c *gin.Context) {
	userID := c.GetString("user_id")
	activity, err := h.svc.ListActivity(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to load audit log: "+err.Error())
		return
	}
	response.OK(c, activity)
}

// GET /supervisor/notifications?unread=true
func (h *Handler) ListNotifications(c *gin.Context) {
	userID := c.GetString("user_id")
	unreadOnly := c.Query("unread") == "true"

	notifs, err := h.svc.ListNotifications(c.Request.Context(), userID, unreadOnly)
	if err != nil {
		response.InternalError(c, "Failed to load notifications: "+err.Error())
		return
	}
	response.OK(c, notifs)
}

// PATCH /supervisor/notifications/:id/read
func (h *Handler) MarkNotificationRead(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.MarkNotificationRead(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to update notification")
		return
	}
	response.OK(c, gin.H{"read": true})
}

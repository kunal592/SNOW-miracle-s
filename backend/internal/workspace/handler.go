package workspace

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
	ws := rg.Group("/workspace")
	{
		ws.GET("/preferences", h.GetPreferences)
		ws.PUT("/preferences", h.UpdatePreferences)
		ws.PATCH("/preferences", h.UpdatePreferences)
	}
}

// GET /workspace/preferences
func (h *Handler) GetPreferences(c *gin.Context) {
	userID := c.GetString("user_id")
	prefs, err := h.svc.GetPreferences(c.Request.Context(), userID)
	if err != nil {
		response.NotFound(c, "Workspace preferences not found")
		return
	}
	response.OK(c, prefs)
}

// PUT/PATCH /workspace/preferences
func (h *Handler) UpdatePreferences(c *gin.Context) {
	var req UpdatePrefsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	userID := c.GetString("user_id")
	prefs, err := h.svc.UpdatePreferences(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, "Failed to update workspace preferences")
		return
	}
	response.OK(c, prefs)
}

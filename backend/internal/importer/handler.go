package importer

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
	imp := rg.Group("/import")
	{
		imp.POST("/chatgpt/parse", h.ParseChatGPT)
		imp.POST("/:id/apply", h.ApplyImport)
	}
}

// POST /import/chatgpt/parse
func (h *Handler) ParseChatGPT(c *gin.Context) {
	var req ParseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")

	record, err := h.svc.ParseChatGPTContent(c.Request.Context(), userID, req.RawContent, req.Source)
	if err != nil {
		response.InternalError(c, "Failed to parse import content: "+err.Error())
		return
	}
	response.Created(c, record)
}

// POST /import/:id/apply
func (h *Handler) ApplyImport(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req ApplyRequest
	_ = c.ShouldBindJSON(&req)
	if req.Resolutions == nil {
		req.Resolutions = make(map[string]string)
	}

	result, err := h.svc.ApplyImport(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, "Failed to apply import: "+err.Error())
		return
	}
	response.OK(c, gin.H{
		"applied": true,
		"counts":  result,
	})
}

package inbox

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
	inbox := rg.Group("/inbox")
	{
		inbox.POST("", h.Create)
		inbox.GET("", h.List)
		inbox.GET("/:id", h.GetByID)
		inbox.PATCH("/:id", h.Update)
		inbox.DELETE("/:id", h.Delete)
		inbox.POST("/:id/process", h.Process)
	}
}

// POST /inbox
func (h *Handler) Create(c *gin.Context) {
	var req CreateEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	entry, err := h.svc.Create(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, "Failed to create inbox entry: "+err.Error())
		return
	}
	response.Created(c, entry)
}

// GET /inbox?status=raw&limit=50&offset=0
func (h *Handler) List(c *gin.Context) {
	userID := c.GetString("user_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	entries, total, err := h.svc.List(c.Request.Context(), userID, ListParams{
		Status: c.Query("status"),
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		response.InternalError(c, "Failed to list inbox entries")
		return
	}
	response.OKWithMeta(c, entries, &response.Meta{Total: total, Limit: limit, Page: offset/limit + 1})
}

// GET /inbox/:id
func (h *Handler) GetByID(c *gin.Context) {
	userID := c.GetString("user_id")
	entry, err := h.svc.GetByID(c.Request.Context(), userID, c.Param("id"))
	if err != nil {
		response.NotFound(c, "Inbox entry not found")
		return
	}
	response.OK(c, entry)
}

// PATCH /inbox/:id
func (h *Handler) Update(c *gin.Context) {
	var req UpdateEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	entry, err := h.svc.Update(c.Request.Context(), userID, c.Param("id"), req)
	if err != nil {
		response.InternalError(c, "Failed to update inbox entry")
		return
	}
	response.OK(c, entry)
}

// DELETE /inbox/:id
func (h *Handler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")
	if err := h.svc.Delete(c.Request.Context(), userID, c.Param("id")); err != nil {
		response.NotFound(c, "Inbox entry not found")
		return
	}
	response.OK(c, gin.H{"message": "Deleted"})
}

// POST /inbox/:id/process — mark as approved/rejected/needs_review
func (h *Handler) Process(c *gin.Context) {
	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	entry, err := h.svc.MarkProcessed(c.Request.Context(), userID, c.Param("id"), body.Status)
	if err != nil {
		response.InternalError(c, "Failed to process inbox entry")
		return
	}
	response.OK(c, entry)
}

package consumption

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
	c := rg.Group("/consumption")
	{
		c.POST("", h.CreateItem)
		c.GET("", h.ListItems)
		c.GET("/burn-rate", h.GetDailyBurnRate)
		c.GET("/:id", h.GetItemByID)
		c.PATCH("/:id", h.UpdateItem)
		c.DELETE("/:id", h.DeleteItem)

		// Fuel entries
		c.POST("/fuel", h.CreateFuelEntry)
		c.GET("/fuel", h.ListFuelEntries)
	}
}

// POST /consumption
func (h *Handler) CreateItem(c *gin.Context) {
	var req CreateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	item, err := h.svc.CreateItem(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

// GET /consumption?status=active
func (h *Handler) ListItems(c *gin.Context) {
	userID := c.GetString("user_id")
	status := c.Query("status")

	items, err := h.svc.ListItems(c.Request.Context(), userID, status)
	if err != nil {
		response.InternalError(c, "Failed to list consumption items")
		return
	}
	response.OK(c, items)
}

// GET /consumption/:id
func (h *Handler) GetItemByID(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	item, err := h.svc.GetItemByID(c.Request.Context(), userID, id)
	if err != nil {
		response.NotFound(c, "Item not found")
		return
	}
	response.OK(c, item)
}

// PATCH /consumption/:id
func (h *Handler) UpdateItem(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	item, err := h.svc.UpdateItem(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, "Failed to update item")
		return
	}
	response.OK(c, item)
}

// DELETE /consumption/:id
func (h *Handler) DeleteItem(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.DeleteItem(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to delete item")
		return
	}
	response.NoContent(c)
}

// GET /consumption/burn-rate?date=2026-10-01
func (h *Handler) GetDailyBurnRate(c *gin.Context) {
	userID := c.GetString("user_id")
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	burnRate, err := h.svc.GetDailyBurnRate(c.Request.Context(), userID, date)
	if err != nil {
		response.InternalError(c, "Failed to compute burn rate")
		return
	}
	response.OK(c, gin.H{
		"date":          date,
		"dailyBurnRate": burnRate,
	})
}

// POST /consumption/fuel
func (h *Handler) CreateFuelEntry(c *gin.Context) {
	var req CreateFuelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	fuel, err := h.svc.CreateFuelEntry(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, fuel)
}

// GET /consumption/fuel
func (h *Handler) ListFuelEntries(c *gin.Context) {
	userID := c.GetString("user_id")
	entries, err := h.svc.ListFuelEntries(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to list fuel entries")
		return
	}
	response.OK(c, entries)
}

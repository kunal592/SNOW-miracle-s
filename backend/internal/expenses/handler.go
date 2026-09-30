package expenses

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
	exp := rg.Group("/expenses")
	{
		exp.GET("/categories", h.GetCategories)
		exp.POST("/categories", h.CreateCategory)
		exp.GET("/summary", h.GetMonthlySummary)
		exp.POST("", h.Create)
		exp.GET("", h.List)
		exp.GET("/:id", h.GetByID)
		exp.PATCH("/:id", h.Update)
		exp.DELETE("/:id", h.Delete)
	}
}

// GET /expenses/categories
func (h *Handler) GetCategories(c *gin.Context) {
	userID := c.GetString("user_id")
	cats, err := h.svc.GetCategories(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to load categories")
		return
	}
	response.OK(c, cats)
}

// POST /expenses/categories
type createCatReq struct {
	Name          string   `json:"name" binding:"required"`
	IconName      *string  `json:"iconName"`
	ColorHex      *string  `json:"colorHex"`
	MonthlyBudget *float64 `json:"monthlyBudget"`
}

func (h *Handler) CreateCategory(c *gin.Context) {
	var req createCatReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	cat, err := h.svc.CreateCategory(c.Request.Context(), userID, req.Name, req.IconName, req.ColorHex, req.MonthlyBudget)
	if err != nil {
		response.InternalError(c, "Failed to create category")
		return
	}
	response.Created(c, cat)
}

// POST /expenses
func (h *Handler) Create(c *gin.Context) {
	var req CreateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID := c.GetString("user_id")
	exp, err := h.svc.Create(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, "Failed to create expense: "+err.Error())
		return
	}
	response.Created(c, exp)
}

// GET /expenses?startDate=...&endDate=...&categoryId=...&limit=50&offset=0
func (h *Handler) List(c *gin.Context) {
	userID := c.GetString("user_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	params := ListExpenseParams{
		StartDate:  c.Query("startDate"),
		EndDate:    c.Query("endDate"),
		CategoryID: c.Query("categoryId"),
		Limit:      limit,
		Offset:     offset,
	}

	items, total, err := h.svc.List(c.Request.Context(), userID, params)
	if err != nil {
		response.InternalError(c, "Failed to list expenses")
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

// GET /expenses/:id
func (h *Handler) GetByID(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	exp, err := h.svc.GetByID(c.Request.Context(), userID, id)
	if err != nil {
		response.NotFound(c, "Expense not found")
		return
	}
	response.OK(c, exp)
}

// PATCH /expenses/:id
func (h *Handler) Update(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	var req UpdateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	exp, err := h.svc.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		response.InternalError(c, "Failed to update expense")
		return
	}
	response.OK(c, exp)
}

// DELETE /expenses/:id
func (h *Handler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")
	id := c.Param("id")

	if err := h.svc.Delete(c.Request.Context(), userID, id); err != nil {
		response.InternalError(c, "Failed to delete expense")
		return
	}
	response.NoContent(c)
}

// GET /expenses/summary?year=2026&month=10
func (h *Handler) GetMonthlySummary(c *gin.Context) {
	userID := c.GetString("user_id")
	now := time.Now()

	year, _ := strconv.Atoi(c.DefaultQuery("year", strconv.Itoa(now.Year())))
	month, _ := strconv.Atoi(c.DefaultQuery("month", strconv.Itoa(int(now.Month()))))

	summary, err := h.svc.GetMonthlySummary(c.Request.Context(), userID, year, month)
	if err != nil {
		response.InternalError(c, "Failed to compute summary")
		return
	}
	response.OK(c, summary)
}

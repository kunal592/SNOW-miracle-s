package analytics

import (
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
	a := rg.Group("/analytics")
	{
		a.GET("/daily", h.GetDailyRollup)
		a.GET("/weekly", h.GetWeeklyOverview)
		a.GET("/monthly", h.GetMonthlyAnalytics)
	}
}

// GET /analytics/daily?date=2026-10-01
func (h *Handler) GetDailyRollup(c *gin.Context) {
	userID := c.GetString("user_id")
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	metrics, err := h.svc.GetDailyRollup(c.Request.Context(), userID, date)
	if err != nil {
		response.InternalError(c, "Failed to compile daily metrics: "+err.Error())
		return
	}
	response.OK(c, metrics)
}

// GET /analytics/weekly?endDate=2026-10-01
func (h *Handler) GetWeeklyOverview(c *gin.Context) {
	userID := c.GetString("user_id")
	endDate := c.DefaultQuery("endDate", time.Now().Format("2006-01-02"))

	overview, err := h.svc.GetWeeklyOverview(c.Request.Context(), userID, endDate)
	if err != nil {
		response.InternalError(c, "Failed to compile weekly overview: "+err.Error())
		return
	}
	response.OK(c, overview)
}

// GET /analytics/monthly?year=2026&month=10
func (h *Handler) GetMonthlyAnalytics(c *gin.Context) {
	userID := c.GetString("user_id")
	now := time.Now()

	year, _ := strconv.Atoi(c.DefaultQuery("year", strconv.Itoa(now.Year())))
	month, _ := strconv.Atoi(c.DefaultQuery("month", strconv.Itoa(int(now.Month()))))

	analytics, err := h.svc.GetMonthlyAnalytics(c.Request.Context(), userID, year, month)
	if err != nil {
		response.InternalError(c, "Failed to compile monthly analytics: "+err.Error())
		return
	}
	response.OK(c, analytics)
}

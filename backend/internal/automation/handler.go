package automation

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
	auto := rg.Group("/automation")
	{
		auto.POST("/milestones/evaluate", h.EvaluateMilestones)
		auto.POST("/consumption/reconcile", h.ReconcileConsumption)
		auto.GET("/status", h.GetStatus)
	}
}

// POST /automation/milestones/evaluate
func (h *Handler) EvaluateMilestones(c *gin.Context) {
	userID := c.GetString("user_id")
	count, err := h.svc.EvaluateMilestones(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to evaluate milestones: "+err.Error())
		return
	}
	response.OK(c, gin.H{
		"evaluated": true,
		"updated":   count,
	})
}

// POST /automation/consumption/reconcile
func (h *Handler) ReconcileConsumption(c *gin.Context) {
	userID := c.GetString("user_id")
	count, err := h.svc.ReconcileConsumption(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to reconcile consumption: "+err.Error())
		return
	}
	response.OK(c, gin.H{
		"reconciled": true,
		"depleted":   count,
	})
}

// GET /automation/status
func (h *Handler) GetStatus(c *gin.Context) {
	redisStatus := "connected"
	if err := h.svc.redis.Ping(c.Request.Context()).Err(); err != nil {
		redisStatus = "unavailable"
	}

	response.OK(c, gin.H{
		"status":      "active",
		"redis":       redisStatus,
		"schedulers":  []string{"milestone_evaluator", "consumption_reconciler", "daily_brief_cache"},
	})
}

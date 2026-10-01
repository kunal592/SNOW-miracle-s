package exporter

import (
	"fmt"
	"net/http"

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
	exp := rg.Group("/export")
	{
		exp.GET("/json", h.ExportJSON)
		exp.GET("/csv", h.ExportCSV)
		exp.GET("/markdown", h.ExportMarkdown)
	}
}

// GET /export/json
func (h *Handler) ExportJSON(c *gin.Context) {
	userID := c.GetString("user_id")
	data, err := h.svc.ExportFullBackup(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to export JSON backup: "+err.Error())
		return
	}
	response.OK(c, data)
}

// GET /export/csv?type=expenses|time
func (h *Handler) ExportCSV(c *gin.Context) {
	userID := c.GetString("user_id")
	exportType := c.DefaultQuery("type", "expenses")

	csvBytes, filename, err := h.svc.ExportCSV(c.Request.Context(), userID, exportType)
	if err != nil {
		response.InternalError(c, "Failed to export CSV: "+err.Error())
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	c.Data(http.StatusOK, "text/csv", csvBytes)
}

// GET /export/markdown
func (h *Handler) ExportMarkdown(c *gin.Context) {
	userID := c.GetString("user_id")
	report, err := h.svc.ExportMarkdownReport(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, "Failed to compile markdown report: "+err.Error())
		return
	}

	c.Header("Content-Disposition", "attachment; filename=\"snow_executive_report.md\"")
	c.Data(http.StatusOK, "text/markdown; charset=utf-8", []byte(report))
}

package users

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
	users := rg.Group("/users")
	{
		users.GET("/me", h.GetMe)
		users.PATCH("/me", h.UpdateMe)
	}
}

// GET /users/me
func (h *Handler) GetMe(c *gin.Context) {
	userID := c.GetString("user_id")
	profile, err := h.svc.GetProfile(c.Request.Context(), userID)
	if err != nil {
		response.NotFound(c, "User not found")
		return
	}
	response.OK(c, profile)
}

// PATCH /users/me
func (h *Handler) UpdateMe(c *gin.Context) {
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	userID := c.GetString("user_id")
	profile, err := h.svc.UpdateProfile(c.Request.Context(), userID, req)
	if err != nil {
		response.InternalError(c, "Failed to update profile")
		return
	}
	response.OK(c, profile)
}

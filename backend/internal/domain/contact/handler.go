package contact

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// Create handles POST /api/contacts
// Public endpoint - submit contact form
func (h *Handler) Create(c echo.Context) error {
	var req ContactRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": "Invalid request body",
		})
	}

	result, err := h.service.Create(c.Request().Context(), &req)
	if err != nil {
		// Check for duplicate submission error
		if err.Error() == "DUPLICATE_SUBMISSION: you have already submitted a message recently. Please wait before submitting again." {
			return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
				"success": false,
				"error":   "DUPLICATE_SUBMISSION",
				"message": err.Error(),
			})
		}
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    result,
	})
}

// List handles GET /api/admin/contacts
// Admin only - list all contact submissions
func (h *Handler) List(c echo.Context) error {
	pageStr := c.QueryParam("page")
	limitStr := c.QueryParam("limit")

	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 || limit > 100 {
		limit = 20
	}

	result, err := h.service.List(c.Request().Context(), page, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "INTERNAL_ERROR",
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    result,
	})
}

// FindByID handles GET /api/admin/contacts/:id
// Admin only - get single contact
func (h *Handler) FindByID(c echo.Context) error {
	id := c.Param("id")

	result, err := h.service.FindByID(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "NOT_FOUND",
			"message": "Contact not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    result,
	})
}

// MarkAsRead handles PATCH /api/admin/contacts/:id/read
// Admin only - mark contact as read
func (h *Handler) MarkAsRead(c echo.Context) error {
	id := c.Param("id")

	if err := h.service.MarkAsRead(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Contact marked as read",
	})
}

// MarkAsUnread handles PATCH /api/admin/contacts/:id/unread
// Admin only - mark contact as unread
func (h *Handler) MarkAsUnread(c echo.Context) error {
	id := c.Param("id")

	if err := h.service.MarkAsUnread(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Contact marked as unread",
	})
}

// Delete handles DELETE /api/admin/contacts/:id
// Admin only - delete contact
func (h *Handler) Delete(c echo.Context) error {
	id := c.Param("id")

	if err := h.service.Delete(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Contact deleted successfully",
	})
}

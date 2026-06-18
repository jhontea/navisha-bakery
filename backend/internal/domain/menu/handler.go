package menu

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

// List handles GET /api/menus
// Public endpoint with category filter and pagination
func (h *Handler) List(c echo.Context) error {
	category := c.QueryParam("category")
	availableStr := c.QueryParam("available")
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

	var available *bool
	if availableStr != "" {
		avail, err := strconv.ParseBool(availableStr)
		if err == nil {
			available = &avail
		}
	}

	result, err := h.service.List(c.Request().Context(), category, available, page, limit)
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

// FindByID handles GET /api/menus/:id
// Public endpoint to get a single menu item
func (h *Handler) FindByID(c echo.Context) error {
	id := c.Param("id")

	result, err := h.service.FindByID(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "NOT_FOUND",
			"message": "Menu item not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    result,
	})
}

// ListFeatured handles GET /api/menus/featured
// Public endpoint to get featured menu items for landing page
func (h *Handler) ListFeatured(c echo.Context) error {
	limitStr := c.QueryParam("limit")
	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 || limit > 50 {
		limit = 10
	}

	result, err := h.service.ListFeatured(c.Request().Context(), limit)
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

// Create handles POST /api/admin/menus
// Admin only - create a new menu item
func (h *Handler) Create(c echo.Context) error {
	var req CreateMenuRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": "Invalid request body",
		})
	}

	result, err := h.service.Create(c.Request().Context(), &req)
	if err != nil {
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

// Update handles PUT /api/admin/menus/:id
// Admin only - update an existing menu item
func (h *Handler) Update(c echo.Context) error {
	id := c.Param("id")

	var req UpdateMenuRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": "Invalid request body",
		})
	}

	result, err := h.service.Update(c.Request().Context(), id, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    result,
	})
}

// Delete handles DELETE /api/admin/menus/:id
// Admin only - delete a menu item
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
		"message": "Menu item deleted successfully",
	})
}

// Count handles GET /api/admin/menus/count
// Admin only - get count of menu items
func (h *Handler) Count(c echo.Context) error {
	category := c.QueryParam("category")
	availableStr := c.QueryParam("available")

	var available *bool
	if availableStr != "" {
		avail, err := strconv.ParseBool(availableStr)
		if err == nil {
			available = &avail
		}
	}

	count, err := h.service.Count(c.Request().Context(), category, available)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "INTERNAL_ERROR",
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]int{
			"count": count,
		},
	})
}

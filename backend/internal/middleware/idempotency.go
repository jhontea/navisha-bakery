package middleware

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/navishabakery/backend/internal/cache"
)

// Idempotency returns a middleware that enforces idempotency keys on write requests.
// It checks the Idempotency-Key header and caches the response for 24 hours.
func Idempotency(cacheStore cache.Cache) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			method := c.Request().Method
			if method != http.MethodPost && method != http.MethodPut &&
				method != http.MethodPatch && method != http.MethodDelete {
				return next(c)
			}

			idempotencyKey := c.Request().Header.Get("Idempotency-Key")
			if idempotencyKey == "" {
				return c.JSON(http.StatusBadRequest, map[string]interface{}{
					"success": false,
					"error":   "VALIDATION_ERROR",
					"message": "Idempotency-Key header is required for this request",
				})
			}

			cacheKey := "idempotency:" + method + ":" + c.Path() + ":" + idempotencyKey

			cachedResponse, err := cacheStore.Get(cacheKey)
			if err == nil && cachedResponse != "" {
				var resp map[string]interface{}
				if err := json.Unmarshal([]byte(cachedResponse), &resp); err == nil {
					return c.JSON(http.StatusOK, resp)
				}
			}

			recorder := &responseRecorder{
				writer: c.Response().Writer,
				status: http.StatusOK,
			}
			c.Response().Writer = recorder

			err = next(c)

			if err == nil && recorder.status >= 200 && recorder.status < 300 {
				responseBody := map[string]interface{}{
					"success": true,
					"data":    recorder.body,
				}
				bodyJSON, _ := json.Marshal(responseBody)
				_ = cacheStore.Set(cacheKey, string(bodyJSON), 24*time.Hour)
			}

			return err
		}
	}
}

type responseRecorder struct {
	writer http.ResponseWriter
	status int
	body   interface{}
}

func (r *responseRecorder) Header() http.Header {
	return r.writer.Header()
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	if r.body == nil {
		r.body = string(b)
	}
	return r.writer.Write(b)
}

func (r *responseRecorder) WriteHeader(status int) {
	r.status = status
	r.writer.WriteHeader(status)
}

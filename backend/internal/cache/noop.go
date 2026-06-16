package cache

import "time"

// NoOpCache is a fallback when Redis is unavailable
// All operations succeed but do nothing (fail-open)
type NoOpCache struct{}

func NewNoOpCache() Cache {
	return &NoOpCache{}
}

func (c *NoOpCache) Get(key string) (string, error)                        { return "", ErrCacheUnavailable }
func (c *NoOpCache) Set(key string, value string, ttl time.Duration) error { return nil }
func (c *NoOpCache) Del(keys ...string) error                              { return nil }
func (c *NoOpCache) Exists(key string) (bool, error)                       { return false, nil }
func (c *NoOpCache) Incr(key string) (int64, error)                        { return 1, nil }
func (c *NoOpCache) SetNX(key string, value string, ttl time.Duration) (bool, error) {
	return true, nil
}
func (c *NoOpCache) Ping() error { return ErrCacheUnavailable }

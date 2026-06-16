package cache

import "time"

//go:generate go run go.uber.org/mock/mockgen -destination=../../mocks/cache/mock_cache.go -package=cache . Cache

// Cache defines the contract for key-value caching
type Cache interface {
	Get(key string) (string, error)
	Set(key string, value string, ttl time.Duration) error
	Del(keys ...string) error
	Exists(key string) (bool, error)
	Incr(key string) (int64, error)
	SetNX(key string, value string, ttl time.Duration) (bool, error)
	Ping() error
}

package cache

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

var ErrCacheUnavailable = errors.New("cache unavailable")

type redisCache struct {
	client *redis.Client
}

// NewCache creates a new Redis-backed cache
func NewCache(redisURL string) (Cache, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}

	client := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return &redisCache{client: client}, nil
}

func (c *redisCache) Get(key string) (string, error) {
	val, err := c.client.Get(context.Background(), key).Result()
	if err == redis.Nil {
		return "", nil
	}
	return val, err
}

func (c *redisCache) Set(key string, value string, ttl time.Duration) error {
	return c.client.Set(context.Background(), key, value, ttl).Err()
}

func (c *redisCache) Del(keys ...string) error {
	return c.client.Del(context.Background(), keys...).Err()
}

func (c *redisCache) Exists(key string) (bool, error) {
	val, err := c.client.Exists(context.Background(), key).Result()
	return val > 0, err
}

func (c *redisCache) Incr(key string) (int64, error) {
	return c.client.Incr(context.Background(), key).Result()
}

func (c *redisCache) SetNX(key string, value string, ttl time.Duration) (bool, error) {
	return c.client.SetNX(context.Background(), key, value, ttl).Result()
}

func (c *redisCache) Ping() error {
	return c.client.Ping(context.Background()).Err()
}

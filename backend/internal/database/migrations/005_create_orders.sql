-- Migration: 005_create_orders
-- Created at: 2026-06-16

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(30) NOT NULL UNIQUE,
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name       VARCHAR(255) NOT NULL,
    customer_phone      VARCHAR(50),
    customer_email      VARCHAR(255),
    delivery_address    TEXT,
    delivery_notes      TEXT,
    pickup_date         DATE,
    pickup_time         TIME,
    status              order_status NOT NULL DEFAULT 'pending',
    total_amount        DECIMAL(10, 2) NOT NULL DEFAULT 0,
    channel             VARCHAR(50) NOT NULL DEFAULT 'web',
    telegram_message_id INTEGER,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
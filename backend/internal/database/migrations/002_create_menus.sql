-- Migration: 002_create_menus
-- Created at: 2026-06-16

CREATE TABLE IF NOT EXISTS menus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,
    price           DECIMAL(10, 2) NOT NULL,
    discount        DECIMAL(5, 2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    discount_price  DECIMAL(10, 2),
    image_url       TEXT,
    image_key       VARCHAR(500),
    is_available    BOOLEAN NOT NULL DEFAULT true,
    is_featured     BOOLEAN DEFAULT false,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_category ON menus(category);
CREATE INDEX IF NOT EXISTS idx_menus_available ON menus(is_available);
CREATE INDEX IF NOT EXISTS idx_menus_featured ON menus(is_featured);
-- Migration: 003_create_contacts
-- Created at: 2026-06-16

CREATE TABLE IF NOT EXISTS contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    submission_hash VARCHAR(64),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts(is_read);
CREATE INDEX IF NOT EXISTS idx_contacts_hash ON contacts(submission_hash);
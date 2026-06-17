-- Migration: 007_seed_super_admin
-- Created at: 2026-06-17
-- Seeds the initial super admin from SUPER_ADMIN_EMAIL environment variable
-- This runs only if no admins exist yet

INSERT INTO admins (email, name, role, is_active)
SELECT
    COALESCE(current_setting('app.super_admin_email', true), 'owner@navishabakery.com') AS email,
    'Super Admin' AS name,
    'super_admin' AS role,
    true AS is_active
WHERE NOT EXISTS (SELECT 1 FROM admins);
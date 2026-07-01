-- ============================================================
-- fix_rls.sql
-- Run this in Supabase SQL Editor to fix the "Failed to fetch"
-- / insert permission error
-- ============================================================

-- ── Option A: Allow anon (unauthenticated) inserts ────────────
-- Use this ONLY during development/testing
-- Comment out when you go to production

ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;


-- ── Option B (PRODUCTION — use this instead of Option A) ─────
-- Keep RLS ON but allow both authenticated users AND the anon role

-- Re-enable RLS
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop old policies
-- DROP POLICY IF EXISTS "Authenticated users can manage students" ON students;
-- DROP POLICY IF EXISTS "Authenticated users can manage payments" ON payments;

-- Allow authenticated users full access
-- CREATE POLICY "auth_students" ON students
--   FOR ALL TO authenticated
--   USING (true) WITH CHECK (true);

-- CREATE POLICY "auth_payments" ON payments
--   FOR ALL TO authenticated
--   USING (true) WITH CHECK (true);

-- Allow anon read (for public pages if needed)
-- CREATE POLICY "anon_read_students" ON students
--   FOR SELECT TO anon USING (true);

-- ============================================================
-- Noor Academy — Quran Hifz System
-- Supabase SQL Schema
--
-- HOW TO USE:
--   1. Go to https://supabase.com → your project
--   2. Click "SQL Editor" in the left sidebar
--   3. Click "New query"
--   4. Paste this entire file
--   5. Click "Run"
-- ============================================================


-- ============================================================
-- 1. STUDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Personal info (matches Amharic registration form)
  full_name         text          NOT NULL,
  gender            text          NOT NULL CHECK (gender IN ('ወንድ (Male)', 'ሴት (Female)')),
  age               integer       NOT NULL CHECK (age > 0 AND age < 120),
  place_of_birth    text,
  class_level       text,                         -- ክፍል 1-12
  hiz_level         text          NOT NULL CHECK (hiz_level IN ('Beginner','Intermediate','Advanced','Hafiz Track')),

  -- Parents
  parent1_name      text          NOT NULL,
  parent1_phone     text          NOT NULL,
  parent2_name      text,
  parent2_phone     text,

  -- Finance
  monthly_fee       numeric(10,2) NOT NULL DEFAULT 0,

  -- Location
  student_area      text,                         -- ቀበሌ / area
  correction_area   text,                         -- የሚስተካከልበት ቦታ

  -- Academic
  starting_surah    text,
  starting_juz      text,
  class_days        text[],                       -- array: ['Monday','Wednesday']
  teacher_notes     text,

  -- Extra
  special_needs     text,
  transport         text,
  photo_url         text,                         -- Supabase Storage public URL

  -- Timestamps
  registered_at     timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast name search
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students USING gin (to_tsvector('simple', full_name));
CREATE INDEX IF NOT EXISTS idx_students_hiz_level ON students (hiz_level);


-- ============================================================
-- 2. PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  student_id    uuid          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name  text          NOT NULL,   -- denormalized for fast display

  amount        numeric(10,2) NOT NULL CHECK (amount > 0),
  method        text          NOT NULL CHECK (method IN ('Cash','Bank Transfer','Mobile Money')),
  month         text          NOT NULL,   -- e.g. 'January'
  year          text          NOT NULL,   -- e.g. '2025'
  note          text,

  paid_at       timestamptz   NOT NULL DEFAULT now(),
  created_at    timestamptz   NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments (student_id);
CREATE INDEX IF NOT EXISTS idx_payments_period     ON payments (month, year);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at    ON payments (paid_at DESC);


-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- RLS is enabled so unauthenticated users cannot read/write
-- any data directly through the Supabase JS client.
-- Your Express backend uses the SECRET KEY which bypasses RLS.

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (logged-in admin/manager) to do everything
CREATE POLICY "Authenticated users can manage students"
  ON students FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 4. REALTIME
-- ============================================================
-- Enable realtime so the frontend receives live updates
-- when rows are inserted / updated / deleted.

ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;


-- ============================================================
-- 5. STORAGE BUCKET
-- ============================================================
-- Creates the bucket for student passport photos.

INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload/read/delete photos
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'student-photos');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'student-photos');


-- ============================================================
-- 6. SAMPLE DATA (optional — delete if you don't need it)
-- ============================================================
-- Uncomment the block below to insert one test student + payment

/*
INSERT INTO students (
  full_name, gender, age, hiz_level,
  parent1_name, parent1_phone,
  monthly_fee, class_days, starting_surah, starting_juz
) VALUES (
  'Abdullah Ahmed Hassan',
  'ወንድ (Male)',
  12,
  'Beginner',
  'Ahmed Hassan',
  '+251911000001',
  300,
  ARRAY['Monday','Wednesday','Friday'],
  'Al-Fatiha',
  'Juz'' 1'
);

INSERT INTO payments (
  student_id, student_name,
  amount, method, month, year, note
)
SELECT
  id,
  full_name,
  300,
  'Cash',
  'January',
  '2025',
  'First month'
FROM students
WHERE full_name = 'Abdullah Ahmed Hassan'
LIMIT 1;
*/

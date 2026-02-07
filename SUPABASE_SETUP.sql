-- Run this in your Supabase SQL Editor

-- 1. Assessments Table
-- Stores the high-level profile and analysis summary
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Core Searchable Fields (Mapped from UserProfile)
  monthly_income NUMERIC,
  household_size INT,
  zip_code TEXT,
  primary_hardships TEXT[], -- Array of strings
  
  -- Full Data Blobs (For complete context retrieval)
  profile_data JSONB NOT NULL,
  analysis_summary JSONB NOT NULL
);

-- 2. Eligibility Results Table
-- Stores the specific program matches found by the AI
CREATE TABLE eligibility_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  
  program_id TEXT NOT NULL,      -- e.g. 'snap', 'wic'
  program_name TEXT NOT NULL,
  category TEXT,                 -- e.g. 'Food', 'Housing'
  
  is_eligible BOOLEAN,
  confidence_score NUMERIC,      -- 0 to 1
  estimated_monthly_benefit NUMERIC,
  
  reason TEXT,                   -- AI explanation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Applications Table
-- Tracks submitted applications
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Link to assessment if available (optional)
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  
  program_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'under_review', 'waitlisted', 'action_required', 'denied')),
  
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmation_number TEXT NOT NULL,
  
  estimated_decision_date DATE,
  benefit_amount TEXT,
  next_steps TEXT
);

-- 4. Notifications Table
-- System notifications for the user
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'action')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_assessments_zip ON assessments(zip_code);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Optional: Enable Row Level Security (RLS)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- For POC (Proof of Concept) without Auth, allow public access
-- WARN: Do not use this in production without proper Authentication policies
CREATE POLICY "Allow public insert to assessments" ON assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on assessments" ON assessments FOR SELECT USING (true);

CREATE POLICY "Allow public insert to eligibility_results" ON eligibility_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on eligibility_results" ON eligibility_results FOR SELECT USING (true);

CREATE POLICY "Allow public all on applications" ON applications USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on notifications" ON notifications USING (true) WITH CHECK (true);

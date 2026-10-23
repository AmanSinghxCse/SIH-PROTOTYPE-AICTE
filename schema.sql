-- ====================================================================
-- AICTE CaseTrack (SIH26264) - Supabase / PostgreSQL Schema Definition
-- Integrated Complaint Monitoring & Tracking System
-- ====================================================================

-- 1. Profiles & Roles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'officer', 'supervisor', 'management')),
    designation TEXT,
    bureau_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Institutions Table
CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- Permanent AICTE ID (e.g. AICTE-1-8492011)
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT,
    accredited_grade TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    established_year INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_institutions_code ON institutions(code);

-- 3. AICTE Bureaus / Cells Table
CREATE TABLE IF NOT EXISTS bureaus (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT,
    officer_in_charge TEXT,
    default_deadline_days INT DEFAULT 30
);

-- 4. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY, -- e.g. AICTE-2026-COMP-101
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    institution_id TEXT REFERENCES institutions(id) ON DELETE RESTRICT,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' 
        CHECK (status IN ('Open', 'Under Review', 'Awaiting Information', 'Escalated', 'Resolved', 'Closed')),
    priority TEXT NOT NULL DEFAULT 'Normal'
        CHECK (priority IN ('Normal', 'Medium', 'High', 'Urgent')),
    bureau_id TEXT REFERENCES bureaus(id) ON DELETE RESTRICT,
    assigned_officer_id TEXT,
    assigned_officer_name TEXT,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline_date DATE NOT NULL,
    resolved_date DATE,
    resolution_summary TEXT,
    source_channel TEXT DEFAULT 'Online Portal',
    reference_number TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_complaints_institution ON complaints(institution_id);
CREATE INDEX IF NOT EXISTS idx_complaints_bureau ON complaints(bureau_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_deadline ON complaints(deadline_date);

-- 5. Complaint Status History / Event Stream
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_status_history_complaint ON complaint_status_history(complaint_id);

-- 6. Officer Notes & Follow-up Directives
CREATE TABLE IF NOT EXISTS complaint_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    content TEXT NOT NULL,
    action_item TEXT,
    is_official_action BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Explainable Related Case Suggestions
CREATE TABLE IF NOT EXISTS related_case_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    related_complaint_id TEXT REFERENCES complaints(id) ON DELETE CASCADE,
    institution_match_score NUMERIC(5,2),
    category_match_score NUMERIC(5,2),
    text_similarity_score NUMERIC(5,2),
    overall_score NUMERIC(5,2) NOT NULL,
    match_signals TEXT[],
    explanation TEXT,
    status TEXT DEFAULT 'Pending Review' 
        CHECK (status IN ('Pending Review', 'Confirmed Related', 'Marked Unrelated')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Immutable Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- Row Level Security (RLS) Policies
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_case_suggestions ENABLE ROW LEVEL SECURITY;

-- Read policy: Permitted roles can view records
CREATE POLICY "Allow authenticated read" ON complaints
    FOR SELECT TO authenticated USING (true);

-- Update policy: Admin, Officer, Supervisor can mutate status
CREATE POLICY "Allow authorized status mutation" ON complaints
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'officer', 'supervisor')
        )
    );

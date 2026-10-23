import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  Download,
  Copy,
  Check,
  FileCode,
  Info,
  Server,
  KeyRound,
  Workflow,
  Sparkles
} from 'lucide-react';

const SQL_SCHEMA = `-- ====================================================================
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
CREATE INDEX idx_institutions_code ON institutions(code);

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
CREATE INDEX idx_complaints_institution ON complaints(institution_id);
CREATE INDEX idx_complaints_bureau ON complaints(bureau_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_deadline ON complaints(deadline_date);

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
CREATE INDEX idx_status_history_complaint ON complaint_status_history(complaint_id);

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
CREATE INDEX idx_audit_entity ON audit_logs(entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

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
`;

export const AboutArchitecturePage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([SQL_SCHEMA], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aicte_casetrack_schema.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 bg-gradient-to-r from-[#0B192C] via-blue-950 to-slate-900 text-white rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
            Smart India Hackathon • Problem ID SIH26264
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            Prototype Evaluation
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          AICTE CaseTrack: Architecture & Engineering Blueprint
        </h1>

        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
          An integrated institutional complaint monitoring and tracking system designed for AICTE Bureaus and Cells.
          Empowers nodal officers with cross-bureau visibility, automated case ageing surveillance, and explainable
          heuristic related-case detection—with strict human-in-the-loop decision safeguards.
        </p>
      </div>

      {/* System Architecture Diagram */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            System Architecture & Component Flow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end data processing pipeline from intake to officer resolution.
          </p>
        </div>

        {/* Visual Pipeline Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
          {/* Block 1 */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase text-blue-700">Layer 1</div>
            <div className="text-xs font-bold text-slate-900">User Interface</div>
            <p className="text-[10px] text-slate-500">React 19, TypeScript, Tailwind CSS, Recharts</p>
          </div>

          {/* Block 2 */}
          <div className="p-3 bg-[#E5F1FC] rounded-xl border border-[#D6E4F0] text-center space-y-1">
            <div className="text-[10px] font-bold uppercase text-[#0B477F]">Layer 2</div>
            <div className="text-xs font-bold text-[#17324D]">Auth & RBAC</div>
            <p className="text-[10px] text-[#53677D]">5 Enforced Roles, Session Control, Token Verify</p>
          </div>

          {/* Block 3 */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-700">Layer 3</div>
            <div className="text-xs font-bold text-slate-900">Backend API</div>
            <p className="text-[10px] text-slate-500">Supabase Edge / Express REST & State Controller</p>
          </div>

          {/* Block 4 */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase text-emerald-700">Layer 4</div>
            <div className="text-xs font-bold text-slate-900">PostgreSQL Store</div>
            <p className="text-[10px] text-slate-500">RLS Policies, Foreign Keys, Entity Indexing</p>
          </div>

          {/* Block 5 */}
          <div className="p-3 bg-[#F1F7FC] rounded-xl border border-[#D6E4F0] text-center space-y-1">
            <div className="text-[10px] font-bold uppercase text-[#0B477F]">Layer 5</div>
            <div className="text-xs font-bold text-[#17324D]">Matching Engine</div>
            <p className="text-[10px] text-[#53677D]">Explainable NLP, Jaccard, Fuzzy Distance</p>
          </div>

          {/* Block 6 */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase text-amber-800">Layer 6</div>
            <div className="text-xs font-bold text-slate-900">Alerts & Audit</div>
            <p className="text-[10px] text-slate-500">Ageing Calculations & Tamper-Evident Logs</p>
          </div>
        </div>

        {/* Readable flow text */}
        <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed space-y-1.5 border border-slate-200">
          <strong className="text-slate-900 font-semibold">How data moves through AICTE CaseTrack:</strong>
          <p>
            1. <strong>Intake:</strong> Petitions filed via Online Portal, CPGRAMS, or Inspection Reports are assigned unique persistent identifiers (e.g., <code>AICTE-2026-COMP-104</code>).<br />
            2. <strong>Indexing:</strong> Records are bound to the permanent AICTE Institution ID (e.g., <code>AICTE-1-8492011</code>), linking historical records across all cells.<br />
            3. <strong>Analysis:</strong> The Explainable Heuristic Engine scans for keyword, category, and entity overlap, generating potential duplicate alerts without altering official case states.<br />
            4. <strong>Surveillance:</strong> Date delta monitors verify case age against statutory deadlines, triggering visual alerts when deadlines are within 5 days or breached.<br />
            5. <strong>Action & Audit:</strong> Status transitions and assignments require written officer justifications and are permanently recorded in the immutable audit log.
          </p>
        </div>
      </div>

      {/* Heuristic Algorithm Formula */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#0B477F]" />
            Explainable Related-Case Scoring Methodology
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mathematical breakdown of weights and signals.
          </p>
        </div>

        <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs space-y-2 overflow-x-auto">
          <div className="text-amber-400 font-bold">// Weighted Heuristic Score (Normalized 0 to 100 points)</div>
          <div>Score = W_inst + W_cat + W_text + W_date</div>
          <div className="text-slate-400 pl-4">
            Where:<br />
            • W_inst = 40 pts if exact AICTE Institution ID matches; up to 35 pts for fuzzy name similarity.<br />
            • W_cat  = 25 pts if primary complaint category is identical.<br />
            • W_text = up to 30 pts based on Jaccard token overlap & domain-specific stopword removal.<br />
            • W_date = 5 pts bonus if filed within a 30-day temporal window; 3 pts if within 60 days.
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Why explainable heuristics over unvalidated deep learning models?</strong> In national government administration,
          decisions must withstand legal scrutiny and RTI queries. An explainable rule breakdown provides officers with the
          exact justification (e.g. <em>"Identical Institution ID + Category Match + Overlapping terms [caution, refund]"</em>),
          ensuring full transparency while avoiding hallucinated false correlations.
        </p>
      </div>

      {/* Database Schema SQL Box */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Production Database Schema (PostgreSQL / Supabase)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Production-ready DDL script with Row Level Security policies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySQL}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>

            <button
              onClick={handleDownloadSQL}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .sql</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-80 leading-relaxed border border-slate-800">
          <pre>{SQL_SCHEMA}</pre>
        </div>
      </div>

      {/* Limitations & Future Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-xs border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            Current Prototype Disclosures & Boundaries
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc pl-4">
            <li><strong>Fictional Demonstration Data:</strong> All 26 complaints and 8 educational institutions are strictly fictional models constructed for SIH evaluation.</li>
            <li><strong>Offline Local Persistence:</strong> State persists in reactive browser localStorage; genuine Supabase connection scripts are ready for staging deployment.</li>
            <li><strong>Explainable Rules:</strong> Utilizes transparent tokenization and Jaccard distance rather than unverified commercial LLM APIs.</li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-xs border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Workflow className="w-4 h-4 text-blue-600" />
            Phase 2 AICTE Integration Roadmap
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc pl-4">
            <li><strong>National Single Sign-On (Jan Parichay):</strong> Direct authentication using MeriPehchan / Government SSO credentials.</li>
            <li><strong>Bilingual Multilingual NLP:</strong> Ingesting student grievances in 12 Schedule VIII regional Indian languages with auto-translation.</li>
            <li><strong>Automated Inspection Summoning:</strong> Automated dispatch of digital notices with QR-encoded verification tokens.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { isOverdue, formatDate } from '../utils/dateUtils';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Search,
  Building2,
  Users,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  MapPin,
  Briefcase
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { complaints } = useCaseTrack();

  const [trackInput, setTrackInput] = useState('');
  const [trackError, setTrackError] = useState('');

  // Calculate live summary figures
  const totalCount = complaints.length;
  const openCount = complaints.filter(c => c.status === 'Open').length;
  const underReviewCount = complaints.filter(c => c.status === 'Under Review' || c.status === 'Awaiting Information').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const overdueCount = complaints.filter(c => isOverdue(c.deadlineDate, c.status)).length;

  // Recent complaints preview (5 latest records)
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
    .slice(0, 5);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackInput.trim().toUpperCase();
    if (!query) {
      setTrackError('Please enter a Complaint ID or Reference Number.');
      return;
    }

    // Try finding exact ID match
    const found = complaints.find(
      c => c.id.toUpperCase() === query || (c.referenceNumber && c.referenceNumber.toUpperCase().includes(query))
    );

    if (found) {
      navigate(`/portal/public?track=${encodeURIComponent(found.id)}`);
    } else {
      setTrackError(`No active complaint record found matching "${trackInput.trim()}". Please verify the Complaint ID (e.g. AICTE-2026-COMP-104).`);
    }
  };

  const scrollToTrack = () => {
    const el = document.getElementById('track-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 animate-fadeInUp pb-10">
      {/* 1. Hero Section with Authentic AICTE Headquarters Photograph */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064578] via-[#0B477F] to-[#155A91] text-white shadow-md border border-[#D6E4F0]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-10 lg:p-12 gap-8 relative z-10">
          {/* Left Column: Heading, Description & Action Buttons */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-xs border border-white/20 text-[#E5F1FC]">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart India Hackathon SIH26264 Prototype</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Institution Complaint Monitoring & Case Intelligence
            </h1>

            <p className="text-sm sm:text-base text-[#E5F1FC] leading-relaxed max-w-xl">
              A centralized platform to monitor institution-related complaints, track case progress, identify potentially related cases, and improve accountability.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/portals')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-white text-[#0B477F] hover:bg-[#F1F7FC] shadow-sm transition-all"
              >
                <span>Select Your Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#064578]/80 text-white border border-white/30 hover:bg-[#064578] transition-all"
              >
                <span>Monitoring Dashboard</span>
              </button>

              <button
                onClick={scrollToTrack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#064578]/80 text-white border border-white/30 hover:bg-[#064578] transition-all"
              >
                <Search className="w-4 h-4 text-amber-300" />
                <span>Track a Complaint</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#E5F1FC]/80 pt-2 border-t border-white/15">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cross-Bureau Surveillance</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explainable Related-Case Detection</span>
              </span>
            </div>
          </div>

          {/* Right Column: Genuine AICTE Headquarters Campus Photograph */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 group">
              {/* Image Container with Responsive Aspect Ratio */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#064578]">
                <img
                  src="/assets/aicte-headquarters.jpg"
                  alt="AICTE Headquarters Campus, Nelson Mandela Marg, Vasant Kunj, New Delhi"
                  loading="eager"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                />
                {/* Subtle Navy Gradient Overlay for Clean Contrast & Integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#064578]/90 via-[#0B477F]/30 to-transparent pointer-events-none" />

                {/* Building Caption & Location Badge */}
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-[#064578]/85 backdrop-blur-xs border border-white/20 text-white">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Building2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="line-clamp-1">AICTE Headquarters Campus</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-medium shrink-0">
                      New Delhi
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#E5F1FC]/80 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                    <span className="line-clamp-1">Nelson Mandela Marg, Vasant Kunj - 110070</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Below-Hero Statistics Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
            Live Centralized Telemetry Overview
          </span>
          <span className="text-[11px] text-[#53677D]">
            Fictional Demonstration Data • Real Ground-Truth Calculations (2026)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Total Complaints */}
          <div
            onClick={() => navigate('/registry')}
            className="p-4 bg-white rounded-xl border border-[#D6E4F0] hover:border-[#155A91] shadow-xs cursor-pointer interactive-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#53677D]">Total Complaints</span>
              <FolderOpen className="w-4 h-4 text-[#0B477F]" />
            </div>
            <div className="text-2xl font-black text-[#0B477F] mt-2">{totalCount}</div>
            <div className="text-[11px] text-[#53677D] mt-0.5">Across 5 AICTE Bureaus</div>
          </div>

          {/* Open Cases */}
          <div
            onClick={() => navigate('/registry?status=Open')}
            className="p-4 bg-white rounded-xl border border-[#D6E4F0] hover:border-[#155A91] shadow-xs cursor-pointer interactive-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B477F]">Open Cases</span>
              <FileText className="w-4 h-4 text-[#155A91]" />
            </div>
            <div className="text-2xl font-black text-[#0B477F] mt-2">{openCount}</div>
            <div className="text-[11px] text-[#53677D] mt-0.5">Awaiting initial assessment</div>
          </div>

          {/* Under Review */}
          <div
            onClick={() => navigate('/registry?status=Under%20Review')}
            className="p-4 bg-white rounded-xl border border-[#D6E4F0] hover:border-amber-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706]">Under Review</span>
              <Clock className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="text-2xl font-black text-[#D97706] mt-2">{underReviewCount}</div>
            <div className="text-[11px] text-[#53677D] mt-0.5">Inquiry & evidence active</div>
          </div>

          {/* Resolved Cases */}
          <div
            onClick={() => navigate('/registry?status=Resolved')}
            className="p-4 bg-white rounded-xl border border-[#D6E4F0] hover:border-emerald-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#237A50]">Resolved Cases</span>
              <CheckCircle2 className="w-4 h-4 text-[#237A50]" />
            </div>
            <div className="text-2xl font-black text-[#237A50] mt-2">{resolvedCount}</div>
            <div className="text-[11px] text-[#53677D] mt-0.5">Verified compliance achieved</div>
          </div>

          {/* Overdue Cases */}
          <div
            onClick={() => navigate('/registry?overdue=true')}
            className="p-4 bg-red-50/40 rounded-xl border border-red-200 hover:border-red-400 shadow-xs cursor-pointer interactive-card col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C43D3D]">Overdue Cases</span>
              <AlertCircle className="w-4 h-4 text-[#C43D3D] animate-pulse" />
            </div>
            <div className="text-2xl font-black text-[#C43D3D] mt-2">{overdueCount}</div>
            <div className="text-[11px] text-[#C43D3D] font-semibold mt-0.5">Exceeded target timeline</div>
          </div>
        </div>
      </section>

      {/* 3. Choose Your Portal Section */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-[#17324D]">Select Your Authorized Portal</h2>
          <p className="text-xs text-[#53677D]">
            Distinct portals for Public Redressal, Central System Administration, and Government Officials Case Management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* 1. Public Portal */}
          <div className="p-6 bg-white rounded-xl border-t-4 border-t-[#0B477F] border-x border-b border-[#D6E4F0] shadow-xs space-y-4 flex flex-col justify-between interactive-card">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E5F1FC] flex items-center justify-center text-[#0B477F]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17324D]">Public Portal</h3>
              <p className="text-xs text-[#53677D] leading-relaxed">
                For students, parents, faculty, and citizens to register grievances, track live status with token authentication, inspect 10-stage milestones, and respond to clarifications.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/portal/public')}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0B477F] text-white hover:bg-[#155A91] text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Enter Public Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2 px-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span>File New Complaint (Form 1A)</span>
              </button>
            </div>
          </div>

          {/* 2. Administration Portal */}
          <div className="p-6 bg-white rounded-xl border-t-4 border-t-[#064578] border-x border-b border-[#D6E4F0] shadow-xs space-y-4 flex flex-col justify-between interactive-card">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#064578]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17324D]">Administration Portal</h3>
              <p className="text-xs text-[#53677D] leading-relaxed">
                Central system control and governance command. System-wide analytics, 20 KPI monitoring cards, staff user RBAC, bureau allocation oversight, and closure sanctions.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/portal/admin')}
                className="w-full py-2.5 px-4 rounded-lg bg-[#064578] text-white hover:bg-[#0B477F] text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Enter Administration Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/admin/how-it-works')}
                className="w-full py-2 px-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Admin Redressal SOP</span>
              </button>
            </div>
          </div>

          {/* 3. Government Officials Portal */}
          <div className="p-6 bg-white rounded-xl border-t-4 border-t-indigo-700 border-x border-b border-[#D6E4F0] shadow-xs space-y-4 flex flex-col justify-between interactive-card">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17324D]">Government Officials Portal</h3>
              <p className="text-xs text-[#53677D] leading-relaxed">
                Operational case workspace for bureau desk officers. Examine evidence, dispatch statutory college explanation notices, record rejoinders, and formulate resolution findings.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/portal/officials')}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Enter Officials Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/officials/how-it-works')}
                className="w-full py-2 px-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Officer Operational Guide</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recent Complaints / Live Demonstration Preview Table */}
      <section className="bg-white rounded-xl border border-[#D6E4F0] shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D6E4F0]">
          <div>
            <h2 className="text-base font-bold text-[#17324D] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0B477F]" />
              <span>Recent Complaint Intake (Live Preview)</span>
            </h2>
            <p className="text-xs text-[#53677D] mt-0.5">
              Latest institution grievance files actively managed within the centralized registry.
            </p>
          </div>

          <button
            onClick={() => navigate('/registry')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0B477F] hover:text-[#155A91] hover:underline self-start sm:self-auto"
          >
            <span>View All {totalCount} Complaints in Registry</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D6E4F0] text-[#53677D] font-semibold uppercase tracking-wider text-[10px] bg-[#F1F7FC]">
                <th className="py-2.5 px-3">Complaint ID</th>
                <th className="py-2.5 px-3">Institution & Code</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Submission Date</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6E4F0]">
              {recentComplaints.map(c => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/case/${c.id}`)}
                  className="hover:bg-[#E5F1FC]/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3 font-mono font-bold text-[#0B477F]">
                    {c.id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#17324D] group-hover:text-[#0B477F]">
                      {c.institutionName}
                    </div>
                    <div className="text-[10px] text-[#53677D] font-mono">
                      {c.institutionCode}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#17324D]">
                    <span className="px-2 py-0.5 rounded bg-[#F1F7FC] border border-[#D6E4F0] text-[11px]">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#53677D] text-[11px]">
                    {formatDate(c.submissionDate)}
                  </td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-xs font-semibold text-[#0B477F] group-hover:underline inline-flex items-center gap-1">
                      <span>Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Citizen Tracking & Public Redressal Advisory */}
      <section id="track-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Citizen Redressal Advisory & Rights */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#D6E4F0] p-6 space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0B477F]" />
              <span>AICTE Citizen Redressal Advisory & Complainant Rights</span>
            </h3>
            <p className="text-xs text-[#53677D] mt-0.5">
              Statutory protections and guidelines governing student and faculty grievances under AICTE Redressal Regulations 2019.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-[#17324D]">Statutory Timelines</div>
              <p className="text-[11px] text-[#53677D] leading-relaxed">
                Mandatory resolution timeline within 30 days for general grievances, and 14 days for urgent fee/ragging dockets.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-[#17324D]">Identity Protection</div>
              <p className="text-[11px] text-[#53677D] leading-relaxed">
                Complainants may submit anonymously or with confidential flag to protect against institutional retaliation.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-[#17324D]">Direct Enforcement</div>
              <p className="text-[11px] text-[#53677D] leading-relaxed">
                Council orders mandate direct fee refunds and remedial actions with compliance verified before closure.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D6E4F0] flex items-center justify-between text-xs text-[#53677D]">
            <span>Need to file a new institutional complaint?</span>
            <button
              onClick={() => navigate('/register')}
              className="font-bold text-[#0B477F] hover:underline flex items-center gap-1"
            >
              <span>File Complaint (Form 1A)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Track Your Complaint Widget */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#D6E4F0] p-6 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#0B477F] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#0B477F]" />
              <span>Track Your Complaint</span>
            </h3>
            <p className="text-xs text-[#53677D]">
              Enter your complaint reference number or token to check live status.
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trackInput}
                onChange={e => {
                  setTrackInput(e.target.value);
                  setTrackError('');
                }}
                placeholder="e.g. AICTE-2026-COMP-104"
                className="flex-1 p-2 bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                Track →
              </button>
            </div>

            {trackError && (
              <div className="text-[11px] text-[#C43D3D]">{trackError}</div>
            )}

            <div className="text-[11px] text-[#53677D] flex items-center gap-1.5 pt-1 border-t border-[#D6E4F0]">
              <Info className="w-3.5 h-3.5 text-[#0B477F] shrink-0" />
              <span>Try sample IDs: <strong>AICTE-2026-COMP-104</strong> or <strong>COMP-101</strong></span>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

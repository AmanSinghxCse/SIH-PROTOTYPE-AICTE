import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Building,
  FileText,
  Check,
  X,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Filter
} from 'lucide-react';

export const VerificationDashboardPage: React.FC = () => {
  const { currentUser, complaints, institutions, updateVerificationStatus } = useCaseTrack();

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'verified' | 'incomplete' | 'flagged'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats calculation
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => !c.verificationStatus || c.verificationStatus === 'Pending').length;
    const verified = complaints.filter(c => c.verificationStatus === 'Verified').length;
    const incomplete = complaints.filter(c => c.verificationStatus === 'Needs Information').length;
    const flagged = complaints.filter(c => c.verificationStatus === 'Flagged').length;

    return { total, pending, verified, incomplete, flagged };
  }, [complaints]);

  // Scrutiny Queue list
  const queueCases = useMemo(() => {
    return complaints.filter(c => {
      // Tab filter
      const vStatus = c.verificationStatus || 'Pending';
      if (filterState === 'pending' && vStatus !== 'Pending') return false;
      if (filterState === 'verified' && vStatus !== 'Verified') return false;
      if (filterState === 'incomplete' && vStatus !== 'Needs Information') return false;
      if (filterState === 'flagged' && vStatus !== 'Flagged') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.institutionName.toLowerCase().includes(q) ||
          (c.institutionCode && c.institutionCode.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [complaints, filterState, searchQuery]);

  const activeCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return complaints.find(c => c.id === selectedCaseId) || null;
  }, [selectedCaseId, complaints]);

  // Check institution validity against AICTE registry
  const matchedInstitution = useMemo(() => {
    if (!activeCase) return null;
    return institutions.find(
      inst =>
        inst.id === activeCase.institutionId ||
        (inst.code && activeCase.institutionCode && inst.code.toLowerCase() === activeCase.institutionCode.toLowerCase())
    );
  }, [activeCase, institutions]);

  const handleAction = (status: 'Verified' | 'Needs Information' | 'Flagged') => {
    if (!selectedCaseId) return;

    const defaultRemarks =
      status === 'Verified'
        ? 'Verified institution AICTE code and mandatory supporting documentation.'
        : status === 'Needs Information'
        ? remarks || 'Submission incomplete. Essential details or valid student verification missing.'
        : remarks || 'Flagged for potential duplicate or fraudulent filing.';

    updateVerificationStatus(selectedCaseId, status, remarks.trim() || defaultRemarks);
    setActionSuccess(`Verification decision saved: Case marked as "${status}".`);
    setRemarks('');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Preliminary Scrutiny & Ingestion Desk • Stage 2 Lifecycle</span>
          </div>
          <h1 className="text-2xl font-black text-[#17324D]">
            AICTE Complaint Verification & Institution Scrutiny
          </h1>
          <p className="text-xs text-[#53677D] mt-1">
            Verification Lead: <strong className="text-[#17324D]">{currentUser.name}</strong> &bull; {currentUser.designation}
          </p>
        </div>

        <Link
          to="/institutions"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F1F7FC] border border-[#D6E4F0] text-[#0B477F] text-xs font-bold rounded-lg hover:bg-[#E5F1FC] transition-all shadow-sm"
        >
          <Building className="w-4 h-4 text-[#0B477F]" />
          <span>Verify Against Institution Directory</span>
        </Link>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase">
            <span>Awaiting Scrutiny</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.pending}</p>
          <p className="text-[11px] text-[#53677D]">Fresh submissions</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase">
            <span>Verified & Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.verified}</p>
          <p className="text-[11px] text-[#53677D]">Ready for cell allocation</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-blue-800 uppercase">
            <span>Needs Info</span>
            <HelpCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats.incomplete}</p>
          <p className="text-[11px] text-[#53677D]">Sent back to complainant</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-red-800 uppercase">
            <span>Flagged / Duplicate</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-700 mt-1">{stats.flagged}</p>
          <p className="text-[11px] text-[#53677D]">Potential anomalies</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#53677D] uppercase">
            <span>Total Ingestion</span>
            <FileText className="w-4 h-4 text-[#0B477F]" />
          </div>
          <p className="text-2xl font-black text-[#17324D] mt-1">{stats.total}</p>
          <p className="text-[11px] text-[#53677D]">Total docket intake</p>
        </div>
      </div>

      {/* Main Verification Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Ingestion Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterState('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterState === 'pending' ? 'bg-[#0B477F] text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                  }`}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  onClick={() => setFilterState('verified')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterState === 'verified' ? 'bg-[#0B477F] text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                  }`}
                >
                  Verified ({stats.verified})
                </button>
                <button
                  onClick={() => setFilterState('incomplete')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterState === 'incomplete' ? 'bg-[#0B477F] text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                  }`}
                >
                  Needs Info ({stats.incomplete})
                </button>
                <button
                  onClick={() => setFilterState('flagged')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterState === 'flagged' ? 'bg-red-600 text-white shadow-sm' : 'text-red-700 hover:bg-red-50'
                  }`}
                >
                  Flagged ({stats.flagged})
                </button>
                <button
                  onClick={() => setFilterState('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterState === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                  }`}
                >
                  All ({stats.total})
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search token, institution, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 text-xs bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg px-3 py-1.5 pl-8 text-[#17324D] focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                />
                <Search className="w-3.5 h-3.5 text-[#53677D] absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Complaint List */}
            <div className="space-y-3">
              {queueCases.map(c => {
                const isSelected = selectedCaseId === c.id;
                const vStatus = c.verificationStatus || 'Pending';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0B477F] bg-[#F1F7FC] ring-1 ring-[#0B477F] shadow-sm'
                        : 'border-[#D6E4F0] bg-white hover:border-[#155A91] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0B477F]">{c.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            vStatus === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : vStatus === 'Needs Information'
                              ? 'bg-blue-100 text-blue-800'
                              : vStatus === 'Flagged'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {vStatus}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#53677D]">
                        Docketed: {c.submissionDate}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#17324D] mb-1 line-clamp-1">{c.title}</h3>

                    <div className="flex items-center gap-2 text-xs text-[#53677D] mb-2">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.institutionName}</span>
                      {c.institutionCode && (
                        <span className="font-mono text-[11px] text-[#0B477F] bg-white px-1.5 py-0.2 rounded border border-[#D6E4F0]">
                          {c.institutionCode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D6E4F0]/60 text-xs">
                      <span className="text-[#53677D]">
                        Category: <strong className="text-[#17324D]">{c.category}</strong>
                      </span>
                      <span className="text-[#0B477F] font-bold text-xs flex items-center gap-1">
                        <span>Inspect Docket</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Scrutiny Checklist & Action Desk */}
        <div className="space-y-4">
          {activeCase ? (
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm sticky top-6 space-y-5">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#0B477F]">{activeCase.id}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Verification Stage
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#17324D] leading-snug">{activeCase.title}</h3>
                <p className="text-xs text-[#53677D] mt-1">{activeCase.description}</p>
              </div>

              {actionSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Institution Verification Check */}
              <div className="bg-[#F1F7FC] border border-[#D6E4F0] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0B477F]" />
                  <span>AICTE Institution Registry Check</span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#53677D]">Provided Name:</span>
                    <strong className="text-[#17324D] text-right truncate max-w-[200px]">
                      {activeCase.institutionName}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#53677D]">AICTE Code:</span>
                    <strong className="font-mono text-[#0B477F]">{activeCase.institutionCode || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#53677D]">Directory Status:</span>
                    {matchedInstitution ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid AICTE Approved Institution
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Unverified Institution ID
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Scrutiny Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                  Mandatory Validation Checklist
                </h4>
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 text-[#17324D] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-[#D6E4F0] text-[#0B477F]" />
                    <span>Permanent AICTE institution ID matched</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#17324D] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-[#D6E4F0] text-[#0B477F]" />
                    <span>Jurisdiction falls within AICTE mandate</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#17324D] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-[#D6E4F0] text-[#0B477F]" />
                    <span>Complainant contact / credentials provided</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#17324D] cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-[#D6E4F0] text-[#0B477F]" />
                    <span>Substantive factual details documented</span>
                  </label>
                </div>
              </div>

              {/* Verification Remarks */}
              <div className="space-y-2 pt-2 border-t border-[#D6E4F0]">
                <label className="block text-xs font-bold text-[#17324D]">
                  Scrutiny Remarks / Feedback
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter verification notes or specific deficiency reason..."
                  className="w-full text-xs p-2 rounded-lg border border-[#D6E4F0] focus:ring-1 focus:ring-[#0B477F] focus:outline-none"
                />
              </div>

              {/* Verification Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#D6E4F0]">
                <button
                  type="button"
                  onClick={() => handleAction('Verified')}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Verified & Advance to Allocation (Stage 3)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('Needs Information')}
                    className="py-2 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Needs Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction('Flagged')}
                    className="py-2 px-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Flag Defect</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-8 text-center text-[#53677D]">
              <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#0B477F]" />
              <p className="text-sm font-bold text-[#17324D]">Select Complaint to Verify</p>
              <p className="text-xs mt-1">Check institution ID, credentials, and advance verified dockets to Stage 3.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

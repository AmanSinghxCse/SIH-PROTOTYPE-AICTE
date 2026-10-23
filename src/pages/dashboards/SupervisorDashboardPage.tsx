import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import {
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Building,
  RotateCcw,
  Check,
  FileCheck,
  Send,
  ArrowRight,
  ExternalLink,
  History
} from 'lucide-react';

export const SupervisorDashboardPage: React.FC = () => {
  const { currentUser, complaints, approveCaseClosure, addNote, auditLogs } = useCaseTrack();

  const [activeTab, setActiveTab] = useState<'closure_queue' | 'overdue' | 'escalated' | 'all'>('closure_queue');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [supervisoryNotes, setSupervisoryNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const today = '2026-10-23';

  // Stats calculation
  const stats = useMemo(() => {
    const total = complaints.length;
    
    // Awaiting closure approval: Resolved but closureApprovedBy is not set
    const awaitingClosure = complaints.filter(c => c.status === 'Resolved' && !c.closureApprovedBy).length;
    
    // Escalated
    const escalated = complaints.filter(c => c.status === 'Escalated').length;
    
    // Overdue
    const overdue = complaints.filter(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      return c.deadlineDate && c.deadlineDate < today;
    }).length;

    // Attention Required (Overdue or Escalated or Awaiting Closure)
    const attention = awaitingClosure + escalated + overdue;

    return { total, awaitingClosure, escalated, overdue, attention };
  }, [complaints, today]);

  // Filtered queue
  const displayCases = useMemo(() => {
    return complaints.filter(c => {
      if (activeTab === 'closure_queue') {
        return c.status === 'Resolved';
      }
      if (activeTab === 'overdue') {
        return (c.status !== 'Resolved' && c.status !== 'Closed') && c.deadlineDate && c.deadlineDate < today;
      }
      if (activeTab === 'escalated') {
        return c.status === 'Escalated';
      }
      return true;
    });
  }, [complaints, activeTab, today]);

  const activeCase = useMemo(() => {
    if (!selectedCaseId) return displayCases[0] || null;
    return complaints.find(c => c.id === selectedCaseId) || displayCases[0] || null;
  }, [selectedCaseId, displayCases, complaints]);

  // Actions
  const handleClosureDecision = (approved: boolean) => {
    if (!activeCase) return;

    approveCaseClosure(
      activeCase.id,
      approved,
      supervisoryNotes.trim() ||
        (approved
          ? 'Final closure approved by Appellate Supervisor upon reviewing institutional compliance.'
          : 'Case remanded for further inquiry; insufficient evidence of complete fee restitution.')
    );

    setActionSuccess(
      approved
        ? `Closure Approved for ${activeCase.id}. Case officially archived.`
        : `Case ${activeCase.id} remanded back to Bureau Officer for further inquiry.`
    );
    setSupervisoryNotes('');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleIssueDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !supervisoryNotes.trim()) return;

    addNote(
      activeCase.id,
      `[Supervisory Directive - Dr. P. K. Nambiar]: ${supervisoryNotes}`,
      'Appellate Intervention Mandate',
      true
    );

    setActionSuccess(`Supervisory Directive recorded for ${activeCase.id}.`);
    setSupervisoryNotes('');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Supervisor Header */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200 mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Appellate Review & Quality Control Authority • Stage 6/7 Lifecycle</span>
          </div>
          <h1 className="text-2xl font-black text-[#17324D]">
            AICTE Supervisory Oversight & Closure Sign-off
          </h1>
          <p className="text-xs text-[#53677D] mt-1">
            Appellate Authority: <strong className="text-[#17324D]">{currentUser.name}</strong> &bull; {currentUser.designation}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/audit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D6E4F0] text-[#17324D] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-[#0B477F]" />
            <span>Appellate Audit Trail</span>
          </Link>
          <Link
            to="/workflow"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition-all shadow-sm"
          >
            <span>Lifecycle Stages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-purple-800 uppercase">
            <span>Awaiting Closure</span>
            <FileCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 mt-1">{stats.awaitingClosure}</p>
          <p className="text-[11px] text-[#53677D]">Require supervisor sign-off</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-red-800 uppercase">
            <span>Overdue Cases</span>
            <Clock className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-1">{stats.overdue}</p>
          <p className="text-[11px] text-[#53677D]">Breached bureau deadline</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase">
            <span>Escalated</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.escalated}</p>
          <p className="text-[11px] text-[#53677D]">Escalated to Chairman/Appellate</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#0B477F] uppercase">
            <span>Critical Interventions</span>
            <Eye className="w-4 h-4 text-[#0B477F]" />
          </div>
          <p className="text-2xl font-black text-[#0B477F] mt-1">{stats.attention}</p>
          <p className="text-[11px] text-[#53677D]">Combined priority load</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#53677D] uppercase">
            <span>Total System Pool</span>
            <ShieldCheck className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-[#17324D] mt-1">{stats.total}</p>
          <p className="text-[11px] text-[#53677D]">Under overall supervision</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setActiveTab('closure_queue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'closure_queue' ? 'bg-[#0B477F] text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                }`}
              >
                Closure Sign-off Queue ({stats.awaitingClosure})
              </button>
              <button
                onClick={() => setActiveTab('overdue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'overdue' ? 'bg-red-600 text-white shadow-sm' : 'text-red-700 hover:bg-red-50'
                }`}
              >
                Overdue Stagnant Cases ({stats.overdue})
              </button>
              <button
                onClick={() => setActiveTab('escalated')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'escalated' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Escalated Files ({stats.escalated})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                }`}
              >
                All Docket Files ({stats.total})
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {displayCases.map(c => {
                const isSelected = activeCase?.id === c.id;
                const isResolved = c.status === 'Resolved';
                const isApproved = Boolean(c.closureApprovedBy);

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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#17324D]">
                          {c.bureauName}
                        </span>
                        {isResolved && !isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            Awaiting Closure Sign-off
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Approved by Supervisor
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#53677D]">
                        Status: <strong className="text-[#17324D]">{c.status}</strong>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#17324D] mb-1 line-clamp-1">{c.title}</h3>

                    <div className="flex items-center gap-2 text-xs text-[#53677D] mb-2">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.institutionName}</span>
                      <span>&bull;</span>
                      <span>Assigned: {c.assignedOfficerName || 'Not assigned'}</span>
                    </div>

                    {c.resolutionSummary && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 mb-2">
                        <strong>Officer Resolution Note:</strong> {c.resolutionSummary}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#D6E4F0]/60 text-xs">
                      <span className="text-[#53677D]">
                        Deadline: <strong className="text-[#17324D]">{c.deadlineDate}</strong>
                      </span>
                      <span className="text-[#0B477F] font-bold text-xs flex items-center gap-1">
                        <span>Review Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Supervisory Action Desk */}
        <div className="space-y-4">
          {activeCase ? (
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm sticky top-6 space-y-5">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#0B477F]">{activeCase.id}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F1F7FC] text-[#0B477F] border border-[#D6E4F0]">
                    {activeCase.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#17324D] leading-snug">{activeCase.title}</h3>
                <p className="text-xs text-[#53677D] mt-1">{activeCase.institutionName}</p>
              </div>

              {actionSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Case Details Summary */}
              <div className="bg-[#F1F7FC] rounded-lg p-3 text-xs space-y-1.5 text-[#53677D]">
                <div>
                  <strong>Category:</strong> {activeCase.category}
                </div>
                <div>
                  <strong>Handling Bureau:</strong> {activeCase.bureauName}
                </div>
                <div>
                  <strong>Handling Officer:</strong> {activeCase.assignedOfficerName || 'Unassigned'}
                </div>
                <div>
                  <strong>Target SLA Date:</strong> {activeCase.deadlineDate}
                </div>
              </div>

              {/* If Case is Resolved: Closure Review Controls */}
              {activeCase.status === 'Resolved' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-purple-700" />
                    <span>Supervisory Closure Decision</span>
                  </h4>
                  <p className="text-xs text-purple-800">
                    The handling officer has proposed resolution for this file. As Appellate Supervisor, confirm closure or remand for deficient compliance.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-purple-900">
                      Supervisory Order / Directives
                    </label>
                    <textarea
                      rows={2}
                      value={supervisoryNotes}
                      onChange={(e) => setSupervisoryNotes(e.target.value)}
                      placeholder="Enter supervisory rationale, compliance verification comments, or remand directions..."
                      className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleClosureDecision(true)}
                      className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Closure</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClosureDecision(false)}
                      className="py-2.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Remand for Inquiry</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Issue Directives on Overdue / Escalated Cases */}
              {activeCase.status !== 'Resolved' && (
                <form onSubmit={handleIssueDirective} className="space-y-3 pt-2 border-t border-[#D6E4F0]">
                  <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Issue Supervisory Directive</span>
                  </h4>
                  <textarea
                    rows={3}
                    value={supervisoryNotes}
                    onChange={(e) => setSupervisoryNotes(e.target.value)}
                    placeholder="Issue binding directive to Bureau Officer, request priority hearing, or mandate show-cause..."
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-1 focus:ring-[#0B477F] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0B477F] hover:bg-[#155A91] text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Issue Supervisory Directive</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-8 text-center text-[#53677D]">
              <Eye className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#0B477F]" />
              <p className="text-sm font-bold text-[#17324D]">Select Case to Review</p>
              <p className="text-xs mt-1">Review closure submissions, evaluate overdue bottlenecks, and issue directives.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

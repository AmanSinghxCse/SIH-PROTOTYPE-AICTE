import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { ComplaintStatus } from '../../types';
import {
  Briefcase,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Search,
  MessageSquarePlus,
  Send,
  Eye,
  Building,
  Calendar,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const {
    currentUser,
    complaints,
    notes,
    updateComplaintStatus,
    addNote,
    requestComplainantInfo,
    relatedSuggestions
  } = useCaseTrack();

  const [activeTab, setActiveTab] = useState<'all' | 'under_review' | 'awaiting' | 'overdue' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Investigation drawer / modal state
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Under Review');
  const [statusReason, setStatusReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Complainant inquiry modal
  const [requestInfoModalOpen, setRequestInfoModalOpen] = useState(false);
  const [inquiryQuery, setInquiryQuery] = useState('');

  const today = '2026-10-23';

  // Bureau cases: all cases belonging to BUR-GRV or assigned to Sunita Verma
  const bureauCases = useMemo(() => {
    return complaints.filter(c => {
      if (c.bureauId === (currentUser.bureauId || 'BUR-GRV')) return true;
      if (c.assignedOfficerId === currentUser.id) return true;
      return false;
    });
  }, [complaints, currentUser]);

  // Statistics
  const stats = useMemo(() => {
    const total = bureauCases.length;
    const newCases = bureauCases.filter(c => c.status === 'Open').length;
    const underReview = bureauCases.filter(c => c.status === 'Under Review').length;
    const awaiting = bureauCases.filter(c => c.status === 'Awaiting Information').length;
    const overdue = bureauCases.filter(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      return c.deadlineDate && c.deadlineDate < today;
    }).length;
    const resolved = bureauCases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    return { total, newCases, underReview, awaiting, overdue, resolved };
  }, [bureauCases, today]);

  // Filtered list
  const filteredCases = useMemo(() => {
    return bureauCases.filter(c => {
      // Tab filter
      if (activeTab === 'under_review' && c.status !== 'Under Review') return false;
      if (activeTab === 'awaiting' && c.status !== 'Awaiting Information') return false;
      if (activeTab === 'resolved' && c.status !== 'Resolved' && c.status !== 'Closed') return false;
      if (activeTab === 'overdue') {
        const isOverdue = (c.status !== 'Resolved' && c.status !== 'Closed') && c.deadlineDate && c.deadlineDate < today;
        if (!isOverdue) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesInst = c.institutionName.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesInst) return false;
      }

      return true;
    });
  }, [bureauCases, activeTab, searchTerm, today]);

  const activeCase = useMemo(() => {
    if (!activeCaseId) return null;
    return complaints.find(c => c.id === activeCaseId) || null;
  }, [activeCaseId, complaints]);

  const activeCaseNotes = useMemo(() => {
    if (!activeCaseId) return [];
    return notes[activeCaseId] || [];
  }, [activeCaseId, notes]);

  const activeCaseRelated = useMemo(() => {
    if (!activeCaseId) return [];
    return relatedSuggestions.filter(s => s.complaintId === activeCaseId || s.relatedComplaintId === activeCaseId);
  }, [activeCaseId, relatedSuggestions]);

  // Handlers
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseId || !newNoteContent.trim()) return;

    addNote(activeCaseId, newNoteContent, 'Officer Investigation Minute', true);
    setNewNoteContent('');
    setActionSuccess('Investigation note recorded in case dossier.');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseId) return;

    updateComplaintStatus(activeCaseId, newStatus, statusReason || `Status updated by handling officer ${currentUser.name}`);
    setActionSuccess(`Status transitioned to "${newStatus}".`);
    setStatusReason('');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleRequestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaseId || !inquiryQuery.trim()) return;

    requestComplainantInfo(activeCaseId, inquiryQuery);
    setRequestInfoModalOpen(false);
    setInquiryQuery('');
    setActionSuccess('Formal query transmitted to complainant.');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Bureau Context Banner */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Bureau Handling Officer • Active Inquiry Desk</span>
          </div>
          <h1 className="text-2xl font-black text-[#17324D]">
            Grievance Redressal Cell (BUR-GRV)
          </h1>
          <p className="text-xs text-[#53677D] mt-1">
            Officer In-Charge: <strong className="text-[#17324D]">{currentUser.name}</strong> &bull; {currentUser.designation}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/case-intelligence"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F1F7FC] border border-[#D6E4F0] text-[#0B477F] text-xs font-bold rounded-lg hover:bg-[#E5F1FC] transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#0B477F]" />
            <span>Case Intelligence & Related Cases</span>
          </Link>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <span className="text-[11px] font-bold text-[#53677D] uppercase">My Bureau</span>
          <p className="text-2xl font-black text-[#17324D] mt-1">{stats.total}</p>
          <span className="text-[10px] text-[#53677D]">Allocated files</span>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <span className="text-[11px] font-bold text-blue-700 uppercase">New Intakes</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats.newCases}</p>
          <span className="text-[10px] text-[#53677D]">Pending review</span>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Under Review</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.underReview}</p>
          <span className="text-[10px] text-[#53677D]">Inquiry in progress</span>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <span className="text-[11px] font-bold text-purple-700 uppercase">Awaiting Info</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{stats.awaiting}</p>
          <span className="text-[10px] text-[#53677D]">Query sent to student</span>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <span className="text-[11px] font-bold text-red-700 uppercase">Overdue SLA</span>
          <p className="text-2xl font-black text-red-600 mt-1">{stats.overdue}</p>
          <span className="text-[10px] text-[#53677D]">Past statutory date</span>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Resolved</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved}</p>
          <span className="text-[10px] text-[#53677D]">Closed / settled</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Bureau Docket Table with Tabs & Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
            {/* Tabs and search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex flex-wrap gap-1.5 border-b border-[#D6E4F0] pb-2 sm:border-none sm:pb-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'all' ? 'bg-[#0B477F] text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('under_review')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'under_review' ? 'bg-[#0B477F] text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                  }`}
                >
                  Under Review ({stats.underReview})
                </button>
                <button
                  onClick={() => setActiveTab('awaiting')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'awaiting' ? 'bg-[#0B477F] text-white shadow-sm' : 'text-[#53677D] hover:bg-slate-100'
                  }`}
                >
                  Awaiting Info ({stats.awaiting})
                </button>
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'overdue' ? 'bg-red-600 text-white shadow-sm' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Overdue ({stats.overdue})
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'resolved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Resolved ({stats.resolved})
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter cases or colleges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-56 text-xs bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg px-3 py-1.5 pl-8 text-[#17324D] focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                />
                <Search className="w-3.5 h-3.5 text-[#53677D] absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredCases.map(c => {
                const isSelected = activeCaseId === c.id;
                const isOverdue = (c.status !== 'Resolved' && c.status !== 'Closed') && c.deadlineDate && c.deadlineDate < today;

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveCaseId(c.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0B477F] bg-[#F1F7FC] ring-1 ring-[#0B477F] shadow-sm'
                        : 'border-[#D6E4F0] bg-white hover:border-[#155A91] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0B477F]">{c.id}</span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-[#17324D]">
                          {c.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#53677D]">
                        Target SLA: <strong className={isOverdue ? 'text-red-600' : 'text-[#17324D]'}>{c.deadlineDate}</strong>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#17324D] mb-1 line-clamp-1">{c.title}</h3>

                    <div className="flex items-center gap-2 text-xs text-[#53677D] mb-2">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.institutionName}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D6E4F0]/60 text-xs">
                      <span className="text-[#53677D]">
                        Status: <strong className="text-[#17324D]">{c.status}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCaseId(c.id);
                        }}
                        className="text-[#0B477F] font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        <span>Open Inquiry Desk</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Active Investigation & Action Desk */}
        <div className="space-y-4">
          {activeCase ? (
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm sticky top-6 space-y-5">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#0B477F]">{activeCase.id}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F7FC] text-[#0B477F] border border-[#D6E4F0]">
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

              {/* Related case correlation indicator */}
              {activeCaseRelated.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Case Intelligence Correlation</span>
                  </div>
                  <p className="text-indigo-800 text-[11px] mb-2">
                    {activeCaseRelated.length} potentially correlated complaints flagged for this college.
                  </p>
                  <Link
                    to="/case-intelligence"
                    className="text-[11px] font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Inspect Match Signals in Intelligence Sandbox</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Request Info from Complainant Button */}
              <div className="pt-2 border-t border-[#D6E4F0]">
                <button
                  type="button"
                  onClick={() => setRequestInfoModalOpen(true)}
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquarePlus className="w-4 h-4 text-amber-700" />
                  <span>Request Clarification from Complainant</span>
                </button>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-2 border-t border-[#D6E4F0]">
                <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                  Update Case Status
                </h4>
                <div>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full text-xs p-2 rounded-lg border border-[#D6E4F0] focus:ring-1 focus:ring-[#0B477F] focus:outline-none"
                  >
                    <option value="Under Review">Under Review (Active Hearing)</option>
                    <option value="Awaiting Information">Awaiting Information</option>
                    <option value="Escalated">Escalated to Appellate Cell</option>
                    <option value="Resolved">Resolved (Recommend Closure)</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Mandatory justification / minutes summary..."
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-lg border border-[#D6E4F0] focus:ring-1 focus:ring-[#0B477F] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#0B477F] hover:bg-[#155A91] text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Confirm Status Change
                </button>
              </form>

              {/* Add Investigation Note */}
              <form onSubmit={handleAddNote} className="space-y-3 pt-2 border-t border-[#D6E4F0]">
                <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                  Add Official Inquiry Note
                </h4>
                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record communication with college, hearing summary, or compliance instructions..."
                  required
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-1 focus:ring-[#0B477F] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Append to Docket</span>
                </button>
              </form>

              {/* Investigation Notes History */}
              <div className="pt-2 border-t border-[#D6E4F0]">
                <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider mb-2">
                  Dossier Notes ({activeCaseNotes.length})
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
                  {activeCaseNotes.length === 0 ? (
                    <p className="text-[11px] text-[#53677D]">No notes recorded yet.</p>
                  ) : (
                    activeCaseNotes.map(n => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-[#F1F7FC] border border-[#D6E4F0]">
                        <div className="flex items-center justify-between text-[10px] text-[#53677D] mb-1">
                          <span className="font-bold text-[#17324D]">{n.authorName}</span>
                          <span>{n.timestamp.slice(0, 10)}</span>
                        </div>
                        <p className="text-[11px] text-[#17324D]">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-8 text-center text-[#53677D]">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#0B477F]" />
              <p className="text-sm font-bold text-[#17324D]">No Case Selected</p>
              <p className="text-xs mt-1">Select any complaint from the queue to record inquiry notes, update status, or issue queries.</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Info Modal */}
      {requestInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#D6E4F0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-amber-600" />
                <span>Request Complainant Information</span>
              </h3>
              <button
                type="button"
                onClick={() => setRequestInfoModalOpen(false)}
                className="text-[#53677D] hover:text-[#17324D] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[#53677D] mb-4">
              Transmitting formal inquiry for case <strong className="font-mono text-[#0B477F]">{activeCase?.id}</strong>. The complaint status will be set to <strong>"Awaiting Information"</strong> and displayed on the student's portal.
            </p>

            <form onSubmit={handleRequestInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17324D] mb-1">
                  Specific Details Required
                </label>
                <textarea
                  rows={4}
                  required
                  value={inquiryQuery}
                  onChange={(e) => setInquiryQuery(e.target.value)}
                  placeholder="e.g. Please provide attested proof of caution money receipt, student enrollment number, or bank deposit acknowledgement..."
                  className="w-full text-xs p-3 rounded-lg border border-[#D6E4F0] focus:ring-1 focus:ring-[#0B477F] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestInfoModalOpen(false)}
                  className="px-4 py-2 border border-[#D6E4F0] rounded-lg text-xs font-semibold text-[#53677D] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Send Inquiry Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

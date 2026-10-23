import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { ComplaintStatus, Complaint } from '../../types';
import { ComplaintLifecycleTracker } from '../../components/workflow/ComplaintLifecycleTracker';
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
  Check,
  Shield,
  HelpCircle,
  UserCheck,
  X,
  FileCheck2,
  Layers,
  ChevronRight,
  MessageCircle,
  History,
  Lock,
  ExternalLink
} from 'lucide-react';

export const OfficerDashboardPage: React.FC = () => {
  const {
    currentUser,
    complaints,
    notes,
    addNote,
    requestComplainantInfo,
    requestInstitutionResponse,
    recordInstitutionResponse,
    recommendResolution,
    relatedSuggestions
  } = useCaseTrack();

  // Active filter tab matching the 8 KPI cards
  const [activeTab, setActiveTab] = useState<
    'all' | 'investigation' | 'institution_pending' | 'complainant_pending' | 'resolution_ready' | 'high_priority' | 'overdue' | 'recent'
  >('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Drawer / modal state for Full Case Review
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'lifecycle' | 'actions' | 'notes' | 'intel'>('actions');

  // Action form state
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [institutionReply, setInstitutionReply] = useState('');
  const [citizenQuery, setCitizenQuery] = useState('');
  const [resolutionProposal, setResolutionProposal] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const today = '2026-10-23';

  // Filter complaints scoped to Officer's Bureau if specified, or all assigned if general
  const bureauComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (currentUser?.bureauId) {
        return c.bureauId === currentUser.bureauId || c.assignedOfficerId === currentUser.id;
      }
      return c.bureauId !== undefined || c.assignedOfficerId !== undefined;
    });
  }, [complaints, currentUser]);

  // Compute 8 operational metrics
  const metrics = useMemo(() => {
    const totalActive = bureauComplaints.filter(c => c.status !== 'Closed' && c.status !== 'Resolved').length;
    const underInvestigation = bureauComplaints.filter(c => c.status === 'Under Review' || c.status === 'Action & Investigation').length;
    const awaitingInstitution = bureauComplaints.filter(c => c.status === 'Awaiting Institution Response' || c.institutionResponseRequested).length;
    const awaitingCitizen = bureauComplaints.filter(c => c.status === 'Awaiting Information').length;
    const resolutionReady = bureauComplaints.filter(c => c.status === 'Resolution Recommended').length;
    const highUrgent = bureauComplaints.filter(c => (c.priority === 'High' || c.priority === 'Urgent' || c.priority === 'Critical') && c.status !== 'Closed').length;
    const overdue = bureauComplaints.filter(c => c.deadlineDate < today && c.status !== 'Closed' && c.status !== 'Resolved').length;
    
    // Recent (updated or created in last 7 days)
    const sevenDaysAgo = '2026-10-16';
    const recent = bureauComplaints.filter(c => (c.lastUpdatedDate >= sevenDaysAgo || c.submissionDate >= sevenDaysAgo)).length;

    return {
      totalActive,
      underInvestigation,
      awaitingInstitution,
      awaitingCitizen,
      resolutionReady,
      highUrgent,
      overdue,
      recent
    };
  }, [bureauComplaints, today]);

  // Filtered queue based on active tab and search filters
  const filteredQueue = useMemo(() => {
    return bureauComplaints.filter(c => {
      // Metric card tab filtering
      if (activeTab === 'all' && (c.status === 'Closed' || c.status === 'Resolved')) return false; // Show active by default
      if (activeTab === 'investigation' && !(c.status === 'Under Review' || c.status === 'Action & Investigation')) return false;
      if (activeTab === 'institution_pending' && !(c.status === 'Awaiting Institution Response' || c.institutionResponseRequested)) return false;
      if (activeTab === 'complainant_pending' && c.status !== 'Awaiting Information') return false;
      if (activeTab === 'resolution_ready' && c.status !== 'Resolution Recommended') return false;
      if (activeTab === 'high_priority' && !(['High', 'Urgent', 'Critical'].includes(c.priority) && c.status !== 'Closed')) return false;
      if (activeTab === 'overdue' && !(c.deadlineDate < today && c.status !== 'Closed' && c.status !== 'Resolved')) return false;
      if (activeTab === 'recent') {
        const sevenDaysAgo = '2026-10-16';
        if (!(c.lastUpdatedDate >= sevenDaysAgo || c.submissionDate >= sevenDaysAgo)) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;

      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchToken = c.id.toLowerCase().includes(q);
        const matchSubject = c.title.toLowerCase().includes(q);
        const matchInst = c.institutionName.toLowerCase().includes(q);
        const matchCategory = c.category.toLowerCase().includes(q);
        return matchToken || matchSubject || matchInst || matchCategory;
      }

      return true;
    });
  }, [bureauComplaints, activeTab, priorityFilter, categoryFilter, searchTerm, today]);

  const selectedCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return complaints.find(c => c.id === selectedCaseId) || null;
  }, [complaints, selectedCaseId]);

  const selectedCaseNotes = useMemo(() => {
    if (!selectedCaseId) return [];
    return notes[selectedCaseId] || [];
  }, [notes, selectedCaseId]);

  const selectedCaseIntel = useMemo(() => {
    if (!selectedCaseId) return [];
    return relatedSuggestions.filter(s => s.complaintId === selectedCaseId || s.relatedComplaintId === selectedCaseId);
  }, [relatedSuggestions, selectedCaseId]);

  // Action Handlers
  const handleDemandInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !institutionQuery.trim()) return;
    requestInstitutionResponse(selectedCase.id, institutionQuery.trim());
    setActionSuccessMsg('Formal demand for explanation issued to institution and logged in case docket.');
    setInstitutionQuery('');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRecordInstitutionReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !institutionReply.trim()) return;
    recordInstitutionResponse(selectedCase.id, institutionReply.trim());
    setActionSuccessMsg('Official institution explanation recorded. Case progressed to Action & Investigation.');
    setInstitutionReply('');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRequestCitizenInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !citizenQuery.trim()) return;
    requestComplainantInfo(selectedCase.id, citizenQuery.trim());
    setActionSuccessMsg('Citizen clarification inquiry dispatched. Status set to Awaiting Information.');
    setCitizenQuery('');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRecommendResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !resolutionProposal.trim()) return;
    recommendResolution(selectedCase.id, resolutionProposal.trim());
    setActionSuccessMsg('Resolution recommendation submitted to Administration for formal closure approval.');
    setResolutionProposal('');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNoteContent.trim()) return;
    addNote(selectedCase.id, newNoteContent.trim(), undefined, true);
    setActionSuccessMsg('Confidential investigation note added to case file.');
    setNewNoteContent('');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Officer Header Banner */}
      <div className="bg-gradient-to-r from-[#064578] via-[#0B477F] to-[#155A91] text-white p-6 rounded-xl shadow-md border-b-4 border-amber-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-blue-100 mb-2 border border-white/20">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>AICTE Bureau Operations Workspace</span>
              <span className="text-white/40">|</span>
              <span className="text-amber-300">Bureau of Grievance Redressal ({currentUser?.bureauId || 'BUR-GRV'})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bureau Officer Operational Console</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Conduct investigations, issue formal explanation demands to AICTE-approved institutions, examine documentary evidence, and formulate official resolution proposals.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto bg-white/10 p-3 rounded-lg border border-white/15">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-[#0B477F] flex items-center justify-center font-bold text-sm shadow">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'BO'}
            </div>
            <div>
              <p className="text-xs text-blue-200">Logged Officer</p>
              <p className="text-sm font-semibold text-white">{currentUser?.name || 'Bureau Officer'}</p>
              <p className="text-[11px] text-amber-300">Official Jurisdiction: AICTE Bureau Cells</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3.1 8 Clickable Operational Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#0B477F]" />
            Bureau Workload & Action Queues
          </h2>
          <span className="text-xs text-slate-500">Click any metric card below to filter the active queue</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Active Queue */}
          <button
            onClick={() => setActiveTab('all')}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeTab === 'all'
                ? 'bg-blue-50 border-[#0B477F] shadow-sm ring-2 ring-[#0B477F]/20'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 truncate">Active Queue</span>
              <Briefcase className="w-4 h-4 text-[#0B477F]" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalActive}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Assigned cases</p>
          </button>

          {/* 2. Under Investigation */}
          <button
            onClick={() => setActiveTab('investigation')}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeTab === 'investigation'
                ? 'bg-indigo-50 border-indigo-600 shadow-sm ring-2 ring-indigo-600/20'
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 truncate">Active Probe</span>
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-900 mt-2">{metrics.underInvestigation}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Action & inquiry</p>
          </button>

          {/* 3. Awaiting Institution Response */}
          <button
            onClick={() => setActiveTab('institution_pending')}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeTab === 'institution_pending'
                ? 'bg-amber-50 border-amber-600 shadow-sm ring-2 ring-amber-600/20'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 truncate">Inst. Notice</span>
              <Building className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-2">{metrics.awaitingInstitution}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">Notice issued</p>
          </button>

          {/* 4. Awaiting Complainant Info */}
          <button
            onClick={() => setActiveTab('complainant_pending')}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeTab === 'complainant_pending'
                ? 'bg-purple-50 border-purple-600 shadow-sm ring-2 ring-purple-600/20'
                : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 truncate">Citizen Info</span>
              <HelpCircle className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">{metrics.awaitingCitizen}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Proof pending</p>
          </button>

          {/* 5. Resolution Ready */}
          <button
            onClick={() => setActiveTab('resolution_ready')}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeTab === 'resolution_ready'
                ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-2 ring-emerald-600/20'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 truncate">Resolution</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900 mt-2">{metrics.resolutionReady}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Ready for sign-off</p>
          </button>

          {/* 6. High & Urgent Priority */}
          <button
            onClick={() => setActiveTab('high_priority')}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeTab === 'high_priority'
                ? 'bg-orange-50 border-orange-600 shadow-sm ring-2 ring-orange-600/20'
                : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 truncate">Urgent / High</span>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2">{metrics.highUrgent}</p>
            <p className="text-[10px] text-orange-700 mt-0.5">Fast-track action</p>
          </button>

          {/* 7. Overdue Cases */}
          <button
            onClick={() => setActiveTab('overdue')}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeTab === 'overdue'
                ? 'bg-rose-50 border-rose-600 shadow-sm ring-2 ring-rose-600/20'
                : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 truncate">Overdue</span>
              <Clock className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-rose-900 mt-2">{metrics.overdue}</p>
            <p className="text-[10px] text-rose-700 mt-0.5">SLA breach risk</p>
          </button>

          {/* 8. Recently Updated */}
          <button
            onClick={() => setActiveTab('recent')}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeTab === 'recent'
                ? 'bg-teal-50 border-teal-600 shadow-sm ring-2 ring-teal-600/20'
                : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 truncate">Recent 7D</span>
              <History className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-teal-900 mt-2">{metrics.recent}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Recent activity</p>
          </button>
        </div>
      </div>

      {/* Main Grid: Queue Table & Quick Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        {/* Table Search & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0B477F]" />
              Assigned Complaint Docket
            </h3>
            <span className="px-2 py-0.5 bg-blue-50 text-[#0B477F] font-bold text-xs rounded-full border border-blue-200">
              {filteredQueue.length} {filteredQueue.length === 1 ? 'case' : 'cases'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search token, institution, subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B477F] focus:bg-white"
              />
            </div>

            {/* Priority dropdown */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B477F]"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category dropdown */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B477F]"
            >
              <option value="all">All Categories</option>
              <option value="Fee Irregularity & Caution Refund">Fee Irregularity & Caution Refund</option>
              <option value="Capitation Fee & Excess Charges">Capitation Fee & Excess Charges</option>
              <option value="Original Certificate Withholding">Original Certificate Withholding</option>
              <option value="Ragging & Campus Safety Harassment">Ragging & Campus Safety Harassment</option>
              <option value="Faculty Deficit & Ghost Teachers">Faculty Deficit & Ghost Teachers</option>
              <option value="Infrastructure & Lab Equipment Deficit">Infrastructure & Lab Equipment Deficit</option>
              <option value="Unapproved Course & Curriculum Deviation">Unapproved Course & Curriculum Deviation</option>
              <option value="Admission Irregularity & Quota Violation">Admission Irregularity & Quota Violation</option>
            </select>

            {(searchTerm || priorityFilter !== 'all' || categoryFilter !== 'all' || activeTab !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                  setActiveTab('all');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* 3.2 Case Queue Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Complaint Token</th>
                <th className="py-2.5 px-3">Institution & Subject</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Lifecycle Stage</th>
                <th className="py-2.5 px-3">Assigned Date</th>
                <th className="py-2.5 px-3">Deadline & SLA</th>
                <th className="py-2.5 px-3 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No complaint cases match your selected filter criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the priority, category, or metric filters above.</p>
                  </td>
                </tr>
              ) : (
                filteredQueue.map(c => {
                  const isOverdue = c.deadlineDate < today && c.status !== 'Closed' && c.status !== 'Resolved';
                  const isSelected = selectedCaseId === c.id;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-medium' : ''
                      }`}
                    >
                      {/* Token */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#0B477F]">{c.id}</span>
                        {c.isReopened && (
                          <span className="block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded w-fit">
                            REOPENED
                          </span>
                        )}
                      </td>

                      {/* Institution & Subject */}
                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate" title={c.institutionName}>
                          {c.institutionName}
                        </p>
                        <p className="text-slate-500 text-[11px] truncate mt-0.5" title={c.title}>
                          {c.title}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 font-medium">
                          {c.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            c.priority === 'Critical' || c.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : c.priority === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : c.priority === 'Medium'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </td>

                      {/* Lifecycle Stage / Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            c.status === 'Resolution Recommended'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : c.status === 'Awaiting Institution Response'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : c.status === 'Awaiting Information'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : c.status === 'Action & Investigation' || c.status === 'Under Review'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : c.status === 'Resolved' || c.status === 'Closed'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-yellow-50 text-yellow-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      {/* Assigned Date */}
                      <td className="py-3 px-3 text-slate-500">
                        {c.submissionDate ? c.submissionDate.slice(0, 10) : 'N/A'}
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            {c.deadlineDate}
                          </span>
                          {isOverdue && (
                            <span className="inline-flex items-center px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCaseId(c.id);
                              setDrawerTab('actions');
                            }}
                            className="px-2.5 py-1 bg-[#0B477F] text-white rounded text-[11px] font-medium hover:bg-[#155A91] transition flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Examine</span>
                          </button>
                          <Link
                            to={`/case/${c.id}`}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="Open full page record"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3.3 Full Case Review Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-300">
            {/* Drawer Header */}
            <div className="bg-[#0B477F] text-white p-4 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm px-2.5 py-1 bg-white/10 rounded font-bold border border-white/20 text-amber-300">
                  {selectedCase.id}
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedCase.title}</h3>
                  <p className="text-xs text-blue-200">
                    {selectedCase.institutionName} • Registered: {selectedCase.submissionDate ? selectedCase.submissionDate.slice(0, 10) : 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Banner for Actions */}
            {actionSuccessMsg && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Navigation Tabs in Drawer */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4">
              <button
                onClick={() => setDrawerTab('actions')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  drawerTab === 'actions'
                    ? 'border-[#0B477F] text-[#0B477F] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Investigation Actions</span>
              </button>
              <button
                onClick={() => setDrawerTab('lifecycle')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  drawerTab === 'lifecycle'
                    ? 'border-[#0B477F] text-[#0B477F] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Lifecycle Flow & Audit</span>
              </button>
              <button
                onClick={() => setDrawerTab('notes')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  drawerTab === 'notes'
                    ? 'border-[#0B477F] text-[#0B477F] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Confidential Notes ({selectedCaseNotes.length})</span>
              </button>
              <button
                onClick={() => setDrawerTab('intel')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  drawerTab === 'intel'
                    ? 'border-[#0B477F] text-[#0B477F] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Case Intelligence ({selectedCaseIntel.length})</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Summary Metadata Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Category</span>
                  <span className="font-semibold text-slate-800">{selectedCase.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status</span>
                  <span className="font-semibold text-blue-700">{selectedCase.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Deadline</span>
                  <span
                    className={`font-semibold ${
                      selectedCase.deadlineDate < today && selectedCase.status !== 'Closed'
                        ? 'text-rose-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {selectedCase.deadlineDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Complainant</span>
                  <span className="font-semibold text-slate-800">{selectedCase.complainantName || 'Anonymous / Confidential'}</span>
                </div>
              </div>

              {/* Case Full Narrative */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Complaint Statement</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedCase.description}</p>
                {selectedCase.institutionRemarks && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                    <span className="font-bold block mb-1">Institution Response On Record:</span>
                    <p className="whitespace-pre-wrap">{selectedCase.institutionRemarks}</p>
                  </div>
                )}
                {selectedCase.resolutionRecommendation && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
                    <span className="font-bold block mb-1">Resolution Proposal Submitted:</span>
                    <p className="whitespace-pre-wrap">{selectedCase.resolutionRecommendation}</p>
                  </div>
                )}
              </div>

              {/* TAB 1: Actions */}
              {drawerTab === 'actions' && (
                <div className="space-y-6">
                  {/* Action 1: Demand Institution Explanation */}
                  <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        1. Demand Institution Explanation
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Issues a formal statutory notice to {selectedCase.institutionName} regarding the allegations. Sets case status to "Awaiting Institution Response".
                    </p>
                    <form onSubmit={handleDemandInstitution} className="space-y-2">
                      <textarea
                        rows={2}
                        value={institutionQuery}
                        onChange={e => setInstitutionQuery(e.target.value)}
                        placeholder="State official inquiry notice text, citing relevant AICTE norms..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-amber-700 text-white rounded text-xs font-semibold hover:bg-amber-800 transition shadow-sm flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Statutory Notice</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Action 2: Record Institution Response */}
                  <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck2 className="w-4 h-4 text-blue-700" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        2. Record Institution Reply
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Record official rejoinder or verification document furnished by the institution. Updates case to "Action & Investigation".
                    </p>
                    <form onSubmit={handleRecordInstitutionReply} className="space-y-2">
                      <textarea
                        rows={2}
                        value={institutionReply}
                        onChange={e => setInstitutionReply(e.target.value)}
                        placeholder="Enter summary of institution's written explanation or compliance documents..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[#0B477F] text-white rounded text-xs font-semibold hover:bg-[#155A91] transition shadow-sm flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Record Institution Rejoinder</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Action 3: Request Citizen Clarification */}
                  <div className="border border-purple-200 bg-purple-50/40 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-4 h-4 text-purple-700" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                        3. Request Student / Complainant Clarification
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Ask the complainant to submit additional fee receipts, admission letters, or correspondence. Sets status to "Awaiting Information".
                    </p>
                    <form onSubmit={handleRequestCitizenInfo} className="space-y-2">
                      <textarea
                        rows={2}
                        value={citizenQuery}
                        onChange={e => setCitizenQuery(e.target.value)}
                        placeholder="Detail the exact documentary evidence or clarification required from citizen..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-purple-700 text-white rounded text-xs font-semibold hover:bg-purple-800 transition shadow-sm flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Clarification Request</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Action 4: Recommend Resolution */}
                  <div className="border-2 border-emerald-400 bg-emerald-50/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          4. Formulate & Recommend Resolution
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                        Administrative Review Next
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Bureau officers can formulate formal findings and propose resolution terms. The case will move to "Resolution Recommended" for final review by the Administration Cell.
                    </p>
                    <form onSubmit={handleRecommendResolution} className="space-y-2">
                      <textarea
                        rows={3}
                        value={resolutionProposal}
                        onChange={e => setResolutionProposal(e.target.value)}
                        placeholder="Enter comprehensive findings, verified facts, and recommended remedy (e.g. refund amount, warning letter, directive to institute)..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Final case closure is restricted to Administration Portal
                        </p>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 transition shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submit Resolution for Closure</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: Lifecycle Tracker */}
              {drawerTab === 'lifecycle' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-600">
                      Standard AICTE 10-stage statutory complaint lifecycle progression. Click any stage node to inspect historical transitions and responsible cells.
                    </p>
                  </div>
                  <ComplaintLifecycleTracker complaint={selectedCase} isPublic={false} showTimeline={true} />
                </div>
              )}

              {/* TAB 3: Confidential Notes */}
              {drawerTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="text-xs font-bold text-slate-700 block">Add Confidential Investigation Log</span>
                    <textarea
                      rows={2}
                      value={newNoteContent}
                      onChange={e => setNewNoteContent(e.target.value)}
                      placeholder="Enter confidential facts, telephone inquiry summaries, or witness statements..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#0B477F] text-white rounded text-xs font-semibold hover:bg-[#155A91] transition flex items-center gap-1"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>Record Internal Note</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 mt-3">
                    {selectedCaseNotes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No internal notes logged on this case file yet.</p>
                    ) : (
                      selectedCaseNotes.map(note => (
                        <div key={note.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="font-semibold text-slate-700">{note.authorName} ({note.authorRole})</span>
                            <span>{note.timestamp.replace('T', ' ').slice(0, 16)}</span>
                          </div>
                          <p className="text-slate-800 whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Case Intelligence */}
              {drawerTab === 'intel' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                      Cross-Bureau Pattern Intelligence
                    </span>
                    AICTE system has analyzed institution records, token similarities, and complaint narratives to detect correlated grievances.
                  </div>

                  {selectedCaseIntel.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 border border-slate-200 rounded-lg">
                      <Shield className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                      No active cross-case relationships flagged for this complaint docket.
                    </div>
                  ) : (
                    selectedCaseIntel.map(rel => (
                      <div key={rel.id} className="border border-slate-200 rounded-lg p-3 bg-white space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            Pair Match: {rel.complaintId === selectedCase.id ? rel.relatedComplaintId : rel.complaintId}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                            {Math.round(rel.overallScore)}% Similarity
                          </span>
                        </div>
                        <p className="text-slate-600">{rel.explanation}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rel.matchSignals?.map((sig: string) => (
                            <span key={sig} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                              {sig}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 flex items-center justify-between text-xs text-slate-500">
              <span>Case Reference: {selectedCase.id}</span>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

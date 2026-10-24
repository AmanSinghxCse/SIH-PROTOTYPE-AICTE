import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { ComplaintStatus, Complaint } from '../../types';
import { ComplaintLifecycleTracker } from '../../components/workflow/ComplaintLifecycleTracker';
import { getCaseAgeInDays, isApproachingDeadline, formatDate } from '../../utils/dateUtils';
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
  ExternalLink,
  ListTodo,
  CheckSquare,
  Flame,
  RotateCcw
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
    relatedSuggestions,
    settings
  } = useCaseTrack();

  // Active view: Docket Table or Personal Task Center
  const [viewMode, setViewMode] = useState<'docket' | 'tasks'>('docket');

  // Active filter tab matching the 9 operational cards
  const [activeTab, setActiveTab] = useState<
    | 'all'
    | 'new_assigned'
    | 'under_review'
    | 'institution_response'
    | 'action_required'
    | 'near_deadline'
    | 'overdue'
    | 'resolution_recommended'
    | 'closure_review'
    | 'recent'
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

  // Completed task ids (in-memory for the session)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'PENDING'>('ALL');

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

  // Compute 9 operational metrics matching required cards
  const metrics = useMemo(() => {
    const newlyAssigned = bureauComplaints.filter(
      c => c.assignedOfficerId && (c.status === 'Open' || c.status === 'Under Review')
    ).length;
    const underReview = bureauComplaints.filter(c => c.status === 'Under Review').length;
    const awaitingInstitution = bureauComplaints.filter(
      c => c.status === 'Awaiting Institution Response' || c.institutionResponseRequested
    ).length;
    const actionRequired = bureauComplaints.filter(
      c => c.status === 'Action & Investigation' || c.status === 'Awaiting Information'
    ).length;
    const nearDeadline = bureauComplaints.filter(
      c => isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays)
    ).length;
    const overdue = bureauComplaints.filter(
      c => c.deadlineDate < today && c.status !== 'Closed' && c.status !== 'Resolved'
    ).length;
    const resolutionRecommended = bureauComplaints.filter(
      c => c.status === 'Resolution Recommended'
    ).length;
    const awaitingClosureReview = bureauComplaints.filter(
      c => c.status === 'Awaiting Closure Review' || (c.status === 'Resolved' && !c.closureApprovedBy)
    ).length;
    const sevenDaysAgo = '2026-10-16';
    const recent = bureauComplaints.filter(
      c => (c.lastUpdatedDate && c.lastUpdatedDate >= sevenDaysAgo) || c.submissionDate >= sevenDaysAgo
    ).length;

    return {
      newlyAssigned,
      underReview,
      awaitingInstitution,
      actionRequired,
      nearDeadline,
      overdue,
      resolutionRecommended,
      awaitingClosureReview,
      recent
    };
  }, [bureauComplaints, today, settings.approachingDeadlineDays]);

  // Filtered queue based on active tab and search filters
  const filteredQueue = useMemo(() => {
    return bureauComplaints.filter(c => {
      // Metric card tab filtering
      if (activeTab === 'new_assigned' && !c.assignedOfficerId) return false;
      if (activeTab === 'under_review' && c.status !== 'Under Review') return false;
      if (activeTab === 'institution_response' && !(c.status === 'Awaiting Institution Response' || c.institutionResponseRequested)) return false;
      if (activeTab === 'action_required' && !(c.status === 'Action & Investigation' || c.status === 'Awaiting Information')) return false;
      if (activeTab === 'near_deadline' && !isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays)) return false;
      if (activeTab === 'overdue' && !(c.deadlineDate < today && c.status !== 'Closed' && c.status !== 'Resolved')) return false;
      if (activeTab === 'resolution_recommended' && c.status !== 'Resolution Recommended') return false;
      if (activeTab === 'closure_review' && !(c.status === 'Awaiting Closure Review' || (c.status === 'Resolved' && !c.closureApprovedBy))) return false;
      if (activeTab === 'recent') {
        const sevenDaysAgo = '2026-10-16';
        if (!((c.lastUpdatedDate && c.lastUpdatedDate >= sevenDaysAgo) || c.submissionDate >= sevenDaysAgo)) return false;
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
  }, [bureauComplaints, activeTab, priorityFilter, categoryFilter, searchTerm, today, settings.approachingDeadlineDays]);

  // Dynamic helper for next required action
  const getNextRequiredAction = (c: Complaint) => {
    if (c.isReopened || c.status === 'Reopened') {
      return {
        label: 'Stage 5: High-Priority Re-inquiry',
        badge: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }
    if (c.status === 'Awaiting Institution Response' || c.institutionResponseRequested) {
      return {
        label: 'Stage 6: Review Institutional Rejoinder',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      };
    }
    if (c.status === 'Awaiting Information') {
      return {
        label: 'Stage 2: Citizen Clarification Pending',
        badge: 'bg-purple-100 text-purple-800 border-purple-300'
      };
    }
    if (c.status === 'Action & Investigation') {
      return {
        label: 'Stage 7: On-Site Inquiry / Hearing',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-300'
      };
    }
    if (c.status === 'Resolution Recommended') {
      return {
        label: 'Stage 8: Formulate Directives',
        badge: 'bg-teal-100 text-teal-800 border-teal-300'
      };
    }
    if (c.status === 'Awaiting Closure Review' || (c.status === 'Resolved' && !c.closureApprovedBy)) {
      return {
        label: 'Stage 9: Administrative Sanction Pending',
        badge: 'bg-blue-100 text-blue-800 border-blue-300'
      };
    }
    if (c.status === 'Closed') {
      return {
        label: 'Stage 10: Disposed & Record Archived',
        badge: 'bg-slate-100 text-slate-600 border-slate-300'
      };
    }
    return {
      label: 'Stage 5: Conduct Preliminary Investigation',
      badge: 'bg-blue-100 text-blue-800 border-blue-300'
    };
  };

  // Personal Task / Follow-up Center Items
  const tasks = useMemo(() => {
    const list: Array<{
      id: string;
      complaintId: string;
      complaintTitle: string;
      institutionName: string;
      taskTitle: string;
      urgency: 'Critical' | 'High' | 'Medium' | 'Routine';
      dueDate: string;
      category: string;
      targetTab: 'actions' | 'notes' | 'lifecycle';
    }> = [];

    bureauComplaints.forEach(c => {
      if (c.status === 'Closed') return;

      const isOverdue = c.deadlineDate < today && c.status !== 'Resolved';
      const isNear = isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays);

      if (isOverdue) {
        list.push({
          id: `TASK-OD-${c.id}`,
          complaintId: c.id,
          complaintTitle: c.title,
          institutionName: c.institutionName,
          taskTitle: `Case has exceeded SLA deadline (${c.deadlineDate}). Formulate findings or request deadline extension immediately.`,
          urgency: 'Critical',
          dueDate: c.deadlineDate,
          category: c.category,
          targetTab: 'actions'
        });
      } else if (isNear) {
        list.push({
          id: `TASK-APP-${c.id}`,
          complaintId: c.id,
          complaintTitle: c.title,
          institutionName: c.institutionName,
          taskTitle: `Approaching deadline: Finalize inquiry and recommend resolution before ${c.deadlineDate}.`,
          urgency: 'High',
          dueDate: c.deadlineDate,
          category: c.category,
          targetTab: 'actions'
        });
      }

      if (c.status === 'Awaiting Institution Response' || c.institutionResponseRequested) {
        list.push({
          id: `TASK-INST-${c.id}`,
          complaintId: c.id,
          complaintTitle: c.title,
          institutionName: c.institutionName,
          taskTitle: `Examine statutory response from ${c.institutionName}. Record findings or issue reminder notice.`,
          urgency: 'Medium',
          dueDate: c.deadlineDate,
          category: c.category,
          targetTab: 'actions'
        });
      }

      if (c.status === 'Action & Investigation' || c.status === 'Under Review') {
        list.push({
          id: `TASK-RES-${c.id}`,
          complaintId: c.id,
          complaintTitle: c.title,
          institutionName: c.institutionName,
          taskTitle: `Prepare formal resolution terms & recommendations for administrative sanction.`,
          urgency: c.priority === 'High' || c.priority === 'Critical' ? 'High' : 'Medium',
          dueDate: c.deadlineDate,
          category: c.category,
          targetTab: 'actions'
        });
      }
    });

    return list.sort((a, b) => {
      const order = { Critical: 4, High: 3, Medium: 2, Routine: 1 };
      return order[b.urgency] - order[a.urgency];
    });
  }, [bureauComplaints, today, settings.approachingDeadlineDays]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const isDone = completedTaskIds.includes(t.id);
      if (taskFilter === 'PENDING' && isDone) return false;
      if (taskFilter === 'CRITICAL' && t.urgency !== 'Critical') return false;
      if (taskFilter === 'HIGH' && t.urgency !== 'High') return false;
      return true;
    });
  }, [tasks, completedTaskIds, taskFilter]);

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
    setActionSuccessMsg(`Formal statutory explanation demand dispatched to ${selectedCase.institutionName}. Status set to Awaiting Institution Response.`);
    setInstitutionQuery('');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleRecordInstitutionReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !institutionReply.trim()) return;

    recordInstitutionResponse(selectedCase.id, institutionReply.trim());
    setActionSuccessMsg(`Official institution rejoinder registered on record for ${selectedCase.id}. Moved to Action & Investigation.`);
    setInstitutionReply('');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleRequestCitizenInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !citizenQuery.trim()) return;

    requestComplainantInfo(selectedCase.id, citizenQuery.trim());
    setActionSuccessMsg(`Clarification notice dispatched to complainant for ${selectedCase.id}. Status set to Awaiting Information.`);
    setCitizenQuery('');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleRecommendResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !resolutionProposal.trim()) return;

    recommendResolution(selectedCase.id, resolutionProposal.trim());
    setActionSuccessMsg(`Formal resolution terms formulated. Complaint ${selectedCase.id} forwarded to Administration Cell for final closure approval.`);
    setResolutionProposal('');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNoteContent.trim()) return;

    addNote(selectedCase.id, newNoteContent.trim(), undefined, true);
    setActionSuccessMsg(`Confidential internal note added to ${selectedCase.id}. Visible to council staff only.`);
    setNewNoteContent('');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (completedTaskIds.includes(taskId)) {
      setCompletedTaskIds(completedTaskIds.filter(id => id !== taskId));
    } else {
      setCompletedTaskIds([...completedTaskIds, taskId]);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Officer Header */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B477F] text-xs font-bold border border-blue-200 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Bureau Officer Operations • Desk Investigation & Verification</span>
          </div>
          <h1 className="text-2xl font-black text-[#17324D]">
            Bureau Officer Operational Center
          </h1>
          <p className="text-xs text-[#53677D] mt-1">
            Logged in as: <strong className="text-[#17324D]">{currentUser?.name}</strong> ({currentUser?.designation}) • Bureau: <strong className="text-[#0B477F]">{currentUser?.bureauName || 'All Bureaus'}</strong>
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('docket')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'docket'
                ? 'bg-white text-[#0B477F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Assigned Docket ({bureauComplaints.length})</span>
          </button>
          <button
            onClick={() => setViewMode('tasks')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'tasks'
                ? 'bg-white text-[#0B477F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4 text-amber-600" />
            <span>Task & Follow-up Center ({tasks.length - completedTaskIds.length})</span>
          </button>
        </div>
      </div>

      {/* 9 Required Operational Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#17324D] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#0B477F]" />
            <span>Operational Queues & Statutory Filters (9 Categories)</span>
          </h2>
          <span className="text-xs text-slate-500">Click any card below to filter the active docket view</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2.5">
          {[
            { id: 'new_assigned', label: 'Newly Assigned', count: metrics.newlyAssigned, sub: 'Intake allocation', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'under_review', label: 'Under Review', count: metrics.underReview, sub: 'Stage 5 scrutiny', icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { id: 'institution_response', label: 'Inst. Response', count: metrics.awaitingInstitution, sub: 'Notice dispatched', icon: Building, color: 'text-amber-600', bg: 'bg-amber-50' },
            { id: 'action_required', label: 'Action Required', count: metrics.actionRequired, sub: 'Hearing & proof', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
            { id: 'near_deadline', label: 'Near Deadline', count: metrics.nearDeadline, sub: `≤ ${settings.approachingDeadlineDays} days left`, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
            { id: 'overdue', label: 'My Overdue', count: metrics.overdue, sub: 'SLA exceeded', icon: Clock, color: 'text-[#C43D3D]', bg: 'bg-rose-100' },
            { id: 'resolution_recommended', label: 'Resolution Ready', count: metrics.resolutionRecommended, sub: 'Directives drafted', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
            { id: 'closure_review', label: 'Closure Review', count: metrics.awaitingClosureReview, sub: 'Sanction pending', icon: FileCheck2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { id: 'recent', label: 'Recent 7D', count: metrics.recent, sub: 'Latest updates', icon: History, color: 'text-slate-600', bg: 'bg-slate-100' }
          ].map((card) => {
            const Icon = card.icon;
            const isSelected = activeTab === card.id;

            return (
              <button
                key={card.id}
                onClick={() => {
                  setActiveTab(card.id as any);
                  setViewMode('docket');
                }}
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#0B477F] ring-2 ring-[#0B477F]/30 shadow-sm'
                    : 'bg-white border-[#D6E4F0] hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="truncate">{card.label}</span>
                  <div className={`w-6 h-6 rounded-md ${card.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-xl font-black ${card.color}`}>{card.count}</span>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">{card.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: DOCKET TABLE */}
      {viewMode === 'docket' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          {/* Active Filter Pill Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0B477F]" />
                <span>Assigned Complaint Docket</span>
              </h3>
              <span className="px-2 py-0.5 bg-blue-50 text-[#0B477F] font-bold text-xs rounded-full border border-blue-200">
                {filteredQueue.length} {filteredQueue.length === 1 ? 'case' : 'cases'}
              </span>
              {activeTab !== 'all' && (
                <span className="text-[11px] font-semibold text-slate-500">
                  (Filtered by: <strong>{activeTab.replace(/_/g, ' ').toUpperCase()}</strong>)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search token, institution, subject..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B477F] focus:bg-white"
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
                <option value="Infrastructure & Labs">Infrastructure & Labs</option>
                <option value="Academic Administration & Faculty">Academic Administration</option>
                <option value="Fee Irregularity & Caution Refund">Fee Irregularity</option>
                <option value="Examination Malpractice & Results">Examinations</option>
                <option value="Harassment & Anti-Ragging">Harassment / Anti-Ragging</option>
                <option value="Regulatory Compliance & Fraud">Regulatory & Compliance</option>
              </select>

              {(searchTerm || priorityFilter !== 'all' || categoryFilter !== 'all' || activeTab !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setPriorityFilter('all');
                    setCategoryFilter('all');
                    setActiveTab('all');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Docket Table with All Required Columns */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Complaint Token</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Institution & Subject</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Lifecycle Stage</th>
                  <th className="py-2.5 px-3">Assigned Date</th>
                  <th className="py-2.5 px-3">Days Pending</th>
                  <th className="py-2.5 px-3">Deadline & SLA</th>
                  <th className="py-2.5 px-3">Last Updated</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Next Required Action</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-800">No complaints matching selected queue filter</p>
                      <p className="text-xs text-slate-400 mt-1">Select "Active Queue" or clear category and priority filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map(c => {
                    const isOverdue = c.deadlineDate < today && c.status !== 'Closed' && c.status !== 'Resolved';
                    const isNear = isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays);
                    const age = getCaseAgeInDays(c.submissionDate, c.resolvedDate);
                    const isSelected = selectedCaseId === c.id;
                    const nextAction = getNextRequiredAction(c);
                    const lastUpdated = c.lastUpdatedDate || c.submissionDate;

                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-blue-50/50 transition-colors ${
                          isSelected ? 'bg-blue-50/90 font-medium' : ''
                        }`}
                      >
                        {/* 1. Complaint Token */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#0B477F]">{c.id}</span>
                          {c.isReopened && (
                            <span className="block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded w-fit">
                              REOPENED
                            </span>
                          )}
                        </td>

                        {/* 2. Institution & Subject */}
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-900 line-clamp-1" title={c.institutionName}>
                            {c.institutionName}
                          </p>
                          <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5" title={c.title}>
                            {c.title}
                          </p>
                        </td>

                        {/* 3. Category */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 font-medium">
                            {c.category}
                          </span>
                        </td>

                        {/* 4. Priority */}
                        <td className="py-3 px-3 whitespace-nowrap">
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

                        {/* 5. Lifecycle Stage */}
                        <td className="py-3 px-3 whitespace-nowrap">
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

                        {/* 6. Assigned Date */}
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {formatDate(c.submissionDate)}
                        </td>

                        {/* 7. Days Pending */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`font-semibold ${age > 30 ? 'text-red-700' : age > 15 ? 'text-amber-700' : 'text-slate-700'}`}>
                            {age} d
                          </span>
                        </td>

                        {/* 8. Deadline & SLA */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : isNear ? 'text-amber-700 font-bold' : 'text-slate-700'}`}>
                            {formatDate(c.deadlineDate)}
                          </div>
                          {isOverdue && (
                            <span className="text-[9px] text-rose-600 font-bold block">
                              OVERDUE
                            </span>
                          )}
                          {isNear && (
                            <span className="text-[9px] text-amber-700 font-bold block">
                              Due Soon
                            </span>
                          )}
                        </td>

                        {/* 9. Last Updated */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {formatDate(lastUpdated)}
                        </td>

                        {/* 10. Next Required Action */}
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${nextAction.badge}`}>
                            {nextAction.label}
                          </span>
                        </td>

                        {/* 11. Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedCaseId(c.id);
                                setDrawerTab('actions');
                              }}
                              className="px-2.5 py-1 bg-[#0B477F] text-white rounded text-[11px] font-bold hover:bg-[#155A91] transition flex items-center gap-1 shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Examine</span>
                            </button>
                            <Link
                              to={`/case/${c.id}`}
                              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                              title="Open full statutory record"
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
      )}

      {/* VIEW MODE 2: PERSONAL TASK / FOLLOW-UP CENTER */}
      {viewMode === 'tasks' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-black text-[#17324D] flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-amber-600" />
                <span>Officer Priority Task & Follow-up Center</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory action items generated from active cases, sorted by SLA urgency and investigation milestones.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaskFilter('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  taskFilter === 'ALL'
                    ? 'bg-[#0B477F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setTaskFilter('CRITICAL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  taskFilter === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Critical Overdue
              </button>
              <button
                onClick={() => setTaskFilter('HIGH')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  taskFilter === 'HIGH'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Approaching Window
              </button>
              <button
                onClick={() => setTaskFilter('PENDING')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  taskFilter === 'PENDING'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pending Only ({tasks.length - completedTaskIds.length})
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">All tasks in this view completed or clear</h4>
              <p className="text-xs text-slate-400 mt-1">Keep monitoring new intakes or check the assigned docket.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map(task => {
                const isCompleted = completedTaskIds.includes(task.id);

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : task.urgency === 'Critical'
                        ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                        : task.urgency === 'High'
                        ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-blue-600 bg-white'
                        }`}
                        title={isCompleted ? 'Mark uncompleted' : 'Mark as done'}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                              task.urgency === 'Critical'
                                ? 'bg-red-100 text-red-800'
                                : task.urgency === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {task.urgency.toUpperCase()}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#0B477F]">{task.complaintId}</span>
                          <span className="text-xs text-slate-600 font-semibold">• {task.institutionName}</span>
                        </div>
                        <p className={`text-xs font-semibold text-slate-800 mt-1 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                          {task.taskTitle}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>Target SLA: <strong className="text-slate-700">{formatDate(task.dueDate)}</strong></span>
                          <span>•</span>
                          <span>Category: {task.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => {
                          setSelectedCaseId(task.complaintId);
                          setDrawerTab(task.targetTab);
                        }}
                        className="px-3 py-1.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Action Case</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Full Case Review Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-300">
            {/* Drawer Header */}
            <div className="bg-[#0B477F] text-white p-4 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm px-2.5 py-1 bg-white/10 rounded font-bold border border-white/20 text-amber-300">
                  {selectedCase.id}
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedCase.title}</h3>
                  <p className="text-xs text-blue-200">
                    {selectedCase.institutionName} • Registered: {formatDate(selectedCase.submissionDate)}
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
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-semibold shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Navigation Tabs in Drawer */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 shrink-0">
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
                <span>Lifecycle Flow & Tracker</span>
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
                    {formatDate(selectedCase.deadlineDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Complainant</span>
                  <span className="font-semibold text-slate-800">{selectedCase.complainantName || 'Confidential Student Filing'}</span>
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
                        1. Demand Institution Explanation (Stage 6 Notice)
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
                      Bureau officers formulate formal findings and propose resolution terms. The case moves to "Resolution Recommended" for final closure approval by the Administration Cell.
                    </p>
                    <form onSubmit={handleRecommendResolution} className="space-y-2">
                      <textarea
                        rows={3}
                        value={resolutionProposal}
                        onChange={e => setResolutionProposal(e.target.value)}
                        placeholder="Specify final resolution directives, refund orders, or compliance remediation mandates..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 transition shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submit Resolution for Administrative Approval</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: Lifecycle Tracker */}
              {drawerTab === 'lifecycle' && (
                <div className="space-y-4">
                  <ComplaintLifecycleTracker complaint={selectedCase} isPublic={false} />
                </div>
              )}

              {/* TAB 3: Notes */}
              {drawerTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Confidential Internal Deliberations — strictly restricted from complainant/public view.</span>
                  </div>

                  <form onSubmit={handleAddInternalNote} className="space-y-2">
                    <textarea
                      rows={2}
                      value={newNoteContent}
                      onChange={e => setNewNoteContent(e.target.value)}
                      placeholder="Add confidential officer note or scrutiny findings..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0B477F]"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#0B477F] text-white text-xs font-semibold rounded hover:bg-[#155A91] transition flex items-center gap-1.5"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>Add Internal Note</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {selectedCaseNotes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No internal notes recorded yet.</p>
                    ) : (
                      selectedCaseNotes.map(n => (
                        <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span className="font-semibold text-slate-800">{n.authorName}</span>
                            <span>{formatDate(n.timestamp)}</span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-wrap">{n.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Intelligence */}
              {drawerTab === 'intel' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>AI-Powered Cross-Case Pattern & Related Filing Intelligence</span>
                  </div>

                  {selectedCaseIntel.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No related case patterns detected for this docket.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedCaseIntel.map(intel => (
                        <div key={intel.id} className="p-3.5 border border-slate-200 rounded-lg bg-white space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">
                              Linked with Case: <span className="font-mono text-[#0B477F]">{intel.relatedComplaintId}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              {Math.round(intel.overallScore || intel.textSimilarityScore)}% Match
                            </span>
                          </div>
                          <p className="text-slate-600">{intel.explanation}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {intel.matchSignals.map((sig, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                                {sig}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

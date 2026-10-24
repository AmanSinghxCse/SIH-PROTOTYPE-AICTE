import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { getCaseAgeInDays, isApproachingDeadline, isOverdue, formatDate } from '../../utils/dateUtils';
import { Complaint, ComplaintPriority, ComplaintStatus, TaskItem } from '../../types';
import { ComplaintLifecycleTracker } from '../../components/workflow/ComplaintLifecycleTracker';
import {
  ShieldCheck,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  UserCheck,
  Building2,
  History,
  FileCheck2,
  Eye,
  BarChart3,
  Download,
  RotateCcw,
  Search,
  HelpCircle,
  ShieldAlert,
  AlertCircle,
  Lightbulb,
  Building,
  FileText,
  ListTodo,
  CheckSquare,
  Send,
  MessageSquarePlus,
  Sparkles,
  ExternalLink,
  Lock,
  MessageCircle,
  Flame,
  Filter,
  PlusCircle,
  X,
  Layers,
  Calendar,
  Briefcase,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const GovernmentOfficialsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    complaints,
    bureaus,
    users,
    notes,
    addNote,
    timelineEvents,
    relatedSuggestions,
    settings,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    requestInstitutionResponse,
    recordInstitutionResponse,
    requestComplainantInfo,
    recommendResolution,
    updateComplaintStatus,
    hasPermission
  } = useCaseTrack();

  // Multi-criteria filters
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [viewScope, setViewScope] = useState<'all' | 'unit' | 'mine'>('all');

  // Case Drawer State
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'actions' | 'lifecycle' | 'notes' | 'intel'>('actions');
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [institutionReply, setInstitutionReply] = useState('');
  const [citizenQuery, setCitizenQuery] = useState('');
  const [resolutionProposal, setResolutionProposal] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Task Management State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskComplaintId, setNewTaskComplaintId] = useState(complaints[0]?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-30');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<'workspace' | 'tasks' | 'unit_analytics' | 'ai_assistant'>('workspace');

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (viewScope === 'mine' && c.assignedOfficerId !== currentUser.id) return false;
      if (viewScope === 'unit' && currentUser.bureauId && c.bureauId !== currentUser.bureauId) return false;
      if (filterCategory !== 'all' && c.category !== filterCategory) return false;
      if (filterPriority !== 'all') {
        if (filterPriority === 'High' && c.priority !== 'High' && c.priority !== 'Critical' && c.priority !== 'Urgent') return false;
        else if (filterPriority !== 'High' && c.priority !== filterPriority) return false;
      }
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const m = c.id.toLowerCase().includes(q) || c.institutionName.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [complaints, viewScope, currentUser, filterCategory, filterPriority, filterStatus, filterSearch]);

  const selectedCase = useMemo(() => {
    return complaints.find(c => c.id === selectedCaseId) || null;
  }, [complaints, selectedCaseId]);

  // Section 6: Government Officials KPI Cards
  const kpiStats = useMemo(() => {
    const all = complaints;
    const myUnitId = currentUser.bureauId || 'BUR-GRV';
    const myOfficerId = currentUser.id;
    const approachingDays = settings?.approachingDeadlineDays || 3;

    return {
      myAssigned: all.filter(c => c.assignedOfficerId === myOfficerId && c.status !== 'Closed').length,
      unitAssigned: all.filter(c => c.bureauId === myUnitId && c.status !== 'Closed').length,
      awaitingReview: all.filter(c => c.status === 'Open' || c.status === 'Under Review').length,
      awaitingInstResponse: all.filter(c => c.status === 'Awaiting Institution Response' || c.institutionResponseRequested).length,
      awaitingAddlInfo: all.filter(c => c.status === 'Awaiting Information' || c.verificationStatus === 'Needs Information').length,
      highPriority: all.filter(c => (c.priority === 'High' || c.priority === 'Critical' || c.priority === 'Urgent') && c.status !== 'Closed').length,
      nearDeadline: all.filter(c => isApproachingDeadline(c.deadlineDate, c.status, approachingDays)).length,
      overdue: all.filter(c => isOverdue(c.deadlineDate, c.status)).length,
      escalated: all.filter(c => c.status === 'Escalated' || c.priority === 'Critical').length,
      tasksDueToday: tasks.filter(t => !t.completed).length,
      pendingFollowUps: all.filter(c => c.status === 'Action & Investigation' || c.status === 'Awaiting Information').length,
      resolutionRecommended: all.filter(c => c.status === 'Resolution Recommended').length,
      awaitingClosureReview: all.filter(c => c.status === 'Awaiting Closure Review' || (c.status === 'Resolved' && !c.closureApprovedBy)).length,
      recentlyUpdated: all.filter(c => {
        const updated = c.lastUpdatedDate || c.submissionDate;
        return getCaseAgeInDays(updated) <= 7;
      }).length
    };
  }, [complaints, currentUser, settings, tasks]);

  // Charts data
  const unitWorkloadData = useMemo(() => {
    return bureaus.map(b => {
      const unitCases = complaints.filter(c => c.bureauId === b.id);
      const active = unitCases.filter(c => c.status !== 'Closed' && c.status !== 'Resolved').length;
      const overdue = unitCases.filter(c => isOverdue(c.deadlineDate, c.status)).length;
      return {
        name: b.shortName,
        active,
        overdue
      };
    });
  }, [bureaus, complaints]);

  const statusDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  // Handle actions
  const handleSendInstitutionNotice = () => {
    if (!selectedCase || !institutionQuery.trim()) return;
    requestInstitutionResponse(selectedCase.id, institutionQuery.trim());
    setInstitutionQuery('');
    setActionSuccessMsg(`Formal Directive Dispatched to ${selectedCase.institutionName}`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRecordRejoinder = () => {
    if (!selectedCase || !institutionReply.trim()) return;
    recordInstitutionResponse(selectedCase.id, institutionReply.trim());
    setInstitutionReply('');
    setActionSuccessMsg(`Institutional Explanation Recorded for ${selectedCase.id}`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRequestCitizenInfo = () => {
    if (!selectedCase || !citizenQuery.trim()) return;
    requestComplainantInfo(selectedCase.id, citizenQuery.trim());
    setCitizenQuery('');
    setActionSuccessMsg(`Citizen Clarification Notice Issued for ${selectedCase.id}`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleRecommendResolution = () => {
    if (!selectedCase || !resolutionProposal.trim()) return;
    recommendResolution(selectedCase.id, resolutionProposal.trim());
    setResolutionProposal('');
    setActionSuccessMsg(`Statutory Findings & Resolution Recommended for ${selectedCase.id}`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleAddNote = () => {
    if (!selectedCase || !newNoteContent.trim()) return;
    addNote(selectedCase.id, newNoteContent.trim(), undefined, true);
    setNewNoteContent('');
    setActionSuccessMsg(`Confidential Note Recorded in ${selectedCase.id}`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const matchedC = complaints.find(c => c.id === newTaskComplaintId);
    addTask({
      title: newTaskTitle.trim(),
      complaintId: newTaskComplaintId,
      complaintTitle: matchedC?.title,
      institutionName: matchedC?.institutionName,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      assignedToId: currentUser.id,
      assignedToName: currentUser.name,
      category: matchedC?.category
    });
    setNewTaskTitle('');
    setNewTaskModalOpen(false);
  };

  const handleAiAsk = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      const q = aiPrompt.toLowerCase();
      let ans = '';
      if (q.includes('deadline') || q.includes('overdue')) {
        ans = `According to statutory AICTE SLA benchmarks, there are currently ${kpiStats.overdue} overdue complaints and ${kpiStats.nearDeadline} cases approaching their 72-hour deadline threshold. High-priority investigations in the Approval & Regulatory Bureau require expedited inspection.`;
      } else if (q.includes('institution') || q.includes('college')) {
        ans = `Recent institutional analysis shows repeated grievances under Fee Irregularities and Lab Infrastructure. Recommendation: Formulate formal Stage 6 explanation directives with a 7-day rejoinder window before sanction review.`;
      } else if (q.includes('summary') || q.includes('status')) {
        ans = `Operational Desk Summary: ${complaints.length} active docket cases are registered across 5 bureaus. ${kpiStats.myAssigned} cases are allocated directly to your officer account. Resolution recommendations are pending on ${kpiStats.resolutionRecommended} cases.`;
      } else {
        ans = `AICTE Case Assistant: Examined grievance parameters for active complaints. Case evidence indicates clear documentation for fee refund disputes. Recommended operational action: Issue statutory notice to the institution registrar and prepare resolution findings under AICTE Redressal Regulation 2019.`;
      }
      setAiResponse(ans);
      setAiGenerating(false);
    }, 600);
  };

  const PIE_COLORS = ['#0B477F', '#155A91', '#059669', '#D97706', '#DC2626', '#7C3AED', '#64748B'];

  return (
    <div className="space-y-6 animate-fadeIn py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#064578] via-[#0B477F] to-[#155A91] text-white rounded-2xl p-6 shadow-md border border-blue-400/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-amber-300 text-xs font-black uppercase tracking-wider border border-blue-300/30">
                Government Officials Portal
              </span>
              <span className="text-white/60 text-xs">•</span>
              <span className="text-xs text-blue-100 font-semibold">
                Operational Case Management & Desk Workspaces
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-amber-300" />
              <span>Council Desk & Case Investigation Command</span>
            </h1>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              Assigned responsibilities, on-site inquiry management, statutory institutional explanation notices, citizen clarification requests, and resolution formulation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/officials/how-it-works"
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>How It Works</span>
            </Link>

            <button
              onClick={() => setNewTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-xs font-black transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>

            <Link
              to="/registry"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#0B477F] hover:bg-blue-50 rounded-xl text-xs font-black transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Complaint Registry</span>
            </Link>
          </div>
        </div>

        {/* Current Officer Profile Strip */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] border border-amber-300/30">
                  {currentUser.role === 'admin' ? 'Central Administrator' : 'Desk Grievance Officer'}
                </span>
              </div>
              <div className="text-[11px] text-blue-200">{currentUser.designation} • {currentUser.bureauName || 'Council Grievance Cell'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-lg">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>Statutory Date: <strong>24 Oct 2026</strong></span>
            </div>
            <div className="flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>My Active Cases: <strong>{kpiStats.myAssigned}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Government Officials 14 KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#17324D]">
              Operational Performance Indicators
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              (Live metrics mapped to your authorized responsibilities)
            </span>
          </div>
          <span className="text-xs text-[#0B477F] font-bold">14 Statutory Focus Areas</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* 1. My Assigned */}
          <div
            onClick={() => navigate('/registry?filter=assigned')}
            className="p-3 bg-white rounded-xl border border-blue-200 hover:border-[#0B477F] shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B477F]">My Assigned</div>
            <div className="text-xl font-black text-[#17324D] mt-1">{kpiStats.myAssigned}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Allocated to my desk</div>
          </div>

          {/* 2. Unit Assigned */}
          <div
            onClick={() => navigate('/registry?bureau=BUR-GRV')}
            className="p-3 bg-white rounded-xl border border-blue-200 hover:border-[#0B477F] shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">My Unit Cases</div>
            <div className="text-xl font-black text-[#17324D] mt-1">{kpiStats.unitAssigned}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Bureau-wide queue</div>
          </div>

          {/* 3. Awaiting Review */}
          <div
            onClick={() => navigate('/registry?filter=under_review')}
            className="p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Awaiting Review</div>
            <div className="text-xl font-black text-amber-700 mt-1">{kpiStats.awaitingReview}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Preliminary inquiry</div>
          </div>

          {/* 4. Awaiting Inst Response */}
          <div
            onClick={() => navigate('/registry?filter=institution_response')}
            className="p-3 bg-white rounded-xl border border-yellow-200 hover:border-yellow-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-800">Inst. Response</div>
            <div className="text-xl font-black text-yellow-700 mt-1">{kpiStats.awaitingInstResponse}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Explanation notice sent</div>
          </div>

          {/* 5. Awaiting Addl Info */}
          <div
            onClick={() => navigate('/registry?filter=awaiting_info')}
            className="p-3 bg-white rounded-xl border border-purple-200 hover:border-purple-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Citizen Info</div>
            <div className="text-xl font-black text-purple-700 mt-1">{kpiStats.awaitingAddlInfo}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Complainant query</div>
          </div>

          {/* 6. High Priority */}
          <div
            onClick={() => navigate('/registry?priority=High')}
            className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">High Priority</div>
            <div className="text-xl font-black text-rose-700 mt-1">{kpiStats.highPriority}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Urgent & Critical</div>
          </div>

          {/* 7. Near Deadline */}
          <div
            onClick={() => navigate('/registry?approaching=true')}
            className="p-3 bg-white rounded-xl border border-orange-200 hover:border-orange-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-800">Near Deadline</div>
            <div className="text-xl font-black text-orange-700 mt-1">{kpiStats.nearDeadline}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Due in 72 hours</div>
          </div>

          {/* 8. Overdue Cases */}
          <div
            onClick={() => navigate('/registry?overdue=true')}
            className="p-3 bg-red-50/50 rounded-xl border border-red-200 hover:border-red-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-red-700 flex items-center justify-between">
              <span>Overdue</span>
              <AlertCircle className="w-3 h-3 text-red-600" />
            </div>
            <div className="text-xl font-black text-red-700 mt-1">{kpiStats.overdue}</div>
            <div className="text-[10px] text-red-600 mt-0.5">SLA exceeded</div>
          </div>

          {/* 9. Escalated Cases */}
          <div
            onClick={() => navigate('/registry?filter=escalated')}
            className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Escalated</div>
            <div className="text-xl font-black text-rose-700 mt-1">{kpiStats.escalated}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Supervisory review</div>
          </div>

          {/* 10. Tasks Due Today */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="p-3 bg-white rounded-xl border border-indigo-200 hover:border-indigo-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">Tasks Pending</div>
            <div className="text-xl font-black text-indigo-700 mt-1">{kpiStats.tasksDueToday}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Action items</div>
          </div>

          {/* 11. Pending Follow-Ups */}
          <div
            onClick={() => navigate('/registry?filter=action')}
            className="p-3 bg-white rounded-xl border border-teal-200 hover:border-teal-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Follow-Ups</div>
            <div className="text-xl font-black text-teal-700 mt-1">{kpiStats.pendingFollowUps}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Investigation active</div>
          </div>

          {/* 12. Resolution Recommended */}
          <div
            onClick={() => navigate('/registry?filter=resolution_recommended')}
            className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Resolution Rec.</div>
            <div className="text-xl font-black text-emerald-700 mt-1">{kpiStats.resolutionRecommended}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Draft findings ready</div>
          </div>

          {/* 13. Awaiting Closure Review */}
          <div
            onClick={() => navigate('/registry?filter=closure_review')}
            className="p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Closure Review</div>
            <div className="text-xl font-black text-blue-700 mt-1">{kpiStats.awaitingClosureReview}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Pending sanction</div>
          </div>

          {/* 14. Recently Updated */}
          <div
            onClick={() => navigate('/registry?filter=updated_today')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-400 shadow-xs cursor-pointer interactive-card"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Updated Today</div>
            <div className="text-xl font-black text-slate-800 mt-1">{kpiStats.recentlyUpdated}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Recent docket edits</div>
          </div>
        </div>
      </div>

      {/* Navigation Workspace Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'workspace'
              ? 'border-[#0B477F] text-[#0B477F]'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Case Investigation Desk ({filteredComplaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'tasks'
              ? 'border-[#0B477F] text-[#0B477F]'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Priority Tasks & Follow-ups ({tasks.filter(t => !t.completed).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('unit_analytics')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'unit_analytics'
              ? 'border-[#0B477F] text-[#0B477F]'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Unit Workload & Ageing Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_assistant')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'ai_assistant'
              ? 'border-[#0B477F] text-[#0B477F]'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Officer AI Case Assistant</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: OPERATIONAL CASE INVESTIGATION DESK */}
      {activeTab === 'workspace' && (
        <div className="space-y-4">
          {/* Desk Filter Bar */}
          <div className="p-3.5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  placeholder="Filter cases by ID or college..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewScope('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    viewScope === 'all' ? 'bg-[#0B477F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Cases
                </button>
                <button
                  onClick={() => setViewScope('unit')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    viewScope === 'unit' ? 'bg-[#0B477F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Unit
                </button>
                <button
                  onClick={() => setViewScope('mine')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    viewScope === 'mine' ? 'bg-[#0B477F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Assigned
                </button>
              </div>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Infrastructure & Labs">Infrastructure & Labs</option>
                <option value="Academic Administration & Faculty">Academic Administration</option>
                <option value="Fee Irregularity & Caution Refund">Fee Irregularity</option>
                <option value="Examination Malpractice & Results">Examinations</option>
                <option value="Harassment & Anti-Ragging">Harassment / Anti-Ragging</option>
                <option value="Regulatory Compliance & Fraud">Regulatory & Compliance</option>
              </select>

              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="High">High / Critical</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Review">Under Review</option>
                <option value="Awaiting Information">Awaiting Information</option>
                <option value="Awaiting Institution Response">Awaiting Institution Response</option>
                <option value="Action & Investigation">Action & Investigation</option>
                <option value="Resolution Recommended">Resolution Recommended</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">
                Showing <strong>{filteredComplaints.length}</strong> complaints
              </span>
              <button
                onClick={() => {
                  setFilterSearch('');
                  setFilterCategory('all');
                  setFilterPriority('all');
                  setFilterStatus('all');
                  setViewScope('all');
                }}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Cases Grid / Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5">Reference ID</th>
                    <th className="py-3 px-3.5">Complaint Title</th>
                    <th className="py-3 px-3.5">Institution Name</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Priority</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5">Assigned Officer</th>
                    <th className="py-3 px-3.5">SLA Target</th>
                    <th className="py-3 px-3.5 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold">No active complaints found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting scope or filter parameters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map(c => {
                      const overdue = isOverdue(c.deadlineDate, c.status);
                      const approaching = isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays);
                      const isSelected = selectedCaseId === c.id;

                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50/80 font-medium' : ''
                          }`}
                          onClick={() => setSelectedCaseId(c.id)}
                        >
                          <td className="py-3 px-3.5 font-mono font-bold text-[#0B477F] whitespace-nowrap">
                            {c.id}
                          </td>
                          <td className="py-3 px-3.5 max-w-[200px] truncate font-semibold text-slate-900" title={c.title}>
                            {c.title}
                          </td>
                          <td className="py-3 px-3.5 max-w-[180px] truncate text-slate-800" title={c.institutionName}>
                            <div>{c.institutionName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{c.institutionCode}</span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-700">
                            {c.category}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              c.priority === 'Critical' || c.priority === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : c.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-700">
                            {c.assignedOfficerName || 'Pending Allocation'}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className={`font-semibold ${overdue ? 'text-red-700 font-bold' : approaching ? 'text-amber-700' : 'text-slate-700'}`}>
                              {formatDate(c.deadlineDate)}
                            </div>
                            {overdue && <span className="text-[9px] text-red-600 font-black block">OVERDUE</span>}
                          </td>
                          <td className="py-3 px-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedCaseId(c.id)}
                                className="px-2.5 py-1 bg-[#0B477F] hover:bg-[#155A91] text-white rounded text-xs font-bold transition"
                                title="Open operational drawer"
                              >
                                Examine
                              </button>
                              <button
                                onClick={() => navigate(`/case/${c.id}`)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                                title="Full Dossier"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
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

          {/* Operational Case Examination Drawer */}
          {selectedCase && (
            <div className="bg-white rounded-2xl shadow-md border border-blue-300 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0B477F] text-white text-[11px] font-mono font-bold">
                      {selectedCase.id}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {selectedCase.category}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600">
                      {selectedCase.institutionName} ({selectedCase.institutionCode})
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#17324D]">{selectedCase.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/case/${selectedCase.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#0B477F]" />
                    <span>View Public Dossier</span>
                  </button>
                  <button
                    onClick={() => setSelectedCaseId(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
                    title="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Tabs */}
              <div className="px-6 border-b border-slate-200 flex space-x-6 text-xs font-bold bg-slate-50/50">
                <button
                  onClick={() => setDrawerTab('actions')}
                  className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                    drawerTab === 'actions' ? 'border-[#0B477F] text-[#0B477F]' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Statutory Directives & Actions</span>
                </button>

                <button
                  onClick={() => setDrawerTab('lifecycle')}
                  className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                    drawerTab === 'lifecycle' ? 'border-[#0B477F] text-[#0B477F]' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>10-Stage Lifecycle</span>
                </button>

                <button
                  onClick={() => setDrawerTab('notes')}
                  className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                    drawerTab === 'notes' ? 'border-[#0B477F] text-[#0B477F]' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Confidential Internal Notes</span>
                </button>

                <button
                  onClick={() => setDrawerTab('intel')}
                  className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                    drawerTab === 'intel' ? 'border-[#0B477F] text-[#0B477F]' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Case Intelligence & Similar Cases</span>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6">
                {drawerTab === 'actions' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Action 1: Dispatch Statutory Notice to College (Stage 6) */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-[#0B477F]" />
                        <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                          1. Issue Statutory Directive / Notice to College (Stage 6)
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Dispatch a formal explanation directive to the institution head with a mandatory 7-day rejoinder window.
                      </p>
                      <textarea
                        rows={3}
                        value={institutionQuery}
                        onChange={e => setInstitutionQuery(e.target.value)}
                        placeholder="State specific inquiry points, regulations violated, and documentation required from college registrar..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                      />
                      <button
                        onClick={handleSendInstitutionNotice}
                        disabled={!institutionQuery.trim()}
                        className="w-full py-2 bg-[#0B477F] hover:bg-[#155A91] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Directive Notice</span>
                      </button>
                    </div>

                    {/* Action 2: Record Institutional Rejoinder */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                          2. Record Institutional Rejoinder / Explanation
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Log the college's formal written defense, annexures, and verification submissions into the case record.
                      </p>
                      <textarea
                        rows={3}
                        value={institutionReply}
                        onChange={e => setInstitutionReply(e.target.value)}
                        placeholder="Summarize college rejoinder, letter reference numbers, and whether corrective compliance was demonstrated..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <button
                        onClick={handleRecordRejoinder}
                        disabled={!institutionReply.trim()}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Record Rejoinder in Docket</span>
                      </button>
                    </div>

                    {/* Action 3: Request Complainant Clarification */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-700" />
                        <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                          3. Request Complainant Information / Affidavit
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ask student or citizen complainant for supplementary receipts, fee bank statements, or proof of enrollment.
                      </p>
                      <textarea
                        rows={3}
                        value={citizenQuery}
                        onChange={e => setCitizenQuery(e.target.value)}
                        placeholder="Specify additional documents needed from complainant..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-700"
                      />
                      <button
                        onClick={handleRequestCitizenInfo}
                        disabled={!citizenQuery.trim()}
                        className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>Send Citizen Information Request</span>
                      </button>
                    </div>

                    {/* Action 4: Formulate Resolution Findings (Stage 8) */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-700" />
                        <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                          4. Formulate Resolution Findings (Stage 8)
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Draft proposed findings, penalty or fee refund directives, and submit case for administrative closure review.
                      </p>
                      <textarea
                        rows={3}
                        value={resolutionProposal}
                        onChange={e => setResolutionProposal(e.target.value)}
                        placeholder="Enter recommended orders, corrective actions, and regulatory sanctions..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                      />
                      <button
                        onClick={handleRecommendResolution}
                        disabled={!resolutionProposal.trim()}
                        className="w-full py-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submit Resolution Recommendation</span>
                      </button>
                    </div>
                  </div>
                )}

                {drawerTab === 'lifecycle' && (
                  <div className="space-y-4">
                    <ComplaintLifecycleTracker
                      complaint={selectedCase}
                      isPublic={false}
                    />
                  </div>
                )}

                {drawerTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        Confidential Internal Notes are protected by Role-Based Access Control. Complainants and unauthorized personnel cannot view these notes.
                      </span>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={newNoteContent}
                        onChange={e => setNewNoteContent(e.target.value)}
                        placeholder="Add confidential case note, evidence scrutiny observation, or officer remark..."
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteContent.trim()}
                        className="px-4 py-2 bg-[#0B477F] hover:bg-[#155A91] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Append Confidential Note</span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      {(notes[selectedCase.id] || []).length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">No confidential notes added yet.</div>
                      ) : (
                        (notes[selectedCase.id] || []).map(note => (
                          <div key={note.id} className="p-3.5 text-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500">
                              <span className="font-bold text-slate-800">{note.authorName} ({note.authorRole})</span>
                              <span>{formatDate(note.timestamp)}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{note.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {drawerTab === 'intel' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>
                        AI Vector Cross-Reference Engine: Scanned past dockets for duplicate patterns against {selectedCase.institutionName}.
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {relatedSuggestions.filter(s => s.complaintId === selectedCase.id || s.relatedComplaintId === selectedCase.id).length === 0 ? (
                        <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                          No duplicate allegations or correlated dockets detected for this reference ID.
                        </div>
                      ) : (
                        relatedSuggestions
                          .filter(s => s.complaintId === selectedCase.id || s.relatedComplaintId === selectedCase.id)
                          .map(s => {
                            const otherId = s.complaintId === selectedCase.id ? s.relatedComplaintId : s.complaintId;
                            const otherCase = complaints.find(c => c.id === otherId);

                            return (
                              <div key={s.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-[#0B477F]">{otherId}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                                    {Math.round(s.overallScore || s.textSimilarityScore)}% Similarity Match
                                  </span>
                                </div>
                                <div className="font-semibold text-slate-800">{otherCase?.title || 'Related Grievance'}</div>
                                <p className="text-slate-600 text-[11px]">{s.explanation}</p>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRIORITY TASKS & FOLLOW-UP CENTER */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#17324D] flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-[#0B477F]" />
                <span>Priority Follow-up & Task Action Center</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory operational deadlines, evidence requests, on-site visit reminders, and institutional hearings.
              </p>
            </div>

            <button
              onClick={() => setNewTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active follow-up tasks currently assigned.
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-3.5 flex items-center justify-between gap-3 transition ${
                    task.completed ? 'bg-slate-50/60 opacity-60' : 'hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-[#0B477F] transition"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <CheckSquare className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <div className={`text-xs font-bold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        {task.complaintId && (
                          <span className="font-mono font-bold text-[#0B477F]">{task.complaintId}</span>
                        )}
                        <span>•</span>
                        <span>Due: {formatDate(task.dueDate)}</span>
                        <span>•</span>
                        <span>Assigned to: {task.assignedToName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      task.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Delete task"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: UNIT WORKLOAD & AGEING ANALYTICS */}
      {activeTab === 'unit_analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workload by Administrative Unit */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#17324D] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0B477F]" />
              <span>Unit Workload & Active Grievances</span>
            </h3>
            <p className="text-[11px] text-slate-500">Live complaint volume across the 5 statutory AICTE bureaus.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="active" fill="#0B477F" name="Active Cases" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overdue" fill="#DC2626" name="Overdue Cases" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Status Distribution */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#17324D] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>Status Distribution of Pending Dockets</span>
            </h3>
            <p className="text-[11px] text-slate-500">Case volume across operational lifecycle checkpoints.</p>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: any) => `${name.slice(0, 10)} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OFFICER AI CASE ASSISTANT */}
      {activeTab === 'ai_assistant' && (
        <div className="bg-white rounded-xl shadow-xs border border-purple-200 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#17324D]">Council Officer AI Case Assistant</h3>
              <p className="text-xs text-slate-500">
                Draft neutral investigation inquiries, summarize case histories, identify related precedents, and prepare resolution proposals.
              </p>
            </div>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
            <div className="font-bold">Prompt Suggestions:</div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setAiPrompt('Summarize upcoming SLA deadlines and overdue cases across bureaus')}
                className="px-2.5 py-1 bg-white border border-purple-200 rounded text-[11px] text-purple-800 hover:bg-purple-50"
              >
                Summarize upcoming SLA deadlines
              </button>
              <button
                onClick={() => setAiPrompt('Draft formal explanation inquiry to institution on fee refund non-compliance')}
                className="px-2.5 py-1 bg-white border border-purple-200 rounded text-[11px] text-purple-800 hover:bg-purple-50"
              >
                Draft institution inquiry directive
              </button>
              <button
                onClick={() => setAiPrompt('Explain status of active cases assigned to my grievance desk')}
                className="px-2.5 py-1 bg-white border border-purple-200 rounded text-[11px] text-purple-800 hover:bg-purple-50"
              >
                Explain active desk assignments
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Ask AI Case Assistant for investigation assistance..."
              className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-700"
            />
            <button
              onClick={handleAiAsk}
              disabled={aiGenerating || !aiPrompt.trim()}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              {aiGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Generate</span>
            </button>
          </div>

          {aiResponse && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn text-xs">
              <div className="flex items-center gap-2 text-purple-800 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI Operational Analysis:</span>
              </div>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line">{aiResponse}</p>
            </div>
          )}
        </div>
      )}

      {/* New Task Modal */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-black text-[#17324D] flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[#0B477F]" />
                <span>Create Follow-up Operational Task</span>
              </h3>
              <button onClick={() => setNewTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Action Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Call registrar regarding refund compliance report"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Associated Complaint Reference ID</label>
                <select
                  value={newTaskComplaintId}
                  onChange={e => setNewTaskComplaintId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none font-mono"
                >
                  <option value="">None (General Administrative Task)</option>
                  {complaints.map(c => (
                    <option key={c.id} value={c.id}>{c.id} — {c.title.slice(0, 35)}...</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
                  >
                  </input>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B477F] hover:bg-[#155A91] text-white font-bold rounded-lg shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { getCaseAgeInDays, isApproachingDeadline, isOverdue, formatDate } from '../../utils/dateUtils';
import { Complaint, ComplaintPriority, ComplaintStatus, TaskItem, Institution } from '../../types';
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
  BookOpen,
  MapPin,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ArrowUpDown
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
  Pie,
  Legend,
  CartesianGrid
} from 'recharts';

export const GovernmentOfficialsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    complaints,
    bureaus,
    institutions,
    requestInstitutionResponse,
    recordInstitutionResponse,
    requestComplainantInfo,
    recommendResolution,
    addNote,
    notes,
    relatedSuggestions,
    timelineEvents,
    tasks,
    addTask,
    toggleTask,
    deleteTask
  } = useCaseTrack();

  // Institution reference lookup map
  const institutionMap = useMemo(() => {
    const map = new Map<string, Institution>();
    institutions.forEach(inst => map.set(inst.id, inst));
    return map;
  }, [institutions]);

  // Available states in database
  const availableStates = useMemo(() => {
    const states = Array.from(new Set(institutions.map(inst => inst.state))).filter(Boolean).sort();
    return states;
  }, [institutions]);

  // Determine State Jurisdiction and Security Lock
  // State officials (e.g. Smt. Sunita Verma for Maharashtra) are locked to their assigned state.
  // National / Admin users can switch state scope or view all states.
  const isStateLocked = Boolean(
    currentUser.assignedState &&
    currentUser.assignedState !== 'All States' &&
    currentUser.jurisdiction === 'State'
  );
  const defaultState = currentUser.assignedState || 'Maharashtra';

  const [selectedState, setSelectedState] = useState<string>(defaultState);

  useEffect(() => {
    if (isStateLocked && currentUser.assignedState) {
      setSelectedState(currentUser.assignedState);
    }
  }, [isStateLocked, currentUser.assignedState]);

  // Complaints strictly scoped to the active state jurisdiction
  const stateComplaints = useMemo(() => {
    return complaints.filter(c => {
      const inst = institutionMap.get(c.institutionId);
      if (!inst) return false;
      if (selectedState === 'All States') return true;
      return inst.state.toLowerCase() === selectedState.toLowerCase();
    });
  }, [complaints, institutionMap, selectedState]);

  // Institutions & Districts located in the active state
  const stateInstitutions = useMemo(() => {
    if (selectedState === 'All States') return institutions;
    return institutions.filter(i => i.state.toLowerCase() === selectedState.toLowerCase());
  }, [institutions, selectedState]);

  const stateDistricts = useMemo(() => {
    const dists = Array.from(new Set(stateInstitutions.map(i => i.district))).filter(Boolean).sort();
    return dists;
  }, [stateInstitutions]);

  // 12 State-Wise KPI Metrics calculated directly from real database records
  const stateStats = useMemo(() => {
    const total = stateComplaints.length;
    const newlyReceived = stateComplaints.filter(c => c.status === 'Open').length;
    const awaitingReview = stateComplaints.filter(c => c.status === 'Under Review').length;
    const awaitingInstResponse = stateComplaints.filter(c => c.status === 'Awaiting Institution Response').length;
    const underInvestigation = stateComplaints.filter(c => c.status === 'Action & Investigation' || c.status === 'Under Review').length;
    const nearingDeadline = stateComplaints.filter(c => isApproachingDeadline(c.deadlineDate, c.status)).length;
    const overdue = stateComplaints.filter(c => isOverdue(c.deadlineDate, c.status)).length;
    const escalated = stateComplaints.filter(c => c.priority === 'Critical' || (isOverdue(c.deadlineDate, c.status) && c.status !== 'Closed')).length;
    const awaitingInfo = stateComplaints.filter(c => c.status === 'Awaiting Information').length;
    const resolutionRecommended = stateComplaints.filter(c => c.status === 'Resolution Recommended' || Boolean(c.resolutionRecommendation)).length;
    const resolved = stateComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const reopened = stateComplaints.filter(c => Boolean(c.isReopened) || c.status === 'Reopened').length;

    return {
      total,
      newlyReceived,
      awaitingReview,
      awaitingInstResponse,
      underInvestigation,
      nearingDeadline,
      overdue,
      escalated,
      awaitingInfo,
      resolutionRecommended,
      resolved,
      reopened
    };
  }, [stateComplaints]);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<
    'monitoring' | 'district_analytics' | 'action_center' | 'reports' | 'tasks' | 'ai_assistant'
  >('monitoring');

  // Quick Card Click Filter (Every card opens a filtered complaint list)
  const [quickCardFilter, setQuickCardFilter] = useState<{
    key: string;
    label: string;
  } | null>(null);

  // Multi-criteria filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [sortBy, setSortBy] = useState<'submission_desc' | 'submission_asc' | 'deadline_asc' | 'priority_desc'>('submission_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered and sorted complaints for the monitoring table
  const filteredComplaints = useMemo(() => {
    return stateComplaints.filter(c => {
      const inst = institutionMap.get(c.institutionId);

      // Quick Card Filter logic
      if (quickCardFilter) {
        switch (quickCardFilter.key) {
          case 'newlyReceived':
            if (c.status !== 'Open') return false;
            break;
          case 'awaitingReview':
            if (c.status !== 'Under Review') return false;
            break;
          case 'awaitingInstResponse':
            if (c.status !== 'Awaiting Institution Response') return false;
            break;
          case 'underInvestigation':
            if (c.status !== 'Action & Investigation' && c.status !== 'Under Review') return false;
            break;
          case 'nearingDeadline':
            if (!isApproachingDeadline(c.deadlineDate, c.status)) return false;
            break;
          case 'overdue':
            if (!isOverdue(c.deadlineDate, c.status)) return false;
            break;
          case 'escalated':
            if (c.priority !== 'Critical' && !isOverdue(c.deadlineDate, c.status)) return false;
            break;
          case 'awaitingInfo':
            if (c.status !== 'Awaiting Information') return false;
            break;
          case 'resolutionRecommended':
            if (c.status !== 'Resolution Recommended' && !c.resolutionRecommendation) return false;
            break;
          case 'resolved':
            if (c.status !== 'Resolved' && c.status !== 'Closed') return false;
            break;
          case 'reopened':
            if (!c.isReopened && c.status !== 'Reopened') return false;
            break;
          default:
            break;
        }
      }

      // District filter
      if (filterDistrict !== 'all') {
        if (!inst || inst.district !== filterDistrict) return false;
      }

      // Institution filter
      if (filterInstitution !== 'all') {
        if (c.institutionId !== filterInstitution) return false;
      }

      // Category filter
      if (filterCategory !== 'all' && c.category !== filterCategory) return false;

      // Status filter
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;

      // Priority filter
      if (filterPriority !== 'all' && c.priority !== filterPriority) return false;

      // Date range filter
      if (filterDateRange !== 'all') {
        const subDate = new Date(c.submissionDate).getTime();
        const now = new Date('2026-10-24').getTime();
        const diffDays = (now - subDate) / (1000 * 3600 * 24);
        if (filterDateRange === '7d' && diffDays > 7) return false;
        if (filterDateRange === '30d' && diffDays > 30) return false;
        if (filterDateRange === '90d' && diffDays > 90) return false;
      }

      // Search query (ID, title, institution name, complainant name, reference)
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase().trim();
        const matchId = c.id.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchInst = c.institutionName.toLowerCase().includes(q);
        const matchComp = (c.complainantName || '').toLowerCase().includes(q);
        const matchRef = (c.referenceNumber || '').toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchInst && !matchComp && !matchRef) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'submission_desc') return b.submissionDate.localeCompare(a.submissionDate);
      if (sortBy === 'submission_asc') return a.submissionDate.localeCompare(b.submissionDate);
      if (sortBy === 'deadline_asc') return a.deadlineDate.localeCompare(b.deadlineDate);
      if (sortBy === 'priority_desc') {
        const score = (p: string) => (p === 'Critical' ? 4 : p === 'High' ? 3 : p === 'Medium' ? 2 : 1);
        return score(b.priority) - score(a.priority);
      }
      return 0;
    });
  }, [
    stateComplaints,
    institutionMap,
    quickCardFilter,
    filterDistrict,
    filterInstitution,
    filterCategory,
    filterStatus,
    filterPriority,
    filterDateRange,
    filterSearch,
    sortBy
  ]);

  // Paginated Complaints
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / pageSize));
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, currentPage, pageSize]);

  // Handler for card clicks (Requirements: Every card must open a filtered complaint list)
  const handleCardClick = (key: string, label: string) => {
    setQuickCardFilter({ key, label });
    setActiveTab('monitoring');
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setQuickCardFilter(null);
    setFilterSearch('');
    setFilterDistrict('all');
    setFilterInstitution('all');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterDateRange('all');
    setCurrentPage(1);
  };

  // Case Drawer / Dossier Workspace State
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'actions' | 'lifecycle' | 'timeline' | 'notes' | 'intel'>('actions');

  const selectedCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return complaints.find(c => c.id === selectedCaseId) || null;
  }, [complaints, selectedCaseId]);

  const selectedCaseInst = useMemo(() => {
    if (!selectedCase) return null;
    return institutionMap.get(selectedCase.institutionId) || null;
  }, [selectedCase, institutionMap]);

  // Workflow Action Form States
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [institutionReply, setInstitutionReply] = useState('');
  const [citizenQuery, setCitizenQuery] = useState('');
  const [resolutionProposal, setResolutionProposal] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Workflow Handlers
  const handleRequestInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !institutionQuery.trim()) return;
    requestInstitutionResponse(selectedCase.id, institutionQuery.trim());
    setActionSuccessMsg(`State statutory explanation demand issued to ${selectedCase.institutionName}. Status set to Awaiting Institution Response.`);
    setInstitutionQuery('');
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleRecordInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !institutionReply.trim()) return;
    recordInstitutionResponse(selectedCase.id, institutionReply.trim());
    setActionSuccessMsg(`Institution rejoinder registered in case record for ${selectedCase.id}. Moved to Action & Investigation.`);
    setInstitutionReply('');
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleRequestCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !citizenQuery.trim()) return;
    requestComplainantInfo(selectedCase.id, citizenQuery.trim());
    setActionSuccessMsg(`Clarification query dispatched to complainant for ${selectedCase.id}.`);
    setCitizenQuery('');
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleRecommendResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !resolutionProposal.trim()) return;
    recommendResolution(selectedCase.id, resolutionProposal.trim());
    setActionSuccessMsg(`State resolution recommendations formulated for ${selectedCase.id}. Forwarded for final administrative closure sign-off.`);
    setResolutionProposal('');
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleAddNote = () => {
    if (!selectedCase || !newNoteContent.trim()) return;
    addNote(selectedCase.id, newNoteContent.trim(), undefined, true);
    setNewNoteContent('');
    setActionSuccessMsg('Confidential state administrative note appended to dossier.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // State Follow-up Tasks Modal State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskComplaintId, setNewTaskComplaintId] = useState(stateComplaints[0]?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-30');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);

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

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAskAI = (promptText?: string) => {
    const query = promptText || aiPrompt;
    if (!query.trim()) return;
    setAiGenerating(true);
    setAiResponse(null);

    setTimeout(() => {
      const qLower = query.toLowerCase();
      let response = '';
      if (qLower.includes('fee') || qLower.includes('refund') || qLower.includes('caution')) {
        response = `**AICTE Statutory Advisory on Tuition & Caution Fee Refunds:**\n\nUnder Chapter VII of the AICTE Approval Process Handbook (APH) and Regulation 2026:\n1. Caution deposit / library deposits must be refunded in full within 15 working days of student graduation clearance or valid withdrawal.\n2. Non-refund or coercive withholding of original educational certificates constitutes statutory capitation violation punishable under Section 10(k) of the AICTE Act 1987.\n3. State Technical Directorate is empowered to issue a 7-day Show Cause Notice demanding bank transaction proof from the Registrar.`;
      } else if (qLower.includes('overdue') || qLower.includes('deadline') || qLower.includes('sla')) {
        response = `**Statutory Protocol for Overdue State Cases:**\n\n1. When a grievance breaches the 30-day (Normal) or 14-day (Urgent) SLA, Section 8.4 mandates automated escalation.\n2. State Nodal Officers should issue a peremptory directive to the college management with a mandatory 48-hour compliance window.\n3. If no rejoinder is received, the matter should be marked for on-site inquiry or referred to the AICTE Regional Appellate Committee.`;
      } else if (qLower.includes('district') || qLower.includes('pune') || qLower.includes('bengaluru')) {
        response = `**District-Level Grievance Coordination Guidelines:**\n\nIn ${selectedState}, district coordination is led by the Joint Director of Technical Education (Regional DTE). For recurring allegations in a specific district, schedule a joint scrutiny hearing with the University Affiliation Committee.`;
      } else {
        response = `**State Regulatory Compliance Guidance (${selectedState}):**\n\nFor reference docket inquiry: Technical institutions must maintain a functional Student Grievance Redressal Committee (SGRC) headed by an Ombudsperson under AICTE (Redressal of Grievance of Students) Regulations. If the college has not formed an SGRC or is unresponsive to state directives, recommend an academic audit inspection.`;
      }
      setAiResponse(response);
      setAiGenerating(false);
    }, 600);
  };

  // Client-Side Real CSV Export for State Complaints
  const handleExportCSV = () => {
    const headers = [
      'Complaint ID',
      'Institution Name',
      'Institution Code',
      'State',
      'District',
      'Category',
      'Status',
      'Priority',
      'Submission Date',
      'Deadline Date',
      'Days Open'
    ];

    const rows = stateComplaints.map(c => {
      const inst = institutionMap.get(c.institutionId);
      const age = getCaseAgeInDays(c.submissionDate, c.resolvedDate);
      return [
        `"${c.id}"`,
        `"${c.institutionName.replace(/"/g, '""')}"`,
        `"${c.institutionCode}"`,
        `"${inst?.state || 'N/A'}"`,
        `"${inst?.district || 'Not Specified'}"`,
        `"${c.category}"`,
        `"${c.status}"`,
        `"${c.priority}"`,
        `"${c.submissionDate}"`,
        `"${c.deadlineDate}"`,
        `"${age}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_State_Grievance_Report_${selectedState.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // District Breakdown Calculation (Section 4)
  const districtBreakdown = useMemo(() => {
    return stateDistricts.map(district => {
      const distInstIds = new Set(
        stateInstitutions.filter(i => i.district === district).map(i => i.id)
      );
      const distComplaints = stateComplaints.filter(c => distInstIds.has(c.institutionId));
      const pending = distComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
      const overdue = distComplaints.filter(c => isOverdue(c.deadlineDate, c.status)).length;
      const resolved = distComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

      return {
        district: district || 'District Not Specified',
        total: distComplaints.length,
        pending,
        overdue,
        resolved,
        resolutionRate: distComplaints.length > 0 ? Math.round((resolved / distComplaints.length) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [stateDistricts, stateInstitutions, stateComplaints]);

  // Institution Breakdown Calculation (Section 4)
  const institutionBreakdown = useMemo(() => {
    return stateInstitutions.map(inst => {
      const instComplaints = stateComplaints.filter(c => c.institutionId === inst.id);
      const pending = instComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
      const overdue = instComplaints.filter(c => isOverdue(c.deadlineDate, c.status)).length;
      const awaitingInst = instComplaints.filter(c => c.status === 'Awaiting Institution Response').length;
      const resolved = instComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

      return {
        id: inst.id,
        name: inst.name,
        code: inst.code,
        district: inst.district || 'District Not Specified',
        accreditedGrade: inst.accreditedGrade,
        total: instComplaints.length,
        pending,
        overdue,
        awaitingInst,
        resolved
      };
    }).sort((a, b) => b.pending - a.pending);
  }, [stateInstitutions, stateComplaints]);

  // Priority Action Center Queue (Section 5)
  const actionCenterQueue = useMemo(() => {
    return stateComplaints.filter(c => {
      const isCaseOverdue = isOverdue(c.deadlineDate, c.status);
      const isNearDeadline = isApproachingDeadline(c.deadlineDate, c.status);
      const isHighPriority = c.priority === 'Critical' || c.priority === 'High';
      const isWaitingCollege = c.status === 'Awaiting Institution Response';
      const isReopened = Boolean(c.isReopened) || c.status === 'Reopened';
      const isWaitingInfo = c.status === 'Awaiting Information';
      const isResRecommended = c.status === 'Resolution Recommended' || Boolean(c.resolutionRecommendation);

      return (
        isCaseOverdue ||
        isNearDeadline ||
        isHighPriority ||
        isWaitingCollege ||
        isReopened ||
        isWaitingInfo ||
        isResRecommended
      );
    }).sort((a, b) => {
      // Prioritize overdue, then critical
      const aOverdue = isOverdue(a.deadlineDate, a.status) ? 10 : 0;
      const bOverdue = isOverdue(b.deadlineDate, b.status) ? 10 : 0;
      const aCrit = a.priority === 'Critical' ? 5 : a.priority === 'High' ? 3 : 0;
      const bCrit = b.priority === 'Critical' ? 5 : b.priority === 'High' ? 3 : 0;
      return (bOverdue + bCrit) - (aOverdue + aCrit);
    });
  }, [stateComplaints]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* State Authority Header Banner */}
      <div className="bg-gradient-to-r from-[#064578] via-[#0B477F] to-[#155A91] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-amber-300 border border-white/20 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>State Coordination & Redressal Center</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-900/60 text-blue-200 border border-blue-400/30">
                Jurisdiction: {selectedState}
              </span>
              {isStateLocked ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>State Access Restricted</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 flex items-center gap-1">
                  <span>National Liaison Oversight</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Government Officials Portal</span>
              <span className="text-lg font-normal text-blue-200">— State of {selectedState}</span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Statutory coordination desk for State Directorate of Technical Education. Monitor district caseloads, examine affiliated college responses, issue statutory inquiry notices, and formulate resolution findings.
            </p>
          </div>

          {/* State Scope Selector (Interactive for National Liaison / Read-only for locked state officers) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {!isStateLocked ? (
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 backdrop-blur-xs space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Select State Jurisdiction
                </label>
                <select
                  value={selectedState}
                  onChange={e => {
                    setSelectedState(e.target.value);
                    setQuickCardFilter(null);
                    setFilterDistrict('all');
                    setFilterInstitution('all');
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold bg-white text-[#0B477F] py-1.5 px-3 rounded-lg border-none shadow-xs cursor-pointer focus:ring-2 focus:ring-amber-400"
                >
                  <option value="All States">All States (National View)</option>
                  {availableStates.map(st => (
                    <option key={st} value={st}>State of {st}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-white/10 py-2 px-3 rounded-xl border border-white/20 text-right">
                <span className="text-[10px] uppercase tracking-wider text-blue-200 block font-bold">Assigned State</span>
                <span className="text-sm font-black text-amber-300">{selectedState} DTE</span>
              </div>
            )}

            <Link
              to="/officials/how-it-works"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>State Official SOP</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Distinction & Governance Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#0B477F] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-[#0B477F]">
            State Operational Boundary • Data Isolated to {selectedState}
          </p>
          <p className="text-slate-600">
            This portal is restricted to monitoring and coordinating grievances relating to institutions in <strong>{selectedState}</strong>. Global workflow rules, system health, and cross-state administrative configurations are managed in the <strong>Administration Portal</strong>.
          </p>
        </div>
      </div>

      {/* 12 STATE-WISE KPI DASHBOARD CARDS (Section 2) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#17324D] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0B477F]" />
            <span>State Key Performance Indicators ({selectedState})</span>
          </h2>
          <span className="text-[11px] text-slate-500">
            Click any metric card below to open its filtered complaint queue
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Complaints */}
          <div
            onClick={() => {
              setQuickCardFilter(null);
              setActiveTab('monitoring');
              setCurrentPage(1);
            }}
            className={`p-3.5 rounded-xl border bg-white hover:border-[#0B477F] hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter === null && activeTab === 'monitoring' ? 'ring-2 ring-[#0B477F] border-[#0B477F]' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Complaints</span>
              <Inbox className="w-3.5 h-3.5 text-[#0B477F]" />
            </div>
            <div className="text-2xl font-black text-[#17324D]">{stateStats.total}</div>
            <p className="text-[10px] text-slate-500">In {selectedState}</p>
          </div>

          {/* Card 2: Newly Received */}
          <div
            onClick={() => handleCardClick('newlyReceived', 'Newly Received Complaints')}
            className={`p-3.5 rounded-xl border bg-white hover:border-blue-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'newlyReceived' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Newly Received</span>
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700">{stateStats.newlyReceived}</div>
            <p className="text-[10px] text-blue-600">Pending intake triage</p>
          </div>

          {/* Card 3: Awaiting State-Level Review */}
          <div
            onClick={() => handleCardClick('awaitingReview', 'Awaiting State-Level Review')}
            className={`p-3.5 rounded-xl border bg-white hover:border-indigo-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'awaitingReview' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Awaiting Review</span>
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700">{stateStats.awaitingReview}</div>
            <p className="text-[10px] text-indigo-600">State scrutiny queue</p>
          </div>

          {/* Card 4: Awaiting Action from Institution */}
          <div
            onClick={() => handleCardClick('awaitingInstResponse', 'Awaiting Institution Response')}
            className={`p-3.5 rounded-xl border bg-white hover:border-amber-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'awaitingInstResponse' ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Awaiting College</span>
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">{stateStats.awaitingInstResponse}</div>
            <p className="text-[10px] text-amber-600">Notice dispatched</p>
          </div>

          {/* Card 5: Under Investigation / Review */}
          <div
            onClick={() => handleCardClick('underInvestigation', 'Under Investigation or Review')}
            className={`p-3.5 rounded-xl border bg-white hover:border-sky-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'underInvestigation' ? 'ring-2 ring-sky-500 border-sky-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Under Inquiry</span>
              <Clock className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-700">{stateStats.underInvestigation}</div>
            <p className="text-[10px] text-sky-600">Active investigation</p>
          </div>

          {/* Card 6: Nearing Deadlines */}
          <div
            onClick={() => handleCardClick('nearingDeadline', 'Nearing SLA Deadlines (< 72 Hours)')}
            className={`p-3.5 rounded-xl border bg-white hover:border-orange-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'nearingDeadline' ? 'ring-2 ring-orange-500 border-orange-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Near Deadline</span>
              <Flame className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-600">{stateStats.nearingDeadline}</div>
            <p className="text-[10px] text-orange-600">Within 72 hours</p>
          </div>

          {/* Card 7: Overdue Complaints */}
          <div
            onClick={() => handleCardClick('overdue', 'Statutory Overdue Complaints')}
            className={`p-3.5 rounded-xl border bg-white hover:border-rose-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'overdue' ? 'ring-2 ring-rose-500 border-rose-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Overdue SLA</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600">{stateStats.overdue}</div>
            <p className="text-[10px] text-rose-600">Statutory breach</p>
          </div>

          {/* Card 8: Escalated Complaints */}
          <div
            onClick={() => handleCardClick('escalated', 'Escalated Complaints (State Attention)')}
            className={`p-3.5 rounded-xl border bg-white hover:border-purple-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'escalated' ? 'ring-2 ring-purple-500 border-purple-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Escalated</span>
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-700">{stateStats.escalated}</div>
            <p className="text-[10px] text-purple-600">State level urgency</p>
          </div>

          {/* Card 9: Awaiting Additional Info */}
          <div
            onClick={() => handleCardClick('awaitingInfo', 'Awaiting Complainant Clarification')}
            className={`p-3.5 rounded-xl border bg-white hover:border-teal-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'awaitingInfo' ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Citizen Info</span>
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-700">{stateStats.awaitingInfo}</div>
            <p className="text-[10px] text-teal-600">Clarification sought</p>
          </div>

          {/* Card 10: With Resolution Recommendations */}
          <div
            onClick={() => handleCardClick('resolutionRecommended', 'Complaints with Resolution Recommendations')}
            className={`p-3.5 rounded-xl border bg-white hover:border-emerald-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'resolutionRecommended' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Resolution Ready</span>
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{stateStats.resolutionRecommended}</div>
            <p className="text-[10px] text-emerald-600">Terms formulated</p>
          </div>

          {/* Card 11: Resolved Complaints */}
          <div
            onClick={() => handleCardClick('resolved', 'Resolved & Closed Complaints')}
            className={`p-3.5 rounded-xl border bg-white hover:border-emerald-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'resolved' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{stateStats.resolved}</div>
            <p className="text-[10px] text-emerald-600">Redressed successfully</p>
          </div>

          {/* Card 12: Reopened Complaints */}
          <div
            onClick={() => handleCardClick('reopened', 'Reopened Complaints')}
            className={`p-3.5 rounded-xl border bg-white hover:border-red-500 hover:shadow-md transition cursor-pointer interactive-card space-y-1 ${
              quickCardFilter?.key === 'reopened' ? 'ring-2 ring-red-500 border-red-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Reopened Cases</span>
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="text-2xl font-black text-red-700">{stateStats.reopened}</div>
            <p className="text-[10px] text-red-600">Post-closure appeal</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation Strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D6E4F0] pb-2">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`py-2 px-4 rounded-lg font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'monitoring'
              ? 'bg-[#0B477F] text-white shadow-xs'
              : 'text-[#17324D] hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>State Complaint Monitoring</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
            {stateComplaints.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('district_analytics')}
          className={`py-2 px-4 rounded-lg font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'district_analytics'
              ? 'bg-[#0B477F] text-white shadow-xs'
              : 'text-[#17324D] hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>District & Institution Analytics</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {stateDistricts.length} Dist • {stateInstitutions.length} Inst
          </span>
        </button>

        <button
          onClick={() => setActiveTab('action_center')}
          className={`py-2 px-4 rounded-lg font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'action_center'
              ? 'bg-[#0B477F] text-white shadow-xs'
              : 'text-[#17324D] hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>State Action Center</span>
          {actionCenterQueue.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
              {actionCenterQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-2 px-4 rounded-lg font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-[#0B477F] text-white shadow-xs'
              : 'text-[#17324D] hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>State Reports & CSV Export</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2 px-4 rounded-lg font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-[#0B477F] text-white shadow-xs'
              : 'text-[#17324D] hover:bg-slate-100'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Follow-up Directives</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {tasks.filter(t => !t.completed).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ai_assistant')}
          className={`py-2 px-4 rounded-lg font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'ai_assistant'
              ? 'bg-[#0B477F] text-white shadow-xs'
              : 'text-[#17324D] hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Regulatory AI Assistant</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: STATE COMPLAINT MONITORING & DOSSIER WORKSPACE (Section 3)
         ========================================================================= */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          {/* Active Quick Card Filter Banner */}
          {quickCardFilter && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Active Card Filter: <strong>{quickCardFilter.label}</strong> ({filteredComplaints.length} records found in {selectedState})
                </span>
              </div>
              <button
                onClick={() => setQuickCardFilter(null)}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-bold transition flex items-center gap-1 text-[11px]"
              >
                <X className="w-3 h-3" />
                <span>Clear Card Filter</span>
              </button>
            </div>
          )}

          {/* Multi-Criteria Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={e => {
                    setFilterSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search ID, student, institution, reference..."
                  className="w-full text-xs pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                />
              </div>

              {/* District Filter */}
              <div>
                <select
                  value={filterDistrict}
                  onChange={e => {
                    setFilterDistrict(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="all">All Districts ({stateDistricts.length})</option>
                  {stateDistricts.map(d => (
                    <option key={d} value={d}>District: {d}</option>
                  ))}
                </select>
              </div>

              {/* Institution Filter */}
              <div>
                <select
                  value={filterInstitution}
                  onChange={e => {
                    setFilterInstitution(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="all">All Institutions ({stateInstitutions.length})</option>
                  {stateInstitutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={e => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Awaiting Institution Response">Awaiting College</option>
                  <option value="Action & Investigation">Action & Investigation</option>
                  <option value="Awaiting Information">Awaiting Citizen Info</option>
                  <option value="Resolution Recommended">Resolution Recommended</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={filterPriority}
                  onChange={e => {
                    setFilterPriority(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="submission_desc">Submission: Newest First</option>
                  <option value="submission_asc">Submission: Oldest First</option>
                  <option value="deadline_asc">Deadline: Approaching First</option>
                  <option value="priority_desc">Priority: High to Low</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Row */}
            {(quickCardFilter || filterDistrict !== 'all' || filterInstitution !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || filterSearch) && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Showing {filteredComplaints.length} of {stateComplaints.length} state dockets
                </span>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-[#0B477F] font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* State Complaints Docket Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F1F7FC] text-[#17324D] border-b border-[#D6E4F0] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3.5">Docket ID</th>
                    <th className="py-3 px-3">Institution & District</th>
                    <th className="py-3 px-3">Subject / Allegation</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Registration</th>
                    <th className="py-3 px-3">Statutory SLA</th>
                    <th className="py-3 px-3 text-right">State Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E4F0]">
                  {paginatedComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-sm text-slate-700">No complaints matching filter criteria in {selectedState}.</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting district, institution, or urgency filters.</p>
                        <button
                          onClick={handleClearFilters}
                          className="mt-3 px-3 py-1.5 bg-[#0B477F] text-white rounded-lg text-xs font-bold"
                        >
                          Clear All Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedComplaints.map(c => {
                      const inst = institutionMap.get(c.institutionId);
                      const isCaseOverdue = isOverdue(c.deadlineDate, c.status);
                      const isNearDl = isApproachingDeadline(c.deadlineDate, c.status);

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50/80 transition cursor-pointer"
                          onClick={() => setSelectedCaseId(c.id)}
                        >
                          <td className="py-3.5 px-3.5 font-mono font-bold text-[#0B477F] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{c.id}</span>
                              {c.isReopened && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-100 text-red-800 border border-red-300">
                                  REOPENED
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 max-w-xs">
                            <p className="font-bold text-[#17324D] truncate">{c.institutionName}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{inst?.district || 'District Not Specified'} • Code: {c.institutionCode}</span>
                            </p>
                          </td>

                          <td className="py-3.5 px-3 max-w-sm">
                            <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                            <span className="inline-block text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium mt-0.5">
                              {c.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              c.status === 'Resolved' || c.status === 'Closed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : c.status === 'Awaiting Institution Response'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : c.status === 'Action & Investigation'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : c.status === 'Resolution Recommended'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}>
                              {c.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : c.priority === 'High'
                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                : c.priority === 'Medium'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {c.priority}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                            {formatDate(c.submissionDate)}
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {isCaseOverdue ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Breached ({formatDate(c.deadlineDate)})</span>
                              </span>
                            ) : isNearDl ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Due: {formatDate(c.deadlineDate)}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600 font-mono text-[11px]">
                                {formatDate(c.deadlineDate)}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedCaseId(c.id)}
                              className="px-3 py-1.5 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto shadow-xs"
                            >
                              <span>Open Dossier</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredComplaints.length} total state dockets)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition font-bold"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded text-xs font-bold transition ${
                        currentPage === pageNum
                          ? 'bg-[#0B477F] text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DISTRICT & INSTITUTION ANALYTICS (Section 4)
         ========================================================================= */}
      {activeTab === 'district_analytics' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Monitoring & Early Intervention Notice</p>
              <p className="text-slate-600 mt-0.5">
                These analytics are intended for state-level monitoring and identifying educational clusters needing administrative attention, not automatically declaring an institution responsible for misconduct. Clicking any district or institution will filter the primary docket queue.
              </p>
            </div>
          </div>

          {/* District Breakdown Table & Institution Breakdown Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* District Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[#17324D] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0B477F]" />
                    <span>District-Wise Complaint Load ({selectedState})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grievance origination by revenue district in {selectedState}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0B477F] bg-blue-50 px-2 py-0.5 rounded">
                  {districtBreakdown.length} Districts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1F7FC] text-[#17324D] border-b border-[#D6E4F0] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">District</th>
                      <th className="py-2.5 px-2 text-center">Total</th>
                      <th className="py-2.5 px-2 text-center">Active</th>
                      <th className="py-2.5 px-2 text-center">Overdue</th>
                      <th className="py-2.5 px-2 text-center">Resolved</th>
                      <th className="py-2.5 px-3 text-right">Filter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6E4F0]">
                    {districtBreakdown.map(d => (
                      <tr key={d.district} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-semibold text-[#17324D]">
                          {d.district}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{d.total}</td>
                        <td className="py-3 px-2 text-center font-bold text-blue-700">{d.pending}</td>
                        <td className="py-3 px-2 text-center">
                          {d.overdue > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                              {d.overdue}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center text-emerald-700 font-bold">{d.resolved}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setFilterDistrict(d.district);
                              setActiveTab('monitoring');
                              setCurrentPage(1);
                            }}
                            className="px-2.5 py-1 bg-[#0B477F]/10 hover:bg-[#0B477F] hover:text-white text-[#0B477F] rounded text-[11px] font-bold transition"
                          >
                            View Cases
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Institution Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[#17324D] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0B477F]" />
                    <span>Institution-Wise Load & Unresolved Cases</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Technical colleges ranked by pending grievance volume
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0B477F] bg-blue-50 px-2 py-0.5 rounded">
                  {institutionBreakdown.length} Colleges
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1F7FC] text-[#17324D] border-b border-[#D6E4F0] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Institution Name</th>
                      <th className="py-2.5 px-2">District</th>
                      <th className="py-2.5 px-2 text-center">Pending</th>
                      <th className="py-2.5 px-2 text-center">Overdue</th>
                      <th className="py-2.5 px-3 text-right">Filter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6E4F0]">
                    {institutionBreakdown.map(inst => (
                      <tr key={inst.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 max-w-xs">
                          <p className="font-semibold text-[#17324D] truncate">{inst.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">Code: {inst.code}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-600">{inst.district}</td>
                        <td className="py-3 px-2 text-center font-bold text-blue-700">{inst.pending}</td>
                        <td className="py-3 px-2 text-center">
                          {inst.overdue > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                              {inst.overdue}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setFilterInstitution(inst.id);
                              setActiveTab('monitoring');
                              setCurrentPage(1);
                            }}
                            className="px-2.5 py-1 bg-[#0B477F]/10 hover:bg-[#0B477F] hover:text-white text-[#0B477F] rounded text-[11px] font-bold transition"
                          >
                            View Cases
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STATE ACTION CENTER (Section 5)
         ========================================================================= */}
      {activeTab === 'action_center' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-[#17324D] flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>State Prioritized Docket Queue ({actionCenterQueue.length} matters requiring attention)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cases flagged due to SLA breaches, high severity, college response delays, or student clarification requests.
              </p>
            </div>
            <button
              onClick={() => setNewTaskModalOpen(true)}
              className="px-3.5 py-2 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create State Directive / Task</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {actionCenterQueue.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-sm text-slate-800">All state matters currently up to date.</p>
                <p className="text-xs text-slate-400 mt-1">No overdue statutory breaches or urgent directives pending in {selectedState}.</p>
              </div>
            ) : (
              actionCenterQueue.map(c => {
                const inst = institutionMap.get(c.institutionId);
                const isCaseOverdue = isOverdue(c.deadlineDate, c.status);
                const isNearDl = isApproachingDeadline(c.deadlineDate, c.status);

                return (
                  <div
                    key={c.id}
                    className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#0B477F]">{c.id}</span>
                        {isCaseOverdue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            SLA Breached ({formatDate(c.deadlineDate)})
                          </span>
                        )}
                        {isNearDl && !isCaseOverdue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            Approaching SLA (72h)
                          </span>
                        )}
                        {c.status === 'Awaiting Institution Response' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-300">
                            College Explanation Awaited
                          </span>
                        )}
                        {c.isReopened && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                            Reopened Dossier
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {c.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-[#17324D]">{c.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {c.institutionName} • District: {inst?.district || 'Not Specified'} • Registered: {formatDate(c.submissionDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedCaseId(c.id)}
                        className="px-3 py-1.5 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <span>Open Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: STATE REPORTS & CSV EXPORT (Section 7)
         ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="font-bold text-base text-[#17324D] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#0B477F]" />
                  <span>State Redressal Performance Evaluation Report ({selectedState})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory reporting metrics for the State Technical Directorate.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download State CSV Dataset</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Received</span>
                <span className="text-3xl font-black text-[#17324D]">{stateStats.total}</span>
                <span className="text-[11px] text-slate-500 block mt-1">In {selectedState}</span>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Resolved Count</span>
                <span className="text-3xl font-black text-emerald-700">{stateStats.resolved}</span>
                <span className="text-[11px] text-emerald-600 block mt-1">Redressal certified</span>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Resolution Rate</span>
                <span className="text-3xl font-black text-blue-700">
                  {stateStats.total > 0 ? Math.round((stateStats.resolved / stateStats.total) * 100) : 0}%
                </span>
                <span className="text-[11px] text-blue-600 block mt-1">Compliance index</span>
              </div>

              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Overdue Count</span>
                <span className="text-3xl font-black text-rose-700">{stateStats.overdue}</span>
                <span className="text-[11px] text-rose-600 block mt-1">SLA breached</span>
              </div>
            </div>

            {/* District & Category Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-[#F1F7FC] px-4 py-2.5 font-bold text-xs text-[#17324D] border-b border-slate-200">
                  District Resolution Summary ({selectedState})
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {districtBreakdown.map(d => (
                    <div key={d.district} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800">{d.district}</span>
                        <span className="text-[11px] text-slate-400 block">{d.total} complaints logged</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#0B477F]">{d.resolutionRate}% Resolved</span>
                        <span className="text-[11px] text-slate-500 block">{d.pending} active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-[#F1F7FC] px-4 py-2.5 font-bold text-xs text-[#17324D] border-b border-slate-200">
                  Institution Resolution Summary ({selectedState})
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {institutionBreakdown.slice(0, 5).map(inst => (
                    <div key={inst.id} className="p-3 flex items-center justify-between">
                      <div className="max-w-xs">
                        <span className="font-semibold text-slate-800 truncate block">{inst.name}</span>
                        <span className="text-[11px] text-slate-400">{inst.district} • Code: {inst.code}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-700">{inst.pending} Pending</span>
                        {inst.overdue > 0 && (
                          <span className="text-[10px] text-rose-700 font-bold block">{inst.overdue} Overdue</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: STATE FOLLOW-UP TASKS (Section 5)
         ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-[#17324D] flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[#0B477F]" />
                <span>State Administrative Tasks & Follow-up Directives</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep track of pending inquiry hearings, college fee reconciliations, and student notices.
              </p>
            </div>
            <button
              onClick={() => setNewTaskModalOpen(true)}
              className="px-3.5 py-2 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Follow-up Directive</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs">
                No active follow-up directives registered.
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 text-[#0B477F] rounded cursor-pointer"
                    />
                    <div>
                      <h4 className={`font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {task.institutionName || 'State Jurisdiction'} • Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'High'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Delete task"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: REGULATORY AI ASSISTANT (Sidecar Assistant)
         ========================================================================= */}
      {activeTab === 'ai_assistant' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#17324D]">
                  State Regulatory & APH AI Advisory Assistant
                </h3>
                <p className="text-xs text-slate-500">
                  Instant guidance on AICTE Approval Process Handbook (APH), Fee Regulatory Committee guidelines, and state redressal norms.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleAskAI('What is the statutory deadline for caution money deposit refund under AICTE rules?')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition"
              >
                Caution Deposit Rules
              </button>
              <button
                onClick={() => handleAskAI('What statutory action should state officials take when a college is overdue past 30 days?')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition"
              >
                Overdue Case Protocol
              </button>
              <button
                onClick={() => handleAskAI('How should district grievance committees coordinate with state DTE?')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition"
              >
                District Coordination
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ask a regulatory query regarding fee rules, show cause notices, or state ombudsperson guidelines..."
                className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiGenerating || !aiPrompt.trim()}
                className="px-4 py-2 bg-[#0B477F] hover:bg-[#155A91] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiGenerating ? 'Consulting Regulatory Engine...' : 'Generate Guidance'}</span>
              </button>
            </div>

            {aiResponse && (
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-2 text-purple-950 animate-fadeIn whitespace-pre-wrap leading-relaxed">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE CASE WORKSPACE DOSSIER DRAWER (Section 6)
         ========================================================================= */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-300">
            {/* Drawer Top Header */}
            <div className="bg-[#0B477F] text-white p-4 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2.5 py-1 bg-white/10 rounded font-bold border border-white/20 text-amber-300">
                  {selectedCase.id}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedCase.title}</h3>
                  <p className="text-xs text-blue-200">
                    {selectedCase.institutionName} • District: {selectedCaseInst?.district || 'Not Specified'} • State: {selectedCaseInst?.state || selectedState}
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

            {/* Action Feedback Banner */}
            {actionSuccessMsg && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Case Quick Overview Grid */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-slate-800">{selectedCase.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <span className="font-bold text-[#0B477F]">{selectedCase.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Statutory SLA</span>
                <span className="font-mono text-slate-800">{formatDate(selectedCase.deadlineDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Complainant</span>
                <span className="font-semibold text-slate-800">{selectedCase.complainantName || 'Confidential Student'}</span>
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200 shrink-0 bg-white">
              <button
                onClick={() => setDrawerTab('actions')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'actions'
                    ? 'border-[#0B477F] text-[#0B477F]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                State Directives & Actions
              </button>
              <button
                onClick={() => setDrawerTab('lifecycle')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'lifecycle'
                    ? 'border-[#0B477F] text-[#0B477F]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                10-Stage Lifecycle
              </button>
              <button
                onClick={() => setDrawerTab('timeline')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'timeline'
                    ? 'border-[#0B477F] text-[#0B477F]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Audit History ({timelineEvents[selectedCase.id]?.length || 0})
              </button>
              <button
                onClick={() => setDrawerTab('notes')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'notes'
                    ? 'border-[#0B477F] text-[#0B477F]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Confidential Notes ({notes[selectedCase.id]?.length || 0})
              </button>
              <button
                onClick={() => setDrawerTab('intel')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
                  drawerTab === 'intel'
                    ? 'border-[#0B477F] text-[#0B477F]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                AI Duplicate Intel
              </button>
            </div>

            {/* Drawer Body Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Full Description Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-slate-700">Official Grievance Statement:</div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedCase.description}</p>
                {selectedCase.institutionRemarks && (
                  <div className="pt-2 border-t border-slate-200 text-amber-900 bg-amber-50/50 p-2.5 rounded-lg mt-2">
                    <span className="font-bold block text-[11px]">Latest Institution Response:</span>
                    <p className="mt-0.5">{selectedCase.institutionRemarks}</p>
                  </div>
                )}
                {selectedCase.resolutionRecommendation && (
                  <div className="pt-2 border-t border-slate-200 text-purple-900 bg-purple-50/50 p-2.5 rounded-lg mt-2">
                    <span className="font-bold block text-[11px]">Formulated Resolution Terms:</span>
                    <p className="mt-0.5">{selectedCase.resolutionRecommendation}</p>
                  </div>
                )}
              </div>

              {/* DRAWER TAB 1: WORKFLOW ACTIONS */}
              {drawerTab === 'actions' && (
                <div className="space-y-6 text-xs">
                  {/* Action 1: Issue State Statutory Directive */}
                  <form onSubmit={handleRequestInstitution} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-[#0B477F]" />
                        <span>1. Issue State Statutory Demand / Notice to Institution</span>
                      </h4>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                        Sets Status: Awaiting Institution Response
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={institutionQuery}
                      onChange={e => setInstitutionQuery(e.target.value)}
                      placeholder="State specific inquiry points, regulations violated, and documentation required from college registrar..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Statutory Notice</span>
                    </button>
                  </form>

                  {/* Action 2: Record Institutional Rejoinder */}
                  <form onSubmit={handleRecordInstitution} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-700" />
                        <span>2. Record College Explanation / Rejoinder</span>
                      </h4>
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                        Sets Status: Action & Investigation
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={institutionReply}
                      onChange={e => setInstitutionReply(e.target.value)}
                      placeholder="Enter formal response details, date of reply, attached ledger vouchers, or corrective actions taken..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Log Rejoinder into Official Record</span>
                    </button>
                  </form>

                  {/* Action 3: Request Complainant Clarification */}
                  <form onSubmit={handleRequestCitizen} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-teal-700" />
                        <span>3. Request Complainant Supplementary Evidence</span>
                      </h4>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">
                        Sets Status: Awaiting Information
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={citizenQuery}
                      onChange={e => setCitizenQuery(e.target.value)}
                      placeholder="Request student or citizen complainant for supplementary receipts, fee bank statements, or proof of enrollment..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Query to Complainant</span>
                    </button>
                  </form>

                  {/* Action 4: Formulate State Resolution Recommendation */}
                  <form onSubmit={handleRecommendResolution} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-purple-700" />
                        <span>4. Formulate State Resolution Findings & Recommend Closure</span>
                      </h4>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                        Sets Status: Resolution Recommended
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={resolutionProposal}
                      onChange={e => setResolutionProposal(e.target.value)}
                      placeholder="Summarize state inquiry findings and recommend specific remediation terms (e.g. Caution fee refund within 7 days)..."
                      className="w-full text-xs p-2.5 border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-700 bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submit Resolution Recommendations</span>
                    </button>
                  </form>
                </div>
              )}

              {/* DRAWER TAB 2: LIFECYCLE */}
              {drawerTab === 'lifecycle' && (
                <div className="space-y-4">
                  <ComplaintLifecycleTracker complaint={selectedCase} isPublic={false} />
                </div>
              )}

              {/* DRAWER TAB 3: TIMELINE AUDIT HISTORY */}
              {drawerTab === 'timeline' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                    Chronological audit ledger recording every state directive, rejoinder, and status transition.
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {(timelineEvents[selectedCase.id] || []).length === 0 ? (
                      <div className="p-6 text-center text-slate-500">No timeline events recorded yet.</div>
                    ) : (
                      (timelineEvents[selectedCase.id] || []).map(event => (
                        <div key={event.id} className="p-3.5 space-y-1">
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="font-bold text-slate-800">{event.title}</span>
                            <span className="font-mono">{formatDate(event.timestamp)}</span>
                          </div>
                          <p className="text-slate-600">{event.description}</p>
                          <div className="text-[10px] text-slate-400">
                            Recorded by: {event.actorName} ({event.actorRole})
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* DRAWER TAB 4: CONFIDENTIAL STATE NOTES */}
              {drawerTab === 'notes' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Confidential State Notes are protected by role security. Complainants and unauthorized personnel cannot view these internal notes.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={newNoteContent}
                      onChange={e => setNewNoteContent(e.target.value)}
                      placeholder="Add confidential state briefing note, preliminary observation, or telephone inquiry remark..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNoteContent.trim()}
                      className="px-4 py-2 bg-[#0B477F] hover:bg-[#155A91] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Append Confidential Note</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {(notes[selectedCase.id] || []).length === 0 ? (
                      <div className="p-6 text-center text-slate-500">No confidential notes added yet.</div>
                    ) : (
                      (notes[selectedCase.id] || []).map(note => (
                        <div key={note.id} className="p-3.5 space-y-1">
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="font-bold text-slate-800">{note.authorName} ({note.authorRole})</span>
                            <span className="font-mono">{formatDate(note.timestamp)}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* DRAWER TAB 5: AI INTEL & DUPLICATES */}
              {drawerTab === 'intel' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 flex items-center gap-2">
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
        </div>
      )}

      {/* NEW STATE TASK / DIRECTIVE MODAL */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17324D] flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[#0B477F]" />
                <span>Create State Follow-up Directive</span>
              </h3>
              <button onClick={() => setNewTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Directive / Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule hearing with Principal regarding caution deposit..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Associated Complaint</label>
                <select
                  value={newTaskComplaintId}
                  onChange={e => setNewTaskComplaintId(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  {stateComplaints.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.institutionName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B477F] text-white font-bold rounded-lg hover:bg-[#155A91]"
                >
                  Create Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

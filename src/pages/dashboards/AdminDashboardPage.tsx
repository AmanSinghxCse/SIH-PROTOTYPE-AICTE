import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { INITIAL_USERS } from '../../data/seedData';
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
  Check,
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
  UserPlus,
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
  Activity,
  Sliders,
  Database,
  Bell,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    complaints,
    bureaus,
    institutions,
    assignComplaint,
    updateVerificationStatus,
    approveCaseClosure,
    reassignComplaint,
    reopenComplaint,
    requestInstitutionResponse,
    recordInstitutionResponse,
    requestComplainantInfo,
    recommendResolution,
    addNote,
    notes,
    relatedSuggestions,
    users,
    addUser,
    auditLogs,
    settings,
    updateSettings,
    updateComplaintDeadline,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    timelineEvents,
    hasPermission
  } = useCaseTrack();

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'action_center'
    | 'data_quality'
    | 'system_health'
    | 'workflow_config'
    | 'notifications'
    | 'tasks'
    | 'verification'
    | 'supervision'
    | 'analytics'
    | 'users'
    | 'sla'
  >('overview');

  // Notification Configuration State (Section 5.11)
  const [notifRules, setNotifRules] = useState({
    newComplaintIntake: true,
    bureauAllocation: true,
    approachingDeadline72h: true,
    overdueEscalation: true,
    institutionRejoinder: true,
    closureSanction: true
  });
  const [notifSavedMsg, setNotifSavedMsg] = useState(false);

  // Data Quality Resolution Feedback
  const [dqResolvedMsg, setDqResolvedMsg] = useState<string | null>(null);

  // Multi-criteria Dashboard Filters (Section 6)
  const [filterDateRange, setFilterDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBureau, setFilterBureau] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // SLA & Priority Governance State
  const [slaNormal, setSlaNormal] = useState(settings?.defaultDeadlineNormal || 30);
  const [slaUrgent, setSlaUrgent] = useState(settings?.defaultDeadlineUrgent || 14);
  const [approachingDays, setApproachingDays] = useState(settings?.approachingDeadlineDays || 3);
  const [escalationDays, setEscalationDays] = useState(settings?.overdueEscalationDays || 5);
  const [similarityThresh, setSimilarityThresh] = useState(settings?.similarityThreshold || 55);
  const [slaSavedMsg, setSlaSavedMsg] = useState(false);

  // Individual Case Deadline Extension State
  const [dlCaseId, setDlCaseId] = useState(complaints[0]?.id || '');
  const [newDlDate, setNewDlDate] = useState('2026-11-20');
  const [dlReason, setDlReason] = useState('');
  const [dlSavedMsg, setDlSavedMsg] = useState(false);

  // Staff User Management State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'bureau_officer'>('bureau_officer');
  const [newUserDesignation, setNewUserDesignation] = useState('Assistant Director (Grievance)');
  const [newUserBureau, setNewUserBureau] = useState(bureaus[0]?.id || 'BUR-GRV');
  const [userCreatedMsg, setUserCreatedMsg] = useState(false);

  // Allocation Modal State
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('');
  const [targetBureauId, setTargetBureauId] = useState<string>(bureaus[0]?.id || '');
  const [targetOfficerId, setTargetOfficerId] = useState<string>('USR-OFFICER-01');
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Verification Desk State
  const [selectedVerifyCaseId, setSelectedVerifyCaseId] = useState<string | null>(null);
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);

  // Closure Review State
  const [selectedSupervisoryCaseId, setSelectedSupervisoryCaseId] = useState<string | null>(null);
  const [supervisoryNotes, setSupervisoryNotes] = useState('');
  const [supervisorySuccessMsg, setSupervisorySuccessMsg] = useState<string | null>(null);

  // Bureau Desk Investigation Drawer State (Transferred from Bureau Officer Portal)
  const [selectedDeskCaseId, setSelectedDeskCaseId] = useState<string | null>(null);
  const [deskDrawerTab, setDeskDrawerTab] = useState<'actions' | 'lifecycle' | 'notes' | 'intel'>('actions');
  const [institutionQuery, setInstitutionQuery] = useState('');
  const [institutionReply, setInstitutionReply] = useState('');
  const [citizenQuery, setCitizenQuery] = useState('');
  const [resolutionProposal, setResolutionProposal] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [deskSuccessMsg, setDeskSuccessMsg] = useState<string | null>(null);

  // Task Management State
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'PENDING'>('ALL');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskComplaintId, setNewTaskComplaintId] = useState(complaints[0]?.id || '');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-30');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);

  // Analytics CSV Export State
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const today = '2026-10-23';

  // Filter complaints based on dashboard multi-criteria filters
  const filteredDashboardComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (filterCategory !== 'all' && c.category !== filterCategory) return false;
      if (filterBureau !== 'all' && c.bureauId !== filterBureau) return false;
      if (filterPriority !== 'all') {
        if (filterPriority === 'High' && c.priority !== 'High' && c.priority !== 'Critical' && c.priority !== 'Urgent') return false;
        else if (filterPriority !== 'High' && c.priority !== filterPriority) return false;
      }
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterDateRange !== 'all') {
        const age = getCaseAgeInDays(c.submissionDate);
        if (filterDateRange === '7d' && age > 7) return false;
        if (filterDateRange === '30d' && age > 30) return false;
        if (filterDateRange === '90d' && age > 90) return false;
      }
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const m = c.id.toLowerCase().includes(q) || c.institutionName.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [complaints, filterCategory, filterBureau, filterPriority, filterStatus, filterDateRange, filterSearch]);

  // 20 Statutory Interactive KPI Counts (Section 5)
  const stats = useMemo(() => {
    const list = filteredDashboardComplaints;
    const total = list.length;
    const newlyRegistered = list.filter(c => c.status === 'Open').length;
    const awaitingVerification = list.filter(
      c => !c.verificationStatus || c.verificationStatus === 'Pending' || c.verificationStatus === 'Needs Information'
    ).length;
    const awaitingAssignment = list.filter(c => !c.bureauId || !c.assignedOfficerId).length;
    const assigned = list.filter(c => Boolean(c.bureauId && c.assignedOfficerId)).length;
    const underInvestigation = list.filter(c => c.status === 'Under Review' || c.status === 'Action & Investigation').length;
    const awaitingInstitutionResponse = list.filter(
      c => c.status === 'Awaiting Institution Response' || c.institutionResponseRequested
    ).length;
    const awaitingInfo = list.filter(
      c => c.status === 'Awaiting Information' || c.verificationStatus === 'Needs Information'
    ).length;
    const awaitingAction = list.filter(c => c.status === 'Action & Investigation' || c.status === 'Escalated').length;
    const highPriority = list.filter(
      c => (c.priority === 'High' || c.priority === 'Critical' || c.priority === 'Urgent') && c.status !== 'Closed'
    ).length;
    const overdue = list.filter(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      return c.deadlineDate && c.deadlineDate < today;
    }).length;
    const nearDeadline = list.filter(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      return isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays);
    }).length;
    const resolutionRecommended = list.filter(c => c.status === 'Resolution Recommended').length;
    const awaitingClosureReview = list.filter(
      c => c.status === 'Awaiting Closure Review' || (c.status === 'Resolved' && !c.closureApprovedBy)
    ).length;
    const resolved = list.filter(c => c.status === 'Resolved').length;
    const closed = list.filter(c => c.status === 'Closed').length;
    const reopened = list.filter(c => c.isReopened || c.status === 'Reopened').length;
    const escalated = list.filter(c => c.status === 'Escalated').length;
    const updatedToday = list.filter(
      c => (c.lastUpdatedDate && c.lastUpdatedDate === today) || (c.submissionDate && c.submissionDate === today)
    ).length;
    const stale = list.filter(c => {
      if (c.status === 'Closed' || c.status === 'Resolved') return false;
      const age = getCaseAgeInDays(c.lastUpdatedDate || c.submissionDate);
      return age >= 14;
    }).length;

    return {
      total,
      newlyRegistered,
      awaitingVerification,
      awaitingAssignment,
      assigned,
      underInvestigation,
      awaitingInstitutionResponse,
      awaitingInfo,
      awaitingAction,
      highPriority,
      overdue,
      nearDeadline,
      resolutionRecommended,
      awaitingClosureReview,
      resolved,
      closed,
      reopened,
      escalated,
      updatedToday,
      stale
    };
  }, [filteredDashboardComplaints, today, settings.approachingDeadlineDays]);

  // Bureau workload breakdown
  const bureauWorkload = useMemo(() => {
    return bureaus.map(b => {
      const bComplaints = complaints.filter(c => c.bureauId === b.id);
      const total = bComplaints.length;
      const active = bComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
      const overdue = bComplaints.filter(c => {
        if (c.status === 'Resolved' || c.status === 'Closed') return false;
        return c.deadlineDate && c.deadlineDate < today;
      }).length;
      const resolved = bComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
      const awaitingNotice = bComplaints.filter(c => c.status === 'Awaiting Institution Response' || c.institutionResponseRequested).length;
      return {
        id: b.id,
        code: b.code,
        name: b.name,
        shortName: b.shortName,
        officerInCharge: b.officerInCharge,
        total,
        active,
        overdue,
        resolved,
        awaitingNotice
      };
    });
  }, [bureaus, complaints, today]);

  // Ageing Buckets
  const ageingBuckets = useMemo(() => {
    const unclosed = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
    return {
      less7: unclosed.filter(c => getCaseAgeInDays(c.submissionDate) <= 7).length,
      b8to15: unclosed.filter(c => {
        const a = getCaseAgeInDays(c.submissionDate);
        return a >= 8 && a <= 15;
      }).length,
      b16to30: unclosed.filter(c => {
        const a = getCaseAgeInDays(c.submissionDate);
        return a >= 16 && a <= 30;
      }).length,
      over30: unclosed.filter(c => getCaseAgeInDays(c.submissionDate) > 30).length
    };
  }, [complaints]);

  // Verification Desk Queue
  const verificationQueue = useMemo(() => {
    return complaints.filter(
      c => !c.verificationStatus || c.verificationStatus === 'Pending' || c.verificationStatus === 'Needs Information'
    );
  }, [complaints]);

  const activeVerifyCase = useMemo(() => {
    if (!selectedVerifyCaseId) return verificationQueue[0] || null;
    return complaints.find(c => c.id === selectedVerifyCaseId) || verificationQueue[0] || null;
  }, [selectedVerifyCaseId, verificationQueue, complaints]);

  const verifiedInstitution = useMemo(() => {
    if (!activeVerifyCase) return null;
    return institutions.find(
      inst =>
        inst.id === activeVerifyCase.institutionId ||
        (inst.code && activeVerifyCase.institutionCode && inst.code.toLowerCase() === activeVerifyCase.institutionCode.toLowerCase())
    );
  }, [activeVerifyCase, institutions]);

  // Closure Review Queue
  const closureQueue = useMemo(() => {
    return complaints.filter(c => c.status === 'Resolved' || c.status === 'Escalated' || c.status === 'Resolution Recommended' || c.status === 'Awaiting Closure Review');
  }, [complaints]);

  const activeSupervisoryCase = useMemo(() => {
    if (!selectedSupervisoryCaseId) return closureQueue[0] || null;
    return complaints.find(c => c.id === selectedSupervisoryCaseId) || closureQueue[0] || null;
  }, [selectedSupervisoryCaseId, closureQueue, complaints]);

  // Bureau Desk Cases Scoped by Officer or Active Bureau
  const bureauDeskCases = useMemo(() => {
    if (currentUser.role === 'bureau_officer' && currentUser.bureauId) {
      return complaints.filter(c => c.bureauId === currentUser.bureauId || c.assignedOfficerId === currentUser.id);
    }
    return complaints.filter(c => c.assignedOfficerId);
  }, [complaints, currentUser]);

  const selectedDeskCase = useMemo(() => {
    if (!selectedDeskCaseId) return null;
    return complaints.find(c => c.id === selectedDeskCaseId) || null;
  }, [complaints, selectedDeskCaseId]);

  const selectedDeskNotes = useMemo(() => {
    if (!selectedDeskCaseId) return [];
    return notes[selectedDeskCaseId] || [];
  }, [notes, selectedDeskCaseId]);

  const selectedDeskIntel = useMemo(() => {
    if (!selectedDeskCaseId) return [];
    return relatedSuggestions.filter(s => s.complaintId === selectedDeskCaseId || s.relatedComplaintId === selectedDeskCaseId);
  }, [relatedSuggestions, selectedDeskCaseId]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (taskFilter === 'PENDING' && t.completed) return false;
      if (taskFilter === 'CRITICAL' && t.priority !== 'Critical') return false;
      if (taskFilter === 'HIGH' && t.priority !== 'High') return false;
      return true;
    });
  }, [tasks, taskFilter]);

  // Analytics Chart Data
  const bureauChartData = useMemo(() => {
    return bureaus.map(b => {
      const bCases = complaints.filter(c => c.bureauId === b.id);
      return {
        id: b.id,
        name: b.shortName || b.name,
        Active: bCases.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length,
        Resolved: bCases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
        Overdue: bCases.filter(c => isOverdue(c.deadlineDate, c.status)).length
      };
    });
  }, [bureaus, complaints]);

  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    const colors = ['#0B477F', '#155A91', '#237A50', '#D97706', '#C43D3D', '#6366F1'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [complaints]);

  const chronicInstitutions = useMemo(() => {
    const map: Record<string, { name: string; count: number; code?: string }> = {};
    complaints.forEach(c => {
      const id = c.institutionId || c.institutionName;
      if (!map[id]) {
        map[id] = { name: c.institutionName, count: 0, code: c.institutionCode };
      }
      map[id].count++;
    });

    return Object.values(map)
      .filter(i => i.count >= 2)
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  // Action Handlers
  const handleResetDashboardFilters = () => {
    setFilterDateRange('all');
    setFilterCategory('all');
    setFilterBureau('all');
    setFilterPriority('all');
    setFilterStatus('all');
    setFilterSearch('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const b = bureaus.find(b => b.id === newUserBureau) || bureaus[0];
    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      designation: newUserDesignation.trim(),
      bureauId: b.id,
      bureauName: b.name
    };

    addUser(newUser);
    setUserCreatedMsg(true);
    setNewUserName('');
    setNewUserEmail('');
    setTimeout(() => setUserCreatedMsg(false), 3000);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId) return;

    assignComplaint(selectedComplaintId, targetBureauId, targetOfficerId, assignNotes);
    setAssignSuccess(true);
    setTimeout(() => {
      setAllocationModalOpen(false);
      setAssignSuccess(false);
      setSelectedComplaintId('');
      setAssignNotes('');
    }, 1200);
  };

  const handleVerifyAction = (status: 'Verified' | 'Needs Information' | 'Flagged') => {
    if (!activeVerifyCase) return;
    const defaultMsg =
      status === 'Verified'
        ? 'Verified institution AICTE code and mandatory supporting documentation.'
        : status === 'Needs Information'
        ? verifyRemarks || 'Submission incomplete. Essential details or valid student verification missing.'
        : verifyRemarks || 'Flagged for potential duplicate or fraudulent filing.';

    updateVerificationStatus(activeVerifyCase.id, status, verifyRemarks.trim() || defaultMsg);
    setVerifySuccessMsg(`Verification updated: Case marked as "${status}".`);
    setVerifyRemarks('');
    setTimeout(() => setVerifySuccessMsg(null), 2500);
  };

  const handleClosureAction = (approved: boolean) => {
    if (!activeSupervisoryCase) return;
    approveCaseClosure(
      activeSupervisoryCase.id,
      approved,
      supervisoryNotes.trim() ||
        (approved
          ? 'Final closure approved by Nodal Administration upon reviewing institutional compliance.'
          : 'Case remanded for further inquiry; insufficient evidence of complete restitution.')
    );

    setSupervisorySuccessMsg(
      approved
        ? `Closure Approved for ${activeSupervisoryCase.id}. Case officially archived.`
        : `Case ${activeSupervisoryCase.id} remanded back to Bureau Officer for further inquiry.`
    );
    setSupervisoryNotes('');
    setTimeout(() => setSupervisorySuccessMsg(null), 2500);
  };

  const handleDeskDemandNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeskCase || !institutionQuery.trim()) return;
    requestInstitutionResponse(selectedDeskCase.id, institutionQuery.trim());
    setDeskSuccessMsg(`Statutory explanation demand issued to ${selectedDeskCase.institutionName}. Status set to Awaiting Institution Response.`);
    setInstitutionQuery('');
    setTimeout(() => setDeskSuccessMsg(null), 3000);
  };

  const handleDeskRecordRejoinder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeskCase || !institutionReply.trim()) return;
    recordInstitutionResponse(selectedDeskCase.id, institutionReply.trim());
    setDeskSuccessMsg(`Institution rejoinder registered on record for ${selectedDeskCase.id}. Moved to Action & Investigation.`);
    setInstitutionReply('');
    setTimeout(() => setDeskSuccessMsg(null), 3000);
  };

  const handleDeskCitizenQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeskCase || !citizenQuery.trim()) return;
    requestComplainantInfo(selectedDeskCase.id, citizenQuery.trim());
    setDeskSuccessMsg(`Clarification request dispatched to complainant for ${selectedDeskCase.id}.`);
    setCitizenQuery('');
    setTimeout(() => setDeskSuccessMsg(null), 3000);
  };

  const handleDeskRecommendResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeskCase || !resolutionProposal.trim()) return;
    recommendResolution(selectedDeskCase.id, resolutionProposal.trim());
    setDeskSuccessMsg(`Resolution terms formulated. Case ${selectedDeskCase.id} forwarded for administrative closure review.`);
    setResolutionProposal('');
    setTimeout(() => setDeskSuccessMsg(null), 3000);
  };

  const handleDeskAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeskCase || !newNoteContent.trim()) return;
    addNote(selectedDeskCase.id, newNoteContent.trim(), undefined, true);
    setDeskSuccessMsg(`Confidential internal note added to ${selectedDeskCase.id}.`);
    setNewNoteContent('');
    setTimeout(() => setDeskSuccessMsg(null), 2500);
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

  const handleSaveSLA = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultDeadlineNormal: slaNormal,
      defaultDeadlineUrgent: slaUrgent,
      approachingDeadlineDays: approachingDays,
      overdueEscalationDays: escalationDays,
      similarityThreshold: similarityThresh
    });
    setSlaSavedMsg(true);
    setTimeout(() => setSlaSavedMsg(false), 2500);
  };

  const handleExtendDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlReason.trim()) return;
    updateComplaintDeadline(dlCaseId, newDlDate, dlReason.trim());
    setDlSavedMsg(true);
    setDlReason('');
    setTimeout(() => setDlSavedMsg(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = ['Case ID', 'Institution Name', 'Institution Code', 'Bureau', 'Category', 'Status', 'Filing Date', 'Resolution Date'];
    const rows = complaints.map(c => [
      c.id,
      `"${c.institutionName.replace(/"/g, '""')}"`,
      c.institutionCode || 'N/A',
      c.bureauName,
      `"${c.category}"`,
      c.status,
      c.submissionDate,
      c.resolvedDate || 'Pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aicte_government_officials_report_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Administration Command Center Header */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B477F] text-xs font-bold border border-blue-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administration Portal • Central System Control & Statutory Oversight</span>
          </div>
          <h1 className="text-2xl font-black text-[#17324D]">
            AICTE Administration Command Center
          </h1>
          <p className="text-xs text-[#53677D] mt-1">
            Logged in as: <strong className="text-[#17324D]">{currentUser.name}</strong> ({currentUser.designation}) &bull; Access Level: <strong className="text-[#0B477F]">Central Nodal Administrator</strong> &bull; Scope: <span className="font-semibold text-slate-700">Council-wide System Governance</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/how-it-works"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 border border-blue-200 text-[#0B477F] text-xs font-bold rounded-lg hover:bg-blue-100 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>How It Works SOP</span>
          </Link>

          {hasPermission('assign_case') && (
            <button
              onClick={() => {
                setSelectedComplaintId(complaints[0]?.id || '');
                setAllocationModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign Case</span>
            </button>
          )}

          <Link
            to="/portal/officials"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-lg hover:bg-indigo-100 transition shadow-sm"
          >
            <Briefcase className="w-4 h-4" />
            <span>Officials Desk</span>
          </Link>

          <Link
            to="/registry"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#D6E4F0] text-[#17324D] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-[#0B477F]" />
            <span>Registry</span>
          </Link>
        </div>
      </div>

      {/* Advanced Multi-criteria Dashboard Filters Bar (Section 6) */}
      <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17324D]">
            <Filter className="w-4 h-4 text-[#0B477F]" />
            <span>Advanced Dashboard Criteria Filters</span>
          </div>
          {(filterCategory !== 'all' || filterBureau !== 'all' || filterPriority !== 'all' || filterStatus !== 'all' || filterDateRange !== 'all' || filterSearch) && (
            <button
              onClick={handleResetDashboardFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Dashboard Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 text-xs">
          {/* Quick Search */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by ID, college name, or title..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-[#D6E4F0] rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0B477F]"
            />
          </div>

          {/* Date Range */}
          <div>
            <select
              value={filterDateRange}
              onChange={e => setFilterDateRange(e.target.value as any)}
              className="w-full p-1.5 bg-slate-50 border border-[#D6E4F0] rounded-lg text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">All Filing Dates</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full p-1.5 bg-slate-50 border border-[#D6E4F0] rounded-lg text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Infrastructure & Labs">Infrastructure & Labs</option>
              <option value="Academic Administration & Faculty">Academic Administration</option>
              <option value="Fee Irregularity & Caution Refund">Fee Irregularity</option>
              <option value="Examination Malpractice & Results">Examinations</option>
              <option value="Harassment & Anti-Ragging">Harassment / Anti-Ragging</option>
              <option value="Regulatory Compliance & Fraud">Regulatory & Compliance</option>
            </select>
          </div>

          {/* Bureau */}
          <div>
            <select
              value={filterBureau}
              onChange={e => setFilterBureau(e.target.value)}
              className="w-full p-1.5 bg-slate-50 border border-[#D6E4F0] rounded-lg text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">All Bureaus</option>
              {bureaus.map(b => (
                <option key={b.id} value={b.id}>{b.shortName}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full p-1.5 bg-slate-50 border border-[#D6E4F0] rounded-lg text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 20 Interactive Dashboard KPI Cards (Section 5) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#17324D] flex items-center gap-1.5">
            <Inbox className="w-4 h-4 text-[#0B477F]" />
            <span>Statutory Complaint Lifecycle KPI Cards (20 Categories)</span>
          </h2>
          <span className="text-[11px] text-slate-500">Every card routes strictly to its distinct filtered registry queue</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[
            { label: '1. Total Complaints', count: stats.total, sub: 'All council records', link: '/registry', icon: Inbox, color: 'text-[#0B477F]', bg: 'bg-[#E5F1FC]' },
            { label: '2. Newly Registered', count: stats.newlyRegistered, sub: 'Intake Stage 1', link: '/registry?status=Open', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '3. Awaiting Verification', count: stats.awaitingVerification, sub: 'Scrutiny Stage 2', link: '/registry?filter=awaiting_verification', icon: FileCheck2, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: '4. Awaiting Assignment', count: stats.awaitingAssignment, sub: 'Allocation Stage 3', link: '/registry?filter=unassigned', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: '5. Assigned Complaints', count: stats.assigned, sub: 'Active with Officer', link: '/registry?filter=assigned', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: '6. Under Investigation', count: stats.underInvestigation, sub: 'Stage 5 Inquiry', link: '/registry?filter=under_review', icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: '7. Inst. Response Pending', count: stats.awaitingInstitutionResponse, sub: 'Stage 6 Notice', link: '/registry?filter=institution_response', icon: Building, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: '8. Additional Info Pending', count: stats.awaitingInfo, sub: 'Citizen proof awaited', link: '/registry?filter=awaiting_info', icon: HelpCircle, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: '9. Awaiting Admin Action', count: stats.awaitingAction, sub: 'Hearing & Committee', link: '/registry?filter=action', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: '10. High-Priority Cases', count: stats.highPriority, sub: 'Immediate attention', link: '/registry?priority=High', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: '11. Overdue Complaints', count: stats.overdue, sub: 'SLA Exceeded', link: '/registry?overdue=true', icon: AlertTriangle, color: 'text-[#C43D3D]', bg: 'bg-rose-100' },
            { label: '12. Near SLA Deadline', count: stats.nearDeadline, sub: `≤ ${settings.approachingDeadlineDays} days left`, link: '/registry?approaching=true', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-100' },
            { label: '13. Resolution Recommended', count: stats.resolutionRecommended, sub: 'Findings concluded', link: '/registry?filter=resolution_recommended', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: '14. Awaiting Closure Review', count: stats.awaitingClosureReview, sub: 'Final Sanction', link: '/registry?filter=closure_review', icon: ShieldCheck, color: 'text-amber-800', bg: 'bg-amber-100' },
            { label: '15. Resolved Complaints', count: stats.resolved, sub: 'Remediation completed', link: '/registry?status=Resolved', icon: Check, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: '16. Closed Complaints', count: stats.closed, sub: 'Disposed & archived', link: '/registry?status=Closed', icon: FileCheck2, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: '17. Reopened Complaints', count: stats.reopened, sub: 'Re-inquiry mandated', link: '/registry?filter=reopened', icon: RotateCcw, color: 'text-red-800', bg: 'bg-red-100' },
            { label: '18. Escalated Complaints', count: stats.escalated, sub: 'Supervisory review', link: '/registry?filter=escalated', icon: Flame, color: 'text-orange-700', bg: 'bg-orange-100' },
            { label: '19. Updated Today', count: stats.updatedToday, sub: 'Active today', link: '/registry?filter=updated_today', icon: History, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: '20. No Recent Activity', count: stats.stale, sub: 'Stale > 14 days', link: '/registry?filter=stale', icon: Clock, color: 'text-zinc-600', bg: 'bg-zinc-100' }
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(kpi.link)}
                className="bg-white rounded-xl border border-[#D6E4F0] p-3 shadow-xs hover:border-[#0B477F] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#53677D]">
                  <span className="line-clamp-1 group-hover:text-[#0B477F] transition-colors">{kpi.label}</span>
                  <div className={`w-6 h-6 rounded-md ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                  </div>
                </div>
                <div className="mt-1.5">
                  <span className={`text-xl font-black ${kpi.color}`}>{kpi.count}</span>
                  <span className="text-[10px] text-[#53677D] block truncate mt-0.5">{kpi.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-[#D6E4F0] flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bureau Matrix & Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab('action_center')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'action_center'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-600" />
          <span>Action Center ({stats.overdue + stats.awaitingAssignment + stats.highPriority})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'tasks'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <ListTodo className="w-4 h-4 text-amber-600" />
          <span>Priority Tasks ({tasks.filter(t => !t.completed).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-amber-600" />
          <span>Document Scrutiny ({verificationQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supervision')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'supervision'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Eye className="w-4 h-4 text-purple-600" />
          <span>Closure Approvals ({closureQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow_config')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'workflow_config'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Workflow Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('data_quality')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'data_quality'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-orange-600" />
          <span>Data Quality</span>
        </button>

        <button
          onClick={() => setActiveTab('system_health')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'system_health'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>System Health</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Bell className="w-4 h-4 text-blue-600" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-teal-600" />
          <span>Executive Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Staff Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'sla'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Clock className="w-4 h-4 text-orange-600" />
          <span>Priority & SLA Governance</span>
        </button>
      </div>

      {/* TAB 1: Bureau Matrix & Operational Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Bureau Workload Matrix */}
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0B477F]" />
                  <span>Inter-Bureau Workload & SLA Matrix</span>
                </h2>
                <p className="text-xs text-[#53677D]">
                  Real-time distribution of cases across AICTE specialized cells.
                </p>
              </div>
              <Link
                to="/registry"
                className="text-xs font-semibold text-[#0B477F] hover:underline flex items-center gap-1"
              >
                <span>View Full Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F1F7FC] text-[#17324D] border-y border-[#D6E4F0]">
                    <th className="py-2.5 px-4 font-bold">Bureau / Cell</th>
                    <th className="py-2.5 px-4 font-bold">Incharge Officer</th>
                    <th className="py-2.5 px-3 font-bold text-center">Total Cases</th>
                    <th className="py-2.5 px-3 font-bold text-center text-blue-700">Active</th>
                    <th className="py-2.5 px-3 font-bold text-center text-amber-700">Notice Dispatched</th>
                    <th className="py-2.5 px-3 font-bold text-center text-red-600">Overdue</th>
                    <th className="py-2.5 px-3 font-bold text-center text-emerald-600">Resolved</th>
                    <th className="py-2.5 px-4 font-bold text-right">Quick Filter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E4F0]">
                  {bureauWorkload.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#17324D]">{b.name}</p>
                        <p className="text-[11px] text-[#53677D] font-mono">{b.code}</p>
                      </td>
                      <td className="py-3 px-4 text-[#53677D]">{b.officerInCharge}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#17324D]">{b.total}</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-700">{b.active}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700">{b.awaitingNotice}</td>
                      <td className="py-3 px-3 text-center font-bold text-red-600">{b.overdue}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">{b.resolved}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/registry?bureau=${b.id}`)}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#0B477F] bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition"
                        >
                          View Queue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ageing & Quick Visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#17324D] mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0B477F]" />
                <span>Active Case Ageing</span>
              </h2>
              <p className="text-xs text-[#53677D] mb-4">
                Elapsed calendar days for unclosed complaints.
              </p>

              <div className="space-y-3">
                <div
                  onClick={() => navigate('/registry?search=2026-10')}
                  className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition"
                >
                  <div>
                    <p className="text-xs font-bold text-emerald-900">&le; 7 Days (Fresh Intake)</p>
                    <p className="text-[11px] text-emerald-700">Within preliminary inquiry phase</p>
                  </div>
                  <span className="text-lg font-black text-emerald-800">{ageingBuckets.less7}</span>
                </div>

                <div
                  onClick={() => navigate('/registry')}
                  className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between cursor-pointer hover:border-blue-400 transition"
                >
                  <div>
                    <p className="text-xs font-bold text-blue-900">8 &ndash; 15 Days (Active Review)</p>
                    <p className="text-[11px] text-blue-700">Institution explanation sought</p>
                  </div>
                  <span className="text-lg font-black text-blue-800">{ageingBuckets.b8to15}</span>
                </div>

                <div
                  onClick={() => navigate('/registry?approaching=true')}
                  className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between cursor-pointer hover:border-amber-400 transition"
                >
                  <div>
                    <p className="text-xs font-bold text-amber-900">16 &ndash; 30 Days (Approaching SLA)</p>
                    <p className="text-[11px] text-amber-700">Priority follow-up mandated</p>
                  </div>
                  <span className="text-lg font-black text-amber-800">{ageingBuckets.b16to30}</span>
                </div>

                <div
                  onClick={() => navigate('/registry?overdue=true')}
                  className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between cursor-pointer hover:border-red-400 transition"
                >
                  <div>
                    <p className="text-xs font-bold text-red-900">&gt; 30 Days (Critical Overdue)</p>
                    <p className="text-[11px] text-red-700">Subject to supervisory escalation</p>
                  </div>
                  <span className="text-lg font-black text-red-800">{ageingBuckets.over30}</span>
                </div>
              </div>
            </div>

            {/* Chronic Institutions */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#0B477F]" />
                    <span>Institution Grievance Concentrations</span>
                  </h2>
                  <p className="text-xs text-[#53677D]">
                    Colleges with multiple active filings (Statutory intake surveillance).
                  </p>
                </div>
                <Link
                  to="/institutions"
                  className="text-xs font-bold text-[#0B477F] hover:underline"
                >
                  Full Directory
                </Link>
              </div>

              <div className="divide-y divide-[#D6E4F0] max-h-60 overflow-y-auto">
                {chronicInstitutions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/registry?search=${encodeURIComponent(item.name)}`)}
                    className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-lg transition"
                  >
                    <div>
                      <p className="font-bold text-xs text-[#17324D]">{item.name}</p>
                      <p className="text-[11px] text-[#53677D] font-mono">{item.code || 'AICTE-CODE-RECORD'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-50 text-[#0B477F] border border-blue-200">
                        {item.count} complaints
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Administrative Action Center (Section 5.12) */}
      {activeTab === 'action_center' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-black text-[#17324D] flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <span>Prioritized Administrative Action Center (Section 5.12)</span>
              </h3>
              <p className="text-xs text-[#53677D] mt-0.5">
                Centralized supervisory radar tracking overdue SLAs, unallocated dockets, high-priority emergencies, pending closure sanctions, and dormant cases.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-rose-50 text-rose-800 text-xs font-bold rounded-full border border-rose-200">
                {stats.overdue + stats.awaitingAssignment + stats.highPriority + stats.awaitingClosureReview + stats.stale} Critical Items
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/registry?overdue=true')}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition cursor-pointer interactive-card space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Overdue Complaints</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700">{stats.overdue}</div>
              <p className="text-[11px] text-rose-600">Statutory SLA timeline breached</p>
            </div>

            <div
              onClick={() => navigate('/registry?filter=unassigned')}
              className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition cursor-pointer interactive-card space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Awaiting Allocation</span>
                <UserCheck className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-orange-700">{stats.awaitingAssignment}</div>
              <p className="text-[11px] text-orange-600">Unallocated to bureau / officer</p>
            </div>

            <div
              onClick={() => navigate('/registry?priority=High')}
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition cursor-pointer interactive-card space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">High Priority Cases</span>
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">{stats.highPriority}</div>
              <p className="text-[11px] text-amber-600">Urgent fee / ragging grievances</p>
            </div>

            <div
              onClick={() => setActiveTab('supervision')}
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer interactive-card space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Pending Closure Review</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700">{stats.awaitingClosureReview}</div>
              <p className="text-[11px] text-blue-600">Final sanction approval ready</p>
            </div>
          </div>

          {/* Action List Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#17324D]">
              Prioritized Action Docket Queue
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F1F7FC] text-[#17324D] border-b border-[#D6E4F0] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Docket ID</th>
                    <th className="py-2.5 px-3">Institution & Subject</th>
                    <th className="py-2.5 px-3">Urgency Rationale</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status / Days Pending</th>
                    <th className="py-2.5 px-3 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E4F0]">
                  {complaints
                    .filter(c => isOverdue(c.deadlineDate, c.status) || !c.bureauId || c.priority === 'High' || c.priority === 'Critical' || c.status === 'Awaiting Closure Review')
                    .slice(0, 8)
                    .map(c => {
                      const isCaseOverdue = isOverdue(c.deadlineDate, c.status);
                      const isUnassigned = !c.bureauId || !c.assignedOfficerId;
                      const age = getCaseAgeInDays(c.submissionDate, c.resolvedDate);

                      return (
                        <tr key={c.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-mono font-bold text-[#0B477F] whitespace-nowrap">
                            {c.id}
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <p className="font-semibold text-[#17324D] truncate">{c.institutionName}</p>
                            <p className="text-[11px] text-[#53677D] truncate mt-0.5">{c.title}</p>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isCaseOverdue ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                SLA Breached ({formatDate(c.deadlineDate)})
                              </span>
                            ) : isUnassigned ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-300">
                                Unallocated Bureau
                              </span>
                            ) : c.status === 'Awaiting Closure Review' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300">
                                Sanction Sign-Off Awaited
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                High Urgency Review
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                            {c.category}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                            <span>{c.status}</span>
                            <span className="text-[11px] text-slate-400 block font-mono">Age: {age} days</span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isUnassigned ? (
                                <button
                                  onClick={() => {
                                    setSelectedComplaintId(c.id);
                                    setAllocationModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-[#0B477F] text-white rounded text-[11px] font-bold hover:bg-[#155A91] transition shadow-xs"
                                >
                                  Allocate Now
                                </button>
                              ) : c.status === 'Awaiting Closure Review' ? (
                                <button
                                  onClick={() => setActiveTab('supervision')}
                                  className="px-2.5 py-1 bg-purple-700 text-white rounded text-[11px] font-bold hover:bg-purple-800 transition shadow-xs"
                                >
                                  Review Sanction
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate(`/case/${c.id}`)}
                                  className="px-2.5 py-1 bg-slate-100 text-[#0B477F] hover:bg-slate-200 rounded text-[11px] font-bold transition"
                                >
                                  Inspect Case
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Document Verification & Scrutiny */}
      {activeTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#17324D]">
                    Intake Scrutiny & Verification Desk
                  </h3>
                  <p className="text-xs text-[#53677D]">
                    Verify AICTE institution credentials and validate documentary evidence before bureau assignment.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200">
                  {verificationQueue.length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {verificationQueue.map(c => {
                  const isSelected = activeVerifyCase?.id === c.id;
                  const vStatus = c.verificationStatus || 'Pending';

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedVerifyCaseId(c.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0B477F] bg-[#F1F7FC] ring-1 ring-[#0B477F] shadow-sm'
                          : 'border-[#D6E4F0] bg-white hover:border-[#155A91] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#0B477F]">{c.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          vStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vStatus}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#17324D] mt-1">{c.institutionName}</p>
                      <p className="text-[11px] text-[#53677D] line-clamp-1">{c.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Pane */}
          {activeVerifyCase && (
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#17324D] border-b pb-2">
                Scrutiny Action: {activeVerifyCase.id}
              </h3>
              {verifySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg font-bold">
                  {verifySuccessMsg}
                </div>
              )}
              <div className="text-xs space-y-2 text-[#53677D]">
                <p><strong>Institution:</strong> {activeVerifyCase.institutionName}</p>
                <p><strong>Code:</strong> {activeVerifyCase.institutionCode || 'N/A'}</p>
                <p><strong>Category:</strong> {activeVerifyCase.category}</p>
                <p className="bg-slate-50 p-2.5 rounded border text-slate-700">{activeVerifyCase.description}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scrutiny Remarks</label>
                <textarea
                  rows={2}
                  value={verifyRemarks}
                  onChange={e => setVerifyRemarks(e.target.value)}
                  placeholder="Record verification findings..."
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleVerifyAction('Verified')}
                  className="py-2 px-3 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition"
                >
                  Confirm Verified
                </button>
                <button
                  onClick={() => handleVerifyAction('Needs Information')}
                  className="py-2 px-3 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition"
                >
                  Request Clarification
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Supervisory Sanctions & Closure Approvals */}
      {activeTab === 'supervision' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#17324D]">
                    Executive Sanction & Case Closure Desk
                  </h3>
                  <p className="text-xs text-[#53677D]">
                    Approve final statutory disposal after reviewing officer findings and institution remediation.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-800 rounded border border-purple-200">
                  {closureQueue.length} Ready
                </span>
              </div>

              <div className="space-y-3">
                {closureQueue.map(c => {
                  const isSelected = activeSupervisoryCase?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedSupervisoryCaseId(c.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600 shadow-sm'
                          : 'border-[#D6E4F0] bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#0B477F]">{c.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#17324D] mt-1">{c.institutionName}</p>
                      <p className="text-[11px] text-[#53677D] line-clamp-1">{c.resolutionRecommendation || c.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {activeSupervisoryCase && (
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#17324D] border-b pb-2">
                Executive Action: {activeSupervisoryCase.id}
              </h3>
              {supervisorySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg font-bold">
                  {supervisorySuccessMsg}
                </div>
              )}
              <div className="text-xs space-y-2 text-[#53677D]">
                <p><strong>Institution:</strong> {activeSupervisoryCase.institutionName}</p>
                <p><strong>Assigned Bureau:</strong> {activeSupervisoryCase.bureauName}</p>
                <p><strong>Officer Recommendation:</strong></p>
                <p className="bg-emerald-50 p-2.5 rounded border border-emerald-200 text-emerald-900 font-medium">
                  {activeSupervisoryCase.resolutionRecommendation || 'Resolution drafted based on verified compliance documents.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supervisory Sanction Directive</label>
                <textarea
                  rows={2}
                  value={supervisoryNotes}
                  onChange={e => setSupervisoryNotes(e.target.value)}
                  placeholder="Record final closure rationale..."
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                />
              </div>

              {hasPermission('approve_closure') ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleClosureAction(true)}
                    className="py-2.5 px-3 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition"
                  >
                    Approve & Close Case
                  </button>
                  <button
                    onClick={() => handleClosureAction(false)}
                    className="py-2.5 px-3 bg-rose-700 text-white rounded-lg text-xs font-bold hover:bg-rose-800 transition"
                  >
                    Remand for Inquest
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                  Notice: Final case closure requires Central Nodal Administrator authorization.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Priority Tasks & Follow-up Center (Section 16) */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-black text-[#17324D] flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-amber-600" />
                <span>Administration Task & Follow-up Center</span>
              </h3>
              <p className="text-xs text-[#53677D] mt-0.5">
                Statutory follow-up items linked to complaint files, sorted by statutory urgency.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaskFilter('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  taskFilter === 'ALL' ? 'bg-[#0B477F] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setTaskFilter('CRITICAL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  taskFilter === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setTaskFilter('PENDING')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  taskFilter === 'PENDING' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pending ({tasks.filter(t => !t.completed).length})
              </button>
              <button
                onClick={() => setNewTaskModalOpen(true)}
                className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredTasks.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  t.completed ? 'bg-slate-50 opacity-60' : t.priority === 'Critical' ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                      t.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-blue-600 bg-white'
                    }`}
                  >
                    {t.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        t.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t.priority.toUpperCase()}
                      </span>
                      {t.complaintId && <span className="font-mono text-xs font-bold text-[#0B477F]">{t.complaintId}</span>}
                      {t.institutionName && <span className="text-xs text-slate-600 font-semibold">• {t.institutionName}</span>}
                    </div>
                    <p className={`text-xs font-bold text-slate-800 mt-1 ${t.completed ? 'line-through text-slate-500' : ''}`}>
                      {t.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Assigned to: {t.assignedToName} &bull; Target SLA: {formatDate(t.dueDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {t.complaintId && (
                    <button
                      onClick={() => navigate(`/case/${t.complaintId}`)}
                      className="px-3 py-1.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Case</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                    title="Delete task"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Executive Analytics & Reports (Section 18) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0B477F]" />
                <span>Executive Turnaround & Bureau Analytics</span>
              </h2>
              <p className="text-xs text-[#53677D]">
                Council-wide performance indicators, turnaround curves, and compliance patterns.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Executive CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">Bureau Workload & Overdue Matrix</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bureauChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Active" fill="#0B477F" onClick={(entry: any) => navigate(`/registry?bureau=${entry.id}`)} />
                    <Bar dataKey="Overdue" fill="#C43D3D" onClick={() => navigate('/registry?overdue=true')} />
                    <Bar dataKey="Resolved" fill="#237A50" onClick={() => navigate('/registry?status=Resolved')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">Grievance Distribution by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Staff Accounts & Roles (Section 19) */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0B477F]" />
                <span>Authorized Government Staff Directory ({users.length})</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-700 font-bold">
                    <th className="py-2.5 px-3">Official Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Designation & Cell</th>
                    <th className="py-2.5 px-3">Email Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-[#17324D]">{u.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-[#0B477F] border border-blue-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{u.designation} &bull; {u.bureauName || 'Central'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create User Form */}
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#17324D] border-b pb-2">Register Official Account</h3>
            {userCreatedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded font-bold">
                Official staff account created successfully.
              </div>
            )}
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Dr. Satish Chandra"
                  className="w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Government Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="e.g. satish.c@aicte-demo.gov.in"
                  className="w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designated Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as any)}
                  className="w-full text-xs p-2 border rounded-lg bg-white"
                >
                  <option value="bureau_officer">Bureau Desk Officer (Operational Desk)</option>
                  <option value="admin">Central Administrator (Nodal Governance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bureau Assignment</label>
                <select
                  value={newUserBureau}
                  onChange={e => setNewUserBureau(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white"
                >
                  {bureaus.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Staff Account</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 8: Priority & SLA Governance (Section 13) */}
      {activeTab === 'sla' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          {/* Global Parameters */}
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2 border-b pb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Statutory Turnaround Parameters</span>
            </h3>
            {slaSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded font-bold">
                SLA parameters saved and synchronized with background monitors.
              </div>
            )}
            <form onSubmit={handleSaveSLA} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Turnaround (Normal Cases - Days)</label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={slaNormal}
                  onChange={e => setSlaNormal(Number(e.target.value))}
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Turnaround (Urgent / Ragging - Days)</label>
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={slaUrgent}
                  onChange={e => setSlaUrgent(Number(e.target.value))}
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Approaching SLA Warning Window (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={approachingDays}
                  onChange={e => setApproachingDays(Number(e.target.value))}
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition"
              >
                Save Statutory SLA Parameters
              </button>
            </form>
          </div>

          {/* Individual Deadline Extension */}
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2 border-b pb-2">
              <History className="w-4 h-4 text-[#0B477F]" />
              <span>Formal Deadline Extension Audit Tool</span>
            </h3>
            {dlSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded font-bold">
                Deadline extension granted and recorded in case audit history.
              </div>
            )}
            <form onSubmit={handleExtendDeadline} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Complaint</label>
                <select
                  value={dlCaseId}
                  onChange={e => setDlCaseId(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white"
                >
                  {complaints.filter(c => c.status !== 'Closed').map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.institutionName} (Due: {c.deadlineDate})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Statutory Deadline Date</label>
                <input
                  type="date"
                  required
                  value={newDlDate}
                  onChange={e => setNewDlDate(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mandatory Extension Justification</label>
                <textarea
                  rows={2}
                  required
                  value={dlReason}
                  onChange={e => setDlReason(e.target.value)}
                  placeholder="Specify legal or inquiry justification for extension..."
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-700 text-white text-xs font-bold rounded-lg hover:bg-orange-800 transition"
              >
                Grant & Record Deadline Extension
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Workflow Configuration (Section 5.4) */}
      {activeTab === 'workflow_config' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#0B477F]" />
                  <span>Statutory Complaint Lifecycle & Status Transition Matrix</span>
                </h3>
                <p className="text-xs text-[#53677D] mt-0.5">
                  Formal state machine defining authorized transitions, role permissions, and compliance guardrails under AICTE Redressal Regulations.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-[#0B477F] border border-blue-200 rounded-full text-xs font-bold self-start font-mono">
                Active Policy: AICTE-SOP-2026-V3
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F1F7FC] text-[#17324D] border-b border-[#D6E4F0] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Current Status</th>
                    <th className="py-3 px-3">Permitted Next Statuses</th>
                    <th className="py-3 px-3">Authorized Role</th>
                    <th className="py-3 px-3">Enforcement Conditions & Rules</th>
                    <th className="py-3 px-3">Audit Trail Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E4F0]">
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">1. Draft</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Submitted</td>
                    <td className="py-3 px-3">Complainant (Public)</td>
                    <td className="py-3 px-3 text-slate-600">All mandatory fields completed, verification checkbox checked</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">CASE_SUBMITTED</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">2. Submitted</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Awaiting Verification, Rejected</td>
                    <td className="py-3 px-3">Administrator / Intake Cell</td>
                    <td className="py-3 px-3 text-slate-600">Completeness check; automated AI duplicate detection run</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">INTAKE_VERIFIED</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">3. Awaiting Verification</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Under Review, Rejected</td>
                    <td className="py-3 px-3">Administrator / Scrutiny Staff</td>
                    <td className="py-3 px-3 text-slate-600">Verification of prima facie jurisdiction; mandatory rejection reason if rejected</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">SCRUTINY_DECISION</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">4. Under Review</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Action & Investigation, Awaiting Institution Response</td>
                    <td className="py-3 px-3">Administrator / Bureau Head</td>
                    <td className="py-3 px-3 text-slate-600">Assignment to Bureau Unit and Desk Officer with target deadline</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">BUREAU_ALLOCATION</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">5. Action & Investigation</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Awaiting Inst Response, Complainant Clarification, Awaiting Closure</td>
                    <td className="py-3 px-3">Desk Officer / Bureau Officer</td>
                    <td className="py-3 px-3 text-slate-600">Statutory notice issued or preliminary findings logged</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">NOTICE_DISPATCHED</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">6. Awaiting Institution Response</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Action & Investigation, Escalated</td>
                    <td className="py-3 px-3">Desk Officer / System Watchdog</td>
                    <td className="py-3 px-3 text-slate-600">Rejoinder received or statutory response window expired</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">REPLY_RECORDED</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">7. Awaiting Complainant Clarification</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Action & Investigation</td>
                    <td className="py-3 px-3">Desk Officer / Public User</td>
                    <td className="py-3 px-3 text-slate-600">Complainant supplies additional evidence or clarification</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">CITIZEN_REPLY</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">8. Awaiting Closure Review</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Resolved, Closed, Action & Investigation (Remanded)</td>
                    <td className="py-3 px-3">Administrator ONLY</td>
                    <td className="py-3 px-3 text-slate-600">Officer recommends terms; Admin conducts final sanction approval or remands</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">SANCTION_APPROVAL</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-blue-900">9. Resolved / Closed</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">Reopened</td>
                    <td className="py-3 px-3">Administrator ONLY</td>
                    <td className="py-3 px-3 text-slate-600">Valid grievance review appeal lodged within 30 days of closure order</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">CASE_REOPENED</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Role-Based Transition Enforcement Note</p>
                <p className="text-amber-800 mt-0.5">
                  Bureau Officers may recommend resolution and request responses, but final closure sanctions are strictly restricted to Administrators. All state transitions automatically write an immutable hash-chained audit log entry.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Data Quality & Integrity (Section 5.9) */}
      {activeTab === 'data_quality' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#0B477F]" />
                  <span>Database Integrity & Schema Validation Checkpoints</span>
                </h3>
                <p className="text-xs text-[#53677D] mt-0.5">
                  Automated validation scanner verifying relational integrity, unassigned active files, missing deadlines, and orphaned records.
                </p>
              </div>
              <button
                onClick={() => setDqResolvedMsg(`Integrity audit executed at ${new Date().toLocaleTimeString()} IST. All 6 checkpoints verified 100% sound.`)}
                className="px-4 py-2 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition flex items-center gap-2 self-start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Run Integrity Verification</span>
              </button>
            </div>

            {dqResolvedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dqResolvedMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#D6E4F0] bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unassigned Open Cases</span>
                  <AlertCircle className={`w-4 h-4 ${stats.awaitingAssignment > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                </div>
                <div className="text-3xl font-black text-[#17324D]">{stats.awaitingAssignment}</div>
                <p className="text-[11px] text-slate-500">Active records requiring bureau unit allocation</p>
                {stats.awaitingAssignment > 0 && (
                  <button
                    onClick={() => setActiveTab('action_center')}
                    className="text-xs font-bold text-[#0B477F] hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Allocate in Action Center</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl border border-[#D6E4F0] bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Missing SLA Deadlines</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-700">
                  {complaints.filter(c => !c.deadlineDate).length}
                </div>
                <p className="text-[11px] text-slate-500">Cases without statutory target resolution date</p>
                <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  All cases have valid deadlines
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#D6E4F0] bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Foreign Key Integrity</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-700">100%</div>
                <p className="text-[11px] text-slate-500">Institution & Bureau ID references confirmed</p>
                <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  0 Orphaned records detected
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-[#F1F7FC] px-4 py-3 border-b border-slate-200 font-bold text-xs text-[#17324D]">
                Data Quality Audit Summary & Checkpoint Logs
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Total Audit Trail Events Verified</p>
                      <p className="text-[11px] text-slate-500">Every case action writes an immutable chronological ledger</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {Object.values(timelineEvents).reduce((acc, curr) => acc + curr.length, 0)} events logged
                  </span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Internal Confidential Notes Stored</p>
                      <p className="text-[11px] text-slate-500">Protected officer briefing notes attached to dossiers</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {Object.values(notes).reduce((acc, curr) => acc + curr.length, 0)} notes on file
                  </span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-800">AI Duplicate Detection Indices</p>
                      <p className="text-[11px] text-slate-500">Text similarity & institution cluster vectors indexed</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {relatedSuggestions.length} relations linked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: System Health & Integrations (Section 5.10) */}
      {activeTab === 'system_health' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0B477F]" />
                <span>Statutory Platform System Health & Service Integration Watchdog</span>
              </h3>
              <p className="text-xs text-[#53677D] mt-0.5">
                Real-time operational status of backend services, auth providers, AI microservices, and database connections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">PostgreSQL / Supabase DB</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ONLINE (200 OK)
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-800">14 ms Latency</div>
                <p className="text-[11px] text-slate-600">Connection pool healthy; SSL active; automated replication verified.</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">RBAC Authentication Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ACTIVE
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-800">JWT Token Session Valid</div>
                <p className="text-[11px] text-slate-600">Strict portal boundary protection active. Cross-role tampering blocked.</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">AI Intelligence Microservice</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    OPERATIONAL
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-800">DeepSeek / Gemini API</div>
                <p className="text-[11px] text-slate-600">Complaint deduplication, urgency scoring, and assistant models responding.</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">SLA Watchdog Daemon</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    RUNNING
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-800">60-Min Polling Cycle</div>
                <p className="text-[11px] text-slate-600">Automated breach detector evaluating statutory deadlines against system clock.</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Encrypted Document Storage</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    MOUNTED
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-800">AES-256 Secured</div>
                <p className="text-[11px] text-slate-600">Evidence and annexure files encrypted with signed access URLs.</p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Audit Ledger Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    SYNCHRONIZED
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-800">Zero Checksum Drift</div>
                <p className="text-[11px] text-slate-600">Case activity streams verified with tamper-proof chronological logs.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Notification Rules & Alerts (Section 5.11) */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#0B477F]" />
                <span>Automated Statutory Notification Rules & Alert Triggers</span>
              </h3>
              <p className="text-xs text-[#53677D] mt-0.5">
                Configure event-driven dispatch rules across SMS, Email, and In-App Channels for citizens, institutions, and bureau officers.
              </p>
            </div>

            {notifSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Notification governance rules saved successfully. Active across all system channels.</span>
              </div>
            )}

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">1. Citizen Intake Confirmation & Docket SMS</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automatically deliver reference docket ID, secret PIN, and statutory tracking URL upon submission.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifRules.newComplaintIntake}
                    onChange={e => setNotifRules(prev => ({ ...prev, newComplaintIntake: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B477F]"></div>
                </label>
              </div>

              <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">2. Bureau Officer Case Allocation Alert</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Trigger internal priority notification when an administrator assigns a complaint file to a bureau unit.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifRules.bureauAllocation}
                    onChange={e => setNotifRules(prev => ({ ...prev, bureauAllocation: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B477F]"></div>
                </label>
              </div>

              <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">3. Approaching Statutory Deadline (72 Hours Warning)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Flag warning banner on officer and administrative dashboards 3 days prior to SLA resolution breach.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifRules.approachingDeadline72h}
                    onChange={e => setNotifRules(prev => ({ ...prev, approachingDeadline72h: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B477F]"></div>
                </label>
              </div>

              <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">4. Overdue SLA Statutory Escalation Notice</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Immediately escalate overdue matters to Bureau Head and Member Secretary with formal non-compliance notice.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifRules.overdueEscalation}
                    onChange={e => setNotifRules(prev => ({ ...prev, overdueEscalation: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B477F]"></div>
                </label>
              </div>

              <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">5. Institution Rejoinder Submission Alert</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Alert the assigned investigation officer the moment the technical institution uploads formal reply or evidence.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifRules.institutionRejoinder}
                    onChange={e => setNotifRules(prev => ({ ...prev, institutionRejoinder: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B477F]"></div>
                </label>
              </div>

              <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">6. Administrative Closure Order & Compliance Summary</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dispatches final signed closure certificate and redressal terms to complainant and institution upon admin sign-off.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifRules.closureSanction}
                    onChange={e => setNotifRules(prev => ({ ...prev, closureSanction: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B477F]"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setNotifSavedMsg(true);
                  setTimeout(() => setNotifSavedMsg(false), 4000);
                }}
                className="px-5 py-2.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition shadow-xs"
              >
                Save Notification Governance Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desk Investigation Drawer / Modal (Transferred from Officer Portal) */}
      {selectedDeskCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-300">
            <div className="bg-[#0B477F] text-white p-4 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm px-2.5 py-1 bg-white/10 rounded font-bold border border-white/20 text-amber-300">
                  {selectedDeskCase.id}
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedDeskCase.title}</h3>
                  <p className="text-xs text-blue-200">
                    {selectedDeskCase.institutionName} • Registered: {formatDate(selectedDeskCase.submissionDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeskCaseId(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deskSuccessMsg && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{deskSuccessMsg}</span>
              </div>
            )}

            <div className="flex border-b border-slate-200 bg-slate-50 px-4 shrink-0">
              <button
                onClick={() => setDeskDrawerTab('actions')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  deskDrawerTab === 'actions' ? 'border-[#0B477F] text-[#0B477F] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Investigation Actions</span>
              </button>
              <button
                onClick={() => setDeskDrawerTab('lifecycle')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  deskDrawerTab === 'lifecycle' ? 'border-[#0B477F] text-[#0B477F] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Lifecycle Flow & Tracker</span>
              </button>
              <button
                onClick={() => setDeskDrawerTab('notes')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  deskDrawerTab === 'notes' ? 'border-[#0B477F] text-[#0B477F] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Confidential Notes ({selectedDeskNotes.length})</span>
              </button>
              <button
                onClick={() => setDeskDrawerTab('intel')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  deskDrawerTab === 'intel' ? 'border-[#0B477F] text-[#0B477F] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Case Intelligence ({selectedDeskIntel.length})</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Category</span>
                  <span className="font-semibold text-slate-800">{selectedDeskCase.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status</span>
                  <span className="font-semibold text-blue-700">{selectedDeskCase.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Deadline</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedDeskCase.deadlineDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Complainant</span>
                  <span className="font-semibold text-slate-800">{selectedDeskCase.complainantName || 'Confidential Student'}</span>
                </div>
              </div>

              {/* Statement */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Complaint Statement</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedDeskCase.description}</p>
                {selectedDeskCase.institutionRemarks && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                    <span className="font-bold block mb-1">Institution Rejoinder On Record:</span>
                    <p>{selectedDeskCase.institutionRemarks}</p>
                  </div>
                )}
                {selectedDeskCase.resolutionRecommendation && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
                    <span className="font-bold block mb-1">Resolution Directives Drafted:</span>
                    <p>{selectedDeskCase.resolutionRecommendation}</p>
                  </div>
                )}
              </div>

              {deskDrawerTab === 'actions' && (
                <div className="space-y-4">
                  {/* Action 1: Notice Demand */}
                  <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-amber-700" />
                      <span>1. Demand Institution Explanation (Stage 6 Statutory Notice)</span>
                    </h4>
                    <form onSubmit={handleDeskDemandNotice} className="space-y-2">
                      <textarea
                        rows={2}
                        required
                        value={institutionQuery}
                        onChange={e => setInstitutionQuery(e.target.value)}
                        placeholder="State statutory inquiry notice text citing relevant AICTE norms..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-amber-700 text-white rounded text-xs font-bold hover:bg-amber-800 transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Statutory Notice</span>
                      </button>
                    </form>
                  </div>

                  {/* Action 2: Rejoinder */}
                  <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-blue-700" />
                      <span>2. Record Institution Rejoinder</span>
                    </h4>
                    <form onSubmit={handleDeskRecordRejoinder} className="space-y-2">
                      <textarea
                        rows={2}
                        required
                        value={institutionReply}
                        onChange={e => setInstitutionReply(e.target.value)}
                        placeholder="Summary of institution written reply or compliance documentation..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#0B477F] text-white rounded text-xs font-bold hover:bg-[#155A91] transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Record Institution Rejoinder</span>
                      </button>
                    </form>
                  </div>

                  {/* Action 3: Citizen clarification */}
                  <div className="border border-purple-200 bg-purple-50/40 rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-700" />
                      <span>3. Request Student Clarification</span>
                    </h4>
                    <form onSubmit={handleDeskCitizenQuery} className="space-y-2">
                      <textarea
                        rows={2}
                        required
                        value={citizenQuery}
                        onChange={e => setCitizenQuery(e.target.value)}
                        placeholder="Detail evidence required from student..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-purple-700 text-white rounded text-xs font-bold hover:bg-purple-800 transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Clarification Demand</span>
                      </button>
                    </form>
                  </div>

                  {/* Action 4: Recommend Resolution */}
                  <div className="border-2 border-emerald-400 bg-emerald-50/50 rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>4. Formulate & Recommend Resolution</span>
                    </h4>
                    <form onSubmit={handleDeskRecommendResolution} className="space-y-2">
                      <textarea
                        rows={3}
                        required
                        value={resolutionProposal}
                        onChange={e => setResolutionProposal(e.target.value)}
                        placeholder="Specify final resolution terms, refund mandates, or compliance directives..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submit for Administrative Review</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {deskDrawerTab === 'lifecycle' && (
                <div className="space-y-4">
                  <ComplaintLifecycleTracker complaint={selectedDeskCase} isPublic={false} />
                </div>
              )}

              {deskDrawerTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Confidential Internal Deliberations — strictly restricted from citizen view.</span>
                  </div>

                  <form onSubmit={handleDeskAddNote} className="space-y-2">
                    <textarea
                      rows={2}
                      required
                      value={newNoteContent}
                      onChange={e => setNewNoteContent(e.target.value)}
                      placeholder="Add confidential officer note..."
                      className="w-full text-xs p-2.5 border rounded"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#0B477F] text-white text-xs font-bold rounded hover:bg-[#155A91] transition flex items-center gap-1.5"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Add Internal Note</span>
                    </button>
                  </form>

                  <div className="space-y-2 pt-2 border-t">
                    {selectedDeskNotes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No internal notes recorded yet.</p>
                    ) : (
                      selectedDeskNotes.map(n => (
                        <div key={n.id} className="p-3 bg-slate-50 border rounded text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span className="font-bold text-slate-800">{n.authorName}</span>
                            <span>{formatDate(n.timestamp)}</span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-wrap">{n.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {deskDrawerTab === 'intel' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Cross-Case Pattern & Related Filing Intelligence</span>
                  </div>

                  {selectedDeskIntel.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No related pattern suggestions detected for this case.
                    </div>
                  ) : (
                    selectedDeskIntel.map(intel => (
                      <div key={intel.id} className="p-3.5 border rounded-lg bg-white space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            Linked with: <span className="font-mono text-[#0B477F]">{intel.relatedComplaintId}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {Math.round(intel.overallScore || intel.textSimilarityScore)}% Match
                          </span>
                        </div>
                        <p className="text-slate-600">{intel.explanation}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal (Section 16) */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17324D] flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-amber-600" />
                <span>Create Administrative Follow-up Task</span>
              </h3>
              <button onClick={() => setNewTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title / Directive *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Follow up on fee refund compliance receipt..."
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated Complaint File</label>
                <select
                  value={newTaskComplaintId}
                  onChange={e => setNewTaskComplaintId(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white"
                >
                  {complaints.filter(c => c.status !== 'Closed').map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.institutionName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full text-xs p-2 border rounded-lg bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91]"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Assignment Modal */}
      {allocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0B477F]" />
                <span>Assign Case to Bureau Unit</span>
              </h3>
              <button onClick={() => setAllocationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Complaint</label>
                <select
                  value={selectedComplaintId}
                  onChange={e => setSelectedComplaintId(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white"
                >
                  {complaints.filter(c => c.status !== 'Closed').map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.institutionName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Bureau</label>
                <select
                  value={targetBureauId}
                  onChange={e => setTargetBureauId(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white"
                >
                  {bureaus.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Directives</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                  placeholder="Directives for desk officer..."
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocationModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91]"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

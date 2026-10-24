import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { INITIAL_USERS } from '../../data/seedData';
import { getCaseAgeInDays } from '../../utils/dateUtils';
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
  UserPlus
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
    users,
    addUser,
    auditLogs,
    settings,
    updateSettings,
    updateComplaintDeadline
  } = useCaseTrack();

  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'supervision' | 'analytics' | 'users' | 'sla'>('overview');

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

  // Analytics CSV Export State
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const today = '2026-10-23';

  // 1. Summary Cards (Total, Unassigned, Open, Overdue, Resolved)
  const stats = useMemo(() => {
    const total = complaints.length;
    const newlyRegistered = complaints.filter(c => c.status === 'Open').length;
    const awaitingVerification = complaints.filter(
      c => !c.verificationStatus || c.verificationStatus === 'Pending' || c.verificationStatus === 'Needs Information'
    ).length;
    const awaitingAssignment = complaints.filter(c => !c.bureauId || !c.assignedOfficerId).length;
    const assigned = complaints.filter(c => Boolean(c.bureauId && c.assignedOfficerId)).length;
    const underReview = complaints.filter(c => c.status === 'Under Review').length;
    const awaitingInstitutionResponse = complaints.filter(
      c => c.status === 'Awaiting Institution Response' || c.institutionResponseRequested
    ).length;
    const awaitingAction = complaints.filter(c => c.status === 'Action & Investigation' || c.status === 'Escalated').length;
    const highPriority = complaints.filter(
      c => (c.priority === 'High' || c.priority === 'Critical' || c.priority === 'Urgent') && c.status !== 'Closed'
    ).length;
    const overdue = complaints.filter(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      return c.deadlineDate && c.deadlineDate < today;
    }).length;
    const resolutionRecommended = complaints.filter(c => c.status === 'Resolution Recommended').length;
    const awaitingClosureReview = complaints.filter(
      c => c.status === 'Awaiting Closure Review' || (c.status === 'Resolved' && !c.closureApprovedBy)
    ).length;
    const closed = complaints.filter(c => c.status === 'Closed').length;
    const reopened = complaints.filter(c => c.isReopened || c.status === 'Reopened').length;

    return {
      total,
      newlyRegistered,
      awaitingVerification,
      awaitingAssignment,
      assigned,
      underReview,
      awaitingInstitutionResponse,
      awaitingAction,
      highPriority,
      overdue,
      resolutionRecommended,
      awaitingClosureReview,
      closed,
      reopened
    };
  }, [complaints, today]);

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

      return {
        ...b,
        total,
        active,
        overdue,
        resolved
      };
    });
  }, [bureaus, complaints, today]);

  // Case Ageing metrics
  const ageingBuckets = useMemo(() => {
    const todayMs = new Date('2026-10-23T00:00:00Z').getTime();
    let less7 = 0;
    let b8to15 = 0;
    let b16to30 = 0;
    let over30 = 0;

    complaints.forEach(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return;
      const subTime = new Date(`${c.submissionDate}T00:00:00Z`).getTime();
      const ageDays = Math.max(0, Math.floor((todayMs - subTime) / (1000 * 60 * 60 * 24)));

      if (ageDays <= 7) less7++;
      else if (ageDays <= 15) b8to15++;
      else if (ageDays <= 30) b16to30++;
      else over30++;
    });

    return { less7, b8to15, b16to30, over30 };
  }, [complaints]);

  // 2. Verification Queue
  const verificationQueue = useMemo(() => {
    return complaints.filter(c => !c.verificationStatus || c.verificationStatus === 'Pending' || c.verificationStatus === 'Needs Information');
  }, [complaints]);

  const activeVerifyCase = useMemo(() => {
    if (!selectedVerifyCaseId) return verificationQueue[0] || null;
    return complaints.find(c => c.id === selectedVerifyCaseId) || verificationQueue[0] || null;
  }, [selectedVerifyCaseId, verificationQueue, complaints]);

  const matchedInstitutionForVerify = useMemo(() => {
    if (!activeVerifyCase) return null;
    return institutions.find(
      inst =>
        inst.id === activeVerifyCase.institutionId ||
        (inst.code && activeVerifyCase.institutionCode && inst.code.toLowerCase() === activeVerifyCase.institutionCode.toLowerCase())
    );
  }, [activeVerifyCase, institutions]);

  // 3. Closure Review Queue
  const closureQueue = useMemo(() => {
    return complaints.filter(c => c.status === 'Resolved' || c.status === 'Escalated');
  }, [complaints]);

  const activeSupervisoryCase = useMemo(() => {
    if (!selectedSupervisoryCaseId) return closureQueue[0] || null;
    return complaints.find(c => c.id === selectedSupervisoryCaseId) || closureQueue[0] || null;
  }, [selectedSupervisoryCaseId, closureQueue, complaints]);

  // 4. Analytics Data
  const resolvedCases = useMemo(() => {
    return complaints.filter(c => (c.status === 'Resolved' || c.status === 'Closed') && c.resolvedDate);
  }, [complaints]);

  const avgResolutionDays = useMemo(() => {
    if (resolvedCases.length === 0) return 0;
    const totalDays = resolvedCases.reduce((acc, c) => acc + getCaseAgeInDays(c.submissionDate, c.resolvedDate), 0);
    return Math.round(totalDays / resolvedCases.length);
  }, [resolvedCases]);

  const bureauChartData = useMemo(() => {
    return bureaus.map(b => {
      const bCases = complaints.filter(c => c.bureauId === b.id);
      return {
        name: b.shortName || b.name,
        Active: bCases.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length,
        Resolved: bCases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
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
      .filter(i => i.count >= 3)
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  // Handlers
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_Administration_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B477F] text-xs font-bold border border-blue-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administration Portal • Central Control & Governance</span>
          </div>
          <h1 className="text-2xl font-black text-[#17324D]">
            AICTE CaseTrack Administration Dashboard
          </h1>
          <p className="text-xs text-[#53677D] mt-1">
            Logged in as: <strong className="text-[#17324D]">{currentUser.name}</strong> ({currentUser.designation})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
          <Link
            to="/audit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#D6E4F0] text-[#17324D] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-[#0B477F]" />
            <span>Audit History</span>
          </Link>
        </div>
      </div>

      {/* 13 Clickable KPI Cards Matching Section 2.1 */}
      {complaints.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-[#D6E4F0]">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#17324D]">No Complaint Records in Registry</h3>
          <p className="text-xs text-[#53677D] mt-1">Submit a complaint via the Public Portal or reset sample data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {[
            { label: 'Total Complaints', count: stats.total, sub: 'All council records', link: '/registry', icon: Inbox, color: 'text-[#0B477F]', bg: 'bg-[#E5F1FC]' },
            { label: 'Newly Registered', count: stats.newlyRegistered, sub: 'Intake Stage 1', link: '/registry?status=Open', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Awaiting Verification', count: stats.awaitingVerification, sub: 'Scrutiny Stage 2', link: '/registry?filter=awaiting_verification', icon: FileCheck2, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Awaiting Assignment', count: stats.awaitingAssignment, sub: 'Allocation Stage 3', link: '/registry?filter=unassigned', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Assigned Complaints', count: stats.assigned, sub: 'Active with Officer', link: '/registry?filter=assigned', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Under Review', count: stats.underReview, sub: 'Inquiry Stage 5', link: '/registry?status=Under%20Review', icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Awaiting Inst. Response', count: stats.awaitingInstitutionResponse, sub: 'Notice Stage 6', link: '/registry?filter=institution_response', icon: Building, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Awaiting Admin Action', count: stats.awaitingAction, sub: 'Hearing & Committee', link: '/registry?filter=action', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'High-Priority Complaints', count: stats.highPriority, sub: 'Immediate attention', link: '/registry?priority=High', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Overdue Complaints', count: stats.overdue, sub: 'SLA Exceeded', link: '/registry?overdue=true', icon: AlertTriangle, color: 'text-[#C43D3D]', bg: 'bg-rose-100' },
            { label: 'Resolution Recommended', count: stats.resolutionRecommended, sub: 'Findings concluded', link: '/registry?filter=resolution_recommended', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Awaiting Closure Review', count: stats.awaitingClosureReview, sub: 'Final Sanction', link: '/registry?filter=closure_review', icon: ShieldCheck, color: 'text-amber-700', bg: 'bg-amber-100' },
            { label: 'Closed Complaints', count: stats.closed, sub: 'Disposed & archived', link: '/registry?status=Closed', icon: Check, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'Reopened Complaints', count: stats.reopened, sub: 'Review mandated', link: '/registry?filter=reopened', icon: RotateCcw, color: 'text-amber-800', bg: 'bg-amber-100' }
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(kpi.link)}
                className="bg-white rounded-xl border border-[#D6E4F0] p-3.5 shadow-xs hover:border-[#0B477F] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#53677D]">
                  <span className="line-clamp-1 group-hover:text-[#0B477F] transition-colors">{kpi.label}</span>
                  <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-2xl font-black ${kpi.color}`}>{kpi.count}</span>
                  <span className="text-[10px] text-[#53677D] block mt-0.5 line-clamp-1">{kpi.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Primary Administration Navigation Tabs (Consolidates Verification, Supervision, Analytics & Users) */}
      <div className="border-b border-[#D6E4F0] flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bureau Workload & Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'verification'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-amber-600" />
          <span>Document Verification & Scrutiny ({verificationQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supervision')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'supervision'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Eye className="w-4 h-4 text-purple-600" />
          <span>Closure Approvals & Escalations ({closureQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-teal-600" />
          <span>Executive Analytics & Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Staff Accounts & Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'sla'
              ? 'border-[#0B477F] text-[#0B477F] bg-white shadow-xs'
              : 'border-transparent text-[#53677D] hover:text-[#17324D]'
          }`}
        >
          <Clock className="w-4 h-4 text-orange-600" />
          <span>Priority & SLA Governance</span>
        </button>
      </div>

      {/* TAB 1: Operational Overview & Bureau Workload */}
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
                    <th className="py-2.5 px-4 font-bold">Head of Cell</th>
                    <th className="py-2.5 px-3 font-bold text-center">Total Cases</th>
                    <th className="py-2.5 px-3 font-bold text-center">Active</th>
                    <th className="py-2.5 px-3 font-bold text-center text-red-600">Overdue</th>
                    <th className="py-2.5 px-3 font-bold text-center text-emerald-600">Resolved</th>
                    <th className="py-2.5 px-4 font-bold">Capacity Load</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6E4F0]">
                  {bureauWorkload.map(b => {
                    const loadPercentage = Math.min(100, Math.round((b.active / 10) * 100));

                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#17324D]">{b.name}</p>
                          <p className="text-[11px] text-[#53677D] font-mono">{b.code}</p>
                        </td>
                        <td className="py-3 px-4 text-[#53677D]">{b.officerInCharge}</td>
                        <td className="py-3 px-3 text-center font-bold text-[#17324D]">{b.total}</td>
                        <td className="py-3 px-3 text-center font-bold text-blue-700">{b.active}</td>
                        <td className="py-3 px-3 text-center font-bold text-red-600">{b.overdue}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600">{b.resolved}</td>
                        <td className="py-3 px-4 w-44">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${
                                  loadPercentage > 75 ? 'bg-red-500' : loadPercentage > 45 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${loadPercentage}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-[#53677D] w-8">
                              {loadPercentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Case Ageing Buckets + User Directory */}
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
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">&le; 7 Days (Fresh Intake)</p>
                    <p className="text-[11px] text-emerald-700">Within preliminary inquiry phase</p>
                  </div>
                  <span className="text-lg font-black text-emerald-800">{ageingBuckets.less7}</span>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-900">8 &ndash; 15 Days (Active Review)</p>
                    <p className="text-[11px] text-blue-700">Institution explanation sought</p>
                  </div>
                  <span className="text-lg font-black text-blue-800">{ageingBuckets.b8to15}</span>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900">16 &ndash; 30 Days (Approaching SLA)</p>
                    <p className="text-[11px] text-amber-700">Priority follow-up mandated</p>
                  </div>
                  <span className="text-lg font-black text-amber-800">{ageingBuckets.b16to30}</span>
                </div>

                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-red-900">&gt; 30 Days (Critical Overdue)</p>
                    <p className="text-[11px] text-red-700">Subject to supervisory escalation</p>
                  </div>
                  <span className="text-lg font-black text-red-800">{ageingBuckets.over30}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0B477F]" />
                    <span>Authorized System Users & Access Privileges</span>
                  </h2>
                  <p className="text-xs text-[#53677D]">
                    Active personnel accounts across AICTE cells.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-[#F1F7FC] text-[#0B477F] rounded border border-[#D6E4F0]">
                  {INITIAL_USERS.length} Accounts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1F7FC] text-[#17324D] border-y border-[#D6E4F0]">
                      <th className="py-2 px-3 font-bold">Officer / User</th>
                      <th className="py-2 px-3 font-bold">Role</th>
                      <th className="py-2 px-3 font-bold">Assigned Cell</th>
                      <th className="py-2 px-3 font-bold">Contact Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6E4F0]">
                    {INITIAL_USERS.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-[#17324D]">{user.name}</p>
                          <p className="text-[11px] text-[#53677D]">{user.designation}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#0B477F] border border-slate-200">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#53677D]">
                          {user.bureauName || 'Central / Citizen'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#53677D]">
                          {user.email}
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

      {/* TAB 2: Document Scrutiny & Verification (Consolidated from Verification Staff) */}
      {activeTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          {/* Left 2 Cols: Queue */}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0B477F]">{c.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              vStatus === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : vStatus === 'Needs Information'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {vStatus}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#53677D]">Docketed: {c.submissionDate}</span>
                      </div>

                      <h4 className="text-sm font-bold text-[#17324D] mb-1 line-clamp-1">{c.title}</h4>

                      <div className="flex items-center gap-2 text-xs text-[#53677D]">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{c.institutionName}</span>
                        {c.institutionCode && (
                          <span className="font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-[#D6E4F0]">
                            {c.institutionCode}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Scrutiny Controls */}
          <div>
            {activeVerifyCase ? (
              <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm sticky top-6 space-y-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[#0B477F]">{activeVerifyCase.id}</span>
                  <h4 className="text-sm font-bold text-[#17324D] mt-1">{activeVerifyCase.title}</h4>
                  <p className="text-xs text-[#53677D] mt-1">{activeVerifyCase.institutionName}</p>
                </div>

                {verifySuccessMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{verifySuccessMsg}</span>
                  </div>
                )}

                {/* Institution Registry Check */}
                <div className="bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#53677D]">AICTE Directory Code:</span>
                    <strong className="font-mono text-[#0B477F]">{activeVerifyCase.institutionCode || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#53677D]">Approval Validity:</span>
                    {matchedInstitutionForVerify ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved Technical Institute
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Unverified Code
                      </span>
                    )}
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#0B477F]" />
                    <span>Complainant bonafide details provided</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#0B477F]" />
                    <span>Prima facie AICTE jurisdiction confirmed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#0B477F]" />
                    <span>Sufficient factual description provided</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Scrutiny Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={verifyRemarks}
                    onChange={(e) => setVerifyRemarks(e.target.value)}
                    placeholder="Enter verification directive or defect notes..."
                    className="w-full text-xs p-2 rounded-lg border border-[#D6E4F0] focus:ring-1 focus:ring-[#0B477F] focus:outline-none"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-[#D6E4F0]">
                  <button
                    type="button"
                    onClick={() => handleVerifyAction('Verified')}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Verified & Advance to Bureau Assignment</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerifyAction('Needs Information')}
                      className="py-2 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Needs Info</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyAction('Flagged')}
                      className="py-2 px-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Flag Defect</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#53677D] text-center p-6 bg-white rounded-xl border border-[#D6E4F0]">
                All intake cases verified.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Closure Approvals & Escalations (Consolidated from Supervisor) */}
      {activeTab === 'supervision' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          {/* Left 2 Cols: Closure & Escalation Queue */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#17324D]">
                    Appellate Closure Sign-Off & Escalation Desk
                  </h3>
                  <p className="text-xs text-[#53677D]">
                    Review proposed case resolutions submitted by handling officers, confirm final closure, or remand for inquiry.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-800 rounded border border-purple-200">
                  {closureQueue.length} Cases
                </span>
              </div>

              <div className="space-y-3">
                {closureQueue.map(c => {
                  const isSelected = activeSupervisoryCase?.id === c.id;
                  const isApproved = Boolean(c.closureApprovedBy);

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedSupervisoryCaseId(c.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0B477F] bg-[#F1F7FC] ring-1 ring-[#0B477F] shadow-sm'
                          : 'border-[#D6E4F0] bg-white hover:border-[#155A91] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0B477F]">{c.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-[#17324D]">
                            {c.bureauName}
                          </span>
                          {c.status === 'Resolved' && !isApproved && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                              Awaiting Closure Sign-off
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Closed & Signed
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#53677D]">Status: {c.status}</span>
                      </div>

                      <h4 className="text-sm font-bold text-[#17324D] mb-1 line-clamp-1">{c.title}</h4>

                      {c.resolutionSummary && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 mt-2">
                          <strong>Resolution Summary:</strong> {c.resolutionSummary}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Supervisory Actions */}
          <div>
            {activeSupervisoryCase ? (
              <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm sticky top-6 space-y-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[#0B477F]">{activeSupervisoryCase.id}</span>
                  <h4 className="text-sm font-bold text-[#17324D] mt-1">{activeSupervisoryCase.title}</h4>
                  <p className="text-xs text-[#53677D] mt-1">{activeSupervisoryCase.institutionName}</p>
                </div>

                {supervisorySuccessMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{supervisorySuccessMsg}</span>
                  </div>
                )}

                <div className="bg-[#F1F7FC] rounded-lg p-3 text-xs space-y-1 text-[#53677D]">
                  <div><strong>Handling Officer:</strong> {activeSupervisoryCase.assignedOfficerName || 'N/A'}</div>
                  <div><strong>Bureau:</strong> {activeSupervisoryCase.bureauName}</div>
                  <div><strong>Category:</strong> {activeSupervisoryCase.category}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Supervisory Order / Rationale
                  </label>
                  <textarea
                    rows={3}
                    value={supervisoryNotes}
                    onChange={(e) => setSupervisoryNotes(e.target.value)}
                    placeholder="Enter compliance sign-off rationale or remand directives..."
                    className="w-full text-xs p-2 rounded-lg border border-[#D6E4F0] focus:ring-1 focus:ring-[#0B477F] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#D6E4F0]">
                  <button
                    type="button"
                    onClick={() => handleClosureAction(true)}
                    className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Closure</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClosureAction(false)}
                    className="py-2.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Remand Case</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      reopenComplaint(activeSupervisoryCase.id, supervisoryNotes || 'Reopened by administrative authority');
                      setSupervisorySuccessMsg(`Case ${activeSupervisoryCase.id} successfully reopened.`);
                      setTimeout(() => setSupervisorySuccessMsg(null), 3000);
                    }}
                    className="py-2.5 px-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reopen Case</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#53677D] text-center p-6 bg-white rounded-xl border border-[#D6E4F0]">
                No cases awaiting closure.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Executive Analytics & Reports (Consolidated from Management User) */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F1F7FC] p-4 rounded-xl border border-[#D6E4F0]">
            <div>
              <h3 className="text-sm font-bold text-[#17324D]">
                Integrated Complaint Intelligence & Macro Analytics
              </h3>
              <p className="text-xs text-[#53677D]">
                Statistical benchmarks, bureau turnaround metrics, and chronic institutional pattern detection.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition-all shadow-sm shrink-0"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Report Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Analytics CSV</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
              <span className="text-xs font-bold text-[#53677D] uppercase">Average Turnaround Time</span>
              <p className="text-2xl font-black text-blue-700 mt-1">{avgResolutionDays} Days</p>
              <p className="text-[11px] text-[#53677D]">Calculated strictly from resolved complaints</p>
            </div>
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
              <span className="text-xs font-bold text-[#53677D] uppercase">Overall Clearance Rate</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {Math.round((resolvedCases.length / complaints.length) * 100)}%
              </p>
              <p className="text-[11px] text-[#53677D]">{resolvedCases.length} of {complaints.length} cases closed</p>
            </div>
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
              <span className="text-xs font-bold text-[#53677D] uppercase">Chronic Institution Clusters</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{chronicInstitutions.length}</p>
              <p className="text-[11px] text-[#53677D]">Institutions with &ge; 3 repeat grievances</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#17324D] mb-1">Bureau Active vs. Resolved Distribution</h4>
              <p className="text-xs text-[#53677D] mb-4">Clearance efficiency across AICTE specialized cells.</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bureauChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5F1FC" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#53677D' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10, fill: '#53677D' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#D6E4F0', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Active" fill="#155A91" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Resolved" fill="#237A50" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#17324D] mb-1">Complaint Category Breakdown</h4>
              <p className="text-xs text-[#53677D] mb-4">Distribution of grievance themes across institutions.</p>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#D6E4F0', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Staff Accounts & User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F1F7FC] p-4 rounded-xl border border-[#D6E4F0]">
            <div>
              <h3 className="text-sm font-bold text-[#17324D] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0B477F]" />
                <span>AICTE Staff Directory & Role Allocations</span>
              </h3>
              <p className="text-xs text-[#53677D] mt-0.5">
                Manage council officer accounts, RBAC clearances, and bureau assignments without bypassing authentication.
              </p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded bg-white text-[#0B477F] border border-[#D6E4F0]">
              {users.length} Active Accounts
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Staff Users Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#17324D] mb-3">
                Authorized Personnel Directory
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#D6E4F0] text-[#53677D] font-bold">
                      <th className="py-2.5 px-3">Officer Name</th>
                      <th className="py-2.5 px-3">Portal Clearance</th>
                      <th className="py-2.5 px-3">Assigned Bureau</th>
                      <th className="py-2.5 px-3">Designation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6E4F0]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-[#17324D]">{u.name}</div>
                          <div className="text-[11px] text-[#53677D] font-mono">{u.email}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'bureau_officer' || u.role === 'officer'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role === 'admin' ? 'Administration' : u.role === 'bureau_officer' || u.role === 'officer' ? 'Bureau Officer' : 'Public'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#53677D]">
                          {u.bureauName || 'Central Council'}
                        </td>
                        <td className="py-2.5 px-3 text-[#17324D] font-medium">
                          {u.designation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Col: Add New Staff Member Form */}
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#17324D] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#0B477F]" />
                <span>Provision Staff Account</span>
              </h4>

              {userCreatedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Account provisioned and RBAC clearance applied!</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#17324D] mb-1">Full Officer Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Dr. Rajeshwari Nair"
                    className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#17324D] mb-1">Official Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. rnair.officer@aicte-demo.gov.in"
                    className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#17324D] mb-1">Portal Clearance Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'bureau_officer')}
                    className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                  >
                    <option value="bureau_officer">Bureau Officer Portal</option>
                    <option value="admin">Administration Portal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#17324D] mb-1">Official Designation</label>
                  <input
                    type="text"
                    required
                    value={newUserDesignation}
                    onChange={(e) => setNewUserDesignation(e.target.value)}
                    placeholder="e.g. Deputy Director (Technical)"
                    className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#17324D] mb-1">Assigned Bureau Cell</label>
                  <select
                    value={newUserBureau}
                    onChange={(e) => setNewUserBureau(e.target.value)}
                    className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                  >
                    {bureaus.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#0B477F] hover:bg-[#064578] text-white rounded-lg font-bold shadow-xs transition-colors mt-2"
                >
                  Create & Authorize Account
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SLA & Priority Governance */}
      {activeTab === 'sla' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Configurable SLA & Redressal Rules */}
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0B477F]" />
                <div>
                  <h3 className="text-base font-bold text-[#17324D]">Statutory SLA & Priority Rules</h3>
                  <p className="text-xs text-[#53677D]">Configure institutional complaint timelines and alert thresholds.</p>
                </div>
              </div>

              {slaSavedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SLA rules successfully updated and synchronized across all bureaus!</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSettings({
                    defaultDeadlineNormal: Number(slaNormal),
                    defaultDeadlineUrgent: Number(slaUrgent),
                    approachingDeadlineDays: Number(approachingDays),
                    overdueEscalationDays: Number(escalationDays),
                    similarityThreshold: Number(similarityThresh)
                  });
                  setSlaSavedMsg(true);
                  setTimeout(() => setSlaSavedMsg(false), 3000);
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#17324D] mb-1">Normal Priority SLA (Days)</label>
                    <input
                      type="number"
                      min={7}
                      max={90}
                      value={slaNormal}
                      onChange={(e) => setSlaNormal(Number(e.target.value))}
                      className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                    />
                    <p className="text-[10px] text-[#53677D] mt-0.5">Standard grievance target</p>
                  </div>
                  <div>
                    <label className="block font-bold text-[#17324D] mb-1">Urgent / Critical SLA (Days)</label>
                    <input
                      type="number"
                      min={3}
                      max={30}
                      value={slaUrgent}
                      onChange={(e) => setSlaUrgent(Number(e.target.value))}
                      className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                    />
                    <p className="text-[10px] text-[#53677D] mt-0.5">High-priority & ragging target</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#17324D] mb-1">Approaching Alert Window (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={approachingDays}
                      onChange={(e) => setApproachingDays(Number(e.target.value))}
                      className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                    />
                    <p className="text-[10px] text-[#53677D] mt-0.5">Warning trigger before deadline</p>
                  </div>
                  <div>
                    <label className="block font-bold text-[#17324D] mb-1">Overdue Escalation Trigger (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={escalationDays}
                      onChange={(e) => setEscalationDays(Number(e.target.value))}
                      className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
                    />
                    <p className="text-[10px] text-[#53677D] mt-0.5">Escalate to Member Secretary</p>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#17324D] mb-1">
                    Related Case Heuristic Threshold ({similarityThresh}%)
                  </label>
                  <input
                    type="range"
                    min={30}
                    max={90}
                    value={similarityThresh}
                    onChange={(e) => setSimilarityThresh(Number(e.target.value))}
                    className="w-full accent-[#0B477F]"
                  />
                  <div className="flex justify-between text-[10px] text-[#53677D]">
                    <span>Broad Match (30%)</span>
                    <span>Standard (55%)</span>
                    <span>Strict Match (90%)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Statutory SLA Rules
                </button>
              </form>
            </div>

            {/* Card 2: Individual Case Deadline Extension Tool */}
            <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-700" />
                <div>
                  <h3 className="text-base font-bold text-[#17324D]">Statutory Deadline Modification</h3>
                  <p className="text-xs text-[#53677D]">Authorize deadline extensions with mandatory regulatory justification.</p>
                </div>
              </div>

              {dlSavedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deadline extension recorded in case history and audit log!</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!dlCaseId || !newDlDate || !dlReason.trim()) return;
                  updateComplaintDeadline(dlCaseId, newDlDate, dlReason.trim());
                  setDlSavedMsg(true);
                  setDlReason('');
                  setTimeout(() => setDlSavedMsg(false), 3500);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-[#17324D] mb-1">Select Active Case Docket</label>
                  <select
                    value={dlCaseId}
                    onChange={(e) => setDlCaseId(e.target.value)}
                    className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none"
                  >
                    {complaints
                      .filter((c) => c.status !== 'Closed')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} - {c.institutionName.slice(0, 30)}... (Current SLA: {c.deadlineDate})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#17324D] mb-1">Revised Target Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDlDate}
                    onChange={(e) => setNewDlDate(e.target.value)}
                    className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#17324D] mb-1">Official Regulatory Reason / Justification *</label>
                  <textarea
                    rows={3}
                    required
                    value={dlReason}
                    onChange={(e) => setDlReason(e.target.value)}
                    placeholder="Enter formal justification (e.g., Awaiting response to AICTE Show-Cause Notice ref AICTE/GRV/2026/88)..."
                    className="w-full p-2 border border-[#D6E4F0] rounded-lg focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Authorize Deadline Extension & Record Audit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {allocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#D6E4F0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0B477F]" />
                <span>Assign Complaint to Bureau & Officer</span>
              </h3>
              <button
                type="button"
                onClick={() => setAllocationModalOpen(false)}
                className="text-[#53677D] hover:text-[#17324D] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {assignSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-800">Case Assigned Successfully!</p>
                <p className="text-xs text-emerald-700">Audit trail updated.</p>
              </div>
            ) : (
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Select Complaint
                  </label>
                  <select
                    value={selectedComplaintId}
                    onChange={(e) => setSelectedComplaintId(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  >
                    <option value="">-- Choose a Complaint --</option>
                    {complaints.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.title.substring(0, 48)}... ({c.bureauName || 'Unassigned'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Target Bureau / Cell
                  </label>
                  <select
                    value={targetBureauId}
                    onChange={(e) => setTargetBureauId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  >
                    {bureaus.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Assigned Handling Officer
                  </label>
                  <select
                    value={targetOfficerId}
                    onChange={(e) => setTargetOfficerId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  >
                    <option value="USR-OFFICER-01">Smt. Sunita Verma (Assistant Director / Grievance Cell)</option>
                    <option value="USR-SUPERVISOR-01">Dr. P. K. Nambiar (Appellate Director / QA Bureau)</option>
                    <option value="USR-ADMIN-01">Shri Arvind Saxena (Nodal Administrator)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Assignment Directives & Statutory Notes
                  </label>
                  <textarea
                    rows={3}
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="Enter handling directions or turnaround mandate..."
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAllocationModalOpen(false)}
                    className="px-4 py-2 border border-[#D6E4F0] rounded-lg text-xs font-semibold text-[#53677D] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B477F] text-white rounded-lg text-xs font-bold hover:bg-[#155A91] shadow-sm"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

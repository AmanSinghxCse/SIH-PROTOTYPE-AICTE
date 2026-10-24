import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Complaint,
  Institution,
  Bureau,
  TimelineEvent,
  ComplaintNote,
  RelatedCaseSuggestion,
  AuditLog,
  SystemSettings,
  ComplaintStatus,
  ProjectMilestone,
  MilestoneStatus,
  LifecycleStage,
  TaskItem,
  ComplaintPriority,
  AssignmentHistoryRecord
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BUREAUS,
  INITIAL_INSTITUTIONS,
  INITIAL_COMPLAINTS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_NOTES,
  INITIAL_RELATED_SUGGESTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_PROJECT_MILESTONES,
  INITIAL_LIFECYCLE_STAGES
} from '../data/seedData';
import { calculateRelatedness } from '../utils/matchingEngine';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'TASK-001',
    complaintId: 'CMP-2026-003',
    complaintTitle: 'Excess Examination & Marksheet Release Fee Demand',
    institutionName: 'Apex Institute of Technology & Management',
    title: 'Urgent: Dispatch reminder notice for delayed refund compliance',
    description: 'Institution deadline expired without submission of refund statement to student.',
    assignedToId: 'USR-OFFICER-01',
    assignedToName: 'Smt. Sunita Verma',
    priority: 'Critical',
    dueDate: '2026-10-24',
    completed: false,
    createdAt: '2026-10-20',
    category: 'Fee Irregularity & Caution Refund'
  },
  {
    id: 'TASK-002',
    complaintId: 'CMP-2026-001',
    complaintTitle: 'Severe Faculty Shortage and Unqualified Instructors in AI Dept',
    institutionName: 'Aryavart Engineering College',
    title: 'Review compliance rejoinder submitted by college administration',
    description: 'Verify faculty appointment letters and AISHE cadre ratios against AICTE Approval Handbook.',
    assignedToId: 'USR-OFFICER-01',
    assignedToName: 'Smt. Sunita Verma',
    priority: 'High',
    dueDate: '2026-10-28',
    completed: false,
    createdAt: '2026-10-21',
    category: 'Academic Administration & Faculty'
  },
  {
    id: 'TASK-003',
    complaintId: 'CMP-2026-004',
    complaintTitle: 'Sub-Standard Laboratory Equipment in Metallurgy Lab',
    institutionName: 'Kalinga Institute of Polytechnic',
    title: 'Schedule on-site expert committee inspection',
    description: 'Coordinate with Regional Office for surprise physical audit of laboratory apparatus.',
    assignedToId: 'USR-ADMIN-01',
    assignedToName: 'Shri Arvind Saxena',
    priority: 'Medium',
    dueDate: '2026-11-05',
    completed: false,
    createdAt: '2026-10-22',
    category: 'Infrastructure & Labs'
  },
  {
    id: 'TASK-004',
    complaintId: 'CMP-2026-002',
    complaintTitle: 'Capitation Fee and Non-Refundable Security Deposit',
    institutionName: 'Kalinga Institute of Polytechnic',
    title: 'Prepare final closure sanction docket for Nodal Sign-off',
    description: 'College has refunded complete caution deposit of Rs 45,000 with student receipt attached.',
    assignedToId: 'USR-OFFICER-01',
    assignedToName: 'Smt. Sunita Verma',
    priority: 'High',
    dueDate: '2026-10-25',
    completed: false,
    createdAt: '2026-10-19',
    category: 'Fee Irregularity & Caution Refund'
  }
];

export type PermissionAction =
  | 'edit_case'
  | 'change_status'
  | 'assign_case'
  | 'verify_case'
  | 'approve_closure'
  | 'review_related'
  | 'manage_settings'
  | 'manage_users'
  | 'view_audit'
  | 'create_complaint'
  | 'view_internal_notes'
  | 'view_all_complaints'
  | 'export_reports';

interface CaseTrackContextType {
  currentUser: User;
  isAuthenticated: boolean;
  activePortal: 'public' | 'admin' | 'bureau_officer';
  login: (email: string, password: string, portal?: 'admin' | 'bureau_officer') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  institutions: Institution[];
  bureaus: Bureau[];
  complaints: Complaint[];
  timelineEvents: Record<string, TimelineEvent[]>;
  notes: Record<string, ComplaintNote[]>;
  relatedSuggestions: RelatedCaseSuggestion[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  reviewedAlertIds: string[];
  milestones: ProjectMilestone[];
  lifecycleStages: LifecycleStage[];
  updateMilestoneStatus: (id: number, newStatus: MilestoneStatus) => void;
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => boolean;
  toggleTask: (taskId: string) => boolean;
  deleteTask: (taskId: string) => boolean;
  bulkAssignComplaints: (complaintIds: string[], bureauId: string, officerId: string, notes?: string) => boolean;
  bulkUpdatePriority: (complaintIds: string[], newPriority: ComplaintPriority, reason: string) => boolean;

  // Actions
  addComplaint: (draft: any) => Complaint | null;
  updateComplaintStatus: (id: string, newStatus: ComplaintStatus, reason: string) => boolean;
  updateVerificationStatus: (id: string, status: 'Verified' | 'Pending' | 'Needs Information' | 'Flagged', remarks: string) => boolean;
  approveCaseClosure: (id: string, approved: boolean, remarks: string) => boolean;
  requestComplainantInfo: (id: string, query: string) => boolean;
  assignComplaint: (id: string, bureauId: string, officerId: string, notes?: string) => boolean;
  editComplaint: (id: string, updates: Partial<Complaint>) => boolean;
  reassignComplaint: (id: string, newBureauId: string, newOfficerId: string, reason: string) => boolean;
  reopenComplaint: (id: string, reason: string) => boolean;
  recommendResolution: (id: string, recommendation: string) => boolean;
  requestInstitutionResponse: (id: string, queryReason: string) => boolean;
  recordInstitutionResponse: (id: string, remarks: string) => boolean;
  updateComplaintDeadline: (id: string, newDeadline: string, reason: string) => boolean;
  users: User[];
  addUser: (newUser: User) => boolean;
  addNote: (complaintId: string, content: string, actionItem?: string, isOfficialAction?: boolean) => boolean;
  confirmRelationship: (suggestionId: string, reviewNotes?: string) => boolean;
  rejectRelationship: (suggestionId: string, reviewNotes?: string) => boolean;
  markAlertReviewed: (alertId: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => boolean;
  resetDemoData: () => void;
  hasPermission: (action: PermissionAction) => boolean;
}

const CaseTrackContext = createContext<CaseTrackContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'aicte_casetrack_v3_';

export const CaseTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session check
  const [session, setSession] = useState<{ userId: string; email: string; role: UserRole; portal: 'public' | 'admin' | 'bureau_officer' } | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth_session`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = Boolean(session);

  // Current user state
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (session) {
      const found = INITIAL_USERS.find(
        u => u.id === session.userId || u.email.toLowerCase() === session.email.toLowerCase()
      );
      if (found) return found;
    }
    return INITIAL_USERS[0]; // Public Ananya Sharma by default
  });

  const activePortal: 'public' | 'admin' | 'bureau_officer' = session
    ? session.portal
    : currentUser.role === 'admin'
    ? 'admin'
    : currentUser.role === 'bureau_officer' || currentUser.role === 'officer'
    ? 'bureau_officer'
    : 'public';

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}complaints`);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  // Institutions & Bureaus
  const [institutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [bureaus] = useState<Bureau[]>(INITIAL_BUREAUS);

  // Timeline events
  const [timelineEvents, setTimelineEvents] = useState<Record<string, TimelineEvent[]>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}timeline`);
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE_EVENTS;
  });

  // Notes
  const [notes, setNotes] = useState<Record<string, ComplaintNote[]>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notes`);
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  // Related suggestions
  const [relatedSuggestions, setRelatedSuggestions] = useState<RelatedCaseSuggestion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}suggestions`);
    return saved ? JSON.parse(saved) : INITIAL_RELATED_SUGGESTIONS;
  });

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Reviewed alert IDs
  const [reviewedAlertIds, setReviewedAlertIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reviewed_alerts`);
    return saved ? JSON.parse(saved) : [];
  });

  // Settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  // Project Milestones
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}milestones`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECT_MILESTONES;
  });

  // Lifecycle Stages
  const [lifecycleStages] = useState<LifecycleStage[]>(INITIAL_LIFECYCLE_STAGES);

  // Users for Administration Staff Management
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}complaints`, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}timeline`, JSON.stringify(timelineEvents));
  }, [timelineEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notes`, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}suggestions`, JSON.stringify(relatedSuggestions));
  }, [relatedSuggestions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reviewed_alerts`, JSON.stringify(reviewedAlertIds));
  }, [reviewedAlertIds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}milestones`, JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  const updateMilestoneStatus = (id: number, newStatus: MilestoneStatus) => {
    setMilestones(prev =>
      prev.map(m =>
        m.id === id ? { ...m, status: newStatus, lastUpdated: '2026-10-23' } : m
      )
    );
    addAuditLogEntry({
      action: 'Project Milestone Status Updated',
      entityType: 'ProjectMilestone',
      entityId: `MILESTONE-${id}`,
      details: `Milestone #${id} status updated to ${newStatus}`,
      newValue: newStatus
    });
  };

  // Role permissions checker
  const hasPermission = (action: PermissionAction): boolean => {
    const role = currentUser.role;
    const isAdmin = role === 'admin';
    const isOfficer = role === 'bureau_officer' || role === 'officer';

    switch (action) {
      case 'manage_settings':
      case 'manage_users':
      case 'assign_case':
      case 'verify_case':
      case 'approve_closure':
      case 'view_audit':
      case 'export_reports':
        return isAuthenticated && isAdmin;

      case 'change_status':
      case 'edit_case':
      case 'review_related':
      case 'view_internal_notes':
        return isAuthenticated && (isAdmin || isOfficer);

      case 'create_complaint':
        return true; // Anyone can register a complaint

      case 'view_all_complaints':
        return isAuthenticated && (isAdmin || isOfficer);

      default:
        return false;
    }
  };

  // Administration Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TASKS;
      }
    }
    return INITIAL_TASKS;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTask: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => {
    const item: TaskItem = {
      ...newTask,
      id: `TASK-${Date.now().toString().slice(-4)}`,
      createdAt: '2026-10-24',
      completed: false
    };
    setTasks(prev => [item, ...prev]);
    addAuditLogEntry({
      action: 'Administrative Task Created',
      entityType: 'Complaint',
      entityId: item.complaintId || item.id,
      details: `New task created: "${item.title}" assigned to ${item.assignedToName}`
    });
    return true;
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? '2026-10-24T17:00:00Z' : undefined,
              completedBy: !t.completed ? currentUser.name : undefined
            }
          : t
      )
    );
    return true;
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    return true;
  };

  const bulkAssignComplaints = (complaintIds: string[], bureauId: string, officerId: string, notes?: string) => {
    const b = bureaus.find(x => x.id === bureauId) || bureaus[0];
    const off = users.find(x => x.id === officerId) || users[0];
    const now = '2026-10-24';

    setComplaints(prev =>
      prev.map(c => {
        if (!complaintIds.includes(c.id)) return c;
        const newAssignmentHistory: AssignmentHistoryRecord[] = [
          ...(c.assignmentHistory || []),
          {
            id: `ASG-${Date.now()}-${c.id}`,
            previousBureauId: c.bureauId,
            newBureauId: b.id,
            previousOfficerId: c.assignedOfficerId,
            newOfficerId: off.id,
            reason: notes || 'Bulk allocation by Nodal Administration',
            assignedAt: now,
            assignedBy: currentUser.name
          }
        ];
        return {
          ...c,
          bureauId: b.id,
          bureauName: b.name,
          assignedOfficerId: off.id,
          assignedOfficerName: off.name,
          status: c.status === 'Open' ? ('Under Review' as ComplaintStatus) : c.status,
          currentStageId: c.currentStageId === 1 || c.currentStageId === 2 ? 4 : c.currentStageId,
          lastUpdatedDate: now,
          assignmentHistory: newAssignmentHistory
        };
      })
    );

    addAuditLogEntry({
      action: 'Bulk Case Allocation',
      entityType: 'Assignment',
      entityId: `BULK-${complaintIds.length}`,
      details: `${complaintIds.length} complaints allocated to ${b.shortName} (${off.name}) by ${currentUser.name}`
    });
    return true;
  };

  const bulkUpdatePriority = (complaintIds: string[], newPriority: ComplaintPriority, reason: string) => {
    const now = '2026-10-24';
    setComplaints(prev =>
      prev.map(c => {
        if (!complaintIds.includes(c.id)) return c;
        return {
          ...c,
          priority: newPriority,
          lastUpdatedDate: now
        };
      })
    );
    addAuditLogEntry({
      action: 'Bulk Priority Updated',
      entityType: 'Status',
      entityId: `BULK-${complaintIds.length}`,
      details: `Priority updated to ${newPriority} for ${complaintIds.length} complaints. Justification: ${reason}`,
      newValue: newPriority
    });
    return true;
  };

  // Secure Portal Login for Government Officials
  const login = async (
    email: string,
    password: string,
    portal: 'admin' | 'bureau_officer' = 'admin'
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulated auth delay
    await new Promise(r => setTimeout(r, 450));

    const normalized = email.trim().toLowerCase();
    const user = INITIAL_USERS.find(u => u.email.toLowerCase() === normalized);

    // Generic error to prevent user enumeration
    if (!user || user.password !== password) {
      return {
        success: false,
        error: 'Invalid official credentials. Please check your registered email and password.'
      };
    }

    if (user.role === 'public') {
      return {
        success: false,
        error: 'Access Restricted: Public complainant accounts cannot access the Government Officials Portal. Please use citizen complaint tracking.'
      };
    }

    const sess = {
      userId: user.id,
      email: user.email,
      role: user.role,
      portal: 'admin' as const,
      token: `cmis_jwt_${Date.now()}`
    };

    setSession(sess);
    setCurrentUser(user);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_session`, JSON.stringify(sess));

    addAuditLogEntry({
      action: 'Government Officials Authentication',
      entityType: 'SystemSettings',
      entityId: user.id,
      details: `User ${user.name} (${user.designation}) authenticated into Government Officials Portal`,
      newValue: 'admin'
    });

    return { success: true };
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_session`);
    setSession(null);
    setCurrentUser(INITIAL_USERS[0]); // Return to public complainant

    addAuditLogEntry({
      action: 'Official Portal Logout',
      entityType: 'SystemSettings',
      entityId: currentUser.id,
      details: `Session terminated for user ${currentUser.name}`
    });
  };

  // Switch role helper
  const switchUserRole = (role: UserRole) => {
    const targetUser = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(targetUser);

    if (role === 'public') {
      setSession(null);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_session`);
    } else {
      const portal = role === 'admin' ? 'admin' : 'bureau_officer';
      const sess = {
        userId: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        portal: portal as 'admin' | 'bureau_officer',
        token: `cmis_jwt_${Date.now()}`
      };
      setSession(sess);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_session`, JSON.stringify(sess));
    }

    addAuditLogEntry({
      action: 'Session Role Altered',
      entityType: 'SystemSettings',
      entityId: targetUser.id,
      details: `Active role updated to ${role.toUpperCase()} (${targetUser.name})`,
      newValue: role
    });
  };

  // Internal audit log creator
  const addAuditLogEntry = (entry: {
    action: string;
    entityType: AuditLog['entityType'];
    entityId: string;
    details: string;
    previousValue?: string;
    newValue?: string;
  }) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role.toUpperCase(),
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add Complaint (Enforced: management cannot register)
  const addComplaint = (draft: any): Complaint | null => {
    if (!hasPermission('create_complaint')) {
      addAuditLogEntry({
        action: 'Access Denied: Create Complaint',
        entityType: 'Complaint',
        entityId: 'UNAUTHORIZED_ATTEMPT',
        details: `User ${currentUser.name} (${currentUser.role}) attempted to register complaint without sufficient permissions.`
      });
      return null;
    }

    const nextSeq = complaints.length + 101;
    const newId = `AICTE-2026-COMP-${nextSeq}`;
    const today = '2026-10-23';

    // Calculate deadline based on priority if not set
    let deadline = draft.deadlineDate;
    if (!deadline) {
      const days = draft.priority === 'Urgent' ? settings.defaultDeadlineUrgent : settings.defaultDeadlineNormal;
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      deadline = d.toISOString().split('T')[0];
    }

    const bureau = bureaus.find(b => b.id === draft.bureauId) || bureaus[0];

    const newComplaint: Complaint = {
      id: newId,
      title: draft.title,
      description: draft.description,
      institutionId: draft.institutionId,
      institutionCode: draft.institutionCode,
      institutionName: draft.institutionName,
      category: draft.category,
      status: 'Open',
      priority: draft.priority || 'Normal',
      bureauId: bureau.id,
      bureauName: bureau.name,
      assignedOfficerId: draft.assignedOfficerId || 'USR-OFFICER-01',
      assignedOfficerName: draft.assignedOfficerName || bureau.officerInCharge,
      submissionDate: draft.submissionDate || today,
      deadlineDate: deadline,
      lastUpdatedDate: today,
      sourceChannel: draft.sourceChannel || 'Online Portal',
      referenceNumber: draft.referenceNumber || `REG-DEMO-${Date.now().toString().slice(-4)}`,
      tags: draft.tags || ['new-filing', draft.category.toLowerCase().split(' ')[0]],
      complainantName: draft.complainantName || currentUser.name || 'Ananya Sharma (Student / Complainant)',
      complainantEmail: draft.complainantEmail || currentUser.email || 'ananya.sharma@student-demo.in',
      complainantPhone: draft.complainantPhone || currentUser.phone || '+91-98765-43210',
      attachments: draft.attachments || [],
      currentStageId: 1,
      verificationStatus: 'Pending'
    };

    setComplaints(prev => [newComplaint, ...prev]);

    // Initial timeline event
    const initialEvent: TimelineEvent = {
      id: `EVT-${newId}-REG`,
      complaintId: newId,
      timestamp: new Date().toISOString(),
      type: 'REGISTERED',
      title: 'Complaint Formally Registered',
      description: `Logged in AICTE CaseTrack under category "${newComplaint.category}". Assigned to ${newComplaint.bureauName}.`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };
    setTimelineEvents(prev => ({
      ...prev,
      [newId]: [initialEvent]
    }));

    // Audit log
    addAuditLogEntry({
      action: 'Complaint Registered',
      entityType: 'Complaint',
      entityId: newId,
      details: `New complaint filed for ${newComplaint.institutionName} (${newComplaint.title.slice(0, 50)}...)`,
      newValue: 'Status: Open'
    });

    // Automatically check for related cases and create suggestions if above threshold
    complaints.forEach(existing => {
      const match = calculateRelatedness(newComplaint, existing);
      if (match.overallScore >= settings.similarityThreshold) {
        const newSuggestion: RelatedCaseSuggestion = {
          id: `SUGG-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 100)}`,
          complaintId: newId,
          relatedComplaintId: existing.id,
          institutionMatchScore: match.institutionMatchScore,
          categoryMatchScore: match.categoryMatchScore,
          textSimilarityScore: match.textSimilarityScore,
          overallScore: match.overallScore,
          matchSignals: match.matchSignals,
          explanation: match.explanation,
          status: 'Pending Review'
        };
        setRelatedSuggestions(prev => [newSuggestion, ...prev]);
      }
    });

    return newComplaint;
  };

  // Update Status (Enforced: management cannot mutate status)
  const updateComplaintStatus = (id: string, newStatus: ComplaintStatus, reason: string): boolean => {
    if (!hasPermission('change_status')) {
      addAuditLogEntry({
        action: 'Access Denied: Status Transition',
        entityType: 'Status',
        entityId: id,
        details: `Unauthorized attempt to alter status to ${newStatus} by user ${currentUser.name} (${currentUser.role}).`
      });
      return false;
    }

    const target = complaints.find(c => c.id === id);
    if (!target) return false;

    const prevStatus = target.status;
    const today = '2026-10-23';

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updated: Complaint = {
            ...c,
            status: newStatus,
            lastUpdatedDate: today,
            resolvedDate: (newStatus === 'Resolved' || newStatus === 'Closed') ? today : c.resolvedDate,
            resolutionSummary: (newStatus === 'Resolved' || newStatus === 'Closed') ? reason : c.resolutionSummary
          };
          return updated;
        }
        return c;
      })
    );

    // Timeline event
    const eventType =
      newStatus === 'Resolved' ? 'RESOLVED' :
      newStatus === 'Escalated' ? 'ESCALATED' : 'STATUS_CHANGED';

    const newEvent: TimelineEvent = {
      id: `EVT-${id}-${Date.now().toString().slice(-5)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: eventType,
      title: `Status Changed: ${prevStatus} -> ${newStatus}`,
      description: reason || `Updated to ${newStatus} by ${currentUser.name}`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), newEvent]
    }));

    // Audit Log
    addAuditLogEntry({
      action: 'Status Transition',
      entityType: 'Status',
      entityId: id,
      details: `Status altered from ${prevStatus} to ${newStatus}. Reason: ${reason}`,
      previousValue: prevStatus,
      newValue: newStatus
    });

    return true;
  };

  // Update Verification Status (Scrutiny Staff & Admin)
  const updateVerificationStatus = (
    id: string,
    status: 'Verified' | 'Pending' | 'Needs Information' | 'Flagged',
    remarks: string
  ): boolean => {
    if (!hasPermission('verify_case')) {
      addAuditLogEntry({
        action: 'Access Denied: Verification',
        entityType: 'Status',
        entityId: id,
        details: `Unauthorized attempt to verify complaint by user ${currentUser.name} (${currentUser.role}).`
      });
      return false;
    }

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updatedStage = status === 'Verified' ? 3 : status === 'Needs Information' ? 5 : c.currentStageId;
          const updatedStatus = status === 'Needs Information' ? 'Awaiting Information' : c.status;
          return {
            ...c,
            verificationStatus: status,
            verificationRemarks: remarks,
            lastUpdatedDate: '2026-10-23',
            currentStageId: updatedStage,
            status: updatedStatus
          };
        }
        return c;
      })
    );

    addAuditLogEntry({
      action: `Verification: ${status}`,
      entityType: 'Status',
      entityId: id,
      details: `Scrutiny Staff ${currentUser.name} updated verification state to "${status}". Remarks: ${remarks}`,
      newValue: status
    });

    // Add Timeline Event
    const verifyEvent: TimelineEvent = {
      id: `EVT-${id}-VERIFY-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'NOTE_ADDED',
      title: `Verification Assessment: ${status}`,
      description: remarks || `Preliminary document verification updated to ${status}.`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), verifyEvent]
    }));

    return true;
  };

  // Approve Closure (Supervisor & Admin)
  const approveCaseClosure = (
    id: string,
    approved: boolean,
    remarks: string
  ): boolean => {
    if (!hasPermission('approve_closure')) {
      addAuditLogEntry({
        action: 'Access Denied: Case Closure Approval',
        entityType: 'Status',
        entityId: id,
        details: `Unauthorized closure approval attempt by ${currentUser.name} (${currentUser.role}).`
      });
      return false;
    }

    const today = '2026-10-23';

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: approved ? 'Closed' : 'Under Review',
            currentStageId: approved ? 7 : 4,
            resolvedDate: approved ? (c.resolvedDate || today) : undefined,
            closureApprovedBy: currentUser.name,
            closureApprovedAt: new Date().toISOString(),
            lastUpdatedDate: today,
            resolutionSummary: approved ? remarks : c.resolutionSummary
          };
        }
        return c;
      })
    );

    addAuditLogEntry({
      action: approved ? 'Complaint Closure Approved' : 'Closure Remanded to Bureau Review',
      entityType: 'Status',
      entityId: id,
      details: `Supervisor ${currentUser.name} ${approved ? 'approved formal complaint closure' : 'rejected closure recommendation and returned case for further inquiry'}. Notes: ${remarks}`,
      newValue: approved ? 'Closed' : 'Under Review'
    });

    const closureEvent: TimelineEvent = {
      id: `EVT-${id}-CLOSURE-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: approved ? 'RESOLVED' : 'STATUS_CHANGED',
      title: approved ? 'Final Case Closure Approved' : 'Closure Remanded for Further Inquiry',
      description: remarks,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), closureEvent]
    }));

    return true;
  };

  // Request Information from Complainant (Officer, Verification, Supervisor)
  const requestComplainantInfo = (id: string, query: string): boolean => {
    const today = '2026-10-23';
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'Awaiting Information',
            currentStageId: 5,
            lastUpdatedDate: today
          };
        }
        return c;
      })
    );

    addAuditLogEntry({
      action: 'Information Requested from Complainant',
      entityType: 'Status',
      entityId: id,
      details: `Official inquiry sent to complainant by ${currentUser.name}: ${query}`,
      newValue: 'Awaiting Information'
    });

    const queryEvent: TimelineEvent = {
      id: `EVT-${id}-REQINFO-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'NOTE_ADDED',
      title: 'Clarification Requested from Complainant',
      description: query,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), queryEvent]
    }));

    return true;
  };

  // Assign Case (Enforced: only admin and supervisor can reassign)
  const assignComplaint = (id: string, bureauId: string, officerId: string, notesText?: string): boolean => {
    if (!hasPermission('assign_case')) {
      addAuditLogEntry({
        action: 'Access Denied: Case Reassignment',
        entityType: 'Assignment',
        entityId: id,
        details: `Unauthorized attempt to reassign bureau by user ${currentUser.name} (${currentUser.role}).`
      });
      return false;
    }

    const target = complaints.find(c => c.id === id);
    if (!target) return false;

    const bureau = bureaus.find(b => b.id === bureauId) || bureaus[0];
    const prevBureau = target.bureauName;
    const prevOfficer = target.assignedOfficerName;
    const officerName = bureau.officerInCharge;

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            bureauId,
            bureauName: bureau.name,
            assignedOfficerId: officerId,
            assignedOfficerName: officerName,
            lastUpdatedDate: '2026-10-23'
          };
        }
        return c;
      })
    );

    // Timeline event
    const newEvent: TimelineEvent = {
      id: `EVT-${id}-${Date.now().toString().slice(-5)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'ASSIGNED',
      title: `Reassigned to ${bureau.shortName}`,
      description: `Reallocated to Officer ${officerName}. Note: ${notesText || 'Administrative reallocation'}`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), newEvent]
    }));

    // Audit log
    addAuditLogEntry({
      action: 'Case Reassigned',
      entityType: 'Assignment',
      entityId: id,
      details: `Reassigned from ${prevBureau} (${prevOfficer}) to ${bureau.name} (${officerName})`,
      previousValue: `${prevBureau} / ${prevOfficer}`,
      newValue: `${bureau.name} / ${officerName}`
    });

    return true;
  };

  // Edit permitted fields
  // Reassign Complaint with structured history
  const reassignComplaint = (id: string, newBureauId: string, newOfficerId: string, reason: string): boolean => {
    if (!hasPermission('assign_case')) {
      addAuditLogEntry({
        action: 'Access Denied: Case Reassignment',
        entityType: 'Assignment',
        entityId: id,
        details: `Unauthorized attempt to reassign bureau by user ${currentUser.name} (${currentUser.role}).`
      });
      return false;
    }

    const target = complaints.find(c => c.id === id);
    if (!target) return false;

    const bureau = bureaus.find(b => b.id === newBureauId) || bureaus[0];
    const prevBureau = target.bureauName;
    const prevOfficer = target.assignedOfficerName;
    const targetOfficer = users.find(u => u.id === newOfficerId);
    const officerName = targetOfficer ? targetOfficer.name : bureau.officerInCharge;
    const today = '2026-10-23';

    const historyRecord = {
      id: `AH-${Date.now().toString().slice(-6)}`,
      previousBureauId: target.bureauId,
      newBureauId,
      previousOfficerId: target.assignedOfficerId,
      newOfficerId,
      reason,
      assignedAt: today,
      assignedBy: currentUser.name
    };

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            bureauId: newBureauId,
            bureauName: bureau.name,
            assignedOfficerId: newOfficerId,
            assignedOfficerName: officerName,
            lastUpdatedDate: today,
            currentStageId: 4,
            assignmentHistory: [...(c.assignmentHistory || []), historyRecord]
          };
        }
        return c;
      })
    );

    const reassignEvent: TimelineEvent = {
      id: `EVT-${id}-REASSIGN-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'REASSIGNED',
      title: `Reallocated to ${bureau.shortName} (${officerName})`,
      description: `Reason: ${reason}`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), reassignEvent]
    }));

    addAuditLogEntry({
      action: 'Case Reassigned',
      entityType: 'Assignment',
      entityId: id,
      details: `Reassigned from ${prevBureau} (${prevOfficer}) to ${bureau.name} (${officerName}). Reason: ${reason}`,
      previousValue: `${prevBureau} / ${prevOfficer}`,
      newValue: `${bureau.name} / ${officerName}`
    });

    return true;
  };

  // Reopen Complaint
  const reopenComplaint = (id: string, reason: string): boolean => {
    if (!hasPermission('approve_closure')) {
      addAuditLogEntry({
        action: 'Access Denied: Reopen Complaint',
        entityType: 'Status',
        entityId: id,
        details: `Unauthorized attempt to reopen complaint by user ${currentUser.name} (${currentUser.role}).`
      });
      return false;
    }

    const today = '2026-10-23';
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'Under Review',
            isReopened: true,
            reopenedDate: today,
            reopenedReason: reason,
            reopenedBy: currentUser.name,
            currentStageId: 5,
            lastUpdatedDate: today
          };
        }
        return c;
      })
    );

    const reopenEvent: TimelineEvent = {
      id: `EVT-${id}-REOPEN-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'REOPENED',
      title: 'Complaint Formally Reopened',
      description: `Case reopened for active investigation by ${currentUser.name}. Reason: ${reason}`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), reopenEvent]
    }));

    addAuditLogEntry({
      action: 'Complaint Reopened',
      entityType: 'Status',
      entityId: id,
      details: `Complaint reopened by ${currentUser.name}. Reason: ${reason}`,
      previousValue: 'Closed',
      newValue: 'Under Review'
    });

    return true;
  };

  // Recommend Resolution
  const recommendResolution = (id: string, recommendation: string): boolean => {
    const today = '2026-10-23';
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'Resolution Recommended',
            resolutionRecommendation: recommendation,
            resolutionRecommendedBy: currentUser.name,
            resolutionRecommendedDate: today,
            currentStageId: 8,
            lastUpdatedDate: today
          };
        }
        return c;
      })
    );

    const recEvent: TimelineEvent = {
      id: `EVT-${id}-RECRES-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'RESOLUTION_RECOMMENDED',
      title: 'Resolution Recommended by Inquiry Officer',
      description: recommendation,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), recEvent]
    }));

    addAuditLogEntry({
      action: 'Resolution Recommended',
      entityType: 'Status',
      entityId: id,
      details: `Resolution recommendation submitted by ${currentUser.name}: ${recommendation}`,
      newValue: 'Resolution Recommended'
    });

    return true;
  };

  // Request Institution Response
  const requestInstitutionResponse = (id: string, queryReason: string): boolean => {
    const today = '2026-10-23';
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'Awaiting Institution Response',
            institutionResponseRequested: true,
            currentStageId: 6,
            lastUpdatedDate: today
          };
        }
        return c;
      })
    );

    const inquiryEvent: TimelineEvent = {
      id: `EVT-${id}-INSTREQ-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'INSTITUTION_INQUIRY',
      title: 'Formal Explanation Called from Institution',
      description: queryReason,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), inquiryEvent]
    }));

    addAuditLogEntry({
      action: 'Institution Explanation Demanded',
      entityType: 'Status',
      entityId: id,
      details: `Formal explanation called from institution by ${currentUser.name}: ${queryReason}`,
      newValue: 'Awaiting Institution Response'
    });

    return true;
  };

  // Record Institution Response
  const recordInstitutionResponse = (id: string, remarks: string): boolean => {
    const today = '2026-10-23';
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'Action & Investigation',
            institutionResponseReceived: true,
            institutionResponseDate: today,
            institutionRemarks: remarks,
            currentStageId: 7,
            lastUpdatedDate: today
          };
        }
        return c;
      })
    );

    const replyEvent: TimelineEvent = {
      id: `EVT-${id}-INSTREP-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'INSTITUTION_REPLIED',
      title: 'Institution Response Received & Logged',
      description: remarks,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), replyEvent]
    }));

    addAuditLogEntry({
      action: 'Institution Response Recorded',
      entityType: 'Status',
      entityId: id,
      details: `Institution response recorded by ${currentUser.name}: ${remarks}`,
      newValue: 'Action & Investigation'
    });

    return true;
  };

  // Update Complaint Deadline with tracking
  const updateComplaintDeadline = (id: string, newDeadline: string, reason: string): boolean => {
    const target = complaints.find(c => c.id === id);
    if (!target) return false;

    const oldDeadline = target.deadlineDate;
    const today = '2026-10-23';

    const deadlineRecord = {
      id: `DL-${Date.now().toString().slice(-6)}`,
      previousDeadline: oldDeadline,
      newDeadline,
      reason,
      changedAt: today,
      changedBy: currentUser.name
    };

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            deadlineDate: newDeadline,
            lastUpdatedDate: today,
            deadlineHistory: [...(c.deadlineHistory || []), deadlineRecord]
          };
        }
        return c;
      })
    );

    const dlEvent: TimelineEvent = {
      id: `EVT-${id}-DL-${Date.now().toString().slice(-4)}`,
      complaintId: id,
      timestamp: new Date().toISOString(),
      type: 'DEADLINE_UPDATED',
      title: `Configured Deadline Extended to ${newDeadline}`,
      description: `Reason: ${reason}`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), dlEvent]
    }));

    addAuditLogEntry({
      action: 'Deadline Modified',
      entityType: 'Complaint',
      entityId: id,
      details: `Deadline altered from ${oldDeadline} to ${newDeadline}. Reason: ${reason}`,
      previousValue: oldDeadline,
      newValue: newDeadline
    });

    return true;
  };

  // Add User (Admin Staff Management)
  const addUser = (newUser: User): boolean => {
    if (currentUser.role !== 'admin') return false;
    setUsers(prev => {
      const updated = [...prev, newUser];
      localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(updated));
      return updated;
    });

    addAuditLogEntry({
      action: 'Staff User Account Created',
      entityType: 'SystemSettings',
      entityId: newUser.id,
      details: `Admin ${currentUser.name} provisioned new staff account ${newUser.name} (${newUser.email}) with role ${newUser.role.toUpperCase()}`,
      newValue: newUser.role
    });

    return true;
  };

  const editComplaint = (id: string, updates: Partial<Complaint>): boolean => {
    if (!hasPermission('edit_case')) {
      addAuditLogEntry({
        action: 'Access Denied: Edit Complaint',
        entityType: 'Complaint',
        entityId: id,
        details: `Unauthorized attempt to edit complaint by user ${currentUser.name} (${currentUser.role}).`
      });
      return false;
    }

    setComplaints(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, lastUpdatedDate: '2026-10-23' } : c))
    );

    addAuditLogEntry({
      action: 'Case Record Edited',
      entityType: 'Complaint',
      entityId: id,
      details: `Updated fields: ${Object.keys(updates).join(', ')}`
    });

    return true;
  };

  // Add Follow-up Note (Enforced: management cannot add notes)
  const addNote = (complaintId: string, content: string, actionItem?: string, isOfficialAction: boolean = true): boolean => {
    if (currentUser.role === 'management') {
      addAuditLogEntry({
        action: 'Access Denied: Add Note',
        entityType: 'Complaint',
        entityId: complaintId,
        details: `Read-only user ${currentUser.name} attempted to add case follow-up note.`
      });
      return false;
    }

    const newNote: ComplaintNote = {
      id: `NOTE-${complaintId}-${Date.now().toString().slice(-4)}`,
      complaintId,
      timestamp: new Date().toISOString(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role.toUpperCase(),
      content,
      actionItem,
      isOfficialAction
    };

    setNotes(prev => ({
      ...prev,
      [complaintId]: [...(prev[complaintId] || []), newNote]
    }));

    // Timeline entry
    const newEvent: TimelineEvent = {
      id: `EVT-${complaintId}-${Date.now().toString().slice(-5)}`,
      complaintId,
      timestamp: new Date().toISOString(),
      type: 'NOTE_ADDED',
      title: 'Follow-up Note Added',
      description: content.length > 80 ? `${content.slice(0, 80)}...` : content,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [complaintId]: [...(prev[complaintId] || []), newEvent]
    }));

    // Audit
    addAuditLogEntry({
      action: 'Note Recorded',
      entityType: 'Complaint',
      entityId: complaintId,
      details: `Added note: "${content.slice(0, 60)}..."`
    });

    return true;
  };

  // Confirm Related Case (Enforced: only admin, officer, supervisor)
  const confirmRelationship = (suggestionId: string, reviewNotes?: string): boolean => {
    if (!hasPermission('review_related')) {
      addAuditLogEntry({
        action: 'Access Denied: Confirm Relationship',
        entityType: 'RelatedCase',
        entityId: suggestionId,
        details: `User ${currentUser.name} (${currentUser.role}) attempted to confirm relationship without authorization.`
      });
      return false;
    }

    const target = relatedSuggestions.find(s => s.id === suggestionId);
    if (!target) return false;

    setRelatedSuggestions(prev =>
      prev.map(s =>
        s.id === suggestionId
          ? {
              ...s,
              status: 'Confirmed Related',
              reviewedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
              reviewedAt: new Date().toISOString(),
              reviewNotes: reviewNotes || 'Relationship confirmed by authorized officer.'
            }
          : s
      )
    );

    // Add timeline entries to BOTH cases without merging
    const evtA: TimelineEvent = {
      id: `EVT-${target.complaintId}-${Date.now().toString().slice(-5)}`,
      complaintId: target.complaintId,
      timestamp: new Date().toISOString(),
      type: 'RELATIONSHIP_CONFIRMED',
      title: `Related Case Confirmed: ${target.relatedComplaintId}`,
      description: `Officer confirmed similarity score of ${target.overallScore}%. ${reviewNotes || ''}`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    const evtB: TimelineEvent = {
      id: `EVT-${target.relatedComplaintId}-${Date.now().toString().slice(-5)}`,
      complaintId: target.relatedComplaintId,
      timestamp: new Date().toISOString(),
      type: 'RELATIONSHIP_CONFIRMED',
      title: `Related Case Confirmed: ${target.complaintId}`,
      description: `Cross-linked as related file by ${currentUser.name}.`,
      actorName: currentUser.name,
      actorRole: currentUser.role.toUpperCase()
    };

    setTimelineEvents(prev => ({
      ...prev,
      [target.complaintId]: [...(prev[target.complaintId] || []), evtA],
      [target.relatedComplaintId]: [...(prev[target.relatedComplaintId] || []), evtB]
    }));

    // Audit
    addAuditLogEntry({
      action: 'Related Case Confirmed',
      entityType: 'RelatedCase',
      entityId: target.complaintId,
      details: `Confirmed relationship between ${target.complaintId} and ${target.relatedComplaintId} (${target.overallScore}%)`,
      previousValue: 'Pending Review',
      newValue: 'Confirmed Related'
    });

    return true;
  };

  // Reject / Mark Unrelated (Enforced)
  const rejectRelationship = (suggestionId: string, reviewNotes?: string): boolean => {
    if (!hasPermission('review_related')) {
      addAuditLogEntry({
        action: 'Access Denied: Reject Relationship',
        entityType: 'RelatedCase',
        entityId: suggestionId,
        details: `User ${currentUser.name} (${currentUser.role}) attempted to reject relationship without authorization.`
      });
      return false;
    }

    const target = relatedSuggestions.find(s => s.id === suggestionId);
    if (!target) return false;

    setRelatedSuggestions(prev =>
      prev.map(s =>
        s.id === suggestionId
          ? {
              ...s,
              status: 'Marked Unrelated',
              reviewedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
              reviewedAt: new Date().toISOString(),
              reviewNotes: reviewNotes || 'Officer reviewed and determined complaints are independent.'
            }
          : s
      )
    );

    addAuditLogEntry({
      action: 'Related Case Marked Unrelated',
      entityType: 'RelatedCase',
      entityId: target.complaintId,
      details: `Officer concluded ${target.complaintId} and ${target.relatedComplaintId} are distinct matters.`,
      previousValue: 'Pending Review',
      newValue: 'Marked Unrelated'
    });

    return true;
  };

  // Mark Alert Reviewed
  const markAlertReviewed = (alertId: string) => {
    if (currentUser.role === 'management') {
      addAuditLogEntry({
        action: 'Access Denied: Alert Acknowledgment',
        entityType: 'Complaint',
        entityId: alertId,
        details: `Read-only user ${currentUser.name} cannot acknowledge alerts.`
      });
      return;
    }

    if (!reviewedAlertIds.includes(alertId)) {
      const updated = [...reviewedAlertIds, alertId];
      setReviewedAlertIds(updated);

      addAuditLogEntry({
        action: 'Alert Acknowledged',
        entityType: 'Complaint',
        entityId: alertId,
        details: `Deadline alert for case ${alertId} reviewed and marked acknowledged by officer.`
      });
    }
  };

  // Update Settings (Enforced: only admin)
  const updateSettings = (newSettings: Partial<SystemSettings>): boolean => {
    if (!hasPermission('manage_settings')) {
      addAuditLogEntry({
        action: 'Access Denied: Update System Settings',
        entityType: 'SystemSettings',
        entityId: 'SYSTEM-CONFIG',
        details: `Unauthorized attempt to alter system settings by ${currentUser.name} (${currentUser.role}).`
      });
      return false;
    }

    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLogEntry({
      action: 'System Settings Updated',
      entityType: 'SystemSettings',
      entityId: 'SYSTEM-CONFIG',
      details: `Updated parameters: ${Object.keys(newSettings).join(', ')}`
    });

    return true;
  };

  // Reset demo data
  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}complaints`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}timeline`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}notes`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}suggestions`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}audit`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}reviewed_alerts`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}settings`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}user_role`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}milestones`);

    setComplaints(INITIAL_COMPLAINTS);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setNotes(INITIAL_NOTES);
    setRelatedSuggestions(INITIAL_RELATED_SUGGESTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setReviewedAlertIds([]);
    setSettings(INITIAL_SYSTEM_SETTINGS);
    setMilestones(INITIAL_PROJECT_MILESTONES);
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <CaseTrackContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        activePortal,
        login,
        logout,
        switchUserRole,
        institutions,
        bureaus,
        complaints,
        timelineEvents,
        notes,
        relatedSuggestions,
        auditLogs,
        settings,
        reviewedAlertIds,
        milestones,
        lifecycleStages,
        updateMilestoneStatus,
        addComplaint,
        updateComplaintStatus,
        updateVerificationStatus,
        approveCaseClosure,
        requestComplainantInfo,
        assignComplaint,
        reassignComplaint,
        reopenComplaint,
        recommendResolution,
        requestInstitutionResponse,
        recordInstitutionResponse,
        updateComplaintDeadline,
        users,
        addUser,
        editComplaint,
        addNote,
        confirmRelationship,
        rejectRelationship,
        markAlertReviewed,
        updateSettings,
        resetDemoData,
        hasPermission,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        bulkAssignComplaints,
        bulkUpdatePriority
      }}
    >
      {children}
    </CaseTrackContext.Provider>
  );
};

export const useCaseTrack = () => {
  const context = useContext(CaseTrackContext);
  if (!context) {
    throw new Error('useCaseTrack must be used within a CaseTrackProvider');
  }
  return context;
};

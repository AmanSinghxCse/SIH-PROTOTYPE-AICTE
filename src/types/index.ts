export type UserRole = 'public' | 'admin' | 'officer' | 'verification' | 'supervisor' | 'management';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  bureauId?: string;
  bureauName?: string;
  avatarUrl?: string;
  phone?: string;
}

export type ComplaintStatus =
  | 'Open'
  | 'Under Review'
  | 'Awaiting Information'
  | 'Escalated'
  | 'Resolved'
  | 'Closed';

export type ComplaintPriority = 'Normal' | 'Medium' | 'High' | 'Urgent';

export type ComplaintCategory =
  | 'Infrastructure & Labs'
  | 'Academic Administration & Faculty'
  | 'Fee Irregularity & Caution Refund'
  | 'Examination Malpractice & Results'
  | 'Harassment & Anti-Ragging'
  | 'Regulatory Compliance & Fraud';

export type SourceChannel =
  | 'Online Portal'
  | 'National Grievance Portal'
  | 'Written Petition'
  | 'Inspection Report';

export interface Institution {
  id: string;
  code: string;
  name: string;
  type: 'Engineering & Tech' | 'Management' | 'Polytechnic' | 'Pharmacy' | 'Architecture';
  state: string;
  district: string;
  address: string;
  accreditedGrade: string;
  contactEmail: string;
  contactPhone: string;
  establishedYear: number;
}

export interface Bureau {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  officerInCharge: string;
  defaultDeadlineDays: number;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  institutionId: string;
  institutionCode: string;
  institutionName: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  bureauId: string;
  bureauName: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  submissionDate: string; // YYYY-MM-DD
  deadlineDate: string;   // YYYY-MM-DD
  lastUpdatedDate: string;// YYYY-MM-DD
  resolvedDate?: string;  // YYYY-MM-DD
  sourceChannel: SourceChannel;
  referenceNumber?: string;
  resolutionSummary?: string;
  tags: string[];
  attachments?: Array<{ name: string; size: string; type: string }>;
  currentStageId?: number; // 1 to 7 corresponding to Circular Lifecycle
  complainantName?: string;
  complainantEmail?: string;
  complainantPhone?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Needs Information' | 'Flagged';
  verificationRemarks?: string;
  closureApprovedBy?: string;
  closureApprovedAt?: string;
}

export interface TimelineEvent {
  id: string;
  complaintId: string;
  timestamp: string;
  type:
    | 'REGISTERED'
    | 'ASSIGNED'
    | 'STATUS_CHANGED'
    | 'NOTE_ADDED'
    | 'DEADLINE_APPROACHING'
    | 'ESCALATED'
    | 'RESOLVED'
    | 'RELATIONSHIP_CONFIRMED'
    | 'RELATIONSHIP_REJECTED';
  title: string;
  description: string;
  actorName: string;
  actorRole: string;
}

export interface ComplaintNote {
  id: string;
  complaintId: string;
  timestamp: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  actionItem?: string;
  isOfficialAction: boolean;
}

export interface RelatedCaseSuggestion {
  id: string;
  complaintId: string;
  relatedComplaintId: string;
  institutionMatchScore: number;
  categoryMatchScore: number;
  textSimilarityScore: number;
  overallScore: number; // 0-100
  matchSignals: string[];
  explanation: string;
  status: 'Pending Review' | 'Confirmed Related' | 'Marked Unrelated';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'Complaint' | 'Assignment' | 'Status' | 'RelatedCase' | 'SystemSettings' | 'ProjectMilestone';
  entityId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface SystemSettings {
  similarityThreshold: number;
  approachingDeadlineDays: number;
  overdueEscalationDays: number;
  defaultDeadlineUrgent: number;
  defaultDeadlineNormal: number;
}

export interface NotificationItem {
  id: string;
  type: 'approaching_deadline' | 'overdue' | 'new_assignment' | 'status_update' | 'related_suggestion';
  title: string;
  message: string;
  timestamp: string;
  complaintId?: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Circular Complaint Lifecycle Model
export interface LifecycleStage {
  id: number;
  title: string;
  role: string;
  activity: string;
  statusName: string;
  colorType: 'blue' | 'green' | 'orange' | 'red';
  description: string;
  actionRequired: string;
}

// Project Development Tracker Milestone Model
export type MilestoneStatus = 'Completed' | 'In Progress' | 'Needs Verification' | 'Not Started';

export interface ProjectMilestone {
  id: number;
  title: string;
  ownerRole: string;
  workCompleted: string;
  nextAction: string;
  status: MilestoneStatus;
  lastUpdated: string;
}

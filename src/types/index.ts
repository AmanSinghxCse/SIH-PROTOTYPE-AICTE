export type ActivePortalRole = 'public' | 'admin' | 'officials' | 'bureau_officer';

export type UserRole =
  | 'public'
  | 'admin'
  | 'bureau_officer'
  | 'officer' // legacy alias for bureau_officer
  | 'verification' // legacy role preserved for database integrity
  | 'supervisor'   // legacy role preserved for database integrity
  | 'management';  // legacy role preserved for database integrity

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
  password?: string;
}

export type ComplaintStatus =
  | 'Open'
  | 'Under Review'
  | 'Awaiting Information'
  | 'Awaiting Institution Response'
  | 'Action & Investigation'
  | 'Resolution Recommended'
  | 'Awaiting Closure Review'
  | 'Escalated'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical' | 'Normal' | 'Urgent';

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

export interface AssignmentHistoryRecord {
  id: string;
  previousBureauId?: string;
  newBureauId: string;
  previousOfficerId?: string;
  newOfficerId: string;
  reason: string;
  assignedAt: string;
  assignedBy: string;
}

export interface DeadlineHistoryRecord {
  id: string;
  previousDeadline: string;
  newDeadline: string;
  reason: string;
  changedAt: string;
  changedBy: string;
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
  currentStageId?: number; // 1 to 10 corresponding to Complaint Lifecycle
  complainantName?: string;
  complainantEmail?: string;
  complainantPhone?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Needs Information' | 'Flagged';
  verificationRemarks?: string;
  closureApprovedBy?: string;
  closureApprovedAt?: string;
  // Extended Tracking Fields for SIH Advanced CMIS
  isReopened?: boolean;
  reopenedDate?: string;
  reopenedReason?: string;
  reopenedBy?: string;
  resolutionRecommendedBy?: string;
  resolutionRecommendation?: string;
  resolutionRecommendedDate?: string;
  closureReviewRequestedAt?: string;
  institutionResponseRequested?: boolean;
  institutionResponseReceived?: boolean;
  institutionResponseDate?: string;
  institutionRemarks?: string;
  assignmentHistory?: AssignmentHistoryRecord[];
  deadlineHistory?: DeadlineHistoryRecord[];
  findings?: string;
}

export interface TimelineEvent {
  id: string;
  complaintId: string;
  timestamp: string;
  type:
    | 'REGISTERED'
    | 'VERIFICATION_UPDATED'
    | 'ASSIGNED'
    | 'REASSIGNED'
    | 'STATUS_CHANGED'
    | 'NOTE_ADDED'
    | 'INSTITUTION_INQUIRY'
    | 'INSTITUTION_REPLIED'
    | 'DEADLINE_UPDATED'
    | 'DEADLINE_APPROACHING'
    | 'RESOLUTION_RECOMMENDED'
    | 'CLOSURE_REVIEW'
    | 'ESCALATED'
    | 'RESOLVED'
    | 'CLOSED'
    | 'REOPENED'
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

export type MilestoneStatus = 'Completed' | 'In Progress' | 'Needs Verification' | 'Not Started';

export interface ProjectMilestone {
  id: number;
  title: string;
  ownerRole: string;
  status: MilestoneStatus;
  workCompleted: string;
  nextAction: string;
  lastUpdated: string;
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

export interface TaskItem {
  id: string;
  complaintId?: string;
  complaintTitle?: string;
  institutionName?: string;
  title: string;
  description?: string;
  assignedToId: string;
  assignedToName: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  category?: string;
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

// AI Assistant Types
export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isDraft?: boolean;
  draftType?: 'progress_update' | 'clarification_request' | 'resolution_summary';
  relatedComplaintId?: string;
  contextSources?: string[];
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  prompt: string;
  category: 'general' | 'case_inquiry' | 'analytics' | 'drafting';
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { AIMessage, SuggestedPrompt, Complaint } from '../../types';
import { isOverdue, isApproachingDeadline } from '../../utils/dateUtils';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  Building2,
  ExternalLink
} from 'lucide-react';

export const CMISAIAssistant: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    complaints,
    bureaus,
    institutions,
    notes,
    timelineEvents,
    relatedSuggestions,
    settings
  } = useCaseTrack();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Initial welcome message per role
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = !isAuthenticated || currentUser.role === 'public'
        ? `Hello, ${currentUser.name || 'Citizen'}! I am the **CMIS AI Assistant**. I can help you understand the complaint registration process, track your grievance status, explain the 10-stage lifecycle, or find contact information. How may I assist you today?`
        : currentUser.role === 'admin'
        ? `Welcome, Administrator ${currentUser.name}! I am your **CMIS Executive Analytics Assistant**. I can summarize council-wide complaint metrics, highlight overdue dockets, check unassigned cases, and analyze bureau workloads using live records.`
        : `Welcome, Officer ${currentUser.name}! I am your **Bureau Case Assistant** for ${currentUser.bureauName || 'Grievance Redressal Cell'}. I can summarize your assigned dockets, highlight approaching deadlines, and help draft progress updates or inquiry notices for your review.`;

      setMessages([
        {
          id: 'msg-welcome',
          sender: 'assistant',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isAuthenticated, currentUser, messages.length]);

  // Suggested prompts per role
  const suggestedPrompts: SuggestedPrompt[] = useMemo(() => {
    if (!isAuthenticated || currentUser.role === 'public') {
      return [
        {
          id: 'p-1',
          label: 'How do I register a complaint?',
          prompt: 'How do I register a formal complaint against a technical college?',
          category: 'general'
        },
        {
          id: 'p-2',
          label: 'Track AICTE-2026-COMP-104',
          prompt: 'Track the status and progress of complaint AICTE-2026-COMP-104',
          category: 'case_inquiry'
        },
        {
          id: 'p-3',
          label: 'What does "Under Review" mean?',
          prompt: 'What does the "Under Review" complaint status mean?',
          category: 'general'
        },
        {
          id: 'p-4',
          label: 'What documents are required?',
          prompt: 'What supporting documents are required for fee refund complaints?',
          category: 'general'
        },
        {
          id: 'p-5',
          label: 'Anti-Ragging Helpline',
          prompt: 'How do I report ragging or reach the 24x7 Anti-Ragging helpline?',
          category: 'general'
        }
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        {
          id: 'a-1',
          label: 'Open & Overdue summary',
          prompt: 'How many complaints are currently open, and which ones are overdue?',
          category: 'analytics'
        },
        {
          id: 'a-2',
          label: 'Complaints by Bureau',
          prompt: 'Show complaint distribution across AICTE bureaus.',
          category: 'analytics'
        },
        {
          id: 'a-3',
          label: 'Unassigned cases needing action',
          prompt: 'Which cases remain unassigned or require urgent allocation?',
          category: 'case_inquiry'
        },
        {
          id: 'a-4',
          label: 'Cases awaiting closure review',
          prompt: 'Which complaints are awaiting administrative closure review or sanction?',
          category: 'case_inquiry'
        },
        {
          id: 'a-5',
          label: 'Summarize Delhi Tech Campus cases',
          prompt: 'Summarize the complaint history for Delhi Institute of Technology.',
          category: 'analytics'
        }
      ];
    }

    // Bureau Officer
    return [
      {
        id: 'o-1',
        label: 'Summarize my assigned cases',
        prompt: 'Summarize my assigned complaints and current pending workload.',
        category: 'case_inquiry'
      },
      {
        id: 'o-2',
        label: 'My overdue & near deadline cases',
        prompt: 'Which of my assigned cases are overdue or nearing their configured deadlines?',
        category: 'case_inquiry'
      },
      {
        id: 'o-3',
        label: 'Draft progress update for COMP-104',
        prompt: 'Draft an official progress update note for case AICTE-2026-COMP-104.',
        category: 'drafting'
      },
      {
        id: 'o-4',
        label: 'Draft explanation request to college',
        prompt: 'Draft a formal request to the institution demanding explanation on retained caution money.',
        category: 'drafting'
      },
      {
        id: 'o-5',
        label: 'Summarize timeline for COMP-104',
        prompt: 'Summarize the chronological event stream for case AICTE-2026-COMP-104.',
        category: 'case_inquiry'
      }
    ];
  }, [isAuthenticated, currentUser]);

  // Permitted complaints scoped to the user
  const permittedComplaints = useMemo(() => {
    if (!isAuthenticated || currentUser.role === 'public') {
      return complaints.filter(
        c =>
          (c.complainantEmail && currentUser.email && c.complainantEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
          ['AICTE-2026-COMP-104', 'AICTE-2026-COMP-112', 'AICTE-2026-COMP-103'].includes(c.id)
      );
    }
    if (currentUser.role === 'bureau_officer' || currentUser.role === 'officer') {
      const bId = currentUser.bureauId || 'BUR-GRV';
      return complaints.filter(c => c.bureauId === bId || c.assignedOfficerId === currentUser.id);
    }
    return complaints; // Admin has full read oversight
  }, [complaints, currentUser, isAuthenticated]);

  // Engine for Grounded Natural Language Responses
  const generateResponse = async (userPrompt: string): Promise<AIMessage> => {
    const q = userPrompt.toLowerCase().trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600));

    // 1. PUBLIC INTENT HANDLING
    if (!isAuthenticated || currentUser.role === 'public') {
      // Check if user is asking to track a specific complaint
      const matchCompId = q.match(/aicte-2026-comp-\d{3}/i) || q.match(/comp-\d{3}/i);
      if (matchCompId) {
        const queryId = matchCompId[0].toUpperCase();
        const found = permittedComplaints.find(c => c.id.toUpperCase().includes(queryId));

        if (found) {
          return {
            id: `resp-${Date.now()}`,
            sender: 'assistant',
            timestamp,
            relatedComplaintId: found.id,
            text: `### Complaint Tracking: ${found.id}
* **Institution:** ${found.institutionName}
* **Category:** ${found.category}
* **Current Status:** \`${found.status}\` (Stage ${found.currentStageId || 5} of 10)
* **Date Lodged:** ${found.submissionDate}
* **Assigned Handling Bureau:** ${found.bureauName}
* **Target Resolution Date:** ${found.deadlineDate}

**Current Progress:**
${
  found.status === 'Resolved' || found.status === 'Closed'
    ? 'This complaint has been officially resolved. A formal disposal directive was issued to the institution.'
    : found.status === 'Awaiting Information'
    ? 'Action required from your end: The verification officer has requested supplemental documents or clarification. Please review your dashboard to submit clarification.'
    : 'Your case is currently undergoing active investigation by the assigned AICTE Bureau. You will receive updates upon stage progression.'
}

*(Internal officer notes and confidential dossiers are protected and not visible in public tracking).*`
          };
        } else {
          return {
            id: `resp-${Date.now()}`,
            sender: 'assistant',
            timestamp,
            text: `I could not locate complaint \`${matchCompId[0]}\` under your authenticated profile. For privacy and data protection, citizens can only track dockets registered under their verified identity or reference token.`
          };
        }
      }

      if (q.includes('register') || q.includes('how to file') || q.includes('submit')) {
        return {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          text: `### How to Register a Grievance on AICTE CMIS
1. **Navigate to "Register Complaint"** via the top navigation menu or home portal button.
2. **Select the Technical Institution** (search by AICTE Permanent ID or College Name).
3. **Choose Grievance Category:** e.g., Fee Irregularity, Academic Administration, Infrastructure Defects, or Harassment.
4. **Provide Clear Allegation Details:** Specify date, affected course/semester, and exact nature of grievance.
5. **Attach Supporting Documents:** Scanned receipts, fee vouchers, or institutional notices (PDF / JPG up to 5MB).
6. **Submit:** You will instantly receive a permanent Reference Docket Token (e.g., \`AICTE-2026-COMP-104\`) for real-time tracking.`
        };
      }

      if (q.includes('under review') || q.includes('status mean') || q.includes('meaning')) {
        return {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          text: `### Understanding AICTE Complaint Statuses:
* **Open / Registered:** Grievance recorded; awaiting initial jurisdictional verification.
* **Under Review:** Document verification cleared; assigned Bureau Officer is actively investigating norms compliance.
* **Awaiting Information:** Clarification or additional proof requested from student or institution.
* **Action & Investigation:** Formal inquiry or physical scrutiny committee evaluation underway.
* **Resolved / Closed:** Official redressal order issued; grievance redressed in council records.`
        };
      }

      if (q.includes('ragging') || q.includes('helpline') || q.includes('harassment') || q.includes('contact')) {
        return {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          text: `### AICTE Emergency Grievance Helplines:
* **National Anti-Ragging 24x7 Toll-Free:** \`1800-180-5522\` (helpline@antiragging.in)
* **AICTE Grievance Redressal Cell:** \`011-29581000\` / \`011-29581014\`
* **Email:** \`grievance@aicte-india.org\`
* **Address:** Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070.`
        };
      }

      // Default Public Answer
      return {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: `As the **CMIS Public Assistant**, I can assist you with:
- Checking your complaint status (type e.g. *"Track AICTE-2026-COMP-104"*).
- Filing guidance and document requirements.
- Explaining the 10-stage grievance redressal process.
- Directing you to anti-ragging or contact helplines.`
      };
    }

    // 2. BUREAU OFFICER INTENT HANDLING
    if (currentUser.role === 'bureau_officer' || currentUser.role === 'officer') {
      const myCases = permittedComplaints;
      const overdueCases = myCases.filter(c => isOverdue(c.deadlineDate, c.status));
      const approachingCases = myCases.filter(c =>
        isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays)
      );

      if (q.includes('draft') && (q.includes('update') || q.includes('progress'))) {
        return {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDraft: true,
          draftType: 'progress_update',
          text: `### [AI-Generated Draft: Progress Update]
> **Directive:** Formal Scrutiny & Institution Follow-up Record
> **Proposed Officer Note:**
"Preliminary examination of complaint docket AICTE-2026-COMP-104 completed. Perusal of submitted caution money receipts indicates retention beyond prescribed AICTE Approval Process Handbook norms. Notice dispatched to institution registrar on 23-Oct-2026 requesting ledger reconciliation within 7 working days. Case retained under active inquiry."

*Notice: This is an AI-generated draft for officer review. You must confirm or modify this text before saving it to official case records.*`
        };
      }

      if (q.includes('draft') && (q.includes('request') || q.includes('explanation') || q.includes('clarification'))) {
        return {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDraft: true,
          draftType: 'clarification_request',
          text: `### [AI-Generated Draft: Clarification Demand Notice]
> **To:** The Principal / Head of Institution
> **Subject:** Immediate Clarification Regarding Fee Retention / Mandate Violation
> **Reference:** AICTE Case Docket AICTE-2026-COMP-104

"Sir/Madam,
AICTE is in receipt of a formal student grievance alleging irregular retention of institutional caution deposit post course completion. In accordance with Section 10(n) of the AICTE Act 1987, you are hereby requested to provide a factual compliance report along with certified student accounts extract within seven (7) calendar days of receipt of this communication.

Failure to respond within the stipulated window may invite regulatory inspection under Chapter V of the Approval Process Handbook."

*Notice: This is an AI-generated draft for officer review.*`
        };
      }

      if (q.includes('summarize my') || q.includes('my cases') || q.includes('workload')) {
        return {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          text: `### Bureau Officer Workload Summary (${currentUser.bureauName || 'Grievance Redressal Cell'}):
* **Total Permitted Cases:** ${myCases.length}
* **Cases Under Active Review:** ${myCases.filter(c => c.status === 'Under Review').length}
* **Awaiting Institution / Student Response:** ${myCases.filter(c => c.status === 'Awaiting Information').length}
* **Overdue Cases:** ${overdueCases.length}
* **Nearing Configured Deadline (≤ ${settings.approachingDeadlineDays} days):** ${approachingCases.length}
* **Resolved / Disposal Recommended:** ${myCases.filter(c => c.status === 'Resolved' || c.status === 'Resolution Recommended').length}`
        };
      }

      if (q.includes('overdue') || q.includes('deadline')) {
        return {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          text: `### Priority Alerts for Your Bureau:
* **Overdue Cases (${overdueCases.length}):**
${
  overdueCases.length > 0
    ? overdueCases.map(c => `  - **${c.id}**: ${c.title.substring(0, 45)}... (Deadline: ${c.deadlineDate})`).join('\n')
    : '  - None. All assigned cases are currently within configured deadlines.'
}

* **Approaching Deadline (${approachingCases.length}):**
${
  approachingCases.length > 0
    ? approachingCases.map(c => `  - **${c.id}**: ${c.title.substring(0, 45)}... (Deadline: ${c.deadlineDate})`).join('\n')
    : '  - None.'
}`
        };
      }

      // Default Officer Answer
      return {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: `As your **Bureau Case Assistant**, I can:
- Summarize your active cases and workload.
- Identify overdue or time-sensitive dockets.
- Draft neutral progress updates or official explanation notices for your review.
- Summarize case timelines and related complaint signals.`
      };
    }

    // 3. ADMINISTRATION INTENT HANDLING
    const totalComplaints = complaints.length;
    const openComplaints = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
    const overdueComplaints = complaints.filter(c => isOverdue(c.deadlineDate, c.status));
    const unassigned = complaints.filter(c => !c.bureauId || !c.assignedOfficerId);
    const awaitingClosure = complaints.filter(c => c.status === 'Awaiting Closure Review' || c.status === 'Resolution Recommended');

    if (q.includes('how many') || q.includes('open') || q.includes('overdue')) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: `### Executive CMIS Overview (Database Grounded):
* **Total Recorded Complaints:** **${totalComplaints}**
* **Active Open Cases:** **${openComplaints.length}**
* **Overdue Cases Across Council:** **${overdueComplaints.length}**
* **Unassigned / Queued Cases:** **${unassigned.length}**
* **Awaiting Closure Review / Sanction:** **${awaitingClosure.length}**
* **Total Resolved / Disposed:** **${complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}**`
      };
    }

    if (q.includes('bureau') || q.includes('distribution') || q.includes('breakdown')) {
      const bureauBreakdown = bureaus.map(b => {
        const bCases = complaints.filter(c => c.bureauId === b.id);
        const bActive = bCases.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
        const bOverdue = bCases.filter(c => isOverdue(c.deadlineDate, c.status)).length;
        return `* **${b.name} (${b.shortName}):** ${bCases.length} total dockets (${bActive} active, ${bOverdue} overdue)`;
      }).join('\n');

      return {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: `### Complaint Distribution Across AICTE Bureaus:\n${bureauBreakdown}`
      };
    }

    if (q.includes('unassigned') || q.includes('allocation') || q.includes('attention')) {
      return {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: `### Cases Requiring Immediate Administrative Action:
* **Unassigned Cases (${unassigned.length}):**
${
  unassigned.length > 0
    ? unassigned.map(c => `  - **${c.id}**: ${c.institutionName} — ${c.category} (Submitted: ${c.submissionDate})`).join('\n')
    : '  - All cases have been allocated to specialized bureaus.'
}

* **Awaiting Closure Review (${awaitingClosure.length}):**
${
  awaitingClosure.length > 0
    ? awaitingClosure.map(c => `  - **${c.id}**: Recommendation ready by ${c.assignedOfficerName}`).join('\n')
    : '  - None.'
}`
      };
    }

    if (q.includes('delhi') || q.includes('institution')) {
      const dInst = institutions.find(i => i.name.toLowerCase().includes('delhi')) || institutions[0];
      const instCases = complaints.filter(c => c.institutionId === dInst.id);
      return {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        text: `### Institution Profile Summary: ${dInst.name}
* **Permanent AICTE Code:** \`${dInst.code}\`
* **Accreditation Grade:** ${dInst.accreditedGrade}
* **Location:** ${dInst.district}, ${dInst.state}
* **Total Recorded Complaints:** **${instCases.length}**
* **Active Open Cases:** ${instCases.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length}
* **Resolved Cases:** ${instCases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}
* **Overdue Cases:** ${instCases.filter(c => isOverdue(c.deadlineDate, c.status)).length}

*(Note: Complaint count represents citizen docket filings and is distinguished from verified council regulatory findings).*`
      };
    }

    // Default Admin Answer
    return {
      id: `resp-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      text: `As the **CMIS Executive Analytics Assistant**, I can assist you with:
- System-wide statistics on open, overdue, and unassigned dockets.
- Workload and performance metrics by AICTE bureau.
- Identifying cases awaiting closure sanction or reassignment.
- Institution intelligence summaries grounded in real stored records.`
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateResponse(query);
      setMessages(prev => [...prev, response]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'An error occurred while querying the assistant engine. Please try rephrasing your question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0B477F] to-[#155A91] text-white shadow-2xl hover:shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all border-2 border-amber-400 cursor-pointer"
          aria-label="Open CMIS AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isOpen ? 'Close Assistant' : 'CMIS AI Assistant'}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400 text-[#17324D]">
            {!isAuthenticated || currentUser.role === 'public' ? 'Public' : currentUser.role === 'admin' ? 'Admin' : 'Officer'}
          </span>
        </button>
      </div>

      {/* Floating Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[440px] max-h-[80vh] h-[600px] bg-white rounded-2xl shadow-2xl border border-[#D6E4F0] flex flex-col z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-[#0B477F] text-white p-3.5 flex items-center justify-between border-b border-[#064578]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold leading-tight">CMIS AI Assistant</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-[#17324D] font-bold">
                    Demo Mode
                  </span>
                </div>
                <div className="text-[10px] text-white/80">
                  Role: <span className="font-semibold">{currentUser.role.toUpperCase()}</span> (Grounded in Local Data)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#F1F7FC]/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#0B477F] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 shadow-xs space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-[#0B477F] text-white rounded-br-none'
                      : 'bg-white text-[#17324D] border border-[#D6E4F0] rounded-bl-none'
                  }`}
                >
                  {msg.isDraft && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] mb-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>AI-Generated Draft (Review Required)</span>
                    </div>
                  )}

                  <div className="prose prose-xs max-w-none whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 text-[9px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="hover:text-[#0B477F] flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#53677D] p-2">
                <Bot className="w-4 h-4 text-[#0B477F] animate-spin" />
                <span className="italic">Querying authorized CMIS records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Pill Carousel */}
          <div className="p-2 bg-white border-t border-[#D6E4F0] overflow-x-auto">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] font-bold text-[#53677D] shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Suggestions:</span>
              </span>
              {suggestedPrompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSendMessage(p.prompt)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#E5F1FC] text-[#0B477F] hover:bg-[#D6E4F0] border border-[#D6E4F0] transition-colors shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-[#D6E4F0] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                !isAuthenticated || currentUser.role === 'public'
                  ? 'Ask about registration or track complaint token...'
                  : currentUser.role === 'admin'
                  ? 'Ask about council-wide stats, bureaus, or institutions...'
                  : 'Ask about your cases or request a draft update...'
              }
              className="flex-1 text-xs bg-[#F1F7FC] border border-[#D6E4F0] rounded-xl px-3 py-2 text-[#17324D] placeholder-[#53677D] focus:outline-none focus:ring-2 focus:ring-[#0B477F]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-[#0B477F] hover:bg-[#064578] disabled:bg-[#D6E4F0] text-white transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Security Disclaimer */}
          <div className="px-3 py-1 bg-[#F1F7FC] border-t border-[#D6E4F0] text-[10px] text-[#53677D] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#0B477F]" />
              <span>Strict RBAC • Read-Only • Confidential</span>
            </span>
            <span>SIH26264 AICTE CMIS</span>
          </div>
        </div>
      )}
    </>
  );
};
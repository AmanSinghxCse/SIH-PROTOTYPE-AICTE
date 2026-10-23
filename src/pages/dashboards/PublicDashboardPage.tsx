import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { ComplaintLifecycleTracker } from '../../components/workflow/ComplaintLifecycleTracker';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  PlusCircle,
  Eye,
  Shield,
  MessageSquare,
  ArrowRight,
  Send,
  Building,
  Check
} from 'lucide-react';

export const PublicDashboardPage: React.FC = () => {
  const { currentUser, complaints, timelineEvents, addNote } = useCaseTrack();

  const [searchToken, setSearchToken] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [activeComplaintForResponse, setActiveComplaintForResponse] = useState<string | null>(null);
  const [responseSuccessMsg, setResponseSuccessMsg] = useState(false);

  // Filter complaints that belong to the current public user
  const myComplaints = useMemo(() => {
    return complaints.filter(c => {
      // Direct match on email/name or default demonstration complaints for demo student
      if (c.complainantEmail && currentUser.email && c.complainantEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        return true;
      }
      if (c.complainantName && currentUser.name && c.complainantName.toLowerCase().includes('ananya')) {
        return true;
      }
      // Demo fallback so the student complainant always has realistic data
      return ['AICTE-2026-COMP-104', 'AICTE-2026-COMP-112', 'AICTE-2026-COMP-103'].includes(c.id);
    });
  }, [complaints, currentUser]);

  // Public stats
  const stats = useMemo(() => {
    const total = myComplaints.length;
    const underReview = myComplaints.filter(c => c.status === 'Under Review' || c.status === 'Open').length;
    const awaitingInfo = myComplaints.filter(c => c.status === 'Awaiting Information' || c.verificationStatus === 'Needs Information').length;
    const resolved = myComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    return { total, underReview, awaitingInfo, resolved };
  }, [myComplaints]);

  // Selected case for tracking
  const trackedCase = useMemo(() => {
    if (searchToken.trim()) {
      const q = searchToken.trim().toLowerCase();
      return (
        complaints.find(c => c.id.toLowerCase().includes(q) || (c.referenceNumber && c.referenceNumber.toLowerCase().includes(q))) ||
        null
      );
    }
    if (selectedCaseId) {
      return complaints.find(c => c.id === selectedCaseId) || null;
    }
    return myComplaints[0] || null;
  }, [searchToken, selectedCaseId, complaints, myComplaints]);

  const trackedTimeline = useMemo(() => {
    if (!trackedCase) return [];
    return (timelineEvents[trackedCase.id] || []).filter(e => {
      // Redact internal notes from public view
      return e.type !== 'NOTE_ADDED' || e.title.includes('Public') || e.title.includes('Information');
    });
  }, [trackedCase, timelineEvents]);

  const handleOpenResponse = (complaintId: string) => {
    setActiveComplaintForResponse(complaintId);
    setResponseModalOpen(true);
    setResponseSuccessMsg(false);
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaintForResponse || !responseText.trim()) return;

    addNote(
      activeComplaintForResponse,
      `[Complainant Response]: ${responseText}`,
      'Clarification submitted by student',
      true
    );

    setResponseSuccessMsg(true);
    setTimeout(() => {
      setResponseModalOpen(false);
      setResponseText('');
      setResponseSuccessMsg(false);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Under Review</span>;
      case 'Awaiting Information':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 animate-pulse">Action Required</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">{status}</span>;
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B477F] to-[#155A91] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm mb-3">
            <Shield className="w-3.5 h-3.5 text-blue-200" />
            <span>Public / Complainant Portal • Citizen Services</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Track your registered AICTE complaints in real-time, view official verification milestones, and submit required clarifications directly to bureau officers.
          </p>
        </div>

        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0B477F] text-sm font-bold rounded-xl hover:bg-blue-50 transition-all shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#0B477F]" />
          <span>Register New Complaint</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#53677D] uppercase tracking-wider">Total Complaints</span>
            <div className="w-9 h-9 rounded-lg bg-[#E5F1FC] text-[#0B477F] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#17324D] mt-2">{stats.total}</p>
          <p className="text-xs text-[#53677D] mt-1">Submitted under your profile</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#53677D] uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#17324D] mt-2">{stats.underReview}</p>
          <p className="text-xs text-[#53677D] mt-1">Active scrutiny & inquiry</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#53677D] uppercase tracking-wider">Action Required</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{stats.awaitingInfo}</p>
          <p className="text-xs text-[#53677D] mt-1">Clarification requested</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#53677D] uppercase tracking-wider">Resolved</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{stats.resolved}</p>
          <p className="text-xs text-[#53677D] mt-1">Officially redressed</p>
        </div>
      </div>

      {/* Main Content: Tracking Widget + My Complaints Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Submitted Complaints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#17324D]">My Registered Complaints</h2>
                <p className="text-xs text-[#53677D]">
                  Click on any complaint to inspect its official status and lifecycle progression.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#F1F7FC] text-[#0B477F] rounded-md border border-[#D6E4F0]">
                {myComplaints.length} Records
              </span>
            </div>

            {myComplaints.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[#D6E4F0] rounded-xl">
                <FileText className="w-12 h-12 text-[#53677D] mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold text-[#17324D]">No complaints registered yet</p>
                <p className="text-xs text-[#53677D] mt-1">File a complaint to monitor its progress here.</p>
                <Link
                  to="/register"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B477F] text-white text-xs font-bold rounded-lg"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register First Complaint</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myComplaints.map(complaint => {
                  const isSelected = trackedCase?.id === complaint.id;
                  const needsInfo = complaint.status === 'Awaiting Information' || complaint.verificationStatus === 'Needs Information';

                  return (
                    <div
                      key={complaint.id}
                      onClick={() => setSelectedCaseId(complaint.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0B477F] bg-[#F1F7FC] shadow-sm ring-1 ring-[#0B477F]'
                          : 'border-[#D6E4F0] bg-white hover:border-[#155A91] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0B477F]">
                            {complaint.id}
                          </span>
                          {complaint.referenceNumber && (
                            <span className="text-[11px] font-mono text-[#53677D] bg-white px-1.5 py-0.5 rounded border border-[#D6E4F0]">
                              Ref: {complaint.referenceNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(complaint.status)}
                          <span className="text-[11px] text-[#53677D]">
                            Filed: {complaint.submissionDate}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-[#17324D] mb-1 line-clamp-1">
                        {complaint.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-[#53677D] mb-3">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{complaint.institutionName}</span>
                        <span>•</span>
                        <span className="truncate">{complaint.category}</span>
                      </div>

                      {/* Needs info prompt */}
                      {needsInfo && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3 text-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              <strong>Action Required:</strong> The verification officer requested clarification on this case.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenResponse(complaint.id);
                            }}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded shadow shrink-0"
                          >
                            Respond Now
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[#D6E4F0]/60 text-xs">
                        <span className="text-[#53677D]">
                          Current Stage:{' '}
                          <strong className="text-[#17324D]">
                            Stage {complaint.currentStageId || 2} / 7
                          </strong>
                        </span>
                        <span className="text-[#0B477F] font-semibold flex items-center gap-1">
                          <span>View Timeline</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Instant Status Tracker Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm sticky top-6">
            <h2 className="text-base font-bold text-[#17324D] mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#0B477F]" />
              <span>Track Complaint Status</span>
            </h2>
            <p className="text-xs text-[#53677D] mb-4">
              Enter your Complaint ID or CPGRAMS token to verify official handling stage.
            </p>

            <div className="relative mb-5">
              <input
                type="text"
                placeholder="e.g. AICTE-2026-COMP-104"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="w-full text-xs font-mono bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg px-3 py-2 pl-9 text-[#17324D] focus:outline-none focus:ring-2 focus:ring-[#0B477F]"
              />
              <Search className="w-4 h-4 text-[#53677D] absolute left-3 top-2.5" />
            </div>

            {trackedCase ? (
              <div className="space-y-4">
                <div className="bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#0B477F]">
                      {trackedCase.id}
                    </span>
                    {getStatusBadge(trackedCase.status)}
                  </div>
                  <h4 className="text-xs font-bold text-[#17324D] line-clamp-2 mt-1">
                    {trackedCase.title}
                  </h4>
                  <p className="text-[11px] text-[#53677D] mt-1">
                    Assigned Cell: <span className="font-medium text-[#17324D]">{trackedCase.bureauName}</span>
                  </p>
                </div>

                {/* Interactive Statutory 10-Stage Lifecycle Workflow */}
                <div>
                  <h4 className="text-xs font-bold text-[#17324D] uppercase tracking-wider mb-2">
                    Official 10-Stage Progression
                  </h4>
                  <ComplaintLifecycleTracker complaint={trackedCase} isPublic={true} showTimeline={false} />
                </div>

                {/* Privacy note */}
                <div className="bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg p-3 text-[11px] text-[#53677D]">
                  <p>
                    <strong>Transparency Assurance:</strong> Public complainants receive official notifications whenever a stage transition occurs. Internal confidential deliberations remain privileged.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#53677D] text-center py-6">
                No matching case found. Verify token format.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {responseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#D6E4F0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0B477F]" />
                <span>Submit Clarification / Response</span>
              </h3>
              <button
                type="button"
                onClick={() => setResponseModalOpen(false)}
                className="text-[#53677D] hover:text-[#17324D] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[#53677D] mb-4">
              Responding for Case ID: <strong className="font-mono text-[#0B477F]">{activeComplaintForResponse}</strong>.
              Your response will be appended directly to the verification docket for the handling officer.
            </p>

            {responseSuccessMsg ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-800">Response Submitted Successfully!</p>
                <p className="text-xs text-emerald-700">The verification officer has been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleSendResponse} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Your Explanation / Clarification
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Provide the requested details (e.g. date of receipt, student roll number, or transaction acknowledgement)..."
                    className="w-full text-xs p-3 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResponseModalOpen(false)}
                    className="px-4 py-2 border border-[#D6E4F0] rounded-lg text-xs font-semibold text-[#53677D] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B477F] text-white rounded-lg text-xs font-bold hover:bg-[#155A91] shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Clarification</span>
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

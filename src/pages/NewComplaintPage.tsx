import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { ComplaintCategory, ComplaintPriority, SourceChannel, Complaint } from '../types';
import { findSimilarExistingComplaints } from '../utils/matchingEngine';
import { ScoreBadge } from '../components/common/Badge';
import {
  PlusCircle,
  Building2,
  FileText,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Info,
  Upload,
  File,
  X,
  Copy,
  Check,
  Printer,
  Search,
  Users,
  Shield
} from 'lucide-react';

interface AttachedFile {
  name: string;
  size: string;
  type: string;
}

export const NewComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const { institutions, bureaus, complaints, addComplaint, hasPermission, currentUser } = useCaseTrack();

  // Complainant Identity State
  const [complainantName, setComplainantName] = useState(
    currentUser?.name && currentUser.role === 'public' ? currentUser.name : ''
  );
  const [complainantEmail, setComplainantEmail] = useState(
    currentUser?.email && currentUser.role === 'public' ? currentUser.email : ''
  );
  const [complainantPhone, setComplainantPhone] = useState(
    currentUser?.phone || '+91-98765-43210'
  );

  // Grievance Details State
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || '');
  const [category, setCategory] = useState<ComplaintCategory>('Fee Irregularity & Caution Refund');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('Normal');
  const [sourceChannel, setSourceChannel] = useState<SourceChannel>('Online Portal');
  const [bureauId, setBureauId] = useState('BUR-GRV');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // Document Upload State
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [acknowledgedSimilarity, setAcknowledgedSimilarity] = useState(false);
  const [submittedCase, setSubmittedCase] = useState<Complaint | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Selected institution metadata
  const currentInstitution = institutions.find(i => i.id === selectedInstId) || institutions[0];

  // Dynamic similarity check against existing records
  const potentialMatches = useMemo(() => {
    if (title.length < 5 && description.length < 10) return [];
    return findSimilarExistingComplaints(
      {
        institutionId: currentInstitution.id,
        institutionCode: currentInstitution.code,
        institutionName: currentInstitution.name,
        category,
        title,
        description
      },
      complaints,
      55 // similarity threshold
    );
  }, [currentInstitution, category, title, description, complaints]);

  // Handle mock file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds 10MB maximum limit.`);
        continue;
      }
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      newFiles.push({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/octet-stream'
      });
    }

    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!complainantName.trim()) {
      errors.complainantName = 'Complainant full name is required.';
    }
    if (!complainantEmail.trim() || !complainantEmail.includes('@')) {
      errors.complainantEmail = 'A valid email address is required for status notifications.';
    }
    if (!complainantPhone.trim()) {
      errors.complainantPhone = 'A valid contact phone number is required.';
    }
    if (!title.trim() || title.trim().length < 8) {
      errors.title = 'Complaint subject must be at least 8 characters long.';
    }
    if (!description.trim() || description.trim().length < 20) {
      errors.description = 'Please provide a comprehensive factual description of at least 20 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const targetBureau = bureaus.find(b => b.id === bureauId) || bureaus[0];

      const newCase = addComplaint({
        title: title.trim(),
        description: description.trim(),
        institutionId: currentInstitution.id,
        institutionCode: currentInstitution.code,
        institutionName: currentInstitution.name,
        category,
        priority: currentUser.role === 'admin' ? priority : 'Normal',
        bureauId: targetBureau.id,
        assignedOfficerId: 'USR-OFFICER-01',
        assignedOfficerName: targetBureau.officerInCharge,
        sourceChannel,
        referenceNumber: referenceNumber.trim() || undefined,
        tags: tags.length > 0 ? tags : [category.toLowerCase().split(' ')[0]],
        complainantName: complainantName.trim(),
        complainantEmail: complainantEmail.trim(),
        complainantPhone: complainantPhone.trim(),
        attachments
      });

      if (newCase) {
        setSubmittedCase(newCase);
      } else {
        alert('Permission Denied: Your current role cannot register grievances.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToken = () => {
    if (!submittedCase) return;
    navigator.clipboard.writeText(submittedCase.id);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const handleResetForm = () => {
    setSubmittedCase(null);
    setTitle('');
    setDescription('');
    setAttachments([]);
    setReferenceNumber('');
    setTagsInput('');
    setFormErrors({});
  };

  if (!hasPermission('create_complaint')) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-xs border border-slate-200 text-center space-y-4 animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Registration Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your active session role is <strong>{currentUser.role.toUpperCase()}</strong> ({currentUser.name}).
          Please switch to <strong>Public</strong> or <strong>Administrator</strong> mode to file grievance cases.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUCCESS CONFIRMATION VIEW
  // -------------------------------------------------------------
  if (submittedCase) {
    return (
      <div className="max-w-3xl mx-auto my-8 animate-fadeIn space-y-6">
        <div className="bg-white rounded-2xl shadow-md border border-emerald-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-white text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Grievance Registered Successfully</h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto">
              Your complaint has been formally ingested into the AICTE CaseTrack Central Registry. Please record your unique reference token below.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Reference Token Box */}
            <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl p-5 text-center space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                Official Complaint Reference Token
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl font-mono font-black text-[#0B477F] tracking-wide select-all">
                  {submittedCase.id}
                </span>
                <button
                  type="button"
                  onClick={copyToken}
                  className="px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs flex items-center gap-1.5"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-700" />
                      <span>Copy Token</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700">
                A verification notification has been queued for <strong className="font-semibold">{submittedCase.complainantEmail}</strong>.
              </p>
            </div>

            {/* Filing Summary Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                Filing Docket Summary
              </div>
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-medium">Institution Name</span>
                  <span className="col-span-2 font-semibold text-slate-900">{submittedCase.institutionName} ({submittedCase.institutionCode})</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-medium">Subject / Title</span>
                  <span className="col-span-2 font-semibold text-slate-900">{submittedCase.title}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-medium">Category Classification</span>
                  <span className="col-span-2 font-medium text-slate-800">{submittedCase.category}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-medium">Complainant</span>
                  <span className="col-span-2 text-slate-800">{submittedCase.complainantName} • {submittedCase.complainantPhone}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-medium">Submission Timestamp</span>
                  <span className="col-span-2 text-slate-800 font-mono">{submittedCase.submissionDate} (Initial Status: {submittedCase.status})</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-medium">Target Redressal SLA</span>
                  <span className="col-span-2 text-blue-700 font-semibold">{submittedCase.deadlineDate} (Stage 1 of 10)</span>
                </div>
                {attachments.length > 0 && (
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-slate-500 font-medium">Supporting Documents</span>
                    <span className="col-span-2 text-slate-800 font-medium">
                      {attachments.map(a => a.name).join(', ')} ({attachments.length} files attached)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  File Another Grievance
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/portal/public?track=${encodeURIComponent(submittedCase.id)}`)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Complaint Status →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // REGISTRATION FORM VIEW
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Register New Complaint Case
          </h1>
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800 border border-blue-200">
            Form 1A
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Submit technical education grievances, fee disputes, or inspection non-compliances directly into the AICTE centralized system.
        </p>
      </div>

      {/* Live Duplicate / Similarity Warning Banner */}
      {potentialMatches.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Heuristic Similarity Notice: {potentialMatches.length} Potentially Related Complaint(s) Found
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                The complaint details you entered share significant institutional identifiers and subject matter with existing cases.
                AICTE CaseTrack allows you to file independently; this warning is for officer cognizance to avoid duplicate inquiries.
              </p>

              <div className="mt-3 space-y-2">
                {potentialMatches.slice(0, 2).map(({ complaint, analysis }) => (
                  <div
                    key={complaint.id}
                    className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">{complaint.id}</span>
                        <ScoreBadge score={analysis.overallScore} />
                        <span className="text-[11px] text-slate-500">Status: {complaint.status}</span>
                      </div>
                      <div className="font-medium text-slate-800 mt-0.5">{complaint.title}</div>
                      <div className="text-[11px] text-slate-500">{complaint.institutionName}</div>
                    </div>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedSimilarity}
                  onChange={e => setAcknowledgedSimilarity(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-medium text-amber-900">
                  I have noted these existing complaints and confirm this is a distinct matter to be registered.
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {/* Section 1: Complainant Identity */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#0B477F]" />
            <span>Section 1: Complainant Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={complainantName}
                onChange={e => setComplainantName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 ${
                  formErrors.complainantName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-500/20'
                }`}
                required
              />
              {formErrors.complainantName && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.complainantName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (for Status Notifications) *
              </label>
              <input
                type="email"
                value={complainantEmail}
                onChange={e => setComplainantEmail(e.target.value)}
                placeholder="e.g. ananya.sharma@student-demo.in"
                className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 ${
                  formErrors.complainantEmail ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-500/20'
                }`}
                required
              />
              {formErrors.complainantEmail && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.complainantEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="tel"
                value={complainantPhone}
                onChange={e => setComplainantPhone(e.target.value)}
                placeholder="e.g. +91-98765-43210"
                className={`w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 ${
                  formErrors.complainantPhone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-500/20'
                }`}
                required
              />
              {formErrors.complainantPhone && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.complainantPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Target Institution */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#0B477F]" />
            <span>Section 2: Target Educational Institution</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select AICTE Approved Institution *
              </label>
              <select
                value={selectedInstId}
                onChange={e => setSelectedInstId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AICTE Permanent Institution Identifier
              </label>
              <input
                type="text"
                readOnly
                value={currentInstitution.code}
                className="w-full text-xs p-2.5 bg-slate-100 font-mono text-slate-700 border border-slate-200 rounded-lg cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category Type</span>
              <span className="font-semibold text-slate-800">{currentInstitution.type}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">State & District</span>
              <span className="font-semibold text-slate-800">{currentInstitution.district}, {currentInstitution.state}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Accreditation</span>
              <span className="font-semibold text-slate-800">{currentInstitution.accreditedGrade}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Complaint Particulars */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#0B477F]" />
            <span>Section 3: Grievance Allegation Particulars</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ComplaintCategory)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
              >
                <option value="Fee Irregularity & Caution Refund">Fee Irregularity & Caution Refund</option>
                <option value="Original Certificate Withholding">Original Certificate Withholding</option>
                <option value="Faculty Deficit & Ghost Teachers">Faculty Deficit & Ghost Teachers</option>
                <option value="Infrastructure & Lab Equipment Deficit">Infrastructure & Lab Equipment Deficit</option>
                <option value="Ragging & Campus Safety Harassment">Ragging & Campus Safety Harassment</option>
                <option value="Admission Irregularity & Quota Violation">Admission Irregularity & Quota Violation</option>
                <option value="Unapproved Course & Curriculum Deviation">Unapproved Course & Curriculum Deviation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Channel
              </label>
              <select
                value={sourceChannel}
                onChange={e => setSourceChannel(e.target.value as SourceChannel)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
              >
                <option value="Online Portal">AICTE Citizen Online Portal</option>
                <option value="National Grievance Portal">CPGRAMS National Portal</option>
                <option value="Written Petition">Written Physical Petition</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grievance Subject / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Non-refund of Rs. 25,000 caution deposit money to 2025 graduating students"
              className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-2 ${
                formErrors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-500/20'
              }`}
            />
            {formErrors.title && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description & Factual Allegation *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder="Provide comprehensive details including dates, fee receipts numbers, batch details, and specific violations under AICTE Approval Process Handbook..."
              className={`w-full text-xs p-3 rounded-lg border focus:outline-none focus:ring-2 ${
                formErrors.description ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-500/20'
              }`}
            />
            {formErrors.description && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.description}</p>
            )}
          </div>
        </div>

        {/* Section 4: Supporting Document Upload */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Upload className="w-4 h-4 text-[#0B477F]" />
              <span>Section 4: Supporting Documentary Evidence</span>
            </div>
            <span className="text-[11px] text-slate-400">PDF, JPG, PNG, DOCX (Max 10MB each)</span>
          </div>

          <div className="border-2 border-dashed border-slate-300 hover:border-[#0B477F] transition rounded-xl p-6 text-center bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Drag and drop supporting proofs, or{' '}
              <label className="text-[#0B477F] hover:underline cursor-pointer font-bold">
                browse files
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                />
              </label>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Attach fee payment receipts, correspondence with institution, admission offer letters, or NOC copies.
            </p>
          </div>

          {uploadError && (
            <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
          )}

          {attachments.length > 0 && (
            <div className="space-y-2 mt-3">
              <span className="text-xs font-bold text-slate-700 block">
                Attached Files ({attachments.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-4 h-4 text-[#0B477F] shrink-0" />
                      <span className="font-medium text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-slate-400 text-[10px]">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Administrative Configuration (Staff Only) */}
        {currentUser.role === 'admin' && (
          <div className="p-6 space-y-4 bg-blue-50/30">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B477F] uppercase tracking-wider">
              <Shield className="w-4 h-4 text-[#0B477F]" />
              <span>Section 5: Administrative Routing & Priority (Admin View)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Bureau Assignment
                </label>
                <select
                  value={bureauId}
                  onChange={e => setBureauId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none"
                >
                  {bureaus.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority Rating
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="Normal">Normal (30-day statutory SLA)</option>
                  <option value="Medium">Medium (25-day statutory SLA)</option>
                  <option value="High">High (21-day statutory SLA)</option>
                  <option value="Urgent">Urgent (14-day statutory SLA)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#0B477F] shrink-0" />
            <span>Filing creates an official immutable audit record under statutory AICTE grievance regulations.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/portal/public')}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering Docket...' : 'Submit Grievance Form 1A'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

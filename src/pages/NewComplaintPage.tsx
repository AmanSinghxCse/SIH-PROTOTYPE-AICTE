import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { ComplaintCategory, ComplaintPriority, SourceChannel } from '../types';
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
  Info
} from 'lucide-react';

export const NewComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const { institutions, bureaus, complaints, addComplaint, hasPermission, currentUser } = useCaseTrack();

  // Form State
  const [selectedInstId, setSelectedInstId] = useState(institutions[0].id);
  const [category, setCategory] = useState<ComplaintCategory>('Fee Irregularity & Caution Refund');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('High');
  const [sourceChannel, setSourceChannel] = useState<SourceChannel>('Online Portal');
  const [bureauId, setBureauId] = useState('BUR-GRV');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledgedSimilarity, setAcknowledgedSimilarity] = useState(false);

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
      55 // check threshold
    );
  }, [currentInstitution, category, title, description, complaints]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out all required fields.');
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
        priority,
        bureauId: targetBureau.id,
        assignedOfficerId: 'USR-OFFICER-01',
        assignedOfficerName: targetBureau.officerInCharge,
        sourceChannel,
        referenceNumber: referenceNumber.trim() || undefined,
        tags: tags.length > 0 ? tags : [category.toLowerCase().split(' ')[0]]
      });

      if (newCase) {
        // Automatically navigate to the newly created case
        navigate(`/case/${newCase.id}`);
      } else {
        alert('Permission Denied: Your current role is not authorized to register complaints.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasPermission('create_complaint')) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-xs border border-slate-200 text-center space-y-4 animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Registration Restricted in Read-Only Mode</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your active session role is <strong>{currentUser.role.toUpperCase()}</strong> ({currentUser.name}).
          Read-only management observers cannot submit official complaint filings.
        </p>
        <p className="text-xs text-slate-500">
          To test complaint registration, switch to <strong>Administrator</strong> or <strong>Bureau Officer</strong> via the top-right role switcher.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
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
          Ingest institutional grievances, allegations, or inspection observations into AICTE CaseTrack.
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
                    <button
                      type="button"
                      onClick={() => window.open(`/case/${complaint.id}`, '_blank')}
                      className="text-xs text-blue-600 hover:underline shrink-0"
                    >
                      Inspect Case ↗
                    </button>
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
        {/* Section A: Institution Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Section A: Target Educational Institution</span>
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

        {/* Section B: Complaint Particulars */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Section B: Complaint Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="Infrastructure & Labs">Infrastructure & Labs</option>
                <option value="Academic Administration & Faculty">Academic Administration & Faculty</option>
                <option value="Examination Malpractice & Results">Examination Malpractice & Results</option>
                <option value="Harassment & Anti-Ragging">Harassment & Anti-Ragging</option>
                <option value="Regulatory Compliance & Fraud">Regulatory Compliance & Fraud</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Classification *
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ComplaintPriority)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
              >
                <option value="Normal">Normal (30-day timeline)</option>
                <option value="Medium">Medium (25-day timeline)</option>
                <option value="High">High (21-day timeline)</option>
                <option value="Urgent">Urgent (14-day timeline)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Channel *
              </label>
              <select
                value={sourceChannel}
                onChange={e => setSourceChannel(e.target.value as SourceChannel)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
              >
                <option value="Online Portal">AICTE Online Portal</option>
                <option value="National Grievance Portal">CPGRAMS National Portal</option>
                <option value="Written Petition">Written Physical Petition</option>
                <option value="Inspection Report">Expert Inspection Report</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complaint Subject / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Non-refund of Rs. 25,000 caution deposit to graduating engineering students"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description & Allegation Minutiae *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide comprehensive factual summary including dates, batch details, departments, and specific AICTE Approval Handbook violations..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Section C: Bureau Assignment & External Ref */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Section C: Bureau Assignment & Metadata</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigning AICTE Bureau / Cell *
              </label>
              <select
                value={bureauId}
                onChange={e => setBureauId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
              >
                {bureaus.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Incharge: {b.officerInCharge})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                External Reference / CPGRAMS Docket No.
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder="e.g. CPGRAMS/2026/98214"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Search Tags / Keywords (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. caution-fee, refund, batch-2026, lab-software"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/registry')}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Register & Generate Case File</span>
          </button>
        </div>
      </form>
    </div>
  );
};

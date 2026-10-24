import React, { useState, useMemo } from 'react';
import { Complaint, Bureau } from '../../types';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { X, UserCheck, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface AssignCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  bureaus: Bureau[];
  onAssign: (id: string, bureauId: string, officerId: string, notes?: string) => void;
}

export const AssignCaseModal: React.FC<AssignCaseModalProps> = ({
  isOpen,
  onClose,
  complaint,
  bureaus,
  onAssign
}) => {
  const { users, complaints } = useCaseTrack();
  const [selectedBureauId, setSelectedBureauId] = useState(complaint.bureauId || bureaus[0]?.id || '');
  const [selectedOfficerId, setSelectedOfficerId] = useState(complaint.assignedOfficerId || 'USR-OFFICER-01');
  const [reassignNote, setReassignNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available officers
  const officers = useMemo(() => {
    return users.filter(u => u.role === 'bureau_officer' || u.role === 'officer' || u.role === 'admin');
  }, [users]);

  // Bureau officers & their active caseloads
  const officerWorkloads = useMemo(() => {
    return officers.map(officer => {
      const activeCases = complaints.filter(
        c => c.assignedOfficerId === officer.id && c.status !== 'Closed' && c.status !== 'Resolved'
      ).length;
      const isBureauMatch = officer.bureauId === selectedBureauId;
      return {
        ...officer,
        activeCases,
        isBureauMatch
      };
    }).sort((a, b) => {
      // Prioritize bureau match, then lower workload
      if (a.isBureauMatch && !b.isBureauMatch) return -1;
      if (!a.isBureauMatch && b.isBureauMatch) return 1;
      return a.activeCases - b.activeCases;
    });
  }, [officers, complaints, selectedBureauId]);

  // Optimal officer recommendation
  const recommendedOfficer = useMemo(() => {
    return officerWorkloads.find(o => o.isBureauMatch) || officerWorkloads[0];
  }, [officerWorkloads]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onAssign(complaint.id, selectedBureauId, selectedOfficerId, reassignNote);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0B477F]" />
              <span>Assign / Reassign Complaint Docket</span>
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{complaint.id} • {complaint.institutionName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Case subject preview */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B477F]">{complaint.category}</span>
              <span className="font-medium text-slate-600">Priority: <strong className="text-red-700">{complaint.priority}</strong></span>
            </div>
            <p className="text-slate-800 font-semibold">{complaint.title}</p>
          </div>

          {/* Bureau Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Responsible AICTE Bureau / Cell *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bureaus.map(b => (
                <label
                  key={b.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedBureauId === b.id
                      ? 'border-[#0B477F] bg-blue-50/70 ring-1 ring-[#0B477F]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="bureau"
                    checked={selectedBureauId === b.id}
                    onChange={() => {
                      setSelectedBureauId(b.id);
                      // Auto-select optimal officer in that bureau if available
                      const bureauMatch = officerWorkloads.find(o => o.bureauId === b.id);
                      if (bureauMatch) setSelectedOfficerId(bureauMatch.id);
                    }}
                    className="mt-0.5 text-[#0B477F] focus:ring-[#0B477F]"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{b.shortName}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{b.name}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Officer Allocation with Workload Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                2. Allocated Desk Officer & Workload Balance *
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recommendation Active</span>
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {officerWorkloads.map(officer => {
                const isSelected = selectedOfficerId === officer.id;
                const isRecommended = recommendedOfficer?.id === officer.id;

                return (
                  <label
                    key={officer.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                        : isRecommended
                        ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="officer"
                        checked={isSelected}
                        onChange={() => setSelectedOfficerId(officer.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{officer.name}</span>
                          {isRecommended && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Optimal Workload
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{officer.designation} • {officer.bureauName || 'General Bureau'}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        officer.activeCases <= 2
                          ? 'bg-emerald-100 text-emerald-800'
                          : officer.activeCases <= 4
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {officer.activeCases} active {officer.activeCases === 1 ? 'case' : 'cases'}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Directive Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              3. Assignment Directive / Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={reassignNote}
              onChange={e => setReassignNote(e.target.value)}
              placeholder="e.g. Prioritize institutional inspection and verify lab compliance within statutory window."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B477F]/20 focus:border-[#0B477F]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B477F] hover:bg-[#155A91] rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch Docket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

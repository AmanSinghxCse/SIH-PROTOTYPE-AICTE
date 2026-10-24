import React, { useState, useMemo } from 'react';
import { Bureau, User } from '../../types';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { X, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComplaintIds: string[];
  bureaus: Bureau[];
  users: User[];
  onBulkAssign: (ids: string[], bureauId: string, officerId: string, notes?: string) => void;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  selectedComplaintIds,
  bureaus,
  users,
  onBulkAssign
}) => {
  const { complaints } = useCaseTrack();
  const [selectedBureauId, setSelectedBureauId] = useState(bureaus[0]?.id || 'BUR-GRV');
  const [selectedOfficerId, setSelectedOfficerId] = useState('USR-OFFICER-01');
  const [directiveNote, setDirectiveNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const officers = useMemo(() => {
    return users.filter(u => u.role === 'bureau_officer' || u.role === 'officer' || u.role === 'admin');
  }, [users]);

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
      if (a.isBureauMatch && !b.isBureauMatch) return -1;
      if (!a.isBureauMatch && b.isBureauMatch) return 1;
      return a.activeCases - b.activeCases;
    });
  }, [officers, complaints, selectedBureauId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onBulkAssign(selectedComplaintIds, selectedBureauId, selectedOfficerId, directiveNote);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-black text-[#17324D] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0B477F]" />
              <span>Bulk Case Allocation</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Allocating <strong>{selectedComplaintIds.length}</strong> selected complaints simultaneously
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Bureau */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Assign to AICTE Bureau / Cell *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bureaus.map(b => (
                <label
                  key={b.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
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
                      const match = officerWorkloads.find(o => o.bureauId === b.id);
                      if (match) setSelectedOfficerId(match.id);
                    }}
                    className="mt-0.5 text-[#0B477F]"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{b.shortName}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{b.name}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target Officer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Allocate Desk Officer *
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {officerWorkloads.map(officer => {
                const isSelected = selectedOfficerId === officer.id;
                return (
                  <label
                    key={officer.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="officer"
                        checked={isSelected}
                        onChange={() => setSelectedOfficerId(officer.id)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{officer.name}</div>
                        <div className="text-[10px] text-slate-500">{officer.designation}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {officer.activeCases} active
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Allocation Directive */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              3. Administrative Directive / Instructions
            </label>
            <textarea
              rows={2}
              value={directiveNote}
              onChange={e => setDirectiveNote(e.target.value)}
              placeholder="e.g. Bulk allocation for preliminary scrutiny and inspection coordination."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B477F]/20"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B477F] hover:bg-[#155A91] rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Bulk Allocation ({selectedComplaintIds.length})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

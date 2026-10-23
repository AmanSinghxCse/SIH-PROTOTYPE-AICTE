import React, { useState } from 'react';
import { Complaint, Bureau } from '../../types';
import { X, UserCheck } from 'lucide-react';

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
  const [selectedBureauId, setSelectedBureauId] = useState(complaint.bureauId);
  const [reassignNote, setReassignNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentBureau = bureaus.find(b => b.id === selectedBureauId) || bureaus[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onAssign(complaint.id, selectedBureauId, 'USR-OFFICER-01', reassignNote);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assign / Reassign Complaint</h3>
            <p className="text-xs text-slate-500">{complaint.id} • {complaint.institutionName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Responsible AICTE Bureau / Cell *
            </label>
            <div className="space-y-2">
              {bureaus.map(b => (
                <label
                  key={b.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedBureauId === b.id
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="bureau"
                    checked={selectedBureauId === b.id}
                    onChange={() => setSelectedBureauId(b.id)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{b.name}</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{b.description}</div>
                    <div className="text-[11px] text-blue-700 font-medium mt-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      Incharge Officer: {b.officerInCharge}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assignment Directive / Note (Optional)
            </label>
            <textarea
              rows={2}
              value={reassignNote}
              onChange={e => setReassignNote(e.target.value)}
              placeholder="e.g. Please expedite scrutiny regarding laboratory compliance."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
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
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

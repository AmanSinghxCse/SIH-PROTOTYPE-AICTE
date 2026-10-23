import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  onUpdate: (id: string, newStatus: ComplaintStatus, reason: string) => void;
}

const ALL_STATUSES: ComplaintStatus[] = [
  'Open',
  'Under Review',
  'Awaiting Information',
  'Escalated',
  'Resolved',
  'Closed'
];

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onUpdate
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === complaint.status) {
      setError('Please choose a different status transition.');
      return;
    }
    if (!reason.trim()) {
      setError('Official justification/reason is required for this status change.');
      return;
    }

    setIsSubmitting(true);
    try {
      onUpdate(complaint.id, selectedStatus, reason.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Update Complaint Status</h3>
            <p className="text-xs text-slate-500">{complaint.id} • {complaint.institutionName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Current Status
            </label>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-700 font-medium">Present State:</span>
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select New Status *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map(st => (
                <button
                  type="button"
                  key={st}
                  onClick={() => {
                    setSelectedStatus(st);
                    setError('');
                  }}
                  className={`p-2.5 text-xs font-medium rounded-lg border text-left flex items-center justify-between transition-all ${
                    selectedStatus === st
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{st}</span>
                  {selectedStatus === st && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Official Justification / Note *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="e.g. Received satisfactory inquiry explanation from Registrar; documents verified."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              This entry will be permanently recorded in the Case Lifecycle Timeline and Audit Trail.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
              Confirm Status Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

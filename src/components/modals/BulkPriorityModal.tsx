import React, { useState } from 'react';
import { ComplaintPriority } from '../../types';
import { X, Flame, CheckCircle2 } from 'lucide-react';

interface BulkPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComplaintIds: string[];
  onBulkUpdatePriority: (ids: string[], newPriority: ComplaintPriority, reason: string) => void;
}

export const BulkPriorityModal: React.FC<BulkPriorityModalProps> = ({
  isOpen,
  onClose,
  selectedComplaintIds,
  onBulkUpdatePriority
}) => {
  const [priority, setPriority] = useState<ComplaintPriority>('High');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      onBulkUpdatePriority(selectedComplaintIds, priority, reason.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#17324D] flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Bulk Priority Escalation</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Updating priority for <strong>{selectedComplaintIds.length}</strong> selected complaints
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Target Priority Level *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Critical', 'High', 'Urgent', 'Medium', 'Low'] as ComplaintPriority[]).map(p => (
                <label
                  key={p}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-bold ${
                    priority === p
                      ? 'border-[#0B477F] bg-blue-50 text-[#0B477F] ring-1 ring-[#0B477F]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="text-[#0B477F]"
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Statutory Justification / Escalation Reason *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Expedited fast-track scrutiny mandated due to anti-ragging allegations."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B477F]/20"
            />
          </div>

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
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B477F] hover:bg-[#155A91] rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Update Priority ({selectedComplaintIds.length})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

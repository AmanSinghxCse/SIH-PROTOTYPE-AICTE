import React, { useState } from 'react';
import { Complaint } from '../../types';
import { X, MessageSquare, AlertCircle } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  onAddNote: (complaintId: string, content: string, actionItem?: string, isOfficialAction?: boolean) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onAddNote
}) => {
  const [content, setContent] = useState('');
  const [actionItem, setActionItem] = useState('');
  const [isOfficialAction, setIsOfficialAction] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter note content.');
      return;
    }

    setIsSubmitting(true);
    try {
      onAddNote(complaint.id, content.trim(), actionItem.trim() || undefined, isOfficialAction);
      setContent('');
      setActionItem('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Case Follow-up Note</h3>
              <p className="text-xs text-slate-500">{complaint.id} • {complaint.institutionName}</p>
            </div>
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Note / Inquiry Minute *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={e => {
                setContent(e.target.value);
                setError('');
              }}
              placeholder="Record official actions, telephonic hearing minutes, document verifications, or status inquiries..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Required Next Action / Target (Optional)
            </label>
            <input
              type="text"
              value={actionItem}
              onChange={e => setActionItem(e.target.value)}
              placeholder="e.g. Schedule virtual hearing before Regional Committee by 28-Oct"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isOfficialAction}
              onChange={e => setIsOfficialAction(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700">
              Flag as <strong>Official Compliance Action</strong> in Case Timeline
            </span>
          </label>

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
              Save Follow-up Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

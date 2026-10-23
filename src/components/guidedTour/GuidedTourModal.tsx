import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  LayoutDashboard,
  FileText,
  Search,
  Building2,
  GitCompare,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TOUR_STEPS = [
  {
    step: 1,
    title: 'Step 1: AICTE CaseTrack Dashboard & Workload Overview',
    route: '/',
    icon: LayoutDashboard,
    badge: 'Centralized Visibility',
    description:
      'The executive dashboard consolidates institution complaints across all 5 AICTE Bureaus. All 6 KPI cards (Total, Open, Under Review, Overdue, Approaching, Resolved) are dynamically computed from stored records. Interactive charts illustrate status breakdown, case ageing buckets, and bureau workload.',
    actionPrompt: 'Examine the summary cards and the ageing distribution histogram.'
  },
  {
    step: 2,
    title: 'Step 2: Centralized Registry & Multi-Parameter Filter',
    route: '/registry',
    icon: Search,
    badge: 'Registry & Search',
    description:
      'Browse through all 26 seeded fictional complaints. Use the live search bar or filter by Bureau (e.g. Grievance Cell), Case Status, or Overdue toggle. Notice column sorting, pagination, and one-click CSV report export for official compliance reviews.',
    actionPrompt: 'Filter by "Overdue Cases" or type "Sunrise College" in the search box.'
  },
  {
    step: 3,
    title: 'Step 3: Comprehensive Case Details & Lifecycle Tracking',
    route: '/case/AICTE-2026-COMP-104',
    icon: FileText,
    badge: 'Lifecycle Tracking',
    description:
      'Inspect case AICTE-2026-COMP-104. The header provides instant visibility into deadline dates, ageing (35 days), and bureau allocation. Explore the 6 tabs: Overview, Chronological Timeline, Assignment & Status transition validator, Related Cases, Officer Notes, and Audit Trail.',
    actionPrompt: 'Switch between the "Case Timeline" and "Notes & Follow-ups" tabs.'
  },
  {
    step: 4,
    title: 'Step 4: Institution Directory & Entity-Level History',
    route: '/institutions',
    icon: Building2,
    badge: 'Institutional Accountability',
    description:
      'AICTE CaseTrack indexes complaint history by Institution Identifier (e.g. AICTE-1-9238412). This enables officers to spot repeat offenders regardless of whether complaints originate from students, faculty, or inspection teams.',
    actionPrompt: 'Click on "Sunrise College of Engineering" to view its full dossier.'
  },
  {
    step: 5,
    title: 'Step 5: Explainable Related-Case Detection Engine',
    route: '/related-cases',
    icon: GitCompare,
    badge: 'Heuristic Matching',
    description:
      'Instead of an opaque black box, our explainable matching algorithm evaluates 4 transparent signals: Institution Code Match (40 pts), Category Agreement (25 pts), Semantic/Jaccard Token Overlap (30 pts), and Filing Date Proximity (5 pts).',
    actionPrompt: 'Review the high-confidence suggestion between COMP-104 and COMP-112.'
  },
  {
    step: 6,
    title: 'Step 6: Officer Review & Interactive Sandbox',
    route: '/related-cases',
    icon: CheckCircle2,
    badge: 'Human-in-the-Loop',
    description:
      'AICTE policy strictly requires human oversight: similarity scores never automatically merge or close cases. Authorized officers can review signal explanations, confirm relationships, or mark as unrelated. Try out the Sandbox at the bottom to test any two complaints!',
    actionPrompt: 'Scroll down to the "Interactive Comparison Sandbox" and select two test cases.'
  },
  {
    step: 7,
    title: 'Step 7: Case Ageing & Deadline Monitoring Alerts',
    route: '/alerts',
    icon: AlertTriangle,
    badge: 'Deadline Control',
    description:
      'Proactively identifies overdue cases and those approaching their statutory deadline (within 5 days). Bureau officers can filter by urgency, open the affected case file, and mark alerts as officially acknowledged with full audit logging.',
    actionPrompt: 'Review the "Overdue Cases" and click "Acknowledge Alert".'
  },
  {
    step: 8,
    title: 'Step 8: Management Analytics & Resolution Trends',
    route: '/analytics',
    icon: BarChart3,
    badge: 'Executive Analytics',
    description:
      'Provides high-level leadership with genuine calculated insights: Average Resolution Turnaround (e.g., 17.8 days for resolved cases), Bureau workload distribution, Overdue frequency by category, and Related Case confirmation rates.',
    actionPrompt: 'Check the "Methodology & Transparency" panel at the bottom.'
  },
  {
    step: 9,
    title: 'Step 9: Tamper-Evident Audit Trail & Security',
    route: '/audit',
    icon: ShieldCheck,
    badge: 'Governance & Auditing',
    description:
      'Every status transition, reallocation, note addition, alert review, and related-case confirmation is permanently recorded in the audit trail with actor name, role, timestamp, previous value, and new value. Strict role-based permissions safeguard official actions.',
    actionPrompt: 'Search the audit log to see recent events recorded during this session.'
  }
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      navigate(TOUR_STEPS[nextIdx].route);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      navigate(TOUR_STEPS[prevIdx].route);
    }
  };

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index);
    navigate(TOUR_STEPS[index].route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-blue-200">
                SIH26264 Demonstration Walkthrough
              </div>
              <h2 className="text-lg font-bold">AICTE CaseTrack Guided Demo</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress pills */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => handleGoToStep(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all ${
                idx === currentStepIndex
                  ? 'bg-blue-600 text-white shadow-sm'
                  : idx < currentStepIndex
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span>{s.step}</span>
            </button>
          ))}
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                <StepIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded border border-indigo-200 mb-1">
                  {currentStep.badge}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{currentStep.title}</h3>
              </div>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">{currentStep.description}</p>

          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center gap-3 text-amber-900 text-xs">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
            <div>
              <strong className="font-semibold">Recommended action: </strong>
              {currentStep.actionPrompt}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Exit Guided Demo
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                currentStepIndex === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

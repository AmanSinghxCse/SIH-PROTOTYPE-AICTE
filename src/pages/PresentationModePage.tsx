import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  LayoutDashboard,
  Building2,
  FileText,
  GitCompare,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Award
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  icon: any;
  bulletPoints: string[];
  keyTakeaway: string;
  demoRoute?: string;
  demoAction?: string;
}

const PRESENTATION_SLIDES: Slide[] = [
  {
    id: 1,
    title: 'The AICTE Complaint Monitoring Challenge',
    subtitle: 'Problem Statement ID: SIH26264',
    category: 'The Problem Statement',
    icon: HelpCircle,
    bulletPoints: [
      'Grievances against approved technical institutions were historically siloed across disconnected bureaus (Approval Bureau, Grievance Cell, Faculty Welfare, QA, Anti-Ragging).',
      'Officers lacked holistic visibility into institution-wide history: repeat infractions in one department were invisible to another bureau.',
      'Statutory resolution deadlines risked slipping through without proactive automated ageing surveillance.',
      'Complaints concerning the same underlying violation (e.g. caution fee retention or faculty pay delays) were handled as isolated filings with redundant inquiries.'
    ],
    keyTakeaway: 'SIH26264 demands a centralized, accountable, and explainable interface bridging all AICTE cells.'
  },
  {
    id: 2,
    title: 'Integrated Dashboard & Cross-Bureau Telemetry',
    subtitle: 'Centralized Visibility Across 5 AICTE Cells',
    category: 'Executive Dashboard',
    icon: LayoutDashboard,
    bulletPoints: [
      'Unified executive surveillance consolidating complaints across Approval, Grievance, Faculty Welfare, Quality Assurance, and Anti-Ragging cells.',
      'Dynamic real-time summary cards: Total Cases, Open, Under Review, Overdue, Approaching Deadline, and Resolved.',
      'Live Recharts analytics showing status distribution, monthly intake trends, and pending vs resolved ratios per bureau.',
      'Clicking any metric instantly filters the complaint registry for drill-down action.'
    ],
    keyTakeaway: 'Eliminates departmental silos by providing an instant unified operational pulse.',
    demoRoute: '/',
    demoAction: 'Explore Dashboard KPI Cards'
  },
  {
    id: 3,
    title: 'Institution-Centric Dossier & Entity Accountability',
    subtitle: 'Primary Indexing by AICTE Permanent Institution ID',
    category: 'Institutional Intelligence',
    icon: Building2,
    bulletPoints: [
      'Indexed primarily by AICTE Permanent Institution ID (e.g. AICTE-1-8492011) to avoid ambiguities arising from identical or similar college names.',
      'Full longitudinal history of all grievances, inspection deficiencies, and approval discrepancies ever lodged against an institution.',
      'Calculates real-time risk factors: overdue complaint frequency, active investigation counts, and resolution compliance rates.',
      'Assists Approval Bureau during annual Extension of Approval (EoA) decisions with instant complaint dossiers.'
    ],
    keyTakeaway: 'Empowers officers to spot systemic non-compliance across multiple academic years.',
    demoRoute: '/institutions',
    demoAction: 'Inspect Institution Dossiers'
  },
  {
    id: 4,
    title: 'Case Lifecycle Tracking & State Machine Governance',
    subtitle: 'Enforced Status Transitions & Verifiable Timeline',
    category: 'Case Lifecycle Management',
    icon: FileText,
    bulletPoints: [
      'Six-tab detailed case dossier: Overview, Chronological Timeline, Bureau Assignment, Related Cases, Officer Notes, and Audit Trail.',
      'Strict state machine transitions: Open → Under Review → Awaiting Information → Escalated → Resolved / Closed.',
      'Mandates formal written justifications for every status modification or bureau transfer.',
      'Chronological event stream permanently preserves all official actions, directives, and inquiry minutes.'
    ],
    keyTakeaway: 'Guarantees procedural fairness, procedural auditability, and institutional transparency.',
    demoRoute: '/case/AICTE-2026-COMP-104',
    demoAction: 'Inspect Case COMP-104 File'
  },
  {
    id: 5,
    title: 'Explainable Related-Case Detection Engine',
    subtitle: 'Transparent Weighted Heuristics (Human-in-the-Loop)',
    category: 'AI / Heuristic Innovation',
    icon: GitCompare,
    bulletPoints: [
      'Evaluates 4 transparent dimensions: Institution ID Match (40 pts), Category Agreement (25 pts), Semantic/Jaccard Keyword Overlap (30 pts), and Filing Date Proximity (5 pts).',
      'Normalized 0-100% similarity score with itemized explainable signal breakdown (e.g. "Shared terms: [caution, deposit, refund] [+22 pts]").',
      'Configurable administrator detection thresholds (default: 65%).',
      'Strict AI safety policy: Heuristic scores never automatically merge or close cases. Authorized officer confirmation is mandatory.'
    ],
    keyTakeaway: 'Surfaces coordinated or duplicate complaints with full mathematical explainability.',
    demoRoute: '/related-cases',
    demoAction: 'Test the Interactive Sandbox'
  },
  {
    id: 6,
    title: 'Case Ageing Surveillance & Deadline Safeguards',
    subtitle: 'Proactive Alerting & Statutory Escalations',
    category: 'Deadline Control',
    icon: AlertTriangle,
    bulletPoints: [
      'Continuous evaluation of days remaining against configured statutory target dates.',
      'Distinct alert classifications: Critical Overdue, Approaching Deadline (within 5 days), and Escalation Urged.',
      'Officers can formally acknowledge alerts, recording the timestamp and review note into the case audit trail.',
      'Prevents grievances from languishing unaddressed in bureaucratic limbo.'
    ],
    keyTakeaway: 'Transforms complaint resolution from reactive firefighting to proactive deadline enforcement.',
    demoRoute: '/alerts',
    demoAction: 'Review Active Deadline Alerts'
  },
  {
    id: 7,
    title: 'Management Analytics & Turnaround Benchmarking',
    subtitle: 'Empirical Insights Derived from Ground Truth Records',
    category: 'Executive Insights',
    icon: BarChart3,
    bulletPoints: [
      'Accurate Average Resolution Turnaround (e.g. 17.8 days) calculated strictly from valid submission-to-resolution timestamps.',
      'Category-wise grievance distribution identifying systemic regulatory friction points (e.g., Caution Deposit refunds and Lab Software licensing).',
      'Officer workload balancing to prevent uneven case distributions across bureaus.',
      'One-click export of structured analytics data for Council committee reviews.'
    ],
    keyTakeaway: 'Provides high-level leadership with genuine statistical truth to drive policy improvements.',
    demoRoute: '/analytics',
    demoAction: 'View Turnaround Analytics'
  },
  {
    id: 8,
    title: 'Security, Role-Based Access & Tamper-Evident Audit',
    subtitle: 'Enterprise Government Architecture',
    category: 'Security & Governance',
    icon: ShieldCheck,
    bulletPoints: [
      'Four distinct application roles: Administrator, Bureau Officer, Supervisor, and Read-only Management.',
      'Permissions enforced at operational boundaries—not merely hidden frontend buttons.',
      'Every mutation (status changes, reassignments, notes, relationship confirmations) is immutably logged with actor identity.',
      'Ready for Supabase PostgreSQL Row Level Security (RLS) with complete SQL schema provided.'
    ],
    keyTakeaway: 'Built according to government-grade data protection and auditing principles.',
    demoRoute: '/audit',
    demoAction: 'Inspect Audit Logs'
  },
  {
    id: 9,
    title: 'Current Limitations & Production Roadmap',
    subtitle: 'Responsible AI & Live Integration Readiness',
    category: 'Transparency & Future Scope',
    icon: Award,
    bulletPoints: [
      'Current Prototype Limitation: Uses realistic fictional data for SIH evaluation. Live AICTE database connection is not configured.',
      'Related-Case Scoring: Currently employs explainable rule-based heuristics; production roadmap includes fine-tuning lightweight bilingual sentence embeddings on verified historical AICTE case files.',
      'Multi-lingual Grievance Intake: Planned voice-to-text and vernacular NLP translation for regional student petitions.',
      'DigiLocker Integration: Planned verification of student enrollment and bonafide credentials.'
    ],
    keyTakeaway: 'A realistic, production-viable solution that enhances human decision-making rather than replacing it.',
    demoRoute: '/about',
    demoAction: 'Review Architecture Blueprint'
  }
];

export const PresentationModePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slide = PRESENTATION_SLIDES[currentSlideIndex];
  const Icon = slide.icon;

  const handleNext = () => {
    if (currentSlideIndex < PRESENTATION_SLIDES.length - 1) {
      setCurrentSlideIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(i => i - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B192C] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Presentation Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/60">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">AICTE CaseTrack</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-300 border border-blue-700">
                SIH26264
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Smart India Hackathon Presentation Mode</div>
          </div>
        </div>

        {/* Slide Counter & Close Button */}
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Slide <strong className="text-white">{currentSlideIndex + 1}</strong> of {PRESENTATION_SLIDES.length}
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Exit Presentation</span>
          </button>
        </div>
      </div>

      {/* Main Slide Card Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl p-8 sm:p-10 space-y-6 animate-fadeIn">
          {/* Slide Tag & Category */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {slide.category}
            </span>

            {slide.demoRoute && (
              <button
                onClick={() => navigate(slide.demoRoute!)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline font-semibold"
              >
                <span>Jump to Live Feature: {slide.demoAction}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Slide Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Icon className="w-7 h-7 text-blue-400 shrink-0" />
              <span>{slide.title}</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 font-medium">{slide.subtitle}</p>
          </div>

          {/* Bullet Points */}
          <div className="space-y-3 pt-2">
            {slide.bulletPoints.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <div>{pt}</div>
              </div>
            ))}
          </div>

          {/* Key Takeaway Banner */}
          <div className="p-4 bg-gradient-to-r from-[#064578]/90 to-[#0B477F]/90 border border-white/20 rounded-xl flex items-center gap-3 text-sm text-[#E5F1FC]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white font-bold">Key Architectural Takeaway: </strong>
              {slide.keyTakeaway}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
        <div className="text-[11px] text-slate-500 hidden sm:block">
          Use the arrow buttons or keys to navigate the SIH pitch sequence.
        </div>

        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Slide Dots */}
          <div className="flex items-center gap-1.5 px-2">
            {PRESENTATION_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-blue-500'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

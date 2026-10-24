import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck2,
  Users,
  Building2,
  Eye,
  Send,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Calendar,
  AlertTriangle,
  Flame,
  FileText
} from 'lucide-react';

export const AdminHowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const STEPS = [
    {
      num: 1,
      title: 'Complaint Registration & Intake Governance',
      stage: 'Stage 1: Intake',
      icon: FileText,
      desc: 'Complainant files grievance through Public Portal. AI auto-detects complaint category, urgency, and duplicate similarity scores. System generates unique reference token and verification docket.'
    },
    {
      num: 2,
      title: 'Initial Document Scrutiny & Verification',
      stage: 'Stage 2: Scrutiny',
      icon: FileCheck2,
      desc: 'Central verification staff inspect institutional AICTE approval code, prima facie documentation, and affidavits. If key proofs are missing, status transitions to "Needs Information" with citizen clarification prompt.'
    },
    {
      num: 3,
      title: 'Intelligent Bureau & Officer Allocation',
      stage: 'Stage 3: Allocation',
      icon: Users,
      desc: 'Nodal administration allocates verified complaint to the competent statutory bureau (PGR, Approval, Anti-Ragging, etc.) using live officer workload balancing and subject-matter jurisdiction rules.'
    },
    {
      num: 4,
      title: 'Preliminary Investigation & Evidence Correlation',
      stage: 'Stage 4: Preliminary Inquiry',
      icon: Eye,
      desc: 'Assigned desk officer examines grievance history, historical college violations, cross-referenced related dockets, and on-ground reports to formulate an inquiry roadmap.'
    },
    {
      num: 5,
      title: 'Citizen Clarification & Supplementary Evidence',
      stage: 'Stage 5: Clarification',
      icon: RotateCcw,
      desc: 'When student statements or transaction proofs are incomplete, official issues a formal query to the complainant. Complainant responds securely through their token-authenticated portal.'
    },
    {
      num: 6,
      title: 'Statutory Institution Explanation Notice',
      stage: 'Stage 6: Institutional Notice',
      icon: Send,
      desc: 'Bureau desk issues formal Section 10/11 directive to the college registrar with specific inquiry points and a mandatory 7-day rejoinder deadline. College submits written reply and annexures.'
    },
    {
      num: 7,
      title: 'Administrative Action & Standing Inquiry Committee',
      stage: 'Stage 7: Inquiry & Hearings',
      icon: AlertTriangle,
      desc: 'If institution rejoinder is unsatisfactory, case is escalated to an on-site expert committee inspection or regional hearing to record witness testimonies and audit physical records.'
    },
    {
      num: 8,
      title: 'Resolution Recommendation Formulation',
      stage: 'Stage 8: Resolution Formulation',
      icon: CheckCircle2,
      desc: 'Desk officer formulates formal resolution findings, recommending corrective directives, caution money refunds, intake reductions, or warning notices under AICTE Redressal Regulations 2019.'
    },
    {
      num: 9,
      title: 'Competent Authority Closure Review & Sanction',
      stage: 'Stage 9: Closure Sanction',
      icon: ShieldCheck,
      desc: 'Central Nodal Administrator reviews recommended resolution findings against statutory regulations. If approved, closure order is digitally sanctioned; otherwise, remanded for re-inquiry.'
    },
    {
      num: 10,
      title: 'Disposal, Archiving & Public Notification',
      stage: 'Stage 10: Disposed & Archived',
      icon: Lock,
      desc: 'Final sanitized compliance summary is published to complainant tracking dashboard. Case record is immutably archived into council repository with full audit trail preservation.'
    },
    {
      num: 11,
      title: 'Audit Trail, Analytics & Post-Closure Governance',
      stage: 'Post-Closure Oversight',
      icon: Building2,
      desc: 'System commits cryptographic audit logs for every transition. If new evidence emerges, authorized central administrators retain jurisdiction to reopen docket with mandatory re-inquiry justification.'
    }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/portal/admin')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0B477F] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Administration Command Center</span>
          </button>
          <h1 className="text-2xl font-black text-[#17324D] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#0B477F]" />
            <span>Administration Complaint Redressal Lifecycle & Governance</span>
          </h1>
          <p className="text-xs text-[#53677D] mt-1 max-w-3xl leading-relaxed">
            Statutory standard operating procedures (SOP) governing administrative complaint oversight, bureau allocation, verification standards, deadline rules, and final closure review under AICTE guidelines.
          </p>
        </div>

        <Link
          to="/registry"
          className="px-4 py-2 bg-[#0B477F] text-white hover:bg-[#155A91] rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Open Complaint Registry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Role & Responsibility Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B477F] flex items-center justify-center font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#17324D]">Central Administrator</div>
          <p className="text-[11px] text-[#53677D] leading-relaxed">
            Full system oversight, user role provisioning, bureau workload monitoring, deadline extensions, and final closure sanctions.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#17324D]">Bureau Desk Officer</div>
          <p className="text-[11px] text-[#53677D] leading-relaxed">
            Operational case examination, statutory institution notice dispatch, rejoinder recording, and resolution recommendation drafting.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#17324D]">Statutory SLA Policy</div>
          <p className="text-[11px] text-[#53677D] leading-relaxed">
            Standard 30-day resolution timeline; Urgent/Critical 14-day timeline. Automated warning alerts fire 72 hours before deadline.
          </p>
        </div>
      </div>

      {/* Step-by-Step Administrative Workflow */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#17324D] flex items-center gap-2">
          <span>The 11-Stage Statutory Workflow Explained</span>
        </h2>

        <div className="space-y-3">
          {STEPS.map(step => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 bg-white rounded-xl border border-[#D6E4F0] shadow-xs flex flex-col sm:flex-row items-start gap-4 hover:border-[#0B477F] transition"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E5F1FC] text-[#0B477F] flex items-center justify-center shrink-0 font-black text-sm">
                  {step.num}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-black text-[#17324D]">{step.title}</h3>
                    <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {step.stage}
                    </span>
                  </div>
                  <p className="text-xs text-[#53677D] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

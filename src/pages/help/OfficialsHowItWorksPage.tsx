import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
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
  FileText,
  ListTodo,
  Sparkles
} from 'lucide-react';

export const OfficialsHowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const STEPS = [
    {
      num: 1,
      title: 'Access Assigned Dockets & Bureau Workspace',
      icon: Briefcase,
      desc: 'Log in to Government Officials Portal. Review "My Assigned Complaints" and "Bureau Unit Queue" on your operational desk. Filter by urgency or SLA approaching deadline.'
    },
    {
      num: 2,
      title: 'Scrutinize Grievance Facts & Complainant Statements',
      icon: FileText,
      desc: 'Open the case drawer to read the full complainant statement, alleged dates of occurrence, fee dispute amounts, and supporting documentary proofs.'
    },
    {
      num: 3,
      title: 'Examine Lifecycle Stage & SLA Remaining Timeline',
      icon: Calendar,
      desc: 'Verify current lifecycle stage (Stage 3 Allocation / Stage 5 Review / Stage 6 Notice). Note the statutory deadline countdown (30 days for Normal, 14 days for Urgent).'
    },
    {
      num: 4,
      title: 'Audit Institution Historical Track Record & Patterns',
      icon: Building2,
      desc: 'Inspect the college profile to check previous compliance history, recurring fee irregular allegations, and whether previous directives were implemented.'
    },
    {
      num: 5,
      title: 'Record Preliminary Inquiry Findings & Evidence Notes',
      icon: Eye,
      desc: 'Add confidential case notes documenting prima facie merit, missing documents, or preliminary telephonic inquiries with department heads.'
    },
    {
      num: 6,
      title: 'Issue Complainant Clarification Request (Needs Info)',
      icon: Users,
      desc: 'If complainant receipts or student identity cards are ambiguous, issue a formal clarification query. Status changes to "Needs Information" until citizen replies.'
    },
    {
      num: 7,
      title: 'Dispatch Statutory Institutional Explanation Notice',
      icon: Send,
      desc: 'Issue formal Section 10/11 notice to college registrar requiring itemized response and documentary rejoinder within a mandatory 7-day period.'
    },
    {
      num: 8,
      title: 'Log Institutional Rejoinder & Compliance Documents',
      icon: FileCheck2,
      desc: 'Once the college submits its written defense and proof of corrective action, log the rejoinder text and letter reference numbers into the case timeline.'
    },
    {
      num: 9,
      title: 'Track Priority Operational Tasks & Follow-ups',
      icon: ListTodo,
      desc: 'Maintain daily follow-up checklists for phone inquiries, documentary verifications, and on-site inspection schedule reminders.'
    },
    {
      num: 10,
      title: 'Request Supervisory Escalation for Obstruction / Urgency',
      icon: Flame,
      desc: 'If college fails to reply or ragging/safety risks are identified, escalate docket to Regional Officer or Director for emergency committee intervention.'
    },
    {
      num: 11,
      title: 'Formulate Formal Resolution Recommendations (Stage 8)',
      icon: CheckCircle2,
      desc: 'Draft comprehensive findings, specifying refund orders, compliance deadlines, or penalties under AICTE Redressal Regulations 2019.'
    },
    {
      num: 12,
      title: 'Submit for Administrative Closure Review & Compliance',
      icon: Lock,
      desc: 'Submit draft resolution to the Competent Nodal Authority for Stage 9 sanction review. Monitor compliance until final order is executed and record archived.'
    }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/portal/officials')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0B477F] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Government Officials Portal</span>
          </button>
          <h1 className="text-2xl font-black text-[#17324D] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#0B477F]" />
            <span>Government Officials Operational Investigation & Case Guide</span>
          </h1>
          <p className="text-xs text-[#53677D] mt-1 max-w-3xl leading-relaxed">
            Standard operating manual for Council desk officers, inquiry in-charges, and bureau teams handling technical education grievance dockets.
          </p>
        </div>

        <Link
          to="/registry"
          className="px-4 py-2 bg-[#0B477F] text-white hover:bg-[#155A91] rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Open Case Desk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B477F] flex items-center justify-center font-bold text-xs">
            <Send className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#17324D]">Statutory Inquiry Power</div>
          <p className="text-[11px] text-[#53677D] leading-relaxed">
            Authorized to issue institutional explanation notices with 7-day deadlines and summon records under AICTE Act guidelines.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#17324D]">AI Case Intelligence</div>
          <p className="text-[11px] text-[#53677D] leading-relaxed">
            Utilize AI duplicate cross-referencing and neutral inquiry drafting to accelerate evidentiary scrutiny.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-[#17324D]">Least-Privilege RBAC</div>
          <p className="text-[11px] text-[#53677D] leading-relaxed">
            Desk officers formulate findings and recommendations. Final closure sanctions are reserved for Competent Central Authorities.
          </p>
        </div>
      </div>

      {/* 12-Step Operational Guide */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#17324D] flex items-center gap-2">
          <span>Operational Investigation Workflow (12 Key Steps)</span>
        </h2>

        <div className="space-y-3">
          {STEPS.map(step => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 bg-white rounded-xl border border-[#D6E4F0] shadow-xs flex flex-col sm:flex-row items-start gap-4 hover:border-[#0B477F] transition"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B477F] flex items-center justify-center shrink-0 font-black text-sm border border-blue-200">
                  {step.num}
                </div>

                <div className="space-y-1 flex-1">
                  <h3 className="text-xs font-black text-[#17324D]">{step.title}</h3>
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

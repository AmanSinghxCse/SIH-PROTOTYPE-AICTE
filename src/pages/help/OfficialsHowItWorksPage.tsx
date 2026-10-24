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
  Sparkles,
  MapPin,
  ShieldAlert,
  Search,
  Filter,
  BarChart3,
  Download
} from 'lucide-react';

export const OfficialsHowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const STATE_SOP_STEPS = [
    {
      num: 1,
      title: 'Viewing Complaints Belonging to Your Assigned State',
      icon: MapPin,
      badge: 'State Scoping & Jurisdiction',
      desc: 'Upon logging in to the Government Officials Portal, your assigned state jurisdiction (e.g., Maharashtra, Karnataka) is automatically activated. The statutory dashboard filters all complaint records, institutions, and metrics strictly to your state boundary. System-wide administrative governance and non-state configurations remain isolated in the Administration Portal.'
    },
    {
      num: 2,
      title: 'Filtering Complaints by District and Institution',
      icon: Filter,
      badge: 'Multi-Level Monitoring',
      desc: 'Use the District and Institution dropdowns in the Complaint Monitoring tab to narrow down dockets. The district list is populated dynamically from institutions registered in your state. You can also view the District & Institution Analytics tab and click on any district (e.g., Pune, Bengaluru Urban) or college to immediately view its filtered case queue.'
    },
    {
      num: 3,
      title: 'Identifying Overdue and High-Priority Cases',
      icon: AlertTriangle,
      badge: 'SLA Watchdog',
      desc: 'The State Dashboard features dedicated KPI cards for "Nearing Deadlines" (< 72 hours remaining) and "Overdue Complaints" (statutory 30-day or 14-day SLA breached). Clicking either card filters the docket view instantly. Critical-priority and overdue complaints are also prioritized in the State Action Center.'
    },
    {
      num: 4,
      title: 'Reviewing Institution Responses & Supporting Documents',
      icon: Building2,
      badge: 'Evidentiary Scrutiny',
      desc: 'When an affiliated technical college submits its explanation or evidence in response to a statutory notice, the complaint status updates to "Action & Investigation". Open the case workspace to review the college remarks, uploaded audit vouchers, fee ledgers, or syllabus certificates under the Actions & Dossier tab.'
    },
    {
      num: 5,
      title: 'Recording Permitted Follow-up Actions & Directives',
      icon: Send,
      badge: 'Operational Authority',
      desc: 'State officials can perform four authorized workflow actions directly from the case workspace: (1) Issue State Statutory Demand to College Principal/Registrar, (2) Record Formal Institutional Rejoinder, (3) Request Citizen Clarification, and (4) Formulate State Resolution Findings. Each action writes an immutable chronological entry to the case audit ledger.'
    },
    {
      num: 6,
      title: 'Monitoring Escalated Complaints & Multi-Agency Issues',
      icon: Flame,
      badge: 'Priority Docket',
      desc: 'Complaints flagged with Critical severity, repeated fee withholding, anti-ragging allegations, or extended SLA breaches appear in the Escalated section of the State Action Center. Officials can coordinate with the State Fee Regulatory Committee, University Ombudsperson, or AICTE Regional Office through confidential internal notes.'
    },
    {
      num: 7,
      title: 'Preparing State-Level Reports & CSV Data Export',
      icon: Download,
      badge: 'Statutory Reporting',
      desc: 'Access the State Reports tab to evaluate received vs. resolved volume, district-wise pending backlogs, average handling durations, and institution response delays. Permitted state officials can download complete CSV datasets or generate formatted printable summary memos for the State Directorate of Technical Education.'
    },
    {
      num: 8,
      title: 'Tracking Complaints Through the 10-Stage Lifecycle',
      icon: RotateCcw,
      badge: 'Lifecycle Visibility',
      desc: 'Every complaint displays its exact position along the 10 statutory lifecycle stages: Draft → Submitted → Verification → Allocation → Investigation → Institution Notice → Complainant Clarification → Resolution Formulation → Closure Review → Closed. Color-coded badges identify whether action is pending with the State Directorate, the Institution, or Central AICTE.'
    },
    {
      num: 9,
      title: 'Understanding Actions Requiring Central AICTE Approval',
      icon: ShieldAlert,
      badge: 'Regulatory Boundaries',
      desc: 'State officials formulate factual inquiry findings and recommend resolution terms (Stage 8). However, final administrative case closure sanctions (Stage 9), statutory penalty impositions, university de-affiliations, and global system configurations are strictly reserved for Central AICTE Administrators in the Administration Portal.'
    },
    {
      num: 10,
      title: 'State Data Isolation & Role-Based Access Enforcement',
      icon: Lock,
      badge: 'Data Security & RLS',
      desc: 'State government officials are restricted to the geographic and institutional boundaries of their assigned jurisdiction. Server-side session verification and database row-level access controls prevent unauthorized access to other states. URL tampering or query parameter modifications will not expose cross-state complaint files.'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#064578] via-[#0B477F] to-[#155A91] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-amber-300 border border-white/20 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>State Directorate Standard Operating Procedure</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-900/60 text-blue-200 border border-blue-400/30">
                SOP-STATE-2026-V1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              State Government Officials Operational Manual
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Standard Operating Procedure for State Technical Education Officials, DTE Nodal Officers, and State Grievance Redressal Cells monitoring institution dockets.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/portal/officials')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Briefcase className="w-4 h-4 text-slate-900" />
              <span>Enter State Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Distinction Strip */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-[#0B477F] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#0B477F]">State Portal vs. Administration Portal Distinction</p>
          <p className="text-slate-700 leading-relaxed">
            The <strong>Government Officials Portal</strong> is designed for state-level coordination, district monitoring, college inquiries, and resolution formulation within your assigned state. Global system configuration, user role provisioning, global workflow rules, and final closure sign-offs are managed exclusively through the <strong>Administration Portal</strong>.
          </p>
        </div>
      </div>

      {/* 10 SOP Steps Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17324D] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Statutory 10-Point Operational Guide for State Officials</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATE_SOP_STEPS.map(step => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#0B477F] transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#0B477F]/10 text-[#0B477F] flex items-center justify-center font-bold text-sm shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        {step.badge}
                      </span>
                      <h3 className="font-bold text-xs text-[#17324D]">{step.title}</h3>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#0B477F]" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-11">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation CTA */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-xs text-[#17324D]">Ready to coordinate state cases?</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Return to your state dashboard to review institution dockets, monitor district caseloads, and issue directives.
          </p>
        </div>
        <button
          onClick={() => navigate('/portal/officials')}
          className="px-5 py-2.5 bg-[#0B477F] hover:bg-[#155A91] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          <span>Open State Government Officials Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

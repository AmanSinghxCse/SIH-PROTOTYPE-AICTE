import React from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  FileText,
  Search,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  PlusCircle
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5F1FC] border border-[#D6E4F0] text-[#0B477F] text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Citizen & Student Grievance Support</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#17324D] tracking-tight">
          Help & Grievance Guidelines
        </h1>
        <p className="text-sm text-[#53677D] mt-2">
          Instructions on submitting technical institution complaints, tracking reference tokens, and contacting AICTE grievance authorities.
        </p>
      </div>

      {/* 3 Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm hover:border-[#0B477F] transition-all">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#17324D]">Filing a Grievance</h3>
          <p className="text-xs text-[#53677D] mt-1 mb-4 leading-relaxed">
            Submit formal complaints regarding fee irregularities, caution money retention, infrastructure defects, or ragging.
          </p>
          <Link
            to="/register"
            className="text-xs font-bold text-[#0B477F] hover:underline flex items-center gap-1"
          >
            <span>Register Complaint</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm hover:border-[#0B477F] transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#17324D]">Tracking Your Status</h3>
          <p className="text-xs text-[#53677D] mt-1 mb-4 leading-relaxed">
            Enter your unique Complaint Token (e.g. AICTE-2026-COMP-104) to monitor verification and inquiry progress.
          </p>
          <Link
            to="/portal/public"
            className="text-xs font-bold text-[#0B477F] hover:underline flex items-center gap-1"
          >
            <span>Open Tracker</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm hover:border-[#0B477F] transition-all">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#17324D]">Anti-Ragging Helpline</h3>
          <p className="text-xs text-[#53677D] mt-1 mb-4 leading-relaxed">
            National 24x7 toll-free helpline for urgent ragging or severe campus harassment reports.
          </p>
          <a
            href="tel:18001805522"
            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <span>Call 1800-180-5522</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-[#17324D] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0B477F]" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F1F7FC] border border-[#D6E4F0]">
            <h4 className="font-bold text-[#17324D] text-sm mb-1">
              What types of complaints does AICTE handle?
            </h4>
            <p className="text-[#53677D] leading-relaxed">
              AICTE has statutory jurisdiction over AICTE-approved technical institutions regarding fee overcharging, non-refund of caution money, withholding of original academic certificates, substandard compute/core laboratories, faculty salary non-payment, unauthorized academic courses, and anti-ragging non-compliance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F1F7FC] border border-[#D6E4F0]">
            <h4 className="font-bold text-[#17324D] text-sm mb-1">
              How does the 7-stage complaint resolution process work?
            </h4>
            <p className="text-[#53677D] leading-relaxed">
              1. Intake Docket Generation &rarr; 2. Institutional Registry Verification &rarr; 3. Specialized Cell Allocation (Approval, Grievance, Faculty, or QA Bureau) &rarr; 4. Institutional Explanation Directives &rarr; 5. Related-Case Identification &rarr; 6. Redressal Action &rarr; 7. Final Supervisory Closure Sign-Off.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F1F7FC] border border-[#D6E4F0]">
            <h4 className="font-bold text-[#17324D] text-sm mb-1">
              Is my personal information protected?
            </h4>
            <p className="text-[#53677D] leading-relaxed">
              Yes. Public users can only see their own submitted petitions. Complainant identity, phone numbers, and addresses are strictly protected from public access and visible only to authorized inquiry officers.
            </p>
          </div>
        </div>
      </div>

      {/* Official AICTE Contact Directory */}
      <div className="bg-[#0B477F] text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Authority Headquarters</span>
        </div>
        <h3 className="text-xl font-black">All India Council for Technical Education (AICTE)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs text-blue-100">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span>Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-amber-300 shrink-0" />
            <span>+91-11-26131576-78, 80</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-amber-300 shrink-0" />
            <span>grievance@aicte-india.org</span>
          </div>
        </div>
      </div>
    </div>
  );
};

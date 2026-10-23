import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { GuidedTourModal } from '../guidedTour/GuidedTourModal';
import { ShieldCheck, ExternalLink, HelpCircle, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F7FC] flex flex-col font-sans text-[#17324D]">
      {/* Top Institutional Header & Horizontal Navigation */}
      <Navbar onOpenGuidedTour={() => setIsGuidedTourOpen(true)} />

      {/* Main Page Viewport */}
      <main className="flex-1 w-full portal-container py-6 sm:py-8 animate-fadeInUp">
        <Outlet />
      </main>

      {/* Professional Indian Government Portal Footer */}
      <footer className="bg-[#064578] text-white border-t-4 border-amber-400 mt-auto">
        <div className="portal-container py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Institutional Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-amber-300 text-sm">
                  AICTE
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    AICTE CMIS Portal
                  </div>
                  <div className="text-[10px] text-[#E5F1FC]">
                    Complaint Management Information System
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#E5F1FC]/80 leading-relaxed">
                Smart India Hackathon SIH26264 Prototype for monitoring and tracking institution-related complaints across AICTE bureaus and cells.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Explainable AI & Human-in-the-Loop Oversight</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
                Key Portals & Modules
              </h3>
              <ul className="space-y-1.5 text-xs text-[#E5F1FC]">
                <li>
                  <Link to="/" className="hover:text-white hover:underline">
                    Public Home Portal
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white hover:underline">
                    Bureau Monitoring Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/registry" className="hover:text-white hover:underline">
                    Central Complaint Registry
                  </Link>
                </li>
                <li>
                  <Link to="/case-intelligence" className="hover:text-white hover:underline">
                    Related-Case Detection
                  </Link>
                </li>
                <li>
                  <Link to="/workflow" className="hover:text-white hover:underline">
                    Circular Lifecycle & Project Progress
                  </Link>
                </li>
                <li>
                  <Link to="/institutions" className="hover:text-white hover:underline">
                    Institution Profiles & History
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Government Disclaimers & Compliance */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
                Standards & Governance
              </h3>
              <ul className="space-y-1.5 text-xs text-[#E5F1FC]/90">
                <li>• Compliance with GIGW Guidelines</li>
                <li>• Role-Based Access Control (RBAC)</li>
                <li>• Automated SLA & Ageing Computation</li>
                <li>• Explainable Jaccard & Signal Matching</li>
                <li>• Immutable Audit Logging</li>
                <li>• Strict Human Final Approval</li>
              </ul>
            </div>

            {/* Col 4: Contact & Disclaimer */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                Prototype Notice
              </h3>
              <div className="p-3 rounded-lg bg-[#0B477F] border border-white/10 text-[11px] text-[#E5F1FC] leading-relaxed">
                <strong>Disclaimer:</strong> This application is a hackathon prototype demonstrating complaint monitoring and decision support. It is not connected to live AICTE internal servers or official databases.
              </div>
              <div className="text-[11px] text-[#E5F1FC]/80 space-y-1">
                <div>AICTE Head Office: Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070</div>
                <div>Portal Helpdesk: complaint-support@aicte-demo.gov.in</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E5F1FC]/70 gap-2">
            <div>
              © {new Date().getFullYear()} AICTE CaseTrack | SIH Problem Statement SIH26264 Prototype.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link to="/about" className="hover:text-white hover:underline">
                About Architecture
              </Link>
              <span>•</span>
              <Link to="/reports" className="hover:text-white hover:underline">
                Audit Trail
              </Link>
              <span>•</span>
              <button
                onClick={() => setIsGuidedTourOpen(true)}
                className="hover:text-white hover:underline"
              >
                Launch Demo Tour
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Guided Tour Modal */}
      <GuidedTourModal
        isOpen={isGuidedTourOpen}
        onClose={() => setIsGuidedTourOpen(false)}
      />
    </div>
  );
};

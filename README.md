# AICTE CaseTrack (SIH26264)

> **Integrated Dashboard for Monitoring and Tracking Institution-Related Complaint Cases Across AICTE Bureaus/Cells**  
> **Smart India Hackathon Problem Statement ID:** SIH26264  
> **Prototype Evaluation Version:** 2.0.0 (Production-Ready Demonstration Prototype)

---

## 1. Executive Summary & Objective

**AICTE CaseTrack** is an enterprise-grade government dashboard prototype developed to address Smart India Hackathon problem statement **SIH26264**. Technical institutions across India are governed by multiple specialized bureaus within the All India Council for Technical Education (AICTE), including the **Approval Bureau**, **Grievance Redressal Cell**, **Faculty Development & Welfare Cell**, **Quality Assurance Bureau**, and **Anti-Ragging & Student Welfare Cell**.

Prior to this solution, complaint management suffered from institutional silos:
1. Repeat non-compliances by an institution in one bureau were invisible to other cells reviewing Extension of Approval (EoA).
2. Grievance resolution deadlines frequently slipped without centralized proactive ageing surveillance.
3. Multiple petitions concerning identical underlying issues (e.g. caution money retention or unlicensed lab software) were treated as disconnected isolated matters.

**AICTE CaseTrack** bridges these gaps by providing:
- **Centralized Cross-Bureau Telemetry:** Ingestion and lifecycle monitoring across all 5 AICTE bureaus.
- **Permanent Institution ID Linking:** Primary indexing on the AICTE Permanent Institution ID (e.g. `AICTE-1-8492011`) to prevent ambiguity caused by similar college names.
- **Explainable Related-Case Detection:** A transparent, rule-based heuristic scoring engine that surfaces potential duplicate or coordinated complaints with full mathematical explainability.
- **Case Ageing Surveillance & Escalation Alerts:** Real-time computation of days remaining, overdue tracking, and statutory review thresholds.
- **Role-Based Access Control (RBAC):** Distinct permission scopes for Administrators, Bureau Officers, Verification Staff, Supervisors, and Read-only Management Users.
- **Tamper-Evident Audit Trail:** Immutable logging of state transitions, reassignments, officer notes, and relationship confirmations.
- **Circular Complaint Lifecycle Diagram:** Visual 7-stage connected SVG circular flow showing stage progress, role ownership, and stage rollback/clarification loops.
- **Project Development Tracker:** Transparent milestone tracker displaying work completed, next actions, and interactive status controls.

> **Transparency Disclosure:** This application operates in local demonstration mode using realistic, internally consistent fictional sample data (26 complaints across 8 educational institutions). It is not connected to live AICTE databases or official grievance portals.

---

## 2. Design & Visual Identity

The interface is inspired directly by the official **AICTE Complaint Management Information System (CMIS)** portal:
- **Primary Dark Navy Blue (`#0B477F`)**: Dominant branding and navigation bar.
- **Secondary Blue (`#155A91`)**: Subheaders, card accents, and secondary actions.
- **Header Blue (`#064578`)**: Ministry banner strip and institutional top bar.
- **Light Blue Background (`#F1F7FC`)**: Clean, accessible portal surface.
- **White (`#FFFFFF`)**: Content cards, data tables, and input fields.
- **Main Text (`#17324D`)**: High-contrast, readable typography.
- **Secondary Text (`#53677D`)**: Captions, timestamps, and metadata.
- **Borders (`#D6E4F0`)**: Subtle, modern divider lines.
- **Light Blue Highlights (`#E5F1FC`)**: Active row selections and pill badges.
- **Status Accents**:
  - **Success Green (`#237A50`)**: Resolved complaints and verified milestones.
  - **Warning Orange (`#D97706`)**: Approaching deadlines, review pending, and escalated files.
  - **Error Red (`#C43D3D`)**: Overdue cases and critical flags.

*Note: In accordance with government design specifications, all arbitrary purple, pink, neon colors, and unrelated dark modes have been eliminated.*

---

## 3. Technology Stack

- **Frontend Core:** React 19, TypeScript 5.8+, Vite 8
- **Styling & UI Design:** Tailwind CSS v4, Lucide Icons
- **Data Visualizations:** Recharts (Area charts, Bar charts, Donut charts, Stacked charts)
- **Routing:** React Router v7
- **Persistence & State:** Reactive React Context with LocalStorage state persistence and instant reset capability
- **Backend & Database Readiness:** Complete PostgreSQL DDL schema with Row Level Security (RLS) policies prepared for Supabase deployment (`schema.sql` included)

---

## 4. Key Pages & Routes

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | **Home Portal** | Public portal landing with Hero featuring authentic AICTE HQ photograph, dynamic KPI telemetry cards, "Choose Your Portal" cards, recent complaints intake preview, and citizen tracking widget. |
| `/dashboard` | **Bureau Dashboard** | Executive bureau monitoring with filters, status distribution donut, monthly trend, bureau workloads, ageing bars, and officer allocation table. |
| `/registry` | **Complaint Registry** | Searchable, filterable complaints table with multi-criteria filters, overdue highlights, CSV export, and assignment/status modals. |
| `/register` | **New Complaint (Form 1A)** | Multi-field registration form with live real-time duplicate warning banner before submission. |
| `/case/:id` | **Case Dossier** | Comprehensive 6-tab case view: Overview, Interactive Timeline, Bureau Assignment, Related Cases, Officer Notes, and Audit Trail. |
| `/institutions` | **Institution History** | Profiles of 8 monitored institutions, historical complaints, status breakdowns, and longitudinal compliance trends. |
| `/case-intelligence` | **Case Intelligence** | Explainable Related-Case Detection with heuristic breakdown and judge sandbox comparison tool. |
| `/workflow` | **Workflow & Progress** | Dedicated full-page view for the 7-stage Circular Complaint Lifecycle Workflow and 7-Milestone Project Development Progress Tracker. |
| `/alerts` | **Alerts & Deadlines** | Overdue surveillance, approaching deadlines, and configurable SLA threshold controls. |
| `/analytics` | **Analytics & Reports** | Turnaround time calculation (resolved cases only), resolution efficiency, and CSV export. |
| `/reports` (`/audit`) | **Audit Trail** | Tamper-evident event log with entity diffs, timestamps, user roles, and export capabilities. |
| `/about` | **Architecture & Specs** | Technical specifications, mathematical formulas, and database schema. |
| `/presentation` | **SIH Presentation Mode** | 9-slide interactive deck designed for live presentation to evaluation panels. |
| `/login` | **Role Authentication** | Role switcher and credentials overview for evaluation. |

---

## 5. Demonstration Roles & Credentials

AICTE CaseTrack includes an instant **Role Switcher** in the top navigation bar and a dedicated `/login` page:

| Role | Demo User | Bureau / Jurisdiction | Permitted Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | Shri Arvind Saxena | Central Administration | Full administrative oversight, configure deadlines & thresholds, review audit trail, manage assignments. |
| **Bureau Officer** | Smt. Sunita Verma | Grievance Redressal Cell | View bureau cases, conduct inquiries, update permitted statuses, add follow-up notes, confirm/reject related cases. |
| **Verification Staff** | Shri Rameshwar Nath | Screening & Scrutiny Cell | Initial document verification, preliminary triage, request additional documentation from complainants. |
| **Supervisor** | Dr. P. K. Nambiar | Quality Assurance Bureau | Monitor cross-bureau workload, review overdue escalations, inspect appellate files. |
| **Management User** | Prof. M. S. Ramachandran | Approval Bureau Observer | Read-only executive analytics, turnaround trends, workload balance (cannot edit or reassign cases). |

---

## 6. Circular Lifecycle & Project Progress Tracker

### A. 7-Stage Circular Complaint Lifecycle
Complaints traverse 7 transparent, defined stages:
1. **Complaint Registered:** Complainant / Authorized Officer.
2. **Initial Scrutiny & Triage:** Verification Staff.
3. **Bureau Assignment:** Cell In-Charge / Supervisor.
4. **Under Review & Inquiry:** Assigned Bureau Officer.
5. **Awaiting Information / Response:** Complainant / Institution *(Supports return loop to Bureau Review)*.
6. **Resolution Proposed:** Bureau Officer.
7. **Case Closed & Notified:** Competent Authority.

**Key Visual Capabilities:**
- Directional SVG circular flow arrows connecting nodes sequentially.
- Return loop curved arrow from Stage 5 ("Awaiting Information") back to Stage 4 ("Under Review").
- Clickable nodes with a live Details Panel displaying Stage Name, Responsible Role, Primary Activity, Current Status Name, Status Color Badge, Stage Description, and Action Required.
- Complaint selector dropdown allowing judges to visualize the active stage of any real demo complaint on the circular diagram.

### B. Project Development Tracker ("What has been done?")
Displays the concrete prototype milestones:
1. **System Architecture & Database Schema** (Backend Lead) — `Completed`
2. **Centralized Cross-Bureau Dashboard** (Full-Stack Developer) — `Completed`
3. **Complaint Ingestion & Multi-Filter Registry** (Frontend Lead) — `Completed`
4. **Explainable Related-Case Detection Engine** (AI/ML Engineer) — `Completed`
5. **Proactive Case-Ageing & SLA Surveillance** (Systems Architect) — `Completed`
6. **Role-Based Access Control & Tamper-Evident Audit** (Security Lead) — `Completed`
7. **End-to-End Testing & Guided Demonstration** (QA & Product Lead) — `Completed`

**Interactive Capabilities:**
- Summary cards calculating Total Milestones, Completed, In Progress, and Needs Verification dynamically.
- Interactive status dropdown on every milestone card allowing judges to change statuses in real time.
- Every milestone status change is recorded into the persistent audit trail.

---

## 7. Setup and Installation Instructions

### Prerequisites
- Node.js (v18.0.0 or higher, tested on Node v24 LTS)
- npm (v9.0.0 or higher)

### Quick Start
```bash
# 1. Navigate to the project directory:
cd "C:\Users\Aman singh\.gemini\antigravity\scratch\aicte-casetrack"

# 2. Install dependencies:
npm install

# 3. Start local development server:
npm run dev

# 4. Open in browser:
# Navigate to http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 8. Capability Status Matrix

| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| Centralized Complaint Registry | **Fully Implemented** | Multi-column search, multi-filters, sorting, pagination, and CSV export. |
| Circular Case Lifecycle Flow | **Fully Implemented** | 7-stage SVG circular diagram with return loop, details panel, and complaint selector. |
| Project Development Tracker | **Fully Implemented** | 7 milestone cards, dynamic summary counters, and interactive status selector. |
| AICTE CMIS Visual Identity | **Fully Implemented** | Strict government palette, Ashoka Lion emblem, G20 badge, and horizontal navbar. |
| Institution Dossier Indexing | **Fully Implemented** | Permanent AICTE ID aggregation, longitudinal history, entity risk metrics. |
| Explainable Related-Case Engine | **Fully Implemented** | Pure heuristic weighted scoring (4 signals), itemized explanation, sandbox. |
| Ageing & Deadline Monitoring | **Fully Implemented** | Days remaining calculation, overdue alerts, escalation recommendations. |
| Role-Based Access Control (5 Roles) | **Fully Implemented** | Admin, Officer, Verification Staff, Supervisor, Management with permission enforcement. |
| Audit Trail Logging | **Fully Implemented** | Immutable session-bound event logging with state delta recording. |
| Interactive Guided Demo | **Fully Implemented** | 9-step automated interactive tour walking judges through the application. |
| Presentation Mode for SIH | **Fully Implemented** | Dedicated fullscreen presentation module with 9 structured pitch slides. |
| PostgreSQL / Supabase Schema | **Provided & Verified** | Complete DDL script with RLS policies ready in `/about` and `schema.sql`. |
| Live Government AICTE API | *Simulated / Planned* | Offline demonstration mode with realistic fictional data for hackathon evaluation. |
| Jan Parichay Government SSO | *Planned (Roadmap)* | Architecture prepared for Phase 2 integration with MeriPehchan SSO. |

---

*AICTE CaseTrack brings complaint monitoring, institution-wise visibility, case ageing, related-case review, and lifecycle progress into one coordinated interface. It supports authorized human decision-making rather than replacing it.*

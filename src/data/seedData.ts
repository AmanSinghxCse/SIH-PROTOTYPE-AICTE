import {
  Institution,
  Bureau,
  User,
  Complaint,
  TimelineEvent,
  ComplaintNote,
  RelatedCaseSuggestion,
  AuditLog,
  SystemSettings,
  LifecycleStage,
  ProjectMilestone
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-PUBLIC-01',
    name: 'Ananya Sharma (Student / Complainant)',
    email: 'ananya.sharma@student-demo.in',
    role: 'public',
    designation: 'B.Tech Student & Complainant',
    phone: '+91-98765-43210'
  },
  {
    id: 'USR-ADMIN-01',
    name: 'Shri Arvind Saxena',
    email: 'admin.saxena@aicte-demo.gov.in',
    role: 'admin',
    designation: 'Senior System Administrator & Nodal Incharge',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    password: 'Admin@AICTE2026'
  },
  {
    id: 'USR-OFFICER-01',
    name: 'Smt. Sunita Verma',
    email: 'sverma.officer@aicte-demo.gov.in',
    role: 'bureau_officer',
    designation: 'Assistant Director / Bureau Grievance Officer',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    password: 'Officer@AICTE2026'
  },
  {
    id: 'USR-VERIFY-01',
    name: 'Shri Rameshwar Nath',
    email: 'rnath.verify@aicte-demo.gov.in',
    role: 'verification',
    designation: 'Senior Verification Officer & Scrutiny Lead (Non-Portal Legacy Account)',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell'
  },
  {
    id: 'USR-SUPERVISOR-01',
    name: 'Dr. P. K. Nambiar',
    email: 'pknambiar.dir@aicte-demo.gov.in',
    role: 'supervisor',
    designation: 'Director & Appellate Review Authority (Non-Portal Legacy Account)',
    bureauId: 'BUR-QAB',
    bureauName: 'Quality Assurance Bureau'
  },
  {
    id: 'USR-MANAGEMENT-01',
    name: 'Prof. M. S. Ramachandran',
    email: 'ramachandran.ms@aicte-demo.gov.in',
    role: 'management',
    designation: 'Advisor & Executive Management Observer (Non-Portal Legacy Account)',
    bureauId: 'BUR-APP',
    bureauName: 'Approval Bureau'
  }
];

export const INITIAL_BUREAUS: Bureau[] = [
  {
    id: 'BUR-APP',
    code: 'BUR-APP',
    name: 'Approval Bureau',
    shortName: 'Approval Cell',
    description: 'Deals with institution approvals, extension of approval (EoA), intake variation, and regulatory compliance.',
    officerInCharge: 'Dr. Rajesh Sharma',
    defaultDeadlineDays: 30
  },
  {
    id: 'BUR-GRV',
    code: 'BUR-GRV',
    name: 'Grievance Redressal Cell',
    shortName: 'Grievance Cell',
    description: 'Handles student grievances, fee disputes, caution deposit refund appeals, and student amenities.',
    officerInCharge: 'Smt. Sunita Verma',
    defaultDeadlineDays: 21
  },
  {
    id: 'BUR-FDC',
    code: 'BUR-FDC',
    name: 'Faculty Development & Welfare Cell',
    shortName: 'Faculty Cell',
    description: 'Manages complaints concerning faculty salary delays, non-issuance of service books, and service condition breaches.',
    officerInCharge: 'Shri Anand Kulkarni',
    defaultDeadlineDays: 30
  },
  {
    id: 'BUR-QAB',
    code: 'BUR-QAB',
    name: 'Quality Assurance Bureau',
    shortName: 'QA Bureau',
    description: 'Monitors academic infrastructure deficiencies, laboratory equipment shortfall, and accreditation norms.',
    officerInCharge: 'Dr. Meenakshi Sundaram',
    defaultDeadlineDays: 25
  },
  {
    id: 'BUR-ARW',
    code: 'BUR-ARW',
    name: 'Anti-Ragging & Student Welfare Cell',
    shortName: 'Anti-Ragging Cell',
    description: 'Urgent response bureau for anti-ragging complaints, hostel safety, mental health welfare, and student harassment.',
    officerInCharge: 'Shri Vikramaditya Rathore',
    defaultDeadlineDays: 14
  }
];

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'INST-01',
    code: 'AICTE-1-8492011',
    name: 'North Valley Institute of Technology',
    type: 'Engineering & Tech',
    state: 'Maharashtra',
    district: 'Pune',
    address: 'Survey No. 42, Hinjawadi Phase 2, Pune, Maharashtra 411057',
    accreditedGrade: 'NAAC A',
    contactEmail: 'director@northvalley.edu.in',
    contactPhone: '+91-20-2794-8800',
    establishedYear: 2004
  },
  {
    id: 'INST-02',
    code: 'AICTE-1-9238412',
    name: 'Sunrise College of Engineering',
    type: 'Engineering & Tech',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    address: 'Plot 18, Electronic City Phase 1, Bengaluru, Karnataka 560100',
    accreditedGrade: 'NAAC B++',
    contactEmail: 'principal@sunrisecoe.ac.in',
    contactPhone: '+91-80-4123-5566',
    establishedYear: 2009
  },
  {
    id: 'INST-03',
    code: 'AICTE-1-7649103',
    name: 'Greenfield Technical University',
    type: 'Engineering & Tech',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    address: 'Knowledge Park III, Greater Noida, Uttar Pradesh 201308',
    accreditedGrade: 'NAAC A+',
    contactEmail: 'registrar@greenfieldtech.org',
    contactPhone: '+91-120-234-9911',
    establishedYear: 2001
  },
  {
    id: 'INST-04',
    code: 'AICTE-1-6548129',
    name: 'Riverdale Institute of Management',
    type: 'Management',
    state: 'Telangana',
    district: 'Hyderabad',
    address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    accreditedGrade: 'NBA Accredited',
    contactEmail: 'dean@riverdale-mgmt.ac.in',
    contactPhone: '+91-40-2355-1200',
    establishedYear: 2011
  },
  {
    id: 'INST-05',
    code: 'AICTE-1-5821094',
    name: 'Horizon Polytechnic Institute',
    type: 'Polytechnic',
    state: 'Gujarat',
    district: 'Vadodara',
    address: 'GIDC Industrial Area, Makarpura, Vadodara, Gujarat 390010',
    accreditedGrade: 'State Board Grade A',
    contactEmail: 'info@horizonpoly.org',
    contactPhone: '+91-265-263-4410',
    establishedYear: 1998
  },
  {
    id: 'INST-06',
    code: 'AICTE-1-4739201',
    name: 'Apex Institute of Technology & Science',
    type: 'Engineering & Tech',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    address: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004',
    accreditedGrade: 'NAAC A',
    contactEmail: 'office@apextech.edu.in',
    contactPhone: '+91-422-259-7100',
    establishedYear: 2007
  },
  {
    id: 'INST-07',
    code: 'AICTE-1-3918402',
    name: 'Metro College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Punjab',
    district: 'Ludhiana',
    address: 'GT Road Near Dhandari Kalan, Ludhiana, Punjab 141010',
    accreditedGrade: 'PCI & NAAC B+',
    contactEmail: 'principal@metropharma.edu.in',
    contactPhone: '+91-161-289-4321',
    establishedYear: 2013
  },
  {
    id: 'INST-08',
    code: 'AICTE-1-2849503',
    name: 'Crestview School of Architecture & Planning',
    type: 'Architecture',
    state: 'Rajasthan',
    district: 'Jaipur',
    address: 'Sitapura Industrial Area, Tonk Road, Jaipur, Rajasthan 302022',
    accreditedGrade: 'COA Approved',
    contactEmail: 'contact@crestviewarch.org',
    contactPhone: '+91-141-277-0988',
    establishedYear: 2015
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  // Pair 1 (Related Pair): Caution Deposit Refund at Sunrise College
  {
    id: 'AICTE-2026-COMP-104',
    title: 'Non-refund of caution deposit money to 2025 B.Tech graduates',
    description: 'Graduating students of 2025 batch have not received their refundable caution money deposit of Rs. 25,000 despite obtaining all clearance certificates over 7 months ago. College accounts department repeatedly issues evasive responses.',
    institutionId: 'INST-02',
    institutionCode: 'AICTE-1-9238412',
    institutionName: 'Sunrise College of Engineering',
    category: 'Fee Irregularity & Caution Refund',
    status: 'Under Review',
    priority: 'High',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-09-18',
    deadlineDate: '2026-10-25', // Approaching deadline
    lastUpdatedDate: '2026-10-18',
    sourceChannel: 'National Grievance Portal',
    referenceNumber: 'CPGRAMS/2026/89412',
    tags: ['caution-deposit', 'fee-refund', 'batch-2025', 'clearance'],
    currentStageId: 4,
    complainantName: 'Ananya Sharma (Student / Complainant)',
    complainantEmail: 'ananya.sharma@student-demo.in',
    complainantPhone: '+91-98765-43210',
    verificationStatus: 'Verified',
    verificationRemarks: 'AICTE code verified; graduation clearance certificates and caution receipt validated.'
  },
  {
    id: 'AICTE-2026-COMP-112',
    title: 'College management withholding caution fee refund and original certificates',
    description: 'Sunrise College of Engineering is refusing caution deposit refund of Rs. 25,000 for multiple computer science students. Furthermore, original migration and transfer documents are being held until arbitrary alumni association fees are remitted.',
    institutionId: 'INST-02',
    institutionCode: 'AICTE-1-9238412',
    institutionName: 'Sunrise College of Engineering',
    category: 'Fee Irregularity & Caution Refund',
    status: 'Open',
    priority: 'High',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-10-02',
    deadlineDate: '2026-10-28', // Approaching deadline
    lastUpdatedDate: '2026-10-02',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-7781',
    tags: ['caution-fee', 'withholding-certificates', 'computer-science'],
    currentStageId: 3,
    complainantName: 'Ananya Sharma (Student / Complainant)',
    complainantEmail: 'ananya.sharma@student-demo.in',
    complainantPhone: '+91-98765-43210',
    verificationStatus: 'Verified',
    verificationRemarks: 'Verified student identity and caution fee ledger deduction records.'
  },

  // Pair 2 (Related Pair): Laboratory Software Licensing Shortfall at North Valley
  {
    id: 'AICTE-2026-COMP-108',
    title: 'Substandard computer laboratory with unlicensed pirated software packages',
    description: 'The advanced CAD/CAM and VLSI laboratories in the mechanical and electronics wings do not possess legitimate educational licenses. Systems are running expired evaluation versions and pirated software, impeding proper practical curriculum training.',
    institutionId: 'INST-01',
    institutionCode: 'AICTE-1-8492011',
    institutionName: 'North Valley Institute of Technology',
    category: 'Infrastructure & Labs',
    status: 'Under Review',
    priority: 'High',
    bureauId: 'BUR-QAB',
    bureauName: 'Quality Assurance Bureau',
    assignedOfficerId: 'USR-SUPERVISOR-01',
    assignedOfficerName: 'Dr. Meenakshi Sundaram',
    submissionDate: '2026-09-12',
    deadlineDate: '2026-10-08', // Overdue!
    lastUpdatedDate: '2026-10-15',
    sourceChannel: 'Inspection Report',
    referenceNumber: 'INSP-2026-NW-41',
    tags: ['lab-equipment', 'software-licenses', 'vlsi-cad', 'curriculum']
  },
  {
    id: 'AICTE-2026-COMP-119',
    title: 'Severe deficiency in CAD lab infrastructure and counterfeit engineering software',
    description: 'Mechanical engineering students at North Valley Institute report that required 3D modeling and analysis software is non-functional due to invalid licensing keys. The college has failed to upgrade compute lab hardware as mandated by AICTE norms.',
    institutionId: 'INST-01',
    institutionCode: 'AICTE-1-8492011',
    institutionName: 'North Valley Institute of Technology',
    category: 'Infrastructure & Labs',
    status: 'Awaiting Information',
    priority: 'Medium',
    bureauId: 'BUR-QAB',
    bureauName: 'Quality Assurance Bureau',
    assignedOfficerId: 'USR-SUPERVISOR-01',
    assignedOfficerName: 'Dr. Meenakshi Sundaram',
    submissionDate: '2026-09-29',
    deadlineDate: '2026-10-24', // Approaching deadline!
    lastUpdatedDate: '2026-10-16',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-8809',
    tags: ['cad-lab', 'counterfeit-software', 'infrastructure-norms']
  },

  // Pair 3 (Related Pair): Faculty Salary & Contract Non-compliance at Greenfield Technical
  {
    id: 'AICTE-2026-COMP-102',
    title: 'Arrears in 7th Pay Commission salary disbursement and missing service books',
    description: 'Faculty members of Civil and Electrical Engineering at Greenfield Technical University have not received salaries for the past 4 months. Service books and formal appointment letters have not been issued to ad-hoc faculty serving continuously over 3 years.',
    institutionId: 'INST-03',
    institutionCode: 'AICTE-1-7649103',
    institutionName: 'Greenfield Technical University',
    category: 'Academic Administration & Faculty',
    status: 'Escalated',
    priority: 'Urgent',
    bureauId: 'BUR-FDC',
    bureauName: 'Faculty Development & Welfare Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Shri Anand Kulkarni',
    submissionDate: '2026-08-28',
    deadlineDate: '2026-09-28', // Severely Overdue
    lastUpdatedDate: '2026-10-10',
    sourceChannel: 'Written Petition',
    referenceNumber: 'FAC-PET-2026-109',
    tags: ['faculty-salary', '7th-cpc', 'service-books', 'salary-arrears']
  },
  {
    id: 'AICTE-2026-COMP-123',
    title: 'Irregular faculty salary payments and unlawful contract termination without notice',
    description: 'Assistant professors in Greenfield Technical University allege 4-month salary backlog and sudden termination of two senior lecturers without disciplinary inquiry or mandated notice period, in direct contravention of AICTE Faculty Regulations 2019.',
    institutionId: 'INST-03',
    institutionCode: 'AICTE-1-7649103',
    institutionName: 'Greenfield Technical University',
    category: 'Academic Administration & Faculty',
    status: 'Under Review',
    priority: 'High',
    bureauId: 'BUR-FDC',
    bureauName: 'Faculty Development & Welfare Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Shri Anand Kulkarni',
    submissionDate: '2026-09-25',
    deadlineDate: '2026-10-25', // Approaching
    lastUpdatedDate: '2026-10-14',
    sourceChannel: 'Written Petition',
    referenceNumber: 'FAC-PET-2026-144',
    tags: ['salary-backlog', 'unlawful-termination', 'faculty-regulations']
  },

  // Overdue Case 1: Ragging & Hostel Security at Greenfield
  {
    id: 'AICTE-2026-COMP-101',
    title: 'Allegation of severe physical ragging and harassment in boys hostel block B',
    description: 'First year engineering students report recurring physical hazing and psychological harassment by senior batches during night hours. Institutional Anti-Ragging squad failed to take cognizance despite written intimation to hostel warden.',
    institutionId: 'INST-03',
    institutionCode: 'AICTE-1-7649103',
    institutionName: 'Greenfield Technical University',
    category: 'Harassment & Anti-Ragging',
    status: 'Escalated',
    priority: 'Urgent',
    bureauId: 'BUR-ARW',
    bureauName: 'Anti-Ragging & Student Welfare Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Shri Vikramaditya Rathore',
    submissionDate: '2026-09-05',
    deadlineDate: '2026-09-19', // Severely Overdue!
    lastUpdatedDate: '2026-10-12',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AR-HELPLINE-2026-302',
    tags: ['anti-ragging', 'hostel-safety', 'warden-negligence', 'urgent-inquiry']
  },

  // Overdue Case 2: Unapproved Division at Riverdale Institute
  {
    id: 'AICTE-2026-COMP-105',
    title: 'Conducting unapproved executive PGDM program and collecting unauthorized capitation fees',
    description: 'Riverdale Institute of Management is running an unapproved 1-year Executive PGDM program not listed in the AICTE Approval Handbook. Institutional flyers advertise corporate partnerships and demand Rs. 4,50,000 non-refundable registration fees.',
    institutionId: 'INST-04',
    institutionCode: 'AICTE-1-6548129',
    institutionName: 'Riverdale Institute of Management',
    category: 'Regulatory Compliance & Fraud',
    status: 'Under Review',
    priority: 'Urgent',
    bureauId: 'BUR-APP',
    bureauName: 'Approval Bureau',
    assignedOfficerId: 'USR-ADMIN-01',
    assignedOfficerName: 'Dr. Rajesh Sharma',
    submissionDate: '2026-09-10',
    deadlineDate: '2026-10-10', // Overdue by 13 days
    lastUpdatedDate: '2026-10-17',
    sourceChannel: 'Written Petition',
    referenceNumber: 'REG-VIO-2026-88',
    tags: ['unapproved-program', 'capitation-fees', 'handbook-violation']
  },

  // Approaching Deadline Case: Examination Results Delay at Apex
  {
    id: 'AICTE-2026-COMP-110',
    title: 'Inordinate delay of 5 months in announcing 6th semester examination results',
    description: 'Apex Institute has not published the even semester results for the 2023-2027 batch. Students are unable to apply for mandatory industrial internships and national competitive examinations.',
    institutionId: 'INST-06',
    institutionCode: 'AICTE-1-4739201',
    institutionName: 'Apex Institute of Technology & Science',
    category: 'Examination Malpractice & Results',
    status: 'Under Review',
    priority: 'High',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-09-30',
    deadlineDate: '2026-10-26', // Approaching (3 days left)
    lastUpdatedDate: '2026-10-19',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-9041',
    tags: ['exam-results', 'semester-6', 'internship-impact']
  },

  // Approaching Deadline Case: Pharmacy Lab Deficit at Metro
  {
    id: 'AICTE-2026-COMP-114',
    title: 'Absence of aseptic manufacturing room and chemical reagents in pharmacology laboratory',
    description: 'Students pursuing M.Pharm (Pharmacology) report that the institution lacks an operational sterile preparation area and essential standard reagents required for animal tissue experiments, violating PCI and AICTE lab norms.',
    institutionId: 'INST-07',
    institutionCode: 'AICTE-1-3918402',
    institutionName: 'Metro College of Pharmaceutical Sciences',
    category: 'Infrastructure & Labs',
    status: 'Awaiting Information',
    priority: 'Medium',
    bureauId: 'BUR-QAB',
    bureauName: 'Quality Assurance Bureau',
    assignedOfficerId: 'USR-SUPERVISOR-01',
    assignedOfficerName: 'Dr. Meenakshi Sundaram',
    submissionDate: '2026-10-01',
    deadlineDate: '2026-10-26', // Approaching (3 days left)
    lastUpdatedDate: '2026-10-15',
    sourceChannel: 'National Grievance Portal',
    referenceNumber: 'CPGRAMS/2026/91102',
    tags: ['pharmacy-lab', 'pci-norms', 'sterile-room']
  },

  // Resolved Cases (with valid resolution dates and summaries)
  {
    id: 'AICTE-2026-COMP-103',
    title: 'Denial of fee concession under AICTE Tuition Fee Waiver (TFW) scheme',
    description: 'Meritorious student admitted under 5% supernumerary TFW quota was billed standard tuition fee of Rs. 85,000 instead of waiver. College claimed misunderstanding during seat allocation rounds.',
    institutionId: 'INST-01',
    institutionCode: 'AICTE-1-8492011',
    institutionName: 'North Valley Institute of Technology',
    category: 'Fee Irregularity & Caution Refund',
    status: 'Resolved',
    priority: 'Medium',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-08-15',
    deadlineDate: '2026-09-15',
    lastUpdatedDate: '2026-09-02',
    resolvedDate: '2026-09-02', // 18 days turnaround
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-6102',
    resolutionSummary: 'Institutional inquiry conducted. College refunded the excess Rs. 85,000 fee via RTGS transfer on 01-Sep-2026 and confirmed compliance with TFW quota guidelines.',
    tags: ['tfw-scheme', 'fee-concession', 'resolved-refund'],
    currentStageId: 7,
    complainantName: 'Ananya Sharma (Student / Complainant)',
    complainantEmail: 'ananya.sharma@student-demo.in',
    complainantPhone: '+91-98765-43210',
    verificationStatus: 'Verified',
    closureApprovedBy: 'Dr. P. K. Nambiar (Supervisor)',
    closureApprovedAt: '2026-09-03'
  },
  {
    id: 'AICTE-2026-COMP-106',
    title: 'Lack of ramp access and disabled-friendly restrooms in main academic block',
    description: 'Physically challenged students unable to access upper floor lecture halls due to out-of-order elevators and absence of ramp corridors, contrary to AICTE Barrier-Free Environment guidelines.',
    institutionId: 'INST-05',
    institutionCode: 'AICTE-1-5821094',
    institutionName: 'Horizon Polytechnic Institute',
    category: 'Infrastructure & Labs',
    status: 'Resolved',
    priority: 'High',
    bureauId: 'BUR-QAB',
    bureauName: 'Quality Assurance Bureau',
    assignedOfficerId: 'USR-SUPERVISOR-01',
    assignedOfficerName: 'Dr. Meenakshi Sundaram',
    submissionDate: '2026-08-20',
    deadlineDate: '2026-09-20',
    lastUpdatedDate: '2026-09-11',
    resolvedDate: '2026-09-11', // 22 days turnaround
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-6540',
    resolutionSummary: 'Principal submitted geotagged video verification of newly commissioned hydraulic ramp and repaired elevator service contract.',
    tags: ['divyangjan', 'barrier-free', 'accessibility', 'resolved']
  },
  {
    id: 'AICTE-2026-COMP-107',
    title: 'Withholding of degree completion certificate for library fine dispute',
    description: 'Student passed in June 2026 was denied provisional degree certificate over a disputed textbook fine of Rs. 600.',
    institutionId: 'INST-04',
    institutionCode: 'AICTE-1-6548129',
    institutionName: 'Riverdale Institute of Management',
    category: 'Academic Administration & Faculty',
    status: 'Resolved',
    priority: 'Normal',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-08-25',
    deadlineDate: '2026-09-25',
    lastUpdatedDate: '2026-09-08',
    resolvedDate: '2026-09-08', // 14 days turnaround
    sourceChannel: 'National Grievance Portal',
    referenceNumber: 'CPGRAMS/2026/84210',
    resolutionSummary: 'Bureau issued directives reminding that AICTE prohibits withholding academic certificates for minor ancillary dues. Degree handed over on 07-Sep-2026.',
    tags: ['certificate-withholding', 'library-fine', 'resolved']
  },

  // Additional Active Cases Across Institutions
  {
    id: 'AICTE-2026-COMP-109',
    title: 'Non-formation of Internal Complaints Committee (ICC) under POSH Act norms',
    description: 'Crestview School of Architecture has not constituted an active Internal Complaints Committee or displayed mandatory statutory notices on campus regarding gender harassment prevention.',
    institutionId: 'INST-08',
    institutionCode: 'AICTE-1-2849503',
    institutionName: 'Crestview School of Architecture & Planning',
    category: 'Harassment & Anti-Ragging',
    status: 'Open',
    priority: 'High',
    bureauId: 'BUR-ARW',
    bureauName: 'Anti-Ragging & Student Welfare Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Shri Vikramaditya Rathore',
    submissionDate: '2026-10-11',
    deadlineDate: '2026-10-25', // Approaching deadline (2 days left)
    lastUpdatedDate: '2026-10-11',
    sourceChannel: 'Written Petition',
    referenceNumber: 'POSH-COMP-2026-12',
    tags: ['icc-committee', 'posh-act', 'statutory-compliance']
  },
  {
    id: 'AICTE-2026-COMP-111',
    title: 'Discrepancy in continuous internal evaluation marks and absence of answer script review',
    description: 'Third year students of Electronics branch were denied transparency in internal sessional evaluation. Faculty declined to share evaluated answer booklets prior to university submission.',
    institutionId: 'INST-06',
    institutionCode: 'AICTE-1-4739201',
    institutionName: 'Apex Institute of Technology & Science',
    category: 'Examination Malpractice & Results',
    status: 'Under Review',
    priority: 'Normal',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-10-05',
    deadlineDate: '2026-11-04',
    lastUpdatedDate: '2026-10-18',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-9288',
    tags: ['internal-assessment', 'marks-transparency', 'evaluations']
  },
  {
    id: 'AICTE-2026-COMP-113',
    title: 'Shortage of qualified architecture faculty meeting minimum Council of Architecture cadred norms',
    description: 'The student-to-teacher ratio in B.Arch program currently stands at 1:26 against the mandated 1:10 norm. Classes are routinely merged and studio review sessions are severely curtailed.',
    institutionId: 'INST-08',
    institutionCode: 'AICTE-1-2849503',
    institutionName: 'Crestview School of Architecture & Planning',
    category: 'Academic Administration & Faculty',
    status: 'Open',
    priority: 'Medium',
    bureauId: 'BUR-APP',
    bureauName: 'Approval Bureau',
    assignedOfficerId: 'USR-ADMIN-01',
    assignedOfficerName: 'Dr. Rajesh Sharma',
    submissionDate: '2026-10-14',
    deadlineDate: '2026-11-13',
    lastUpdatedDate: '2026-10-14',
    sourceChannel: 'Written Petition',
    referenceNumber: 'COA-REV-2026-09',
    tags: ['faculty-cadre', 'student-faculty-ratio', 'coa-norms']
  },
  {
    id: 'AICTE-2026-COMP-115',
    title: 'Unauthorized increase of 60 seats in Diploma in Mechanical Engineering without AICTE EoA',
    description: 'Horizon Polytechnic admitted 180 students in Diploma ME against the sanctioned intake of 120 approved in the 2026-2027 Extension of Approval letter.',
    institutionId: 'INST-05',
    institutionCode: 'AICTE-1-5821094',
    institutionName: 'Horizon Polytechnic Institute',
    category: 'Regulatory Compliance & Fraud',
    status: 'Escalated',
    priority: 'Urgent',
    bureauId: 'BUR-APP',
    bureauName: 'Approval Bureau',
    assignedOfficerId: 'USR-ADMIN-01',
    assignedOfficerName: 'Dr. Rajesh Sharma',
    submissionDate: '2026-09-14',
    deadlineDate: '2026-10-14', // Overdue by 9 days!
    lastUpdatedDate: '2026-10-16',
    sourceChannel: 'Inspection Report',
    referenceNumber: 'INSP-2026-GUJ-19',
    tags: ['excess-admission', 'intake-violation', 'eoa-breach']
  },
  {
    id: 'AICTE-2026-COMP-116',
    title: 'Unsanitary condition of drinking water coolers leading to water-borne illnesses in campus hostel',
    description: 'Over 20 hostellers hospitalised due to acute gastroenteritis caused by contaminated overhead water tanks and non-functional RO filtration units.',
    institutionId: 'INST-02',
    institutionCode: 'AICTE-1-9238412',
    institutionName: 'Sunrise College of Engineering',
    category: 'Infrastructure & Labs',
    status: 'Under Review',
    priority: 'High',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-10-08',
    deadlineDate: '2026-10-29',
    lastUpdatedDate: '2026-10-17',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-9501',
    tags: ['drinking-water', 'hostel-amenities', 'health-hygiene']
  },
  {
    id: 'AICTE-2026-COMP-117',
    title: 'Denial of maternity leave benefits to woman assistant professor under state service rules',
    description: 'College rejected statutory maternity leave application and forced unpaid sabbatical under threat of termination, violating AICTE Regulations for Faculty Service 2019.',
    institutionId: 'INST-01',
    institutionCode: 'AICTE-1-8492011',
    institutionName: 'North Valley Institute of Technology',
    category: 'Academic Administration & Faculty',
    status: 'Open',
    priority: 'Medium',
    bureauId: 'BUR-FDC',
    bureauName: 'Faculty Development & Welfare Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Shri Anand Kulkarni',
    submissionDate: '2026-10-17',
    deadlineDate: '2026-11-16',
    lastUpdatedDate: '2026-10-17',
    sourceChannel: 'Written Petition',
    referenceNumber: 'FAC-PET-2026-189',
    tags: ['maternity-leave', 'faculty-rights', 'service-conditions']
  },
  {
    id: 'AICTE-2026-COMP-118',
    title: 'Collection of non-prescribed development charges and compulsory uniform levy',
    description: 'First year pharmacy entrants coerced into paying Rs. 35,000 cash for unreceipted uniform and college development kit prior to enrollment.',
    institutionId: 'INST-07',
    institutionCode: 'AICTE-1-3918402',
    institutionName: 'Metro College of Pharmaceutical Sciences',
    category: 'Fee Irregularity & Caution Refund',
    status: 'Under Review',
    priority: 'Medium',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-10-09',
    deadlineDate: '2026-10-30',
    lastUpdatedDate: '2026-10-16',
    sourceChannel: 'National Grievance Portal',
    referenceNumber: 'CPGRAMS/2026/92881',
    tags: ['capitation-fee', 'cash-levy', 'admission-fraud']
  },
  {
    id: 'AICTE-2026-COMP-120',
    title: 'Discrepancy in NBA accreditation claim on marketing brochures and website banner',
    description: 'Riverdale Institute of Management displays NBA accreditation logos on admissions collateral for MBA batch 2026-28 despite accreditation status having expired in June 2024.',
    institutionId: 'INST-04',
    institutionCode: 'AICTE-1-6548129',
    institutionName: 'Riverdale Institute of Management',
    category: 'Regulatory Compliance & Fraud',
    status: 'Open',
    priority: 'Medium',
    bureauId: 'BUR-APP',
    bureauName: 'Approval Bureau',
    assignedOfficerId: 'USR-ADMIN-01',
    assignedOfficerName: 'Dr. Rajesh Sharma',
    submissionDate: '2026-10-15',
    deadlineDate: '2026-11-14',
    lastUpdatedDate: '2026-10-15',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-9710',
    tags: ['misleading-accreditation', 'nba-logo', 'false-advertisement']
  },
  {
    id: 'AICTE-2026-COMP-121',
    title: 'Failure to provide high-speed internet and computational cloud resources for AI/ML department',
    description: 'Approved Artificial Intelligence and Data Science department operates on intermittent 10 Mbps broadband connection; GPU computing workstations promised during intake expansion remain unpurchased.',
    institutionId: 'INST-06',
    institutionCode: 'AICTE-1-4739201',
    institutionName: 'Apex Institute of Technology & Science',
    category: 'Infrastructure & Labs',
    status: 'Awaiting Information',
    priority: 'Normal',
    bureauId: 'BUR-QAB',
    bureauName: 'Quality Assurance Bureau',
    assignedOfficerId: 'USR-SUPERVISOR-01',
    assignedOfficerName: 'Dr. Meenakshi Sundaram',
    submissionDate: '2026-09-22',
    deadlineDate: '2026-10-22', // Overdue by 1 day!
    lastUpdatedDate: '2026-10-19',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-8511',
    tags: ['ai-ml-labs', 'gpu-workstations', 'broadband-bandwidth']
  },
  {
    id: 'AICTE-2026-COMP-122',
    title: 'Verbal harassment and victimisation of student council members post protest',
    description: 'Hostel students who petitioned management regarding mess catering hygiene were issued disciplinary show-cause notices and threatened with debarment from placement season.',
    institutionId: 'INST-05',
    institutionCode: 'AICTE-1-5821094',
    institutionName: 'Horizon Polytechnic Institute',
    category: 'Harassment & Anti-Ragging',
    status: 'Under Review',
    priority: 'High',
    bureauId: 'BUR-ARW',
    bureauName: 'Anti-Ragging & Student Welfare Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Shri Vikramaditya Rathore',
    submissionDate: '2026-10-06',
    deadlineDate: '2026-10-20', // Overdue by 3 days!
    lastUpdatedDate: '2026-10-18',
    sourceChannel: 'Written Petition',
    referenceNumber: 'STU-WEL-2026-44',
    tags: ['student-victimisation', 'placement-blackmail', 'mess-grievance']
  },
  {
    id: 'AICTE-2026-COMP-124',
    title: 'Missing fire safety NOC and uninspected chemical waste drainage in chemistry laboratory',
    description: 'Municipal fire department audit highlighted lack of pressurized fire hydrant risers and illegal pouring of organic solvents directly into storm-water drains.',
    institutionId: 'INST-07',
    institutionCode: 'AICTE-1-3918402',
    institutionName: 'Metro College of Pharmaceutical Sciences',
    category: 'Regulatory Compliance & Fraud',
    status: 'Escalated',
    priority: 'Urgent',
    bureauId: 'BUR-APP',
    bureauName: 'Approval Bureau',
    assignedOfficerId: 'USR-ADMIN-01',
    assignedOfficerName: 'Dr. Rajesh Sharma',
    submissionDate: '2026-09-16',
    deadlineDate: '2026-10-16', // Overdue by 7 days!
    lastUpdatedDate: '2026-10-19',
    sourceChannel: 'Inspection Report',
    referenceNumber: 'FIRE-INSP-2026-02',
    tags: ['fire-noc', 'hazardous-waste', 'campus-safety']
  },
  {
    id: 'AICTE-2026-COMP-125',
    title: 'Refusal to refund tuition fee post seat cancellation within AICTE cutoff date',
    description: 'Candidate surrendered B.Arch seat on 10-August-2026 prior to the national cutoff date. Management deducted Rs. 40,000 against permissible maximum processing fee limit of Rs. 1,000.',
    institutionId: 'INST-08',
    institutionCode: 'AICTE-1-2849503',
    institutionName: 'Crestview School of Architecture & Planning',
    category: 'Fee Irregularity & Caution Refund',
    status: 'Resolved',
    priority: 'High',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-08-18',
    deadlineDate: '2026-09-18',
    lastUpdatedDate: '2026-09-04',
    resolvedDate: '2026-09-04', // 17 days turnaround
    sourceChannel: 'National Grievance Portal',
    referenceNumber: 'CPGRAMS/2026/85102',
    resolutionSummary: 'College registrar summoned; institution credited Rs. 39,000 directly to candidate bank account following AICTE seat withdrawal refund guidelines.',
    tags: ['admission-cancellation', 'fee-refund', 'cutoff-compliance', 'resolved']
  },
  {
    id: 'AICTE-2026-COMP-126',
    title: 'Discontinuation of scholarship disbursal under PM-USPY Scheme for SC/ST scholars',
    description: 'Post-matric scholarship funds remitted by Ministry have not been credited into beneficiary accounts of 44 eligible polytechnic students.',
    institutionId: 'INST-05',
    institutionCode: 'AICTE-1-5821094',
    institutionName: 'Horizon Polytechnic Institute',
    category: 'Academic Administration & Faculty',
    status: 'Under Review',
    priority: 'High',
    bureauId: 'BUR-GRV',
    bureauName: 'Grievance Redressal Cell',
    assignedOfficerId: 'USR-OFFICER-01',
    assignedOfficerName: 'Smt. Sunita Verma',
    submissionDate: '2026-10-04',
    deadlineDate: '2026-10-25', // Approaching deadline (2 days left)
    lastUpdatedDate: '2026-10-18',
    sourceChannel: 'Online Portal',
    referenceNumber: 'AICTE-WEB-2026-9214',
    tags: ['sc-st-scholarship', 'pm-uspy', 'fund-diversion']
  }
];

export const INITIAL_TIMELINE_EVENTS: Record<string, TimelineEvent[]> = {
  'AICTE-2026-COMP-104': [
    {
      id: 'EVT-104-1',
      complaintId: 'AICTE-2026-COMP-104',
      timestamp: '2026-09-18T10:30:00',
      type: 'REGISTERED',
      title: 'Complaint Registered via CPGRAMS Portal',
      description: 'Grievance lodged citing non-refund of Rs. 25,000 caution deposit after completion of graduation formalities.',
      actorName: 'National Grievance Portal API',
      actorRole: 'System Integration'
    },
    {
      id: 'EVT-104-2',
      complaintId: 'AICTE-2026-COMP-104',
      timestamp: '2026-09-19T11:15:00',
      type: 'ASSIGNED',
      title: 'Case Allocated to Grievance Redressal Cell',
      description: 'Designated to Smt. Sunita Verma with 35-day target completion deadline of 25-Oct-2026.',
      actorName: 'Shri Arvind Saxena',
      actorRole: 'Senior Administrator'
    },
    {
      id: 'EVT-104-3',
      complaintId: 'AICTE-2026-COMP-104',
      timestamp: '2026-09-24T14:20:00',
      type: 'STATUS_CHANGED',
      title: 'Status Updated: Under Review',
      description: 'Formal explanation notice served to Principal, Sunrise College of Engineering with 14-day reply window.',
      actorName: 'Smt. Sunita Verma',
      actorRole: 'Bureau Officer'
    },
    {
      id: 'EVT-104-4',
      complaintId: 'AICTE-2026-COMP-104',
      timestamp: '2026-10-05T16:00:00',
      type: 'RELATIONSHIP_CONFIRMED',
      title: 'Related Case Linked: AICTE-2026-COMP-112',
      description: 'Officer verified high heuristic similarity (82%) with new filing COMP-112 from the same institution.',
      actorName: 'Smt. Sunita Verma',
      actorRole: 'Bureau Officer'
    },
    {
      id: 'EVT-104-5',
      complaintId: 'AICTE-2026-COMP-104',
      timestamp: '2026-10-18T12:00:00',
      type: 'DEADLINE_APPROACHING',
      title: 'Approaching Resolution Deadline Notice',
      description: 'Automated monitoring system flagged 7 days remaining before statutory review deadline.',
      actorName: 'System Monitor',
      actorRole: 'Automated Rule'
    }
  ]
};

export const INITIAL_NOTES: Record<string, ComplaintNote[]> = {
  'AICTE-2026-COMP-104': [
    {
      id: 'NOTE-104-1',
      complaintId: 'AICTE-2026-COMP-104',
      timestamp: '2026-09-24T14:35:00',
      authorId: 'USR-OFFICER-01',
      authorName: 'Smt. Sunita Verma',
      authorRole: 'Bureau Officer',
      content: 'Dispatched formal communication to College Registrar requesting list of all pending caution deposit disbursements for 2025 passouts.',
      actionItem: 'Await institutional response by 08-Oct-2026',
      isOfficialAction: true
    },
    {
      id: 'NOTE-104-2',
      complaintId: 'AICTE-2026-COMP-104',
      timestamp: '2026-10-18T15:10:00',
      authorId: 'USR-OFFICER-01',
      authorName: 'Smt. Sunita Verma',
      authorRole: 'Bureau Officer',
      content: 'College submitted partial reply stating audit of hostel accounts underway. Instructed them that caution fee cannot be indefinitely impounded.',
      actionItem: 'Issue final 7-day summons notice if uncredited by 25-Oct',
      isOfficialAction: true
    }
  ]
};

export const INITIAL_RELATED_SUGGESTIONS: RelatedCaseSuggestion[] = [
  {
    id: 'SUGG-01',
    complaintId: 'AICTE-2026-COMP-104',
    relatedComplaintId: 'AICTE-2026-COMP-112',
    institutionMatchScore: 40,
    categoryMatchScore: 25,
    textSimilarityScore: 22,
    overallScore: 87,
    matchSignals: [
      'Exact Institution Match (AICTE-1-9238412) [+40 pts]',
      'Identical Complaint Category: Fee Irregularity & Caution Refund [+25 pts]',
      'Shared Key Terms: [caution, deposit, refund, batch, withholding] [+22 pts]'
    ],
    explanation: 'Both complaints allege improper retention of caution deposit refunds at Sunrise College of Engineering for recent passouts. Highly likely to represent systemic institutional non-compliance.',
    status: 'Confirmed Related',
    reviewedBy: 'Smt. Sunita Verma (Bureau Officer)',
    reviewedAt: '2026-10-05T16:00:00',
    reviewNotes: 'Verified that both cases pertain to 2025 engineering graduates of Sunrise College. Cross-referenced files.'
  },
  {
    id: 'SUGG-02',
    complaintId: 'AICTE-2026-COMP-108',
    relatedComplaintId: 'AICTE-2026-COMP-119',
    institutionMatchScore: 40,
    categoryMatchScore: 25,
    textSimilarityScore: 21,
    overallScore: 86,
    matchSignals: [
      'Exact Institution Match (AICTE-1-8492011) [+40 pts]',
      'Identical Complaint Category: Infrastructure & Labs [+25 pts]',
      'Shared Key Terms: [software, laboratory, licenses, cad, engineering] [+21 pts]'
    ],
    explanation: 'Both complaints allege lack of legitimate software licenses and deficient compute infrastructure in mechanical/VLSI laboratories at North Valley Institute of Technology.',
    status: 'Pending Review',
    reviewNotes: undefined
  },
  {
    id: 'SUGG-03',
    complaintId: 'AICTE-2026-COMP-102',
    relatedComplaintId: 'AICTE-2026-COMP-123',
    institutionMatchScore: 40,
    categoryMatchScore: 25,
    textSimilarityScore: 19,
    overallScore: 84,
    matchSignals: [
      'Exact Institution Match (AICTE-1-7649103) [+40 pts]',
      'Identical Complaint Category: Academic Administration & Faculty [+25 pts]',
      'Shared Key Terms: [salary, arrears, contract, faculty, 4-month] [+19 pts]'
    ],
    explanation: 'Both grievances involve 4-month faculty salary backlogs and breach of statutory faculty appointment norms at Greenfield Technical University.',
    status: 'Pending Review',
    reviewNotes: undefined
  },
  {
    id: 'SUGG-04',
    complaintId: 'AICTE-2026-COMP-105',
    relatedComplaintId: 'AICTE-2026-COMP-120',
    institutionMatchScore: 40,
    categoryMatchScore: 25,
    textSimilarityScore: 14,
    overallScore: 79,
    matchSignals: [
      'Exact Institution Match (AICTE-1-6548129) [+40 pts]',
      'Identical Complaint Category: Regulatory Compliance & Fraud [+25 pts]',
      'Shared Key Terms: [management, pgdm, mba, accreditation, brochures] [+14 pts]'
    ],
    explanation: 'Cases share Riverdale Institute of Management entity and regulatory violation themes (unapproved program offering and misleading accreditation claims).',
    status: 'Pending Review',
    reviewNotes: undefined
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-10-18T15:10:00',
    userId: 'USR-OFFICER-01',
    userName: 'Smt. Sunita Verma',
    userRole: 'Bureau Officer',
    action: 'Added Official Follow-up Note',
    entityType: 'Complaint',
    entityId: 'AICTE-2026-COMP-104',
    details: 'Recorded directive issued to college registrar regarding pending caution fee audit.',
    previousValue: undefined,
    newValue: 'Follow-up note added to case file'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-16T11:40:00',
    userId: 'USR-ADMIN-01',
    userName: 'Dr. Rajesh Sharma',
    userRole: 'Administrator',
    action: 'Case Escalation Recorded',
    entityType: 'Status',
    entityId: 'AICTE-2026-COMP-115',
    details: 'Escalated to Chairman Appellate Bureau due to continued unauthorized student intake.',
    previousValue: 'Under Review',
    newValue: 'Escalated'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-10-05T16:00:00',
    userId: 'USR-OFFICER-01',
    userName: 'Smt. Sunita Verma',
    userRole: 'Bureau Officer',
    action: 'Related Case Confirmed',
    entityType: 'RelatedCase',
    entityId: 'AICTE-2026-COMP-104',
    details: 'Confirmed relationship with COMP-112 based on identical caution fee withholding at Sunrise College.',
    previousValue: 'Pending Review',
    newValue: 'Confirmed Related'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-09-24T14:20:00',
    userId: 'USR-OFFICER-01',
    userName: 'Smt. Sunita Verma',
    userRole: 'Bureau Officer',
    action: 'Status Transition',
    entityType: 'Status',
    entityId: 'AICTE-2026-COMP-104',
    details: 'Case moved from Open to Under Review after preliminary scrutinisation of student documents.',
    previousValue: 'Open',
    newValue: 'Under Review'
  },
  {
    id: 'AUD-005',
    timestamp: '2026-09-02T16:30:00',
    userId: 'USR-OFFICER-01',
    userName: 'Smt. Sunita Verma',
    userRole: 'Bureau Officer',
    action: 'Case Resolution Recorded',
    entityType: 'Status',
    entityId: 'AICTE-2026-COMP-103',
    details: 'Marked resolved following full fee refund receipt from North Valley Institute of Technology under TFW.',
    previousValue: 'Under Review',
    newValue: 'Resolved'
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  similarityThreshold: 65,
  approachingDeadlineDays: 5,
  overdueEscalationDays: 7,
  defaultDeadlineUrgent: 14,
  defaultDeadlineNormal: 30
};

// 7-Stage Circular Complaint Lifecycle Model
export const INITIAL_LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: 1,
    title: 'Complaint Registered',
    role: 'Complainant / Authorized Registration Staff',
    activity: 'Complaint details, institution information, category, and supporting docs are recorded.',
    statusName: 'Initial Stage',
    colorType: 'blue',
    description: 'Initial intake of the grievance through the Public Portal, CPGRAMS integration, or direct administrative receipt. A persistent unique identifier is generated.',
    actionRequired: 'Acknowledge intake receipt and generate official docket token.'
  },
  {
    id: 2,
    title: 'Validation & Verification',
    role: 'Authorized Verification Staff',
    activity: 'Required fields, permanent institution identifier, and complainant bona fides are checked.',
    statusName: 'Pending / In Progress',
    colorType: 'orange',
    description: 'Preliminary scrutiny verifying institutional jurisdiction under AICTE mandate. Identifiers are verified against the approved technical institutions directory.',
    actionRequired: 'Verify institution approval status and validate documentary submissions.'
  },
  {
    id: 3,
    title: 'Bureau / Cell Assignment',
    role: 'Authorized Administrator',
    activity: 'The complaint is allocated to the designated bureau (Approval, Grievance, QA, Faculty, or Anti-Ragging).',
    statusName: 'Pending / Assigned',
    colorType: 'blue',
    description: 'Case allocation to the specialized bureau or cell holding statutory jurisdiction over the subject matter. Handling officer is formally appointed.',
    actionRequired: 'Designate responsible bureau officer and establish target turnaround deadline.'
  },
  {
    id: 4,
    title: 'Case Review & Inquiry',
    role: 'Assigned Bureau Officer',
    activity: 'The handling officer reviews facts, calls for institutional explanation, and records inquiry minutes.',
    statusName: 'In Progress / Under Review',
    colorType: 'orange',
    description: 'Active examination stage. Formal inquiries, written show-cause directives, or virtual hearings are conducted with college authorities.',
    actionRequired: 'Issue formal query to college registrar and examine compliance rebuttal.'
  },
  {
    id: 5,
    title: 'Related-Case Identification',
    role: 'Case Intelligence Module + Authorized Officer',
    activity: 'The system highlights correlated complaints using institution IDs, names, categories, and text similarity.',
    statusName: 'Suggested Matches / Under Review',
    colorType: 'blue',
    description: 'Heuristic engine cross-references active complaints against the institutional dossier to identify repeat infractions or duplicate student petitions.',
    actionRequired: 'Officer reviews explainable signals to confirm relationship or mark unrelated.'
  },
  {
    id: 6,
    title: 'Action & Resolution',
    role: 'Assigned Officer / Authorized Bureau',
    activity: 'Directives, fee refunds, corrective orders, and resolution terms are enforced.',
    statusName: 'Pending Action / Resolved',
    colorType: 'green',
    description: 'Remedial outcome stage. Institutional compliance (e.g. caution money refund, lab software procurement) is verified by the officer.',
    actionRequired: 'Confirm institutional remediation and obtain formal closure compliance.'
  },
  {
    id: 7,
    title: 'Closure & Audit',
    role: 'Authorized Supervisor',
    activity: 'Formal case closure is approved and recorded permanently in the tamper-evident audit history.',
    statusName: 'Closed / Archived',
    colorType: 'green',
    description: 'Final closure sign-off by supervisory authority. Dossier is archived for longitudinal institutional review during annual approval cycles.',
    actionRequired: 'Appellate supervisor confirms final resolution compliance and seals audit record.'
  }
];

// Project Development Tracker Milestones (What has been done in the project?)
export const INITIAL_PROJECT_MILESTONES: ProjectMilestone[] = [
  {
    id: 1,
    title: 'Problem Understanding & Stakeholder Needs',
    ownerRole: 'Entire Team',
    workCompleted: 'Analyzed disconnected complaint handling across 5 AICTE bureaus; mapped cross-cell visibility gaps, statutory deadline risks, and duplicate filing challenges.',
    nextAction: 'Maintain ongoing alignment with AICTE Approval Process Handbook (APH) regulations.',
    status: 'Completed',
    lastUpdated: '2026-10-15'
  },
  {
    id: 2,
    title: 'Requirements & 7-Stage Workflow Architecture',
    ownerRole: 'Entire Team',
    workCompleted: 'Formulated 7-stage circular complaint lifecycle, RBAC matrix (Admin, Officer, Verification Staff, Read-Only Reviewer), and explainable matching criteria.',
    nextAction: 'Document functional requirement specifications for official committee presentation.',
    status: 'Completed',
    lastUpdated: '2026-10-18'
  },
  {
    id: 3,
    title: 'Dashboard & Interface Engineering',
    ownerRole: 'Frontend Team',
    workCompleted: 'Built AICTE CMIS government portal interface, executive KPI cards, circular SVG lifecycle diagram, Recharts analytics, and responsive registry table.',
    nextAction: 'Ensure strict mobile viewport accessibility across all resolution scales.',
    status: 'Completed',
    lastUpdated: '2026-10-23'
  },
  {
    id: 4,
    title: 'Case Intelligence & Heuristic Scoring',
    ownerRole: 'Case Intelligence & Technical Validation',
    workCompleted: 'Designed and implemented transparent 4-signal heuristic matching engine (Institution ID, category match, Jaccard keyword overlap, date proximity) and sandbox.',
    nextAction: 'Curate larger multi-institution test benchmarks for precision-recall validation.',
    status: 'Completed',
    lastUpdated: '2026-10-23'
  },
  {
    id: 5,
    title: 'Data Architecture, Storage & RBAC',
    ownerRole: 'Backend Team',
    workCompleted: 'Designed relational PostgreSQL schema with Row Level Security (RLS) policies, immutable audit logger, and local persistent state engine.',
    nextAction: 'Connect cloud PostgreSQL / Supabase instance with Jan Parichay SSO endpoint.',
    status: 'Completed',
    lastUpdated: '2026-10-22'
  },
  {
    id: 6,
    title: 'Testing, Ageing Formulas & Quality Assurance',
    ownerRole: 'Testing / Technical Validation',
    workCompleted: 'Executed automated 16-point test verification suite; validated UTC calendar-day ageing, deadline thresholds, and positive/negative related pair detection.',
    nextAction: 'Conduct simulated high-load responsiveness and browser compatibility tests.',
    status: 'Completed',
    lastUpdated: '2026-10-23'
  },
  {
    id: 7,
    title: 'Final SIH Hackathon Demonstration',
    ownerRole: 'Entire Team',
    workCompleted: 'Constructed dedicated Presentation Mode, 9-step guided walkthrough, project development tracker, and institutional dossier drill-downs.',
    nextAction: 'Complete final pitch rehearsal and technical Q&A preparation for SIH judges.',
    status: 'In Progress',
    lastUpdated: '2026-10-23'
  }
];


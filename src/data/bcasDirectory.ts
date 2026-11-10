/**
 * BCAS Campus Authoritative Academic Staff & Department Directory
 * Extracted from official BCAS Academic Hierarchy & Master Directory
 */

export interface Lecturer {
  code: string;
  name: string;
  designation: string;
  type: 'Internal' | 'Visiting';
  email: string;
  status: 'Active' | 'Inactive';
  isHod?: boolean;
  isDeputyHod?: boolean;
  isCoordinator?: boolean;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  shortName: string;
  hodName?: string;
  hodEmail?: string;
  deputyHodName?: string;
  deputyHodEmail?: string;
  coordinators: { name: string; email: string; code: string }[];
  lecturers: Lecturer[];
}

export const BCAS_DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'biomedical',
    name: 'Department of Biomedical Science',
    shortName: 'Biomedical Science',
    hodName: 'Dr. Anjali (Acting / Deputy HOD)',
    hodEmail: 'email28@bcas.lk',
    deputyHodName: 'Dr. Anjali & Dr. Dulani',
    deputyHodEmail: 'email28@bcas.lk',
    coordinators: [
      { name: 'Ms. Samitha', email: 'email27@bcas.lk', code: 'LEC0026' }
    ],
    lecturers: [
      { code: 'LEC0027', name: 'Dr. Anjali', designation: 'Deputy HOD', type: 'Internal', email: 'email28@bcas.lk', status: 'Active', isDeputyHod: true },
      { code: 'LEC0028', name: 'Dr. Dulani', designation: 'Deputy HOD', type: 'Internal', email: 'email29@bcas.lk', status: 'Active', isDeputyHod: true },
      { code: 'LEC0026', name: 'Ms. Samitha', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email27@bcas.lk', status: 'Active', isCoordinator: true }
    ]
  },
  {
    id: 'business',
    name: 'Department of Business Management',
    shortName: 'Business Management',
    hodName: 'Dr. Chethana',
    hodEmail: 'chathana@bcas.lk',
    coordinators: [
      { name: 'Ms. Jadharshani', email: 'email18@bcas.lk', code: 'LEC0017' },
      { name: 'Mr. Dinesh', email: 'email138@gmail.com', code: 'LEC137' },
      { name: 'Ms. Niluni', email: 'niluni@bcas.lk', code: 'LEC0101' },
      { name: 'Ms. Shazna', email: 'email71@gmail.com', code: 'LEC0070' },
      { name: 'Ms. Ayesha', email: 'email78@bcas.lk', code: 'LEC0077' },
      { name: 'Ms. Tharushika', email: 'email136@bcas.lk', code: 'LEC134' }
    ],
    lecturers: [
      { code: 'LEC0104', name: 'Dr. Chethana', designation: 'Head of Department (HOD)', type: 'Internal', email: 'chathana@bcas.lk', status: 'Active', isHod: true },
      { code: 'LEC0017', name: 'Ms. Jadharshani', designation: 'Senior Lecturer Cum Coordinator', type: 'Internal', email: 'email18@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC137', name: 'Mr. Dinesh', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email138@gmail.com', status: 'Active', isCoordinator: true },
      { code: 'LEC0101', name: 'Ms. Niluni', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'niluni@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0070', name: 'Ms. Shazna', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email71@gmail.com', status: 'Active', isCoordinator: true },
      { code: 'LEC0077', name: 'Ms. Ayesha', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email78@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC134', name: 'Ms. Tharushika', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email136@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0023', name: 'Mr. Dilan', designation: 'Lecturer', type: 'Visiting', email: 'email24@bcas.lk', status: 'Active' },
      { code: 'LEC0025', name: 'Mr. Lasantha', designation: 'Lecturer', type: 'Visiting', email: 'email26@bcas.lk', status: 'Active' },
      { code: 'LEC142', name: 'Mr. Sasanka', designation: 'Lecturer', type: 'Visiting', email: 'email143@bcas.lk', status: 'Active' },
      { code: 'LEC0024', name: 'Mr. Sudesh', designation: 'Lecturer', type: 'Visiting', email: 'email25@bcas.lk', status: 'Active' },
      { code: 'LEC0080', name: 'Mr. Tharaka', designation: 'Lecturer', type: 'Visiting', email: 'email80@bcas.lk', status: 'Active' },
      { code: 'LEC0083', name: 'Mr. Tharaka Soysa', designation: 'Lecturer', type: 'Visiting', email: 'email83@bcas.lk', status: 'Active' },
      { code: 'LEC0082', name: 'Mr. Vinod', designation: 'Lecturer', type: 'Visiting', email: 'email82@bcas.lk', status: 'Active' },
      { code: 'LEC0021', name: 'Mr. Harendra', designation: 'Lecturer', type: 'Visiting', email: 'email22@bcas.lk', status: 'Active' },
      { code: 'LEC0084', name: 'Ms. Nipunika', designation: 'Lecturer', type: 'Visiting', email: 'email84@bcas.lk', status: 'Active' },
      { code: 'LEC0081', name: 'Prof. Thakshila', designation: 'Lecturer', type: 'Visiting', email: 'email81@bcas.lk', status: 'Active' }
    ]
  },
  {
    id: 'computing',
    name: 'Department of Computing',
    shortName: 'Computing',
    hodName: 'Mr. Anis',
    hodEmail: 'email5@bcas.lk',
    deputyHodName: 'Mr. Ravindu & Mr. S. Moulana',
    deputyHodEmail: 'email1@bcas.lk',
    coordinators: [
      { name: 'Ms. Ayeshwery Samarakoon', email: 'email9@bcas.lk', code: 'LEC0009' },
      { name: 'Ms. Maleesha', email: 'email14@bcas.lk', code: 'LEC0013' },
      { name: 'Ms. Menu', email: 'email8@bcas.lk', code: 'LEC0008' },
      { name: 'Ms. Pramodi Thilakarathne', email: 'email7@bcas.lk', code: 'LEC0007' },
      { name: 'Ms. Sandali Bhagya', email: 'email10@bcas.lk', code: 'LEC0010' },
      { name: 'Mr. Viraj', email: 'email16@bcas.lk', code: 'LEC0015' }
    ],
    lecturers: [
      { code: 'LEC0006', name: 'Mr. Anis', designation: 'Head of Department (HOD)', type: 'Internal', email: 'email5@bcas.lk', status: 'Active', isHod: true },
      { code: 'LEC0002', name: 'Mr. Ravindu', designation: 'Deputy HOD', type: 'Internal', email: 'email1@bcas.lk', status: 'Active', isDeputyHod: true },
      { code: 'LEC0069', name: 'Mr. S. Moulana', designation: 'Deputy HOD', type: 'Internal', email: 'email70@bcas.lk', status: 'Active', isDeputyHod: true },
      { code: 'LEC0009', name: 'Ms. Ayeshwery Samarakoon', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email9@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0013', name: 'Ms. Maleesha', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email14@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0008', name: 'Ms. Menu', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email8@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0007', name: 'Ms. Pramodi Thilakarathne', designation: 'Assistant Lecturer Cum Coordinator', type: 'Internal', email: 'email7@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0010', name: 'Ms. Sandali Bhagya', designation: 'Assistant Lecturer Cum Coordinator', type: 'Internal', email: 'email10@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0003', name: 'Mr. Ramesh', designation: 'Lecturer', type: 'Internal', email: 'email2@bcas.lk', status: 'Active' },
      { code: 'LEC0005', name: 'Mr. Tharinda Kaushalya', designation: 'Lecturer', type: 'Internal', email: 'email4@bcas.lk', status: 'Active' },
      { code: 'LEC145', name: 'Ms Kaushani', designation: 'Lecturer', type: 'Internal', email: 'email146@bcas.lk', status: 'Active' },
      { code: 'LEC0103', name: 'Ms. Bhagya', designation: 'Lecturer', type: 'Internal', email: 'bhagya.b@bcas.lk', status: 'Active' },
      { code: 'LEC0012', name: 'Ms. Nadeesha Hansani', designation: 'Lecturer', type: 'Internal', email: 'email13@bcas.lk', status: 'Active' },
      { code: 'LEC0107', name: 'Ms. Mohana', designation: 'Assistant Lecturer', type: 'Internal', email: 'mohana@bcas.lk', status: 'Active' },
      { code: 'LEC0014', name: 'Ms. Uvindya', designation: 'Assistant Lecturer', type: 'Internal', email: 'email15@bcas.lk', status: 'Active' },
      { code: 'LEC130', name: 'Mr. Vinod', designation: 'Lecturer', type: 'Visiting', email: 'email131@bcas.lk', status: 'Active' }
    ]
  },
  {
    id: 'construction',
    name: 'Department of Construction & Built Environment',
    shortName: 'Construction & Built Environment',
    hodName: 'Mr. Kithsiri (Deputy HOD / Acting)',
    hodEmail: 'email32@bcas.lk',
    deputyHodName: 'Mr. Kithsiri',
    deputyHodEmail: 'email32@bcas.lk',
    coordinators: [
      { name: 'Ms. Hasara', email: 'hasara@bcas.lk', code: 'LEC0105' },
      { name: 'Ms. Hiruni', email: 'email72@bcas.lk', code: 'LEC0071' },
      { name: 'Ms. Rushmika Ebenezer', email: 'email33@bcas.lk', code: 'LEC0032' },
      { name: 'Ms. Shafroon', email: 'email135@bcas.lk', code: 'LEC133' }
    ],
    lecturers: [
      { code: 'LEC0031', name: 'Mr. Kithsiri', designation: 'Deputy HOD', type: 'Internal', email: 'email32@bcas.lk', status: 'Active', isDeputyHod: true },
      { code: 'LEC0105', name: 'Ms. Hasara', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'hasara@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0071', name: 'Ms. Hiruni', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email72@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0032', name: 'Ms. Rushmika Ebenezer', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email33@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC133', name: 'Ms. Shafroon', designation: 'Assistant Lecturer Cum Coordinator', type: 'Internal', email: 'email135@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0093', name: 'Mr. Harsha', designation: 'Lecturer', type: 'Internal', email: 'email94@bcas.lk', status: 'Active' },
      { code: 'LEC0041', name: 'Mr. Chathuranga', designation: 'Lecturer', type: 'Visiting', email: 'email42@bcas.lk', status: 'Active' },
      { code: 'LEC0040', name: 'Mr. Hasni', designation: 'Lecturer', type: 'Visiting', email: 'email41@bcas.lk', status: 'Active' },
      { code: 'LEC139', name: 'Mr. Kusal', designation: 'Lecturer', type: 'Visiting', email: 'email140@bcas.lk', status: 'Active' },
      { code: 'LEC0034', name: 'Mr. Mayuran', designation: 'Lecturer', type: 'Visiting', email: 'email35@bcas.lk', status: 'Active' },
      { code: 'LEC0039', name: 'Mr. Tharindu Dilshan', designation: 'Lecturer', type: 'Visiting', email: 'email40@bcas.lk', status: 'Active' },
      { code: 'LEC0074', name: 'Ms. Anupama Nipuni', designation: 'Lecturer', type: 'Visiting', email: 'email74@bcas.lk', status: 'Active' },
      { code: 'LEC0037', name: 'Ms. Ashcharya', designation: 'Lecturer', type: 'Visiting', email: 'email38@bcas.lk', status: 'Active' },
      { code: 'LEC0038', name: 'Ms. Chamini', designation: 'Lecturer', type: 'Visiting', email: 'email39@bcas.lk', status: 'Active' },
      { code: 'LEC0035', name: 'Ms. Nipuni', designation: 'Lecturer', type: 'Visiting', email: 'email36@bcas.lk', status: 'Active' },
      { code: 'LEC0075', name: 'Ms. Tharangani', designation: 'Lecturer', type: 'Visiting', email: 'email76@bcas.lk', status: 'Active' }
    ]
  },
  {
    id: 'ecd',
    name: 'Department of Early Childhood Development',
    shortName: 'Early Childhood Development',
    hodName: 'Department Academic Head',
    hodEmail: 'email49@bcas.lk',
    coordinators: [
      { name: 'Ms. Nayomi', email: 'email49@bcas.lk', code: 'LEC0048' },
      { name: 'Ms. Shani', email: 'email93@bcas.lk', code: 'LEC0092' }
    ],
    lecturers: [
      { code: 'LEC0048', name: 'Ms. Nayomi', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email49@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0092', name: 'Ms. Shani', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email93@bcas.lk', status: 'Active', isCoordinator: true }
    ]
  },
  {
    id: 'hotel',
    name: 'Department of Hotel Management',
    shortName: 'Hotel Management',
    hodName: 'Mr. Tashen (Deputy HOD)',
    hodEmail: 'tashen@bcas.lk',
    deputyHodName: 'Mr. Tashen',
    deputyHodEmail: 'tashen@bcas.lk',
    coordinators: [
      { name: 'Ms. Alokani', email: 'email59@bcas.lk', code: 'LEC0058' },
      { name: 'Ms. Semini', email: 'email55@bcas.lk', code: 'LEC0054' }
    ],
    lecturers: [
      { code: 'LEC0108', name: 'Mr. Tashen', designation: 'Deputy HOD', type: 'Internal', email: 'tashen@bcas.lk', status: 'Active', isDeputyHod: true },
      { code: 'LEC0058', name: 'Ms. Alokani', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email59@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0054', name: 'Ms. Semini', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email55@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0059', name: 'Chef Nandasri', designation: 'Lecturer', type: 'Visiting', email: 'email60@bcas.lk', status: 'Active' },
      { code: 'LEC0060', name: 'Chef Piyadasa', designation: 'Lecturer', type: 'Visiting', email: 'email61@bcas.lk', status: 'Active' },
      { code: 'LEC0061', name: 'Chef Randeniya', designation: 'Lecturer', type: 'Visiting', email: 'email62@bcas.lk', status: 'Active' },
      { code: 'LEC0022', name: 'Mr. Amesh Neran', designation: 'Lecturer', type: 'Visiting', email: 'email23@bcas.lk', status: 'Active' },
      { code: 'LEC0064', name: 'Mr. Sujeewa', designation: 'Lecturer', type: 'Visiting', email: 'email65@bcas.lk', status: 'Active' },
      { code: 'LEC0062', name: 'Mr. Thilakasiri', designation: 'Lecturer', type: 'Visiting', email: 'email63@bcas.lk', status: 'Active' }
    ]
  },
  {
    id: 'languages',
    name: 'Department of Languages',
    shortName: 'Languages',
    hodName: 'Mr. Chinthaka (Deputy HOD)',
    hodEmail: 'email48@bcas.lk',
    deputyHodName: 'Mr. Chinthaka',
    deputyHodEmail: 'email48@bcas.lk',
    coordinators: [
      { name: 'Ms. Disara', email: 'email47@bcas.lk', code: 'LEC0046' }
    ],
    lecturers: [
      { code: 'LEC0047', name: 'Mr. Chinthaka', designation: 'Deputy HOD', type: 'Internal', email: 'email48@bcas.lk', status: 'Active', isDeputyHod: true },
      { code: 'LEC0046', name: 'Ms. Disara', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email47@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0049', name: 'Ms. Chanuki Anjana', designation: 'Lecturer', type: 'Internal', email: 'email50@bcas.lk', status: 'Active' },
      { code: 'LEC0050', name: 'Mr. Akila', designation: 'Lecturer', type: 'Visiting', email: 'email51@bcas.lk', status: 'Active' },
      { code: 'LEC0051', name: 'Ms. Navithma', designation: 'Lecturer', type: 'Visiting', email: 'email52@bcas.lk', status: 'Active' },
      { code: 'LEC0086', name: 'Ms. Shobica', designation: 'Lecturer', type: 'Visiting', email: 'email87@bcas.lk', status: 'Active' },
      { code: 'LEC0052', name: 'Ms. Shobika', designation: 'Lecturer', type: 'Visiting', email: 'email53@bcas.lk', status: 'Active' }
    ]
  },
  {
    id: 'law',
    name: 'Department of Law',
    shortName: 'Law',
    hodName: 'Ms. Rashmi (Deputy HOD)',
    hodEmail: 'email43@bcas.lk',
    deputyHodName: 'Ms. Rashmi',
    deputyHodEmail: 'email43@bcas.lk',
    coordinators: [
      { name: 'Mr. Pranawan', email: 'email45@bcas.lk', code: 'LEC0044' },
      { name: 'Ms. Sajini', email: 'email44@bcas.lk', code: 'LEC0043' }
    ],
    lecturers: [
      { code: 'LEC0042', name: 'Ms. Rashmi', designation: 'Deputy HOD', type: 'Internal', email: 'email43@bcas.lk', status: 'Active', isDeputyHod: true },
      { code: 'LEC0044', name: 'Mr. Pranawan', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email45@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC0043', name: 'Ms. Sajini', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email44@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'EXM001', name: 'Examiner 01', designation: 'Internal Lecturer', type: 'Internal', email: 'examiner01@bcas.lk', status: 'Active' },
      { code: 'EXM002', name: 'Examiner 02', designation: 'Internal Lecturer', type: 'Internal', email: 'examiner02@bcas.lk', status: 'Active' },
      { code: 'LEC0045', name: 'Mr. Melwin', designation: 'Lecturer', type: 'Visiting', email: 'email46@bcas.lk', status: 'Active' },
      { code: 'LEC0076', name: 'Ms. Chathurya', designation: 'Lecturer', type: 'Visiting', email: 'email77@bcas.lk', status: 'Active' }
    ]
  },
  {
    id: 'nursing',
    name: 'Department of Nursing',
    shortName: 'Nursing',
    hodName: 'Ms. Chavika (Coordinator)',
    hodEmail: 'email69@bcas.lk',
    coordinators: [
      { name: 'Ms. Chavika', email: 'email69@bcas.lk', code: 'LEC0068' }
    ],
    lecturers: [
      { code: 'LEC0068', name: 'Ms. Chavika', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email69@bcas.lk', status: 'Active', isCoordinator: true }
    ]
  },
  {
    id: 'psychology',
    name: 'Department of Psychology',
    shortName: 'Psychology',
    hodName: 'Ms. Indrachapa (Coordinator)',
    hodEmail: 'email66@bcas.lk',
    coordinators: [
      { name: 'Ms. Indrachapa', email: 'email66@bcas.lk', code: 'LEC0065' }
    ],
    lecturers: [
      { code: 'LEC0065', name: 'Ms. Indrachapa', designation: 'Lecturer Cum Coordinator', type: 'Internal', email: 'email66@bcas.lk', status: 'Active', isCoordinator: true },
      { code: 'LEC140', name: 'Mr. Sandev', designation: 'Lecturer', type: 'Visiting', email: 'email141@bcas.lk', status: 'Active' },
      { code: 'LEC0067', name: 'Ms. Nethmi', designation: 'Lecturer', type: 'Visiting', email: 'email68@bcas.lk', status: 'Active' },
      { code: 'LEC141', name: 'Ms. Radshwary', designation: 'Lecturer', type: 'Visiting', email: 'email142@bcas.lk', status: 'Active' }
    ]
  }
];

export const BCAS_CLASSROOMS = [
  'WEST 101 (15)',
  'WEST 102 (40)',
  'WEST 103 (9)',
  'WEST 104 (21)',
  'WEST 105 (39)',
  'WEST 106 (New)',
  'WEST 107 (New)',
  'WEST 108 (New)',
  'WEST 002 (40)',
  'WEST 003 (19)',
  'WEST 004 (27)',
  'WEST 005 (40)',
  'EAST 301',
  'EAST 302(20) Bio medical Lab',
  'EAST 303 Nursing Lab',
  'EAST 304 (64)',
  'EAST 305 (30)',
  'EAST 306 (30)',
  'EAST 307 (42)',
  'TECH 001 (30)',
  'TECH 002 (30)',
  'TECH 003 (54)',
  'TECH 004 (40)',
  'CIVIL LAB BASE 001 [20]',
  'CIVIL LAB BASE 002 [20]',
  'DL 203 (TR)',
  'DL 204 (Study abroad)',
  'DL 205',
  'DL next to mini board rm(202)',
  'Hotel Management room',
  'KITCHEN',
  'AUDITORIUM',
  'Main Board Room',
  'Mini Board Room',
  'Library',
  'WFH / Online (Teams / Zoom)'
];

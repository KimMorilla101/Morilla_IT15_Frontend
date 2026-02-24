// Mock Data Structure - Ready for Laravel REST API Integration
// API Endpoints will follow this structure: /api/students, /api/courses, etc.

export const studentsData = [
  { id: 1, studentId: '2024-0001', name: 'Juan Dela Cruz', email: 'juan.delacruz@email.com', program: 'BS Computer Science', year: 3, status: 'Active', enrolledUnits: 21 },
  { id: 2, studentId: '2024-0002', name: 'Maria Santos', email: 'maria.santos@email.com', program: 'BS Information Technology', year: 2, status: 'Active', enrolledUnits: 18 },
  { id: 3, studentId: '2024-0003', name: 'Pedro Rodriguez', email: 'pedro.rodriguez@email.com', program: 'BS Computer Engineering', year: 4, status: 'Active', enrolledUnits: 15 },
  { id: 4, studentId: '2024-0004', name: 'Ana Reyes', email: 'ana.reyes@email.com', program: 'BS Computer Science', year: 1, status: 'Active', enrolledUnits: 24 },
  { id: 5, studentId: '2024-0005', name: 'Carlos Mendoza', email: 'carlos.mendoza@email.com', program: 'BS Information Technology', year: 3, status: 'Inactive', enrolledUnits: 0 },
];

export const coursesData = [
  { id: 1, courseCode: 'CS101', title: 'Introduction to Programming', units: 3, instructor: 'Prof. Garcia', schedule: 'MWF 8:00-9:00 AM', capacity: 40, enrolled: 35, available: 5 },
  { id: 2, courseCode: 'CS201', title: 'Data Structures & Algorithms', units: 3, instructor: 'Prof. Torres', schedule: 'TTH 10:00-11:30 AM', capacity: 35, enrolled: 30, available: 5 },
  { id: 3, courseCode: 'IT301', title: 'Web Development', units: 3, instructor: 'Prof. Ramos', schedule: 'MWF 1:00-2:00 PM', capacity: 30, enrolled: 28, available: 2 },
  { id: 4, courseCode: 'CS305', title: 'Database Systems', units: 3, instructor: 'Prof. Villanueva', schedule: 'TTH 2:00-3:30 PM', capacity: 35, enrolled: 32, available: 3 },
  { id: 5, courseCode: 'IT401', title: 'Systems Integration', units: 3, instructor: 'Prof. Cruz', schedule: 'MWF 3:00-4:00 PM', capacity: 25, enrolled: 25, available: 0 },
  { id: 6, courseCode: 'CS402', title: 'Machine Learning', units: 3, instructor: 'Prof. Bautista', schedule: 'TTH 4:00-5:30 PM', capacity: 30, enrolled: 22, available: 8 },
];

export const enrollmentData = [
  { id: 1, studentId: '2024-0001', studentName: 'Juan Dela Cruz', courseCode: 'CS201', courseName: 'Data Structures & Algorithms', units: 3, semester: '2nd Semester 2025-2026', status: 'Enrolled', date: '2026-01-15' },
  { id: 2, studentId: '2024-0001', studentName: 'Juan Dela Cruz', courseCode: 'CS305', courseName: 'Database Systems', units: 3, semester: '2nd Semester 2025-2026', status: 'Enrolled', date: '2026-01-15' },
  { id: 3, studentId: '2024-0002', studentName: 'Maria Santos', courseCode: 'IT301', courseName: 'Web Development', units: 3, semester: '2nd Semester 2025-2026', status: 'Enrolled', date: '2026-01-16' },
  { id: 4, studentId: '2024-0003', studentName: 'Pedro Rodriguez', courseCode: 'CS402', courseName: 'Machine Learning', units: 3, semester: '2nd Semester 2025-2026', status: 'Enrolled', date: '2026-01-14' },
  { id: 5, studentId: '2024-0004', studentName: 'Ana Reyes', courseCode: 'CS101', courseName: 'Introduction to Programming', units: 3, semester: '2nd Semester 2025-2026', status: 'Pending', date: '2026-02-18' },
];

export const dashboardStats = {
  totalStudents: 1247,
  totalCourses: 86,
  activeEnrollments: 3891,
  pendingApprovals: 23,
  
  // Chart data
  enrollmentTrends: [
    { month: 'Aug', enrollments: 420 },
    { month: 'Sep', enrollments: 380 },
    { month: 'Oct', enrollments: 250 },
    { month: 'Nov', enrollments: 180 },
    { month: 'Dec', enrollments: 120 },
    { month: 'Jan', enrollments: 890 },
    { month: 'Feb', enrollments: 740 },
  ],
  
  programDistribution: [
    { name: 'Computer Science', value: 485, color: '#800000' },
    { name: 'Information Technology', value: 412, color: '#a00000' },
    { name: 'Computer Engineering', value: 350, color: '#c00000' },
  ],
  
  recentActivities: [
    { id: 1, type: 'enrollment', message: 'New enrollment: Ana Reyes', time: '2 hours ago' },
    { id: 2, type: 'student', message: 'Student profile updated: Juan Dela Cruz', time: '5 hours ago' },
    { id: 3, type: 'course', message: 'Course added: Advanced AI', time: '1 day ago' },
    { id: 4, type: 'report', message: 'Monthly report generated', time: '2 days ago' },
  ]
};

<<<<<<< HEAD
export const programsData = [
  {
    id: 1,
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    type: "Bachelor's",
    duration: '4 years',
    totalUnits: 146,
    status: 'Active',
    description: 'Focuses on software development, systems administration, and applied computing for business solutions.',
    yearLevels: [
      { year: '1st Year', subjects: ['IT101', 'IT102', 'GE101', 'MATH101'] },
      { year: '2nd Year', subjects: ['IT201', 'IT202', 'IT203', 'STAT201'] },
      { year: '3rd Year', subjects: ['IT301', 'IT302', 'IT303', 'IT304'] },
      { year: '4th Year', subjects: ['IT401', 'IT402', 'IT403', 'IT404'] }
    ],
    addedDate: '2026-02-20'
  },
  {
    id: 2,
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    type: "Bachelor's",
    duration: '4 years',
    totalUnits: 150,
    status: 'Active',
    description: 'Emphasizes algorithms, software engineering, data science, and theoretical foundations of computing.',
    yearLevels: [
      { year: '1st Year', subjects: ['CS101', 'CS102', 'GE101', 'MATH101'] },
      { year: '2nd Year', subjects: ['CS201', 'CS202', 'CS203', 'STAT201'] },
      { year: '3rd Year', subjects: ['CS301', 'CS302', 'CS303', 'CS304'] },
      { year: '4th Year', subjects: ['CS401', 'CS402', 'CS403', 'CS404'] }
    ],
    addedDate: '2026-02-16'
  },
  {
    id: 3,
    code: 'BSCE',
    name: 'Bachelor of Science in Computer Engineering',
    type: "Bachelor's",
    duration: '5 years',
    totalUnits: 178,
    status: 'Under Review',
    description: 'Integrates hardware design, embedded systems, and computer architecture with software fundamentals.',
    yearLevels: [
      { year: '1st Year', subjects: ['CE101', 'CE102', 'GE101', 'MATH101'] },
      { year: '2nd Year', subjects: ['CE201', 'CE202', 'CE203', 'STAT201'] },
      { year: '3rd Year', subjects: ['CE301', 'CE302', 'CE303', 'CE304'] },
      { year: '4th Year', subjects: ['CE401', 'CE402', 'CE403', 'CE404'] },
      { year: '5th Year', subjects: ['CE501', 'CE502', 'CE503'] }
    ],
    addedDate: '2026-02-10'
  },
  {
    id: 4,
    code: 'DIT',
    name: 'Diploma in Information Technology',
    type: 'Diploma',
    duration: '2 years',
    totalUnits: 82,
    status: 'Phased Out',
    description: 'Provides foundational IT skills for system support, networking, and basic programming.',
    yearLevels: [
      { year: '1st Year', subjects: ['DIT101', 'DIT102', 'GE101', 'MATH101'] },
      { year: '2nd Year', subjects: ['DIT201', 'DIT202', 'DIT203', 'DIT204'] }
    ],
    addedDate: '2025-12-12'
  }
];

export const subjectsData = [
  {
    id: 1,
    code: 'IT101',
    title: 'Foundations of Computing',
    units: 3,
    termType: 'Semester',
    semester: '1st Semester',
    programCode: 'BSIT',
    programName: 'BS Information Technology',
    description: 'Introduces computing concepts, problem solving, and productivity tools.',
    preReqs: [],
    coReqs: [],
    addedDate: '2026-02-18'
  },
  {
    id: 2,
    code: 'IT102',
    title: 'Programming Fundamentals',
    units: 4,
    termType: 'Semester',
    semester: '1st Semester',
    programCode: 'BSIT',
    programName: 'BS Information Technology',
    description: 'Covers basic programming constructs using a modern language.',
    preReqs: [],
    coReqs: [],
    addedDate: '2026-02-18'
  },
  {
    id: 3,
    code: 'IT201',
    title: 'Web Development I',
    units: 3,
    termType: 'Both',
    semester: '2nd Semester',
    programCode: 'BSIT',
    programName: 'BS Information Technology',
    description: 'Front-end development with responsive layouts and accessibility.',
    preReqs: ['IT102'],
    coReqs: [],
    addedDate: '2026-02-12'
  },
  {
    id: 4,
    code: 'IT301',
    title: 'Systems Integration',
    units: 2,
    termType: 'Term',
    semester: 'Midyear Term',
    programCode: 'BSIT',
    programName: 'BS Information Technology',
    description: 'Integrates system components and services into cohesive solutions.',
    preReqs: ['IT201'],
    coReqs: [],
    addedDate: '2026-01-28'
  },
  {
    id: 5,
    code: 'CS101',
    title: 'Introduction to Computing',
    units: 3,
    termType: 'Semester',
    semester: '1st Semester',
    programCode: 'BSCS',
    programName: 'BS Computer Science',
    description: 'Overview of computer science disciplines and computational thinking.',
    preReqs: [],
    coReqs: [],
    addedDate: '2026-02-15'
  },
  {
    id: 6,
    code: 'CS201',
    title: 'Data Structures and Algorithms',
    units: 4,
    termType: 'Semester',
    semester: '2nd Semester',
    programCode: 'BSCS',
    programName: 'BS Computer Science',
    description: 'Covers fundamental data structures and algorithmic analysis.',
    preReqs: ['CS101'],
    coReqs: [],
    addedDate: '2026-02-05'
  },
  {
    id: 7,
    code: 'CS301',
    title: 'Software Engineering',
    units: 3,
    termType: 'Both',
    semester: '1st Semester',
    programCode: 'BSCS',
    programName: 'BS Computer Science',
    description: 'Software development life cycle, modeling, and quality assurance.',
    preReqs: ['CS201'],
    coReqs: [],
    addedDate: '2026-01-20'
  },
  {
    id: 8,
    code: 'CS401',
    title: 'Machine Learning',
    units: 4,
    termType: 'Term',
    semester: 'Midyear Term',
    programCode: 'BSCS',
    programName: 'BS Computer Science',
    description: 'Supervised and unsupervised learning techniques with applications.',
    preReqs: ['CS201', 'STAT201'],
    coReqs: [],
    addedDate: '2026-01-10'
  },
  {
    id: 9,
    code: 'CE101',
    title: 'Digital Logic Design',
    units: 3,
    termType: 'Semester',
    semester: '1st Semester',
    programCode: 'BSCE',
    programName: 'BS Computer Engineering',
    description: 'Binary systems, logic gates, and combinational circuits.',
    preReqs: [],
    coReqs: [],
    addedDate: '2026-01-05'
  },
  {
    id: 10,
    code: 'CE201',
    title: 'Microprocessors',
    units: 4,
    termType: 'Semester',
    semester: '2nd Semester',
    programCode: 'BSCE',
    programName: 'BS Computer Engineering',
    description: 'Architecture and programming of microprocessors and peripherals.',
    preReqs: ['CE101'],
    coReqs: [],
    addedDate: '2025-12-22'
  },
  {
    id: 11,
    code: 'DIT101',
    title: 'IT Essentials',
    units: 2,
    termType: 'Semester',
    semester: '1st Semester',
    programCode: 'DIT',
    programName: 'Diploma in Information Technology',
    description: 'Covers hardware, operating systems, and basic troubleshooting.',
    preReqs: [],
    coReqs: [],
    addedDate: '2025-12-10'
  },
  {
    id: 12,
    code: 'DIT201',
    title: 'Network Fundamentals',
    units: 3,
    termType: 'Both',
    semester: '2nd Semester',
    programCode: 'DIT',
    programName: 'Diploma in Information Technology',
    description: 'Introduces networking concepts, cabling, and basic configuration.',
    preReqs: ['DIT101'],
    coReqs: [],
    addedDate: '2025-12-02'
  },
  {
    id: 13,
    code: 'IT205',
    title: 'Database Fundamentals',
    units: 3,
    termType: 'Semester',
    semester: '2nd Semester',
    programCode: 'BSIT',
    programName: 'BS Information Technology',
    description: 'Relational database concepts, modeling, and SQL fundamentals.',
    preReqs: ['IT102'],
    coReqs: [],
    addedDate: '2026-02-22'
  },
  {
    id: 14,
    code: 'IT310',
    title: 'Systems Maintenance',
    units: 2,
    termType: 'Term',
    semester: 'Midyear Term',
    programCode: 'BSIT',
    programName: 'BS Information Technology',
    description: 'Maintenance planning, diagnostics, and system upkeep procedures.',
    preReqs: ['IT201'],
    coReqs: [],
    addedDate: '2026-02-22'
  },
  {
    id: 15,
    code: 'IT420',
    title: 'Human-Computer Interaction',
    units: 3,
    termType: 'Term',
    semester: 'Midyear Term',
    programCode: 'BSIT',
    programName: 'BS Information Technology',
    description: 'User-centered design, prototyping, and usability evaluation.',
    preReqs: ['IT201'],
    coReqs: [],
    addedDate: '2026-02-22'
  },
  {
    id: 16,
    code: 'CS498',
    title: 'Machine Learning Thesis / Capstone',
    units: 4,
    termType: 'Semester',
    semester: '2nd Semester',
    programCode: 'BSCS',
    programName: 'BS Computer Science',
    description: 'Capstone research project focused on machine learning applications.',
    preReqs: ['CS401'],
    coReqs: [],
    addedDate: '2026-02-21'
  },
  {
    id: 17,
    code: 'CS499',
    title: 'Capstone Project',
    units: 4,
    termType: 'Semester',
    semester: '2nd Semester',
    programCode: 'BSCS',
    programName: 'BS Computer Science',
    description: 'Team-based software capstone project with full delivery lifecycle.',
    preReqs: ['CS301'],
    coReqs: [],
    addedDate: '2026-02-21'
  },
  {
    id: 18,
    code: 'CE320',
    title: 'Hydraulics',
    units: 3,
    termType: 'Semester',
    semester: '1st Semester',
    programCode: 'BSCE',
    programName: 'BS Computer Engineering',
    description: 'Fluid properties, flow measurement, and hydraulic applications.',
    preReqs: ['CE201'],
    coReqs: [],
    addedDate: '2026-02-20'
  },
  {
    id: 19,
    code: 'CE330',
    title: 'Geotechnical Engineering',
    units: 3,
    termType: 'Semester',
    semester: '2nd Semester',
    programCode: 'BSCE',
    programName: 'BS Computer Engineering',
    description: 'Soil mechanics, foundation design, and site investigation.',
    preReqs: ['CE201'],
    coReqs: [],
    addedDate: '2026-02-20'
  },
  {
    id: 20,
    code: 'DIT299',
    title: 'On-the-Job Training (OJT)',
    units: 2,
    termType: 'Semester',
    semester: '2nd Semester',
    programCode: 'DIT',
    programName: 'Diploma in Information Technology',
    description: 'Supervised industry training with applied IT tasks.',
    preReqs: ['DIT201'],
    coReqs: [],
    addedDate: '2026-02-19'
  }
];

=======
>>>>>>> b2e5797868fe35bc656ad79a139a2f0fbd1bb43e
// API Integration Structure (for future Laravel backend)
export const apiEndpoints = {
  students: '/api/students',
  courses: '/api/courses',
  enrollments: '/api/enrollments',
  dashboard: '/api/dashboard/stats',
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
  }
};

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

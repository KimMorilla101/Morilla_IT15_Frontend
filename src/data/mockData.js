// Mock Data Structure - Ready for Laravel REST API Integration
// Provides rich local data when backend mode is disabled.

const formatDateIso = (value) => value.toISOString().slice(0, 10);

const PROGRAM_CATALOG = [
  {
    code: 'BSCS',
    name: 'BS Computer Science',
    department: 'School of Computing',
    duration: '4 years',
    totalUnits: 152,
    status: 'Active',
    description:
      'Focuses on software engineering, algorithms, and data-driven systems for modern applications.',
  },
  {
    code: 'BSIT',
    name: 'BS Information Technology',
    department: 'School of Computing',
    duration: '4 years',
    totalUnits: 146,
    status: 'Active',
    description:
      'Covers systems administration, networking, and enterprise application development.',
  },
  {
    code: 'BSIS',
    name: 'BS Information Systems',
    department: 'School of Business and Technology',
    duration: '4 years',
    totalUnits: 144,
    status: 'Active',
    description:
      'Bridges business analysis and information systems design for organizational solutions.',
  },
  {
    code: 'BSCPE',
    name: 'BS Computer Engineering',
    department: 'College of Engineering',
    duration: '5 years',
    totalUnits: 175,
    status: 'Active',
    description:
      'Combines electronics, embedded systems, and computer architecture with software fundamentals.',
  },
];

const FIRST_NAMES = [
  'Alex',
  'Bianca',
  'Carlo',
  'Diana',
  'Ethan',
  'Faith',
  'Gabriel',
  'Hannah',
  'Ivan',
  'Julia',
  'Kyle',
  'Lara',
  'Marco',
  'Nina',
  'Owen',
  'Paula',
  'Quinn',
  'Rafael',
  'Sofia',
  'Tristan',
  'Uma',
  'Vince',
  'Wendy',
  'Xavier',
  'Yasmin',
  'Zach',
];

const LAST_NAMES = [
  'Dela Cruz',
  'Santos',
  'Reyes',
  'Mendoza',
  'Garcia',
  'Ramos',
  'Torres',
  'Flores',
  'Navarro',
  'Diaz',
  'Bautista',
  'Castillo',
  'Villanueva',
  'Ortega',
  'Mercado',
  'Domingo',
  'Valdez',
  'Lopez',
  'Rivera',
  'Salazar',
];

const CITIES = [
  'Quezon City',
  'Manila',
  'Caloocan',
  'Pasig',
  'Taguig',
  'Makati',
  'Marikina',
  'Paranaque',
  'Las Pinas',
  'Mandaluyong',
  'Antipolo',
  'San Jose del Monte',
];

const PROVINCES = [
  'Metro Manila',
  'Rizal',
  'Bulacan',
  'Laguna',
  'Cavite',
  'Batangas',
  'Pampanga',
  'Tarlac',
];

const INCOME_BRACKETS = [
  'Low Income',
  'Lower-Middle Income',
  'Middle Income',
  'Upper-Middle Income',
];

const SCHOLARSHIP_STATUSES = ['None', 'Academic', 'Athletic', 'Government Grant'];
const GENDER_CYCLE = ['Female', 'Male', 'Female', 'Male', 'Female', 'Male'];
const STUDENT_STATUS_CYCLE = ['Active', 'Active', 'Active', 'Active', 'Pending', 'Inactive'];
const UNITS_CYCLE = [15, 18, 21, 24];

const toEmail = (name, id) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '')}${id}@student.morilla.edu`;

const toOrdinal = (year) => {
  if (year === 1) return '1st Year';
  if (year === 2) return '2nd Year';
  if (year === 3) return '3rd Year';
  return `${year}th Year`;
};

export const studentsData = Array.from({ length: 500 }, (_, index) => {
  const id = index + 1;
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  const name = `${firstName} ${lastName}`;

  const program = PROGRAM_CATALOG[index % PROGRAM_CATALOG.length];
  const year = (index % 4) + 1;

  const birthYear = 1999 + (index % 8);
  const birthMonth = (index % 12) + 1;
  const birthDay = ((index * 2) % 28) + 1;
  const birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
  const age = 2026 - birthYear;

  return {
    id,
    studentId: `2026-${String(id).padStart(4, '0')}`,
    name,
    email: toEmail(name, id),
    program: program.name,
    programCode: program.code,
    department: program.department,
    year,
    yearLevel: toOrdinal(year),
    status: STUDENT_STATUS_CYCLE[index % STUDENT_STATUS_CYCLE.length],
    enrolledUnits: UNITS_CYCLE[index % UNITS_CYCLE.length],

    // Demographic information
    gender: GENDER_CYCLE[index % GENDER_CYCLE.length],
    age,
    birthDate,
    city: CITIES[index % CITIES.length],
    province: PROVINCES[index % PROVINCES.length],
    householdIncomeBracket: INCOME_BRACKETS[index % INCOME_BRACKETS.length],
    scholarshipStatus: SCHOLARSHIP_STATUSES[index % SCHOLARSHIP_STATUSES.length],
    guardianName: `${FIRST_NAMES[(index + 7) % FIRST_NAMES.length]} ${lastName}`,
    contactNumber: `09${String(10_000_000 + index).padStart(8, '0')}`,
    entryYear: 2026 - (year - 1),
  };
});

const COURSE_BLUEPRINTS = [
  {
    courseCode: 'CS101',
    title: 'Introduction to Programming',
    department: 'Computer Science',
    units: 3,
    instructor: 'Prof. Adrian Garcia',
    semester: '1st Semester',
    schedule: 'MWF 8:00-9:00 AM',
    capacity: 45,
    enrolled: 40,
  },
  {
    courseCode: 'CS102',
    title: 'Discrete Structures',
    department: 'Computer Science',
    units: 3,
    instructor: 'Prof. Nina Torres',
    semester: '1st Semester',
    schedule: 'TTH 9:00-10:30 AM',
    capacity: 40,
    enrolled: 36,
  },
  {
    courseCode: 'CS201',
    title: 'Data Structures and Algorithms',
    department: 'Computer Science',
    units: 4,
    instructor: 'Prof. Carlo Ramos',
    semester: '2nd Semester',
    schedule: 'MWF 9:00-10:00 AM',
    capacity: 40,
    enrolled: 38,
  },
  {
    courseCode: 'CS220',
    title: 'Object-Oriented Programming',
    department: 'Computer Science',
    units: 3,
    instructor: 'Prof. Bianca Reyes',
    semester: '2nd Semester',
    schedule: 'TTH 1:00-2:30 PM',
    capacity: 38,
    enrolled: 34,
  },
  {
    courseCode: 'CS301',
    title: 'Operating Systems',
    department: 'Computer Science',
    units: 3,
    instructor: 'Prof. Marco Villanueva',
    semester: '1st Semester',
    schedule: 'MWF 11:00-12:00 NN',
    capacity: 35,
    enrolled: 31,
  },
  {
    courseCode: 'CS401',
    title: 'Artificial Intelligence',
    department: 'Computer Science',
    units: 3,
    instructor: 'Prof. Sofia Mendoza',
    semester: '2nd Semester',
    schedule: 'TTH 3:00-4:30 PM',
    capacity: 32,
    enrolled: 29,
  },
  {
    courseCode: 'IT101',
    title: 'Fundamentals of Information Technology',
    department: 'Information Technology',
    units: 3,
    instructor: 'Prof. Hannah Flores',
    semester: '1st Semester',
    schedule: 'MWF 10:00-11:00 AM',
    capacity: 45,
    enrolled: 41,
  },
  {
    courseCode: 'IT130',
    title: 'Web Design and UX',
    department: 'Information Technology',
    units: 3,
    instructor: 'Prof. Kyle Navarro',
    semester: '1st Semester',
    schedule: 'TTH 10:30-12:00 NN',
    capacity: 35,
    enrolled: 33,
  },
  {
    courseCode: 'IT220',
    title: 'Database Systems',
    department: 'Information Technology',
    units: 3,
    instructor: 'Prof. Lara Diaz',
    semester: '2nd Semester',
    schedule: 'MWF 1:00-2:00 PM',
    capacity: 40,
    enrolled: 37,
  },
  {
    courseCode: 'IT250',
    title: 'Networking Essentials',
    department: 'Information Technology',
    units: 3,
    instructor: 'Prof. Ivan Salazar',
    semester: '2nd Semester',
    schedule: 'TTH 8:00-9:30 AM',
    capacity: 36,
    enrolled: 30,
  },
  {
    courseCode: 'IT310',
    title: 'Information Assurance',
    department: 'Information Technology',
    units: 3,
    instructor: 'Prof. Quentin Valdez',
    semester: '1st Semester',
    schedule: 'MWF 2:00-3:00 PM',
    capacity: 32,
    enrolled: 28,
  },
  {
    courseCode: 'IT402',
    title: 'Cloud Computing',
    department: 'Information Technology',
    units: 3,
    instructor: 'Prof. Wendy Lopez',
    semester: '2nd Semester',
    schedule: 'TTH 4:00-5:30 PM',
    capacity: 30,
    enrolled: 26,
  },
  {
    courseCode: 'IS210',
    title: 'Systems Analysis and Design',
    department: 'Information Systems',
    units: 3,
    instructor: 'Prof. Julia Castillo',
    semester: '1st Semester',
    schedule: 'MWF 9:00-10:00 AM',
    capacity: 40,
    enrolled: 32,
  },
  {
    courseCode: 'IS320',
    title: 'Enterprise Architecture',
    department: 'Information Systems',
    units: 3,
    instructor: 'Prof. Tristan Rivera',
    semester: '2nd Semester',
    schedule: 'TTH 1:00-2:30 PM',
    capacity: 36,
    enrolled: 30,
  },
  {
    courseCode: 'CPE101',
    title: 'Computer Engineering Drafting',
    department: 'Computer Engineering',
    units: 2,
    instructor: 'Prof. Ethan Bautista',
    semester: '1st Semester',
    schedule: 'MWF 8:00-9:00 AM',
    capacity: 30,
    enrolled: 27,
  },
  {
    courseCode: 'CPE210',
    title: 'Digital Logic and Design',
    department: 'Computer Engineering',
    units: 3,
    instructor: 'Prof. Paula Ortega',
    semester: '1st Semester',
    schedule: 'TTH 2:30-4:00 PM',
    capacity: 34,
    enrolled: 29,
  },
  {
    courseCode: 'CPE320',
    title: 'Microprocessors',
    department: 'Computer Engineering',
    units: 4,
    instructor: 'Prof. Rafael Mercado',
    semester: '2nd Semester',
    schedule: 'MWF 3:00-4:00 PM',
    capacity: 34,
    enrolled: 31,
  },
  {
    courseCode: 'CPE410',
    title: 'Embedded Systems',
    department: 'Computer Engineering',
    units: 3,
    instructor: 'Prof. Yasmin Domingo',
    semester: '2nd Semester',
    schedule: 'TTH 9:00-10:30 AM',
    capacity: 28,
    enrolled: 24,
  },
  {
    courseCode: 'GE101',
    title: 'Communication Skills',
    department: 'General Education',
    units: 3,
    instructor: 'Prof. Xavier Flores',
    semester: '1st Semester',
    schedule: 'MWF 11:00-12:00 NN',
    capacity: 50,
    enrolled: 46,
  },
  {
    courseCode: 'GE202',
    title: 'Philippine History and Society',
    department: 'General Education',
    units: 3,
    instructor: 'Prof. Owen Navarro',
    semester: '1st Semester',
    schedule: 'TTH 10:00-11:30 AM',
    capacity: 50,
    enrolled: 44,
  },
  {
    courseCode: 'GE303',
    title: 'Science, Technology, and Society',
    department: 'General Education',
    units: 3,
    instructor: 'Prof. Zach Torres',
    semester: '2nd Semester',
    schedule: 'TTH 3:00-4:30 PM',
    capacity: 45,
    enrolled: 40,
  },
];

export const coursesData = COURSE_BLUEPRINTS.map((course, index) => {
  const enrolled = 30;
  const capacity = Math.max(course.capacity, enrolled + 10);
  const available = capacity - enrolled;
  return {
    id: index + 1,
    ...course,
    enrolled,
    capacity,
    code: course.courseCode,
    name: course.title,
    available,
    status: available > 0 ? 'Open' : 'Full',
  };
});

const PROGRAM_COURSE_PREFIX = {
  'Computer Science': 'BSCS',
  'Information Technology': 'BSIT',
  'Information Systems': 'BSIS',
  'Computer Engineering': 'BSCPE',
  'General Education': 'BSIS',
};

const buildYearLevels = (programCode, years) =>
  Array.from({ length: years }, (_, index) => {
    const yearNumber = index + 1;
    return {
      year: toOrdinal(yearNumber),
      courses: [
        `${programCode}${yearNumber}01`,
        `${programCode}${yearNumber}02`,
        `${programCode}${yearNumber}03`,
        `${programCode}${yearNumber}04`,
      ],
    };
  });

export const programsData = PROGRAM_CATALOG.map((program, index) => {
  const studentCount = studentsData.filter((student) => student.programCode === program.code).length;
  const years = Number(program.duration.charAt(0));

  return {
    id: index + 1,
    code: program.code,
    name: program.name,
    type: "Bachelor's",
    department: program.department,
    duration: program.duration,
    totalUnits: program.totalUnits,
    studentCount,
    status: program.status,
    description: program.description,
    yearLevels: buildYearLevels(program.code, years),
    addedDate: `2026-0${(index % 5) + 1}-1${index % 9}`,
  };
});

const COURSE_STATUS = (available) => (available > 0 ? 'Active' : 'Inactive');

const courseDescription = (course) =>
  `${course.title} for ${course.department.toLowerCase()} focusing on practical competencies and assessment milestones.`;

export const courseCatalogData = coursesData.map((course, index) => ({
  id: index + 1,
  code: course.courseCode,
  name: course.title,
  title: course.title,
  units: course.units,
  department: course.department,
  semester: course.semester,
  termType: 'Semester',
  instructor: course.instructor,
  enrolledStudents: course.enrolled,
  status: COURSE_STATUS(course.available),
  description: courseDescription(course),
  programCode: PROGRAM_COURSE_PREFIX[course.department] || 'BSCS',
  programName:
    PROGRAM_CATALOG.find((item) => item.code === (PROGRAM_COURSE_PREFIX[course.department] || 'BSCS'))?.name ||
    'BS Computer Science',
  preReqs: index % 4 === 0 ? [] : [coursesData[Math.max(0, index - 1)].courseCode],
  coReqs: index % 6 === 0 ? [coursesData[Math.max(0, index - 2)].courseCode] : [],
  addedDate: `2026-0${(index % 5) + 1}-${String((index % 20) + 1).padStart(2, '0')}`,
}));

const ENROLLMENT_START_DATE = new Date('2025-08-05T00:00:00');

export const enrollmentData = courseCatalogData.flatMap((course, courseIndex) =>
  Array.from({ length: 30 }, (_, entryIndex) => {
    const id = courseIndex * 30 + entryIndex + 1;
    const student = studentsData[(courseIndex * 29 + entryIndex) % studentsData.length];

    const date = new Date(ENROLLMENT_START_DATE);
    date.setDate(ENROLLMENT_START_DATE.getDate() + ((courseIndex * 11 + entryIndex) % 280));
    const enrollmentDate = formatDateIso(date);

    let status = 'Enrolled';
    if (entryIndex >= 24 && entryIndex < 28) {
      status = 'Pending';
    }
    if (entryIndex >= 28) {
      status = 'Dropped';
    }

    return {
      id,
      studentId: student.studentId,
      studentName: student.name,
      courseCode: course.code,
      courseName: course.name,
      units: course.units,
      semester:
        course.semester === '1st Semester' ? '1st Semester 2025-2026' : '2nd Semester 2025-2026',
      status,
      enrollmentDate,
      date: enrollmentDate,
    };
  }),
);

const HOLIDAYS = {
  '2025-08-25': 'National Heroes Day',
  '2025-11-27': 'University Foundation Holiday',
  '2025-12-08': 'Feast of the Immaculate Conception',
  '2025-12-25': 'Christmas Day',
  '2026-01-01': 'New Year Day',
  '2026-02-25': 'EDSA People Power Anniversary',
  '2026-04-02': 'Maundy Thursday',
  '2026-04-03': 'Good Friday',
  '2026-04-09': 'Araw ng Kagitingan',
  '2026-05-01': 'Labor Day',
};

const ACADEMIC_EVENTS = {
  '2025-08-11': 'Opening Convocation',
  '2025-09-08': 'Student Leadership Summit',
  '2025-10-13': 'Midterm Examinations Start',
  '2025-11-10': 'Research Colloquium',
  '2025-12-15': 'Community Extension Day',
  '2026-01-12': 'Second Semester Opening',
  '2026-02-16': 'Career and Internship Fair',
  '2026-03-16': 'Academic Festival Week',
  '2026-04-20': 'Final Examination Review Week',
  '2026-05-18': 'Capstone Defense Week',
  '2026-05-25': 'Recognition and Awards Ceremony',
};

const attendanceBaseByWeekday = {
  1: 92,
  2: 90,
  3: 91,
  4: 89,
  5: 87,
};

const buildSchoolDaysData = () => {
  const start = new Date('2025-08-04T00:00:00');
  const end = new Date('2026-05-29T00:00:00');

  const rows = [];
  let id = 1;
  let classDayCounter = 0;

  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) {
      continue;
    }

    const iso = formatDateIso(date);

    if (HOLIDAYS[iso]) {
      rows.push({
        id: id++,
        date: iso,
        type: 'holiday',
        category: 'holiday',
        title: HOLIDAYS[iso],
        attendance_rate: null,
        attendanceRate: null,
        notes: 'No classes scheduled.',
      });
      continue;
    }

    const baseRate = attendanceBaseByWeekday[weekday] || 90;
    const variation = (classDayCounter % 5) - 2;
    const attendance = Math.max(82, Math.min(98, baseRate + variation));

    if (ACADEMIC_EVENTS[iso]) {
      rows.push({
        id: id++,
        date: iso,
        type: 'event',
        category: 'event',
        title: ACADEMIC_EVENTS[iso],
        attendance_rate: attendance,
        attendanceRate: attendance,
        notes: 'Academic event integrated with instructional activities.',
      });
      classDayCounter += 1;
      continue;
    }

    rows.push({
      id: id++,
      date: iso,
      type: 'class_day',
      category: 'attendance',
      title: 'Regular Class Day',
      attendance_rate: attendance,
      attendanceRate: attendance,
      notes: 'Regular instruction day.',
    });
    classDayCounter += 1;
  }

  return rows;
};

export const schoolDaysData = buildSchoolDaysData();

const monthOrder = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
const monthFromDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short' });

const enrollmentByMonth = enrollmentData.reduce((accumulator, item) => {
  const month = monthFromDate(item.enrollmentDate);
  const current = accumulator.get(month) || 0;
  accumulator.set(month, current + 1);
  return accumulator;
}, new Map());

const programDistribution = programsData.map((program, index) => ({
  name: program.name.replace('BS ', ''),
  value: program.studentCount,
  color: ['#800000', '#a00000', '#b22222', '#c14444', '#d16666', '#e18888'][index % 6],
}));

const recentActivities = schoolDaysData
  .filter((item) => item.type === 'holiday' || item.type === 'event')
  .slice(-8)
  .reverse()
  .map((item, index) => ({
    id: index + 1,
    type: item.type === 'event' ? 'student' : 'report',
    message: `${item.type === 'event' ? 'Academic event' : 'Holiday'}: ${item.title}`,
    time: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }));

export const dashboardStats = {
  totalStudents: studentsData.length,
  totalCourses: coursesData.length,
  activeEnrollments: enrollmentData.filter((item) => item.status === 'Enrolled').length,
  pendingApprovals: enrollmentData.filter((item) => item.status === 'Pending').length,

  enrollmentTrends: monthOrder.map((month) => ({
    month,
    enrollments: enrollmentByMonth.get(month) || 0,
  })),

  programDistribution,
  recentActivities,
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
  },
};

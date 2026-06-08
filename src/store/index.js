
// ============================================================
// HR MIS - Central Data Store (localStorage-backed)
// Provides CRUD operations for all HR data collections.
// Collections: users, vacancies, recruitment, employees,
//              interviews, offers, attendance, performance,
//              feedback, grievances, exits, notifications
// ============================================================

const DEFAULT_DATA = {
  users: [
    { id: 'u1', name: 'Priya Sharma', email: 'admin@hrms.com', password: 'admin123', role: 'hr_admin', department: 'HR', avatar: 'PS' },
    { id: 'u2', name: 'Rajesh Kumar', email: 'head@hrms.com', password: 'head123', role: 'dept_head', department: 'Engineering', avatar: 'RK' },
    { id: 'u3', name: 'Anita Singh', email: 'emp@hrms.com', password: 'emp123', role: 'employee', department: 'Marketing', avatar: 'AS', employeeId: 'E005' },
  ],

  vacancies: [
    { id: 'v1', department: 'Engineering', title: 'Senior React Developer', profile: 'React, Node.js, MongoDB, 3+ years', count: 2, requestDate: '2026-01-05', platform: 'LinkedIn', postStart: '2026-01-10', postEnd: '2026-02-10', status: 'Fulfilled' },
    { id: 'v2', department: 'Marketing', title: 'Digital Marketing Manager', profile: 'SEO, SEM, Google Ads, Analytics', count: 1, requestDate: '2026-01-15', platform: 'Naukri', postStart: '2026-01-20', postEnd: '2026-02-20', status: 'Open' },
    { id: 'v3', department: 'Finance', title: 'Financial Analyst', profile: 'Excel, Tally, Financial Reporting, CPA preferred', count: 2, requestDate: '2026-02-01', platform: 'LinkedIn', postStart: '2026-02-05', postEnd: '2026-03-05', status: 'Open' },
    { id: 'v4', department: 'HR', title: 'HR Executive', profile: 'Recruitment, Onboarding, HRMS tools', count: 1, requestDate: '2026-02-10', platform: 'Instagram', postStart: '2026-02-15', postEnd: '2026-03-15', status: 'Pending' },
    { id: 'v5', department: 'Engineering', title: 'DevOps Engineer', profile: 'AWS, Docker, Kubernetes, CI/CD', count: 1, requestDate: '2026-03-01', platform: 'LinkedIn', postStart: '2026-03-05', postEnd: '2026-04-05', status: 'Closed' },
    { id: 'v6', department: 'Sales', title: 'Business Development Executive', profile: 'B2B Sales, CRM, Communication', count: 3, requestDate: '2026-03-10', platform: 'Naukri', postStart: '2026-03-15', postEnd: '2026-04-15', status: 'Open' },
    { id: 'v7', department: 'Design', title: 'UI/UX Designer', profile: 'Figma, Adobe XD, Prototyping', count: 1, requestDate: '2026-04-01', platform: 'Instagram', postStart: '2026-04-05', postEnd: '2026-05-05', status: 'Open' },
    { id: 'v8', department: 'Engineering', title: 'Backend Python Developer', profile: 'Python, Django, REST APIs, PostgreSQL', count: 2, requestDate: '2026-04-15', platform: 'LinkedIn', postStart: '2026-04-20', postEnd: '2026-05-20', status: 'Fulfilled' },
  ],

  recruitment: [
    { id: 'r1', vacancyId: 'v1', platform: 'LinkedIn', applications: 87, shortlisted: 22, interviewed: 15, selected: 2, rejected: 13, joined: 2, conversionRate: 2.3 },
    { id: 'r2', vacancyId: 'v2', platform: 'Naukri', applications: 54, shortlisted: 12, interviewed: 8, selected: 1, rejected: 7, joined: 0, conversionRate: 1.8 },
    { id: 'r3', vacancyId: 'v3', platform: 'LinkedIn', applications: 43, shortlisted: 10, interviewed: 6, selected: 1, rejected: 5, joined: 1, conversionRate: 2.3 },
    { id: 'r4', vacancyId: 'v6', platform: 'Naukri', applications: 120, shortlisted: 30, interviewed: 20, selected: 5, rejected: 15, joined: 3, conversionRate: 4.2 },
    { id: 'r5', vacancyId: 'v8', platform: 'LinkedIn', applications: 65, shortlisted: 18, interviewed: 10, selected: 2, rejected: 8, joined: 2, conversionRate: 3.1 },
    { id: 'r6', vacancyId: 'v7', platform: 'Instagram', applications: 38, shortlisted: 9, interviewed: 5, selected: 1, rejected: 4, joined: 0, conversionRate: 2.6 },
  ],

  employees: [
    { id: 'E001', name: 'Arjun Mehta', department: 'Engineering', designation: 'Senior Developer', profile: 'Full Stack', doj: '2023-06-15', gender: 'Male', category: 'General', age: 29, experience: 5, phone: '9876543210', email: 'arjun@company.com', status: 'Active' },
    { id: 'E002', name: 'Sneha Patel', department: 'Marketing', designation: 'Marketing Lead', profile: 'Digital Marketing', doj: '2023-08-01', gender: 'Female', category: 'OBC', age: 27, experience: 3, phone: '9876543211', email: 'sneha@company.com', status: 'Active' },
    { id: 'E003', name: 'Vikram Rathore', department: 'Finance', designation: 'Financial Analyst', profile: 'Financial Planning', doj: '2024-01-10', gender: 'Male', category: 'General', age: 32, experience: 7, phone: '9876543212', email: 'vikram@company.com', status: 'Active' },
    { id: 'E004', name: 'Kavya Nair', department: 'HR', designation: 'HR Manager', profile: 'Talent Acquisition', doj: '2022-11-20', gender: 'Female', category: 'General', age: 34, experience: 9, phone: '9876543213', email: 'kavya@company.com', status: 'Active' },
    { id: 'E005', name: 'Anita Singh', department: 'Marketing', designation: 'Content Strategist', profile: 'Content & SEO', doj: '2024-03-05', gender: 'Female', category: 'SC', age: 25, experience: 2, phone: '9876543214', email: 'anita@company.com', status: 'Probation' },
    { id: 'E006', name: 'Rohit Gupta', department: 'Engineering', designation: 'DevOps Engineer', profile: 'Cloud & Infra', doj: '2023-04-12', gender: 'Male', category: 'OBC', age: 30, experience: 4, phone: '9876543215', email: 'rohit@company.com', status: 'Active' },
    { id: 'E007', name: 'Deepa Krishnan', department: 'Design', designation: 'UI/UX Designer', profile: 'Product Design', doj: '2024-05-01', gender: 'Female', category: 'General', age: 26, experience: 2, phone: '9876543216', email: 'deepa@company.com', status: 'Active' },
    { id: 'E008', name: 'Manoj Yadav', department: 'Sales', designation: 'BDE', profile: 'B2B Sales', doj: '2024-02-14', gender: 'Male', category: 'OBC', age: 28, experience: 3, phone: '9876543217', email: 'manoj@company.com', status: 'Active' },
    { id: 'E009', name: 'Ritika Joshi', department: 'Engineering', designation: 'Backend Developer', profile: 'Python & APIs', doj: '2026-04-01', gender: 'Female', category: 'ST', age: 24, experience: 1, phone: '9876543218', email: 'ritika@company.com', status: 'Probation' },
    { id: 'E010', name: 'Suresh Babu', department: 'Sales', designation: 'Sales Manager', profile: 'Enterprise Sales', doj: '2022-07-18', gender: 'Male', category: 'General', age: 38, experience: 12, phone: '9876543219', email: 'suresh@company.com', status: 'Active' },
    { id: 'E011', name: 'Pallavi Desai', department: 'HR', designation: 'HR Executive', profile: 'Onboarding & Compliance', doj: '2023-09-10', gender: 'Female', category: 'General', age: 27, experience: 3, phone: '9876543220', email: 'pallavi@company.com', status: 'On Leave' },
    { id: 'E012', name: 'Karan Malhotra', department: 'Engineering', designation: 'Frontend Developer', profile: 'React & Vue', doj: '2026-05-01', gender: 'Male', category: 'General', age: 23, experience: 1, phone: '9876543221', email: 'karan@company.com', status: 'Probation' },
    { id: 'E013', name: 'Nisha Verma', department: 'Finance', designation: 'Accounts Executive', profile: 'Accounting & Reporting', doj: '2023-12-01', gender: 'Female', category: 'SC', age: 29, experience: 4, phone: '9876543222', email: 'nisha@company.com', status: 'Resigned' },
    { id: 'E014', name: 'Amit Tiwari', department: 'Design', designation: 'Graphic Designer', profile: 'Branding & Visual Design', doj: '2024-07-20', gender: 'Male', category: 'OBC', age: 25, experience: 2, phone: '9876543223', email: 'amit@company.com', status: 'Active' },
  ],

  interviews: [
    { id: 'i1', candidate: 'Rahul Bansal', vacancy: 'Senior React Developer', date: '2026-01-18', time: '10:00', interviewer: 'Arjun Mehta', status: 'Completed', result: 'Selected', reason: '' },
    { id: 'i2', candidate: 'Preeti Sharma', vacancy: 'Digital Marketing Manager', date: '2026-02-05', time: '11:30', interviewer: 'Sneha Patel', status: 'Completed', result: 'Rejected', reason: 'Insufficient experience in paid ads' },
    { id: 'i3', candidate: 'Mohit Kapoor', vacancy: 'Financial Analyst', date: '2026-02-20', time: '14:00', interviewer: 'Vikram Rathore', status: 'Completed', result: 'On Hold', reason: 'Awaiting second round' },
    { id: 'i4', candidate: 'Sonia Agarwal', vacancy: 'Backend Python Developer', date: '2026-04-28', time: '10:30', interviewer: 'Rohit Gupta', status: 'Scheduled', result: '', reason: '' },
    { id: 'i5', candidate: 'Tarun Mishra', vacancy: 'Business Development Executive', date: '2026-05-02', time: '15:00', interviewer: 'Suresh Babu', status: 'Scheduled', result: '', reason: '' },
    { id: 'i6', candidate: 'Akanksha Roy', vacancy: 'UI/UX Designer', date: '2026-05-05', time: '11:00', interviewer: 'Deepa Krishnan', status: 'Scheduled', result: '', reason: '' },
    { id: 'i7', candidate: 'Nikhil Pandey', vacancy: 'DevOps Engineer', date: '2026-03-15', time: '13:00', interviewer: 'Rohit Gupta', status: 'Completed', result: 'Rejected', reason: 'Kubernetes experience not adequate' },
    { id: 'i8', candidate: 'Aarav Jain', vacancy: 'Business Development Executive', date: '2026-05-14', time: '10:00', interviewer: 'Suresh Babu', status: 'Scheduled', result: '', reason: '' },
  ],

  offers: [
    { id: 'o1', employeeId: 'E001', employeeName: 'Arjun Mehta', joiningDate: '2023-06-15', basicSalary: 65000, hra: 26000, allowances: 12000, specialConditions: 'Remote work 2 days/week', ctc: 1236000 },
    { id: 'o2', employeeId: 'E002', employeeName: 'Sneha Patel', joiningDate: '2023-08-01', basicSalary: 50000, hra: 20000, allowances: 8000, specialConditions: 'Annual performance bonus', ctc: 936000 },
    { id: 'o3', employeeId: 'E009', employeeName: 'Ritika Joshi', joiningDate: '2026-04-01', basicSalary: 42000, hra: 16800, allowances: 7000, specialConditions: '6 month probation, then review', ctc: 789600 },
    { id: 'o4', employeeId: 'E012', employeeName: 'Karan Malhotra', joiningDate: '2026-05-01', basicSalary: 38000, hra: 15200, allowances: 6000, specialConditions: 'Training period 3 months', ctc: 710400 },
  ],

  attendance: (() => {
    const records = [];
    const employees = ['E001','E002','E003','E004','E005','E006','E007','E008','E009','E010','E011','E012','E014'];
    for (let d = 1; d <= 13; d++) {
      const date = `2026-05-${String(d).padStart(2,'0')}`;
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      employees.forEach(empId => {
        const rand = Math.random();
        const status = rand > 0.1 ? 'Present' : 'Absent';
        records.push({ id: `att_${date}_${empId}`, date, employeeId: empId, status });
      });
    }
    return records;
  })(),

  performance: [
    { id: 'p1', employeeId: 'E001', period: 'Q1 2026', score: 92, feedback: 'Excellent delivery on React migration project', improvement: 'Communication with stakeholders', result: 'Excellent', recommendation: 'Promotion' },
    { id: 'p2', employeeId: 'E002', period: 'Q1 2026', score: 78, feedback: 'Good marketing campaigns, exceeded quarterly targets', improvement: 'Data analysis skills', result: 'Good', recommendation: 'Hike' },
    { id: 'p3', employeeId: 'E003', period: 'Q1 2026', score: 65, feedback: 'Average performance in financial modeling', improvement: 'Advanced Excel skills', result: 'Average', recommendation: 'None' },
    { id: 'p4', employeeId: 'E006', period: 'Q1 2026', score: 88, feedback: 'Excellent CI/CD pipeline setup', improvement: 'Documentation practices', result: 'Excellent', recommendation: 'Hike' },
    { id: 'p5', employeeId: 'E008', period: 'Q1 2026', score: 55, feedback: 'Below target in Q1 sales', improvement: 'Sales pitch & CRM usage', result: 'Poor', recommendation: 'PIP' },
    { id: 'p6', employeeId: 'E010', period: 'Q1 2026', score: 84, feedback: 'Strong enterprise client retention', improvement: 'Team collaboration', result: 'Good', recommendation: 'Hike' },
    { id: 'p7', employeeId: 'E004', period: 'Q1 2026', score: 90, feedback: 'Excellent talent acquisition & HR processes', improvement: 'HR tech adoption', result: 'Excellent', recommendation: 'Promotion' },
    { id: 'p8', employeeId: 'E007', period: 'Q1 2026', score: 82, feedback: 'Very creative UI designs delivered on time', improvement: 'User research documentation', result: 'Good', recommendation: 'Hike' },
    { id: 'p9', employeeId: 'E014', period: 'Q4 2025', score: 71, feedback: 'Good branding work', improvement: 'Motion design skills', result: 'Good', recommendation: 'None' },
    { id: 'p10', employeeId: 'E001', period: 'Q4 2025', score: 85, feedback: 'Strong backend contributions', improvement: 'Code review participation', result: 'Excellent', recommendation: 'Hike' },
  ],

  feedback: [
    { id: 'f1', date: '2026-01-15', by: 'Suresh Babu', employeeId: 'E008', type: 'Negative', description: 'Missed client meeting without prior notice', action: 'Verbal Warning Issued' },
    { id: 'f2', date: '2026-02-10', by: 'Arjun Mehta', employeeId: 'E009', type: 'Positive', description: 'Proactive in learning new technologies', action: 'Appreciation mail sent' },
    { id: 'f3', date: '2026-02-20', by: 'Kavya Nair', employeeId: 'E011', type: 'Negative', description: 'Frequent late check-ins affecting team schedule', action: 'Counseling session scheduled' },
    { id: 'f4', date: '2026-03-05', by: 'Sneha Patel', employeeId: 'E002', type: 'Positive', description: 'Outstanding campaign results - 40% lead increase', action: 'Recommended for quarterly bonus' },
    { id: 'f5', date: '2026-03-18', by: 'Vikram Rathore', employeeId: 'E003', type: 'Negative', description: 'Errors found in quarterly financial report', action: 'Additional training assigned' },
    { id: 'f6', date: '2026-04-02', by: 'Rohit Gupta', employeeId: 'E001', type: 'Positive', description: 'Excellent code quality and documentation', action: 'Shared as best practice with team' },
    { id: 'f7', date: '2026-04-22', by: 'Kavya Nair', employeeId: 'E008', type: 'Negative', description: 'Third instance of missing targets this quarter', action: 'Performance Improvement Plan initiated' },
  ],

  grievances: [
    { id: 'g1', complaintBy: 'E005', against: 'E002', date: '2026-02-15', description: 'Unequal distribution of project tasks within marketing team', status: 'Resolved', remarks: 'Task allocation revised and documented', resolutionDate: '2026-02-22' },
    { id: 'g2', complaintBy: 'E011', against: 'HR Policy', date: '2026-03-10', description: 'Medical leave policy is unclear and inconsistently applied', status: 'Under Review', remarks: 'HR policy committee reviewing leave guidelines', resolutionDate: '' },
    { id: 'g3', complaintBy: 'E003', against: 'E010', date: '2026-04-01', description: 'Inappropriate behavior during team meeting', status: 'Open', remarks: '', resolutionDate: '' },
    { id: 'g4', complaintBy: 'E008', against: 'Management', date: '2026-04-15', description: 'Sales targets set without consultation or market data', status: 'Under Review', remarks: 'Management reviewing target-setting process', resolutionDate: '' },
    { id: 'g5', complaintBy: 'E009', against: 'E006', date: '2026-05-02', description: 'Senior colleague not providing technical mentorship as promised', status: 'Open', remarks: '', resolutionDate: '' },
  ],

  exits: [
    { id: 'ex1', employeeId: 'E013', resignationDate: '2026-03-01', lastWorkingDay: '2026-03-31', reason: 'Better opportunity elsewhere', assetReturn: 'Completed', expLetter: 'Issued', status: 'Completed' },
    { id: 'ex2', employeeId: 'E011', resignationDate: '2026-04-20', lastWorkingDay: '2026-05-19', reason: 'Personal reasons / relocation', assetReturn: 'Pending', expLetter: 'Pending', status: 'In Progress' },
  ],

  notifications: [
    { id: 'n1', type: 'interview', message: 'Interview with Sonia Agarwal on 2026-04-28 at 10:30', priority: 'high', read: false },
    { id: 'n2', type: 'interview', message: 'Interview with Aarav Jain scheduled for today (2026-05-14)', priority: 'high', read: false },
    { id: 'n3', type: 'grievance', message: 'Grievance G3 from E003 is still Open - 43 days pending', priority: 'high', read: false },
    { id: 'n4', type: 'assessment', message: 'Q2 2026 performance assessments are due by June 30', priority: 'medium', read: false },
    { id: 'n5', type: 'vacancy', message: 'Vacancy for "Digital Marketing Manager" closes on 2026-02-20 - still unfilled', priority: 'medium', read: true },
    { id: 'n6', type: 'grievance', message: 'Grievance G5 from E009 opened 12 days ago - no action taken', priority: 'medium', read: false },
  ],
};

const STORAGE_KEY = 'hr_mis_data';

export function initStore() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
  }
}

export function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_DATA;
}

export function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
}

/** Return all records for a given collection key. */
export function getCollection(key) {
  return getStore()[key] || [];
}

/** Replace an entire collection. */
export function saveCollection(key, arr) {
  const store = getStore();
  store[key] = arr;
  saveStore(store);
}

/** Append a new item to a collection. */
export function addItem(key, item) {
  const store = getStore();
  store[key] = [...(store[key] || []), item];
  saveStore(store);
}

/** Merge updates into a single item matched by id. */
export function updateItem(key, id, updates) {
  const store = getStore();
  store[key] = (store[key] || []).map(i => i.id === id ? { ...i, ...updates } : i);
  saveStore(store);
}

/** Remove an item from a collection by id. */
export function deleteItem(key, id) {
  const store = getStore();
  store[key] = (store[key] || []).filter(i => i.id !== id);
  saveStore(store);
}

/** Generate a unique prefixed ID. */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

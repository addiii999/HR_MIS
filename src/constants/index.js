// ============================================================
// Application-wide constants
// Centralised here to avoid magic values scattered across pages.
// ============================================================

/** Chart palette — used in Recharts throughout the dashboard. */
export const CHART_COLORS = [
  '#0084ff', '#319AFF', '#60B1FF',
  '#8b5cf6', '#10b981', '#f59e0b',
  '#f97316', '#ec4899',
];

/** Maps employee status strings to their CSS badge class. */
export const STATUS_BADGE_MAP = {
  Active:      'badge-green',
  Probation:   'badge-yellow',
  'On Leave':  'badge-blue',
  Resigned:    'badge-red',
  Terminated:  'badge-red',
};

/** Canonical department list used in forms and filters. */
export const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Finance',
  'HR', 'Sales', 'Design', 'Operations', 'Legal',
];

/** Employee status options. */
export const EMPLOYEE_STATUSES = [
  'Active', 'Probation', 'On Leave', 'Resigned', 'Terminated',
];

/** Gender options. */
export const GENDERS = ['Male', 'Female', 'Other'];

/** Reservation category options (India context). */
export const CATEGORIES = ['General', 'OBC', 'SC', 'ST'];

/** Application user roles. */
export const ROLES = {
  HR_ADMIN:  'hr_admin',
  DEPT_HEAD: 'dept_head',
  EMPLOYEE:  'employee',
};

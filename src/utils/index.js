// ============================================================
// Shared utility functions
// Pure functions with no side effects — safe to import anywhere.
// ============================================================

/**
 * Format an ISO date string (YYYY-MM-DD) to a locale-friendly display.
 * @param {string} dateStr - ISO date string
 * @param {object} [options] - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(dateStr, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  } catch {
    return dateStr;
  }
}

/**
 * Extract initials from a full name (up to 2 characters).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Generate a unique prefixed ID string.
 * @param {string} [prefix='id']
 * @returns {string}
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate a percentage, returning 0 if denominator is 0.
 * @param {number} numerator
 * @param {number} denominator
 * @param {number} [decimals=1]
 * @returns {number}
 */
export function percent(numerator, denominator, decimals = 1) {
  if (!denominator) return 0;
  return parseFloat(((numerator / denominator) * 100).toFixed(decimals));
}

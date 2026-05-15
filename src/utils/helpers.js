// src/utils/helpers.js
// Miscellaneous helper functions.

/**
 * Format a JS Date (or Firestore Timestamp) to DD/MM/YYYY.
 */
export const formatDate = (dateOrTimestamp) => {
  if (!dateOrTimestamp) return '—';
  // Firestore Timestamp has .toDate()
  const d =
    typeof dateOrTimestamp.toDate === 'function'
      ? dateOrTimestamp.toDate()
      : new Date(dateOrTimestamp);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Format date + time for activity rows.
 */
export const formatDateTime = (dateOrTimestamp) => {
  if (!dateOrTimestamp) return '—';
  const d =
    typeof dateOrTimestamp.toDate === 'function'
      ? dateOrTimestamp.toDate()
      : new Date(dateOrTimestamp);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}  ${hh}:${min}`;
};

/**
 * Validate nickname: A-Z a-z 0-9 _ only, max 30 chars.
 */
export const isValidNickname = (value) => /^[A-Za-z0-9_]{1,30}$/.test(value);

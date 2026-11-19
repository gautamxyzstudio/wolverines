/**
 * Generates a unique registration ID for Year-End Celebration 2026 submissions.
 * Format: YEC26-XXXXXX (e.g., YEC26-834921)
 */
export function generateYearEndRegistrationId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `YEC26-${randomDigits}`;
}

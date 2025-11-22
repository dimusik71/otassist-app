/**
 * Healthcare Record Retention Utilities
 * Compliant with Australian healthcare record retention requirements
 */

/**
 * Calculate the retention period end date for a client
 * - Adults: 7 years from last service/archival
 * - Children: 7 years from turning 18
 */
export function calculateClientRetentionDate(
  dateOfBirth: Date | null,
  archivedAt: Date
): Date {
  const retentionDate = new Date(archivedAt);

  if (dateOfBirth) {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const hadBirthdayThisYear =
      today.getMonth() > dateOfBirth.getMonth() ||
      (today.getMonth() === dateOfBirth.getMonth() &&
        today.getDate() >= dateOfBirth.getDate());

    const currentAge = hadBirthdayThisYear ? age : age - 1;

    // If client is currently under 18, calculate 7 years from turning 18
    if (currentAge < 18) {
      const turns18Date = new Date(dateOfBirth);
      turns18Date.setFullYear(dateOfBirth.getFullYear() + 18);
      retentionDate.setTime(turns18Date.getTime());
      retentionDate.setFullYear(retentionDate.getFullYear() + 7);
      return retentionDate;
    }
  }

  // Adult or unknown DOB: 7 years from archival date
  retentionDate.setFullYear(retentionDate.getFullYear() + 7);
  return retentionDate;
}

/**
 * Calculate the retention period end date for an assessment
 * - Completed assessments: 7 years from completion date
 * - Incomplete assessments: Can be deleted immediately or kept at discretion
 */
export function calculateAssessmentRetentionDate(
  status: string,
  completedAt: Date | null,
  archivedAt: Date,
  clientDateOfBirth: Date | null
): Date {
  const retentionDate = new Date(archivedAt);

  // Incomplete assessments can be deleted after 30 days by default
  if (status === "draft" || status === "in_progress") {
    retentionDate.setDate(retentionDate.getDate() + 30);
    return retentionDate;
  }

  // For completed assessments, use the client's retention policy
  // or 7 years from completion date, whichever is longer
  const completionDate = completedAt || archivedAt;

  if (clientDateOfBirth) {
    const today = new Date();
    const age = today.getFullYear() - clientDateOfBirth.getFullYear();
    const hadBirthdayThisYear =
      today.getMonth() > clientDateOfBirth.getMonth() ||
      (today.getMonth() === clientDateOfBirth.getMonth() &&
        today.getDate() >= clientDateOfBirth.getDate());

    const currentAge = hadBirthdayThisYear ? age : age - 1;

    // If client was/is a child, use child retention policy
    if (currentAge < 18) {
      const turns18Date = new Date(clientDateOfBirth);
      turns18Date.setFullYear(clientDateOfBirth.getFullYear() + 18);
      retentionDate.setTime(turns18Date.getTime());
      retentionDate.setFullYear(retentionDate.getFullYear() + 7);
      return retentionDate;
    }
  }

  // Adult or unknown: 7 years from completion
  retentionDate.setTime(completionDate.getTime());
  retentionDate.setFullYear(retentionDate.getFullYear() + 7);
  return retentionDate;
}

/**
 * Check if a record can be permanently deleted based on retention date
 */
export function canPermanentlyDelete(canDeleteAfter: Date | null): boolean {
  if (!canDeleteAfter) return false;
  return new Date() >= canDeleteAfter;
}

/**
 * Determine if a client is a child based on date of birth
 */
export function isChild(dateOfBirth: Date | null): boolean {
  if (!dateOfBirth) return false;

  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() &&
      today.getDate() >= dateOfBirth.getDate());

  return hadBirthdayThisYear ? age < 18 : age - 1 < 18;
}

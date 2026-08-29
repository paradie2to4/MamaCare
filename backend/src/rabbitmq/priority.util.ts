import { FollowUpPriority } from '@prisma/client';

/** 1st mother-wide missed appointment -> MEDIUM, 2nd -> HIGH, 3rd+ -> URGENT. */
export function deriveMissedAppointmentPriority(missedCount: number): FollowUpPriority {
  if (missedCount <= 1) return FollowUpPriority.MEDIUM;
  if (missedCount === 2) return FollowUpPriority.HIGH;
  return FollowUpPriority.URGENT;
}

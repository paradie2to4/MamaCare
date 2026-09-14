export type Role = 'MOTHER' | 'PARTNER' | 'CHW' | 'HEALTH_OFFICER' | 'ADMIN';

export type AppointmentType = 'ANC_VISIT' | 'ULTRASOUND' | 'LAB_TEST' | 'VACCINATION' | 'POSTNATAL' | 'OTHER';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED' | 'RESCHEDULED';

export type ReminderType = 'APPOINTMENT' | 'MEDICATION' | 'DAILY_TIP' | 'CUSTOM';
export type ReminderStatus = 'PENDING' | 'SENT' | 'DISMISSED' | 'FAILED';
export type ReminderChannel = 'IN_APP' | 'EMAIL' | 'SMS';

export type EducationCategory =
  | 'NUTRITION'
  | 'ANTENATAL_CARE'
  | 'EXERCISE_WELLBEING'
  | 'BIRTH_PREPARATION'
  | 'DANGER_SIGNS'
  | 'MENTAL_WELLBEING'
  | 'NEWBORN_CARE'
  | 'BREASTFEEDING'
  | 'POSTNATAL_CARE'
  | 'IMMUNIZATION'
  | 'HYGIENE'
  | 'FAMILY_SUPPORT';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: Role;
  preferredLanguage: string;
  createdAt: string;
}

export interface MotherProfile {
  id: string;
  userId: string;
  dateOfBirth?: string | null;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export interface Pregnancy {
  id: string;
  motherProfileId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'MISCARRIED' | 'TERMINATED';
  lmpDate: string;
  eddDate: string;
  notes?: string | null;
  currentWeek: number;
}

export interface Appointment {
  id: string;
  motherProfileId: string;
  pregnancyId?: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: string;
  facilityName: string;
  location?: string | null;
  notes?: string | null;
}

export interface Reminder {
  id: string;
  userId: string;
  appointmentId?: string | null;
  type: ReminderType;
  title: string;
  message: string;
  scheduledFor: string;
  status: ReminderStatus;
  channel: ReminderChannel;
}

export interface EducationArticle {
  id: string;
  slug: string;
  category: EducationCategory;
  titleEnglish: string;
  titleKinyarwanda: string;
  summaryEnglish: string;
  summaryKinyarwanda: string;
  contentEnglish: string;
  contentKinyarwanda: string;
  pregnancyStage?: string | null;
  readTimeMinutes: number;
  reviewedBy?: string | null;
  updatedAt: string;
}

export type PartnerLinkStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

export interface PartnerLinkView {
  id: string;
  status: PartnerLinkStatus;
  invitedAt: string;
  acceptedAt?: string | null;
  partner?: { firstName: string; lastName: string; email: string };
}

export interface NextAppointmentSummary {
  type: AppointmentType;
  scheduledAt: string;
  facilityName: string;
  status: AppointmentStatus;
}

export interface PartnerDashboard {
  status: 'NONE' | 'PENDING' | 'ACTIVE';
  mother: { firstName: string; lastName: string } | null;
  nextAppointment: NextAppointmentSummary | null;
}

export type FollowUpPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type FollowUpStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface HealthFollowUp {
  id: string;
  motherProfileId: string;
  assignedCHWId?: string | null;
  priority: FollowUpPriority;
  reason: string;
  status: FollowUpStatus;
  dueDate?: string | null;
  notes?: string | null;
  createdAt: string;
  motherProfile?: { user: { firstName: string; lastName: string } };
}

export interface ChwSummary {
  totalAssigned: number;
  onTrack: number;
  followUpNeeded: number;
  priority: number;
}

export interface AssignedMother {
  id: string;
  userId: string;
  user: { firstName: string; lastName: string; phone?: string | null };
  pregnancies: Pregnancy[];
  followUps: HealthFollowUp[];
}

export type NotificationType = 'APPOINTMENT' | 'REMINDER' | 'FOLLOW_UP' | 'EDUCATION' | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type AiMessageRole = 'USER' | 'ASSISTANT';

export interface AiMessage {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}

import {
  DEMO_PASSWORD,
  educationArticles,
  initialAiMessages,
  initialAppointments,
  initialFollowUps,
  initialMotherProfiles,
  initialNotifications,
  initialPartnerLinks,
  initialPregnancies,
  initialReminders,
  initialUsers,
  type MockAiMessage,
  type MockAppointment,
  type MockFollowUp,
  type MockMotherProfile,
  type MockNotification,
  type MockPartnerLink,
  type MockPregnancy,
  type MockReminder,
  type MockUser,
} from './fixtures';

/**
 * Mutable in-memory "database" for demo/mock mode. Resets on page reload —
 * that's expected for a mock demo, not a bug. The current logged-in user id
 * persists in sessionStorage so a refresh doesn't force a re-login.
 */
export const db = {
  users: [...initialUsers] as MockUser[],
  motherProfiles: [...initialMotherProfiles] as MockMotherProfile[],
  pregnancies: [...initialPregnancies] as MockPregnancy[],
  appointments: [...initialAppointments] as MockAppointment[],
  reminders: [...initialReminders] as MockReminder[],
  educationArticles: [...educationArticles],
  partnerLinks: [...initialPartnerLinks] as MockPartnerLink[],
  followUps: [...initialFollowUps] as MockFollowUp[],
  notifications: [...initialNotifications] as MockNotification[],
  aiMessages: [...initialAiMessages] as MockAiMessage[],
};

export function checkPassword(password: string): boolean {
  return password === DEMO_PASSWORD;
}

export function findUserByEmail(email: string): MockUser | undefined {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): MockUser | undefined {
  return db.users.find((u) => u.id === id);
}

export function findMotherProfileByUserId(userId: string): MockMotherProfile | undefined {
  return db.motherProfiles.find((p) => p.userId === userId);
}

export function findMotherProfileById(id: string): MockMotherProfile | undefined {
  return db.motherProfiles.find((p) => p.id === id);
}

let idCounter = 1000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const SESSION_KEY = 'mamacare_mock_session_user_id';

export function startSession(userId: string) {
  sessionStorage.setItem(SESSION_KEY, userId);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSessionUser(): MockUser | undefined {
  const id = sessionStorage.getItem(SESSION_KEY);
  if (!id) return undefined;
  return findUserById(id);
}

/** Mock access tokens just carry the user id — nothing verifies signatures in demo mode. */
export function makeAccessToken(userId: string): string {
  return `mock.${userId}`;
}

export function userIdFromAuthHeader(authHeader: string | null): string | undefined {
  if (!authHeader?.startsWith('Bearer mock.')) return undefined;
  return authHeader.replace('Bearer mock.', '');
}

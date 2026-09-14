export const authKeys = {
  me: ['auth', 'me'] as const,
};

export const motherKeys = {
  profile: ['mothers', 'profile'] as const,
  pregnancies: ['mothers', 'pregnancies'] as const,
  currentPregnancy: ['mothers', 'pregnancies', 'current'] as const,
};

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (status?: string) => ['appointments', 'list', status ?? 'all'] as const,
};

export const reminderKeys = {
  all: ['reminders'] as const,
  list: (status?: string) => ['reminders', 'list', status ?? 'all'] as const,
};

export const educationKeys = {
  all: ['education'] as const,
  list: (category?: string) => ['education', 'list', category ?? 'all'] as const,
  detail: (slug: string) => ['education', 'detail', slug] as const,
};

export const partnerKeys = {
  myLink: ['partners', 'my-link'] as const,
  dashboard: ['partners', 'dashboard'] as const,
};

export const chwKeys = {
  summary: ['chw', 'summary'] as const,
  mothers: ['chw', 'mothers'] as const,
};

export const followUpKeys = {
  mine: (status?: string) => ['follow-ups', 'mine', status ?? 'all'] as const,
  my: ['follow-ups', 'my'] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly?: boolean) => ['notifications', 'list', unreadOnly ?? false] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export const aiKeys = {
  messages: ['ai', 'messages'] as const,
};

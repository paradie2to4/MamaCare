import { http, HttpResponse, type HttpHandler } from 'msw';
import {
  checkPassword,
  clearSession,
  db,
  findMotherProfileById,
  findMotherProfileByUserId,
  findUserByEmail,
  findUserById,
  getSessionUser,
  makeAccessToken,
  nextId,
  startSession,
  userIdFromAuthHeader,
} from './store';
import type { MockUser } from './fixtures';

const API = '*/api/v1';
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getCurrentWeek(lmpDate: string): number {
  const elapsed = Date.now() - new Date(lmpDate).getTime();
  const week = Math.floor(elapsed / MS_PER_WEEK) + 1;
  return Math.min(Math.max(week, 1), 42);
}

function withCurrentWeek<T extends { lmpDate: string }>(pregnancy: T) {
  return { ...pregnancy, currentWeek: getCurrentWeek(pregnancy.lmpDate) };
}

function toUserResponse(user: MockUser) {
  const { id, firstName, lastName, email, phone, role, preferredLanguage, createdAt } = user;
  return { id, firstName, lastName, email, phone, role, preferredLanguage, createdAt };
}

function ok<T>(data: T, init?: number) {
  return HttpResponse.json({ data }, init ? { status: init } : undefined);
}

function unauthorized(message = 'Unauthorized') {
  return HttpResponse.json({ statusCode: 401, message }, { status: 401 });
}

function forbidden(message = 'Forbidden') {
  return HttpResponse.json({ statusCode: 403, message }, { status: 403 });
}

function notFound(message = 'Not found') {
  return HttpResponse.json({ statusCode: 404, message }, { status: 404 });
}

/**
 * Small, self-contained keyword-matched reply set for demo mode — mirrors the shape of the
 * real backend's fallback (`backend/src/modules/ai/ai.fallback.ts`) but is not shared code,
 * since the frontend demo build has no access to the backend package.
 */
const DEMO_AI_TOPICS: { keywords: string[]; content: string }[] = [
  {
    keywords: ['appointment', 'anc', 'visit', 'checkup', 'check-up', 'schedule'],
    content:
      'Rwanda\'s Ministry of Health recommends at least 4 antenatal care (ANC) visits during a pregnancy. ' +
      'If you miss one, reschedule it as soon as possible rather than skipping it.',
  },
  {
    keywords: ['bleeding', 'blood', 'headache', 'fever', 'swelling', 'convulsion', 'movement', 'emergency', 'urgent'],
    content:
      'That sounds like it could be a warning sign. Please contact your CHW or go to the nearest health facility ' +
      'immediately — this needs an in-person check, not a chat reply.',
  },
  {
    keywords: ['eat', 'food', 'nutrition', 'diet', 'iron', 'vitamin'],
    content:
      'A varied diet with vegetables, fruit, protein, and whole grains supports a healthy pregnancy. Ask your CHW ' +
      'about iron and folic acid supplements if you have not started them yet.',
  },
  {
    keywords: ['newborn', 'baby', 'breastfeed', 'breastfeeding'],
    content:
      'Exclusive breastfeeding is recommended for the first 6 months. Keep the umbilical cord stump clean and dry, ' +
      'and contact a health worker if your baby has trouble feeding or seems unusually weak.',
  },
  {
    keywords: ['stress', 'anxious', 'anxiety', 'sad', 'overwhelmed', 'mood'],
    content:
      'Mood changes and worry are common during pregnancy. Talking to someone you trust can help — and if feelings ' +
      'of sadness persist, reach out to your CHW.',
  },
];

function generateDemoReply(userMessage: string): string {
  const normalized = userMessage.toLowerCase();
  const match = DEMO_AI_TOPICS.find((topic) => topic.keywords.some((keyword) => normalized.includes(keyword)));
  return (
    match?.content ??
    'I can help with general information about pregnancy, appointments, nutrition, and warning signs — ask me ' +
      'about one of those, or contact your CHW for anything urgent.'
  );
}

/** Resolves the calling user from the mock Bearer token, or null if unauthenticated. */
function requireUser(request: Request): MockUser | null {
  const auth = request.headers.get('Authorization');
  const userId = userIdFromAuthHeader(auth);
  if (!userId) return null;
  return findUserById(userId) ?? null;
}

export const handlers: HttpHandler[] = [
  // --- Auth ---
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const user = findUserByEmail(body.email);
    if (!user || !checkPassword(body.password)) {
      return unauthorized('Invalid email or password.');
    }
    startSession(user.id);
    return ok({ user: toUserResponse(user), accessToken: makeAccessToken(user.id) });
  }),

  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    if (findUserByEmail(body.email)) {
      return HttpResponse.json({ statusCode: 409, message: 'An account with this email already exists.' }, { status: 409 });
    }
    const user: MockUser = {
      id: nextId('user'),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone ?? null,
      role: 'MOTHER',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    db.motherProfiles.push({
      id: nextId('profile'),
      userId: user.id,
      assignedCHWId: null,
      dateOfBirth: null,
      district: null,
      sector: null,
      cell: null,
      village: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
    });
    startSession(user.id);
    return ok({ user: toUserResponse(user), accessToken: makeAccessToken(user.id) });
  }),

  http.post(`${API}/auth/refresh`, () => {
    const user = getSessionUser();
    if (!user) return unauthorized('No active demo session.');
    return ok({ user: toUserResponse(user), accessToken: makeAccessToken(user.id) });
  }),

  http.post(`${API}/auth/logout`, () => {
    clearSession();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/auth/me`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    return ok(toUserResponse(user));
  }),

  // --- Users ---
  http.patch(`${API}/users/me`, async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const body = (await request.json()) as Partial<MockUser>;
    Object.assign(user, body);
    return ok(toUserResponse(user));
  }),

  // --- Mothers / Pregnancies ---
  http.get(`${API}/mothers/me/profile`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    return ok(findMotherProfileByUserId(user.id) ?? null);
  }),

  http.patch(`${API}/mothers/me/profile`, async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    let profile = findMotherProfileByUserId(user.id);
    const body = (await request.json()) as Record<string, unknown>;
    if (!profile) {
      profile = {
        id: nextId('profile'),
        userId: user.id,
        assignedCHWId: null,
        dateOfBirth: null,
        district: null,
        sector: null,
        cell: null,
        village: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
      };
      db.motherProfiles.push(profile);
    }
    Object.assign(profile, body);
    return ok(profile);
  }),

  http.get(`${API}/mothers/me/pregnancies/current`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return ok(null);
    const pregnancy = db.pregnancies.find((p) => p.motherProfileId === profile.id && p.status === 'ACTIVE');
    return ok(pregnancy ? withCurrentWeek(pregnancy) : null);
  }),

  http.get(`${API}/mothers/me/pregnancies`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return ok([]);
    return ok(db.pregnancies.filter((p) => p.motherProfileId === profile.id).map(withCurrentWeek));
  }),

  http.post(`${API}/mothers/me/pregnancies`, async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    let profile = findMotherProfileByUserId(user.id);
    if (!profile) {
      profile = {
        id: nextId('profile'),
        userId: user.id,
        assignedCHWId: null,
        dateOfBirth: null,
        district: null,
        sector: null,
        cell: null,
        village: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
      };
      db.motherProfiles.push(profile);
    }
    const body = (await request.json()) as { lmpDate: string; eddDate?: string; notes?: string };
    const lmpDate = new Date(body.lmpDate).toISOString();
    const eddDate = body.eddDate
      ? new Date(body.eddDate).toISOString()
      : new Date(new Date(lmpDate).getTime() + 280 * 24 * 60 * 60 * 1000).toISOString();
    const pregnancy = {
      id: nextId('pregnancy'),
      motherProfileId: profile.id,
      status: 'ACTIVE' as const,
      lmpDate,
      eddDate,
      notes: body.notes ?? null,
    };
    db.pregnancies.push(pregnancy);
    return ok(withCurrentWeek(pregnancy));
  }),

  // --- Appointments ---
  http.get(`${API}/appointments`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return ok([]);
    const status = new URL(request.url).searchParams.get('status');
    let list = db.appointments.filter((a) => a.motherProfileId === profile.id);
    if (status) list = list.filter((a) => a.status === status);
    return ok([...list].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
  }),

  http.post(`${API}/appointments`, async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return forbidden('Complete onboarding first.');
    const body = (await request.json()) as {
      type: string;
      scheduledAt: string;
      facilityName: string;
      location?: string;
      notes?: string;
      pregnancyId?: string;
    };
    const appointment = {
      id: nextId('appt'),
      motherProfileId: profile.id,
      pregnancyId: body.pregnancyId ?? null,
      createdByUserId: user.id,
      type: body.type as never,
      status: 'SCHEDULED' as const,
      scheduledAt: new Date(body.scheduledAt).toISOString(),
      facilityName: body.facilityName,
      location: body.location ?? null,
      notes: body.notes ?? null,
    };
    db.appointments.push(appointment);
    return ok(appointment);
  }),

  http.patch(`${API}/appointments/:id/status`, async ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    const appointment = db.appointments.find((a) => a.id === params.id);
    if (!appointment) return notFound('Appointment not found.');
    if (!profile || appointment.motherProfileId !== profile.id) return forbidden();
    const body = (await request.json()) as { status: string };
    appointment.status = body.status as never;
    return ok(appointment);
  }),

  // --- Reminders ---
  http.get(`${API}/reminders`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const status = new URL(request.url).searchParams.get('status');
    let list = db.reminders.filter((r) => r.userId === user.id);
    if (status) list = list.filter((r) => r.status === status);
    return ok([...list].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()));
  }),

  http.patch(`${API}/reminders/:id/dismiss`, ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const reminder = db.reminders.find((r) => r.id === params.id);
    if (!reminder) return notFound('Reminder not found.');
    if (reminder.userId !== user.id) return forbidden();
    reminder.status = 'DISMISSED';
    return ok(reminder);
  }),

  // --- Education ---
  http.get(`${API}/education`, ({ request }) => {
    const category = new URL(request.url).searchParams.get('category');
    let list = db.educationArticles;
    if (category) list = list.filter((a) => a.category === category);
    return ok(list);
  }),

  http.get(`${API}/education/:slug`, ({ params }) => {
    const article = db.educationArticles.find((a) => a.slug === params.slug);
    if (!article) return notFound('Article not found.');
    return ok(article);
  }),

  // --- Partners ---
  http.post(`${API}/partners/invite`, async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return forbidden();
    const existing = db.partnerLinks.find(
      (l) => l.motherProfileId === profile.id && (l.status === 'PENDING' || l.status === 'ACTIVE'),
    );
    if (existing) {
      return HttpResponse.json(
        { statusCode: 409, message: 'You already have a pending or active partner link.' },
        { status: 409 },
      );
    }
    const body = (await request.json()) as { email: string };
    const partner = findUserByEmail(body.email);
    if (!partner) return notFound('No account found with that email address.');
    if (partner.role !== 'PARTNER') {
      return HttpResponse.json(
        { statusCode: 400, message: 'That account is not registered as a partner.' },
        { status: 400 },
      );
    }
    const link = {
      id: nextId('link'),
      partnerUserId: partner.id,
      motherProfileId: profile.id,
      status: 'PENDING' as const,
      invitedAt: new Date().toISOString(),
      acceptedAt: null,
    };
    db.partnerLinks.push(link);
    return ok({ ...link, partner: { firstName: partner.firstName, lastName: partner.lastName, email: partner.email } });
  }),

  http.get(`${API}/partners/my-link`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return ok(null);
    const link = db.partnerLinks.find(
      (l) => l.motherProfileId === profile.id && (l.status === 'PENDING' || l.status === 'ACTIVE'),
    );
    if (!link) return ok(null);
    const partner = findUserById(link.partnerUserId);
    return ok({
      ...link,
      partner: partner ? { firstName: partner.firstName, lastName: partner.lastName, email: partner.email } : undefined,
    });
  }),

  http.patch(`${API}/partners/revoke`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    const link = profile
      ? db.partnerLinks.find((l) => l.motherProfileId === profile.id && (l.status === 'PENDING' || l.status === 'ACTIVE'))
      : undefined;
    if (!link) return notFound('No active or pending partner link found.');
    link.status = 'REVOKED';
    return ok(link);
  }),

  http.get(`${API}/partners/dashboard`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const link = db.partnerLinks.find(
      (l) => l.partnerUserId === user.id && (l.status === 'PENDING' || l.status === 'ACTIVE'),
    );
    if (!link) return ok({ status: 'NONE', mother: null, nextAppointment: null });
    const profile = findMotherProfileById(link.motherProfileId);
    const motherUser = profile ? findUserById(profile.userId) : undefined;
    const mother = motherUser ? { firstName: motherUser.firstName, lastName: motherUser.lastName } : null;
    if (link.status === 'PENDING') {
      return ok({ status: 'PENDING', mother, nextAppointment: null });
    }
    const nextAppointment = profile
      ? db.appointments
          .filter((a) => a.motherProfileId === profile.id && a.status === 'SCHEDULED')
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]
      : undefined;
    return ok({
      status: 'ACTIVE',
      mother,
      nextAppointment: nextAppointment
        ? {
            type: nextAppointment.type,
            scheduledAt: nextAppointment.scheduledAt,
            facilityName: nextAppointment.facilityName,
            status: nextAppointment.status,
          }
        : null,
    });
  }),

  http.patch(`${API}/partners/accept`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const link = db.partnerLinks.find((l) => l.partnerUserId === user.id && l.status === 'PENDING');
    if (!link) return notFound('No pending invite found.');
    link.status = 'ACTIVE';
    link.acceptedAt = new Date().toISOString();
    return ok(link);
  }),

  // --- CHW ---
  http.get(`${API}/chw/summary`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const mothers = db.motherProfiles.filter((p) => p.assignedCHWId === user.id);
    let onTrack = 0;
    let followUpNeeded = 0;
    let priority = 0;
    for (const mother of mothers) {
      const open = db.followUps.filter(
        (f) => f.motherProfileId === mother.id && (f.status === 'OPEN' || f.status === 'IN_PROGRESS'),
      );
      if (open.length === 0) onTrack += 1;
      else if (open.some((f) => f.priority === 'HIGH' || f.priority === 'URGENT')) priority += 1;
      else followUpNeeded += 1;
    }
    return ok({ totalAssigned: mothers.length, onTrack, followUpNeeded, priority });
  }),

  http.get(`${API}/chw/mothers`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const mothers = db.motherProfiles.filter((p) => p.assignedCHWId === user.id);
    return ok(
      mothers.map((mother) => {
        const motherUser = findUserById(mother.userId);
        return {
          id: mother.id,
          userId: mother.userId,
          user: { firstName: motherUser?.firstName ?? '', lastName: motherUser?.lastName ?? '', phone: motherUser?.phone ?? null },
          pregnancies: db.pregnancies.filter((p) => p.motherProfileId === mother.id && p.status === 'ACTIVE').map(withCurrentWeek),
          followUps: db.followUps.filter(
            (f) => f.motherProfileId === mother.id && (f.status === 'OPEN' || f.status === 'IN_PROGRESS'),
          ),
        };
      }),
    );
  }),

  // --- Follow-ups ---
  http.post(`${API}/follow-ups`, async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const body = (await request.json()) as {
      motherProfileId: string;
      reason: string;
      priority: string;
      dueDate?: string;
      notes?: string;
    };
    const mother = findMotherProfileById(body.motherProfileId);
    if (!mother || mother.assignedCHWId !== user.id) return forbidden('This mother is not assigned to you.');
    const followUp = {
      id: nextId('followup'),
      motherProfileId: body.motherProfileId,
      assignedCHWId: user.id,
      priority: body.priority as never,
      reason: body.reason,
      status: 'OPEN' as const,
      dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
      notes: body.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    db.followUps.push(followUp);
    return ok(followUp);
  }),

  http.get(`${API}/follow-ups/mine`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const status = new URL(request.url).searchParams.get('status');
    let list = db.followUps.filter((f) => f.assignedCHWId === user.id);
    if (status) list = list.filter((f) => f.status === status);
    return ok(
      [...list]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((f) => {
          const mother = findMotherProfileById(f.motherProfileId);
          const motherUser = mother ? findUserById(mother.userId) : undefined;
          return {
            ...f,
            motherProfile: motherUser ? { user: { firstName: motherUser.firstName, lastName: motherUser.lastName } } : undefined,
          };
        }),
    );
  }),

  http.patch(`${API}/follow-ups/:id/complete`, ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const followUp = db.followUps.find((f) => f.id === params.id);
    if (!followUp) return notFound('Follow-up not found.');
    if (followUp.assignedCHWId !== user.id) return forbidden();
    followUp.status = 'RESOLVED';
    return ok(followUp);
  }),

  http.patch(`${API}/follow-ups/:id`, async ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const followUp = db.followUps.find((f) => f.id === params.id);
    if (!followUp) return notFound('Follow-up not found.');
    if (followUp.assignedCHWId !== user.id) return forbidden();
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(followUp, body);
    return ok(followUp);
  }),

  http.get(`${API}/follow-ups/my`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return ok([]);
    return ok(
      db.followUps
        .filter((f) => f.motherProfileId === profile.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    );
  }),

  // --- Notifications ---
  http.get(`${API}/notifications`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const type = url.searchParams.get('type');
    let list = db.notifications.filter((n) => n.userId === user.id);
    if (unreadOnly) list = list.filter((n) => !n.read);
    if (type) list = list.filter((n) => n.type === type);
    return ok([...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }),

  http.get(`${API}/notifications/unread-count`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const count = db.notifications.filter((n) => n.userId === user.id && !n.read).length;
    return ok({ count });
  }),

  http.patch(`${API}/notifications/:id/read`, ({ request, params }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const notification = db.notifications.find((n) => n.id === params.id);
    if (!notification) return notFound('Notification not found.');
    if (notification.userId !== user.id) return forbidden();
    notification.read = true;
    return ok(notification);
  }),

  // --- AI Assistant (demo mode: deterministic keyword-matched replies, no real LLM) ---
  http.get(`${API}/ai/messages`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return ok([]);
    return ok(
      db.aiMessages
        .filter((m) => m.motherProfileId === profile.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    );
  }),

  http.post(`${API}/ai/messages`, async ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    const profile = findMotherProfileByUserId(user.id);
    if (!profile) return forbidden('Complete onboarding first.');
    const body = (await request.json()) as { content: string };

    const conversationId = `conv-${profile.id}`;

    db.aiMessages.push({
      id: nextId('ai-msg'),
      conversationId,
      motherProfileId: profile.id,
      role: 'USER',
      content: body.content,
      createdAt: new Date().toISOString(),
    });

    const assistantMessage = {
      id: nextId('ai-msg'),
      conversationId,
      motherProfileId: profile.id,
      role: 'ASSISTANT' as const,
      content: generateDemoReply(body.content),
      createdAt: new Date().toISOString(),
    };
    db.aiMessages.push(assistantMessage);
    return ok(assistantMessage);
  }),

  http.patch(`${API}/notifications/read-all`, ({ request }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    let count = 0;
    for (const n of db.notifications) {
      if (n.userId === user.id && !n.read) {
        n.read = true;
        count += 1;
      }
    }
    return ok({ count });
  }),
];

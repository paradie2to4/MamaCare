import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000/api/v1';

export const mockUser = {
  id: 'user-1',
  firstName: 'Grace',
  lastName: 'Uwase',
  email: 'grace@example.com',
  phone: null,
  role: 'MOTHER' as const,
  preferredLanguage: 'en',
  createdAt: new Date().toISOString(),
};

export const handlers = [
  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({ data: { user: mockUser, accessToken: 'fake-access-token' } });
  }),

  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({ statusCode: 401, message: 'No session' }, { status: 401 });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_URL}/mothers/me/profile`, () => {
    return HttpResponse.json({
      data: {
        id: 'profile-1',
        userId: 'user-1',
        dateOfBirth: null,
        district: 'Gasabo',
        sector: 'Kacyiru',
        cell: null,
        village: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
      },
    });
  }),

  http.get(`${API_URL}/partners/my-link`, () => {
    return HttpResponse.json({ data: null });
  }),

  http.get(`${API_URL}/partners/dashboard`, () => {
    return HttpResponse.json({ data: { status: 'NONE', mother: null, nextAppointment: null } });
  }),

  http.get(`${API_URL}/chw/summary`, () => {
    return HttpResponse.json({
      data: { totalAssigned: 3, onTrack: 1, followUpNeeded: 1, priority: 1 },
    });
  }),

  http.get(`${API_URL}/chw/mothers`, () => {
    return HttpResponse.json({ data: [] });
  }),

  http.get(`${API_URL}/notifications`, () => {
    return HttpResponse.json({ data: [] });
  }),

  http.get(`${API_URL}/notifications/unread-count`, () => {
    return HttpResponse.json({ data: { count: 0 } });
  }),

  http.get(`${API_URL}/appointments`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'appt-1',
          motherProfileId: 'profile-1',
          pregnancyId: null,
          type: 'ANC_VISIT',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          facilityName: 'Kacyiru Health Center',
          location: null,
          notes: null,
        },
        {
          id: 'appt-2',
          motherProfileId: 'profile-1',
          pregnancyId: null,
          type: 'ULTRASOUND',
          status: 'COMPLETED',
          scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          facilityName: 'King Faisal Hospital',
          location: null,
          notes: null,
        },
        {
          id: 'appt-3',
          motherProfileId: 'profile-1',
          pregnancyId: null,
          type: 'LAB_TEST',
          status: 'MISSED',
          scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          facilityName: 'Kacyiru Health Center',
          location: null,
          notes: null,
        },
      ],
    });
  }),
];

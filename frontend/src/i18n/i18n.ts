import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import onboardingEn from './locales/en/onboarding.json';
import dashboardEn from './locales/en/dashboard.json';
import journeyEn from './locales/en/journey.json';
import educationEn from './locales/en/education.json';
import appointmentsEn from './locales/en/appointments.json';
import profileEn from './locales/en/profile.json';
import landingEn from './locales/en/landing.json';
import partnerEn from './locales/en/partner.json';
import chwEn from './locales/en/chw.json';
import followupsEn from './locales/en/followups.json';
import notificationsEn from './locales/en/notifications.json';
import assistantEn from './locales/en/assistant.json';

import commonRw from './locales/rw/common.json';
import authRw from './locales/rw/auth.json';
import onboardingRw from './locales/rw/onboarding.json';
import dashboardRw from './locales/rw/dashboard.json';
import journeyRw from './locales/rw/journey.json';
import educationRw from './locales/rw/education.json';
import appointmentsRw from './locales/rw/appointments.json';
import profileRw from './locales/rw/profile.json';
import landingRw from './locales/rw/landing.json';
import partnerRw from './locales/rw/partner.json';
import chwRw from './locales/rw/chw.json';
import followupsRw from './locales/rw/followups.json';
import notificationsRw from './locales/rw/notifications.json';
import assistantRw from './locales/rw/assistant.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    onboarding: onboardingEn,
    dashboard: dashboardEn,
    journey: journeyEn,
    education: educationEn,
    appointments: appointmentsEn,
    profile: profileEn,
    landing: landingEn,
    partner: partnerEn,
    chw: chwEn,
    followups: followupsEn,
    notifications: notificationsEn,
    assistant: assistantEn,
  },
  rw: {
    common: commonRw,
    auth: authRw,
    onboarding: onboardingRw,
    dashboard: dashboardRw,
    journey: journeyRw,
    education: educationRw,
    appointments: appointmentsRw,
    profile: profileRw,
    landing: landingRw,
    partner: partnerRw,
    chw: chwRw,
    followups: followupsRw,
    notifications: notificationsRw,
    assistant: assistantRw,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS,
    ns: Object.keys(resources.en),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'mamacare_language',
    },
  });

export default i18n;

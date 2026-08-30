/**
 * Static fixture data for demo/mock mode — mirrors backend/prisma/seed.ts so the
 * documented demo accounts and content behave the same whether the app is
 * talking to a live backend or running fully mocked (e.g. on Vercel without a
 * deployed API yet).
 */

export const DEMO_PASSWORD = 'Password123!';

const DAY_MS = 24 * 60 * 60 * 1000;
export const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString();
export const daysFromNow = (n: number) => new Date(Date.now() + n * DAY_MS).toISOString();

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: 'MOTHER' | 'PARTNER' | 'CHW' | 'HEALTH_OFFICER' | 'ADMIN';
  preferredLanguage: string;
  createdAt: string;
}

export const initialUsers: MockUser[] = [
  {
    id: 'user-mother1',
    firstName: 'Grace',
    lastName: 'Uwase',
    email: 'mother@example.com',
    phone: '+250780000001',
    role: 'MOTHER',
    preferredLanguage: 'en',
    createdAt: daysAgo(120),
  },
  {
    id: 'user-mother2',
    firstName: 'Claudine',
    lastName: 'Mukamana',
    email: 'mother2@example.com',
    phone: '+250780000002',
    role: 'MOTHER',
    preferredLanguage: 'en',
    createdAt: daysAgo(60),
  },
  {
    id: 'user-mother3',
    firstName: 'Immaculee',
    lastName: 'Nyirahabimana',
    email: 'mother3@example.com',
    phone: '+250780000003',
    role: 'MOTHER',
    preferredLanguage: 'en',
    createdAt: daysAgo(300),
  },
  {
    id: 'user-partner',
    firstName: 'Eric',
    lastName: 'Habimana',
    email: 'partner@example.com',
    phone: '+250780000004',
    role: 'PARTNER',
    preferredLanguage: 'en',
    createdAt: daysAgo(120),
  },
  {
    id: 'user-chw',
    firstName: 'Beatrice',
    lastName: 'Ingabire',
    email: 'chw@example.com',
    phone: '+250780000005',
    role: 'CHW',
    preferredLanguage: 'en',
    createdAt: daysAgo(400),
  },
  {
    id: 'user-officer',
    firstName: 'Jean Paul',
    lastName: 'Nkurunziza',
    email: 'officer@example.com',
    phone: '+250780000006',
    role: 'HEALTH_OFFICER',
    preferredLanguage: 'en',
    createdAt: daysAgo(400),
  },
];

export interface MockMotherProfile {
  id: string;
  userId: string;
  assignedCHWId: string | null;
  dateOfBirth: string | null;
  district: string | null;
  sector: string | null;
  cell: string | null;
  village: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export const initialMotherProfiles: MockMotherProfile[] = [
  {
    id: 'profile-1',
    userId: 'user-mother1',
    assignedCHWId: 'user-chw',
    dateOfBirth: null,
    district: 'Gasabo',
    sector: 'Kacyiru',
    cell: 'Kamatamu',
    village: 'Ubumwe',
    emergencyContactName: 'Eric Habimana',
    emergencyContactPhone: '+250780000004',
  },
  {
    id: 'profile-2',
    userId: 'user-mother2',
    assignedCHWId: 'user-chw',
    dateOfBirth: null,
    district: 'Kicukiro',
    sector: 'Niboye',
    cell: 'Nyanza',
    village: 'Amahoro',
    emergencyContactName: null,
    emergencyContactPhone: null,
  },
  {
    id: 'profile-3',
    userId: 'user-mother3',
    assignedCHWId: null,
    dateOfBirth: null,
    district: 'Nyarugenge',
    sector: 'Nyamirambo',
    cell: 'Rugarama',
    village: 'Terimbere',
    emergencyContactName: null,
    emergencyContactPhone: null,
  },
];

export interface MockPregnancy {
  id: string;
  motherProfileId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'MISCARRIED' | 'TERMINATED';
  lmpDate: string;
  eddDate: string;
  notes: string | null;
}

const lmp1 = daysAgo(24 * 7);
const lmp2 = daysAgo(8 * 7);
const lmp3 = daysAgo(42 * 7 + 14);
const GESTATION_MS = 280 * DAY_MS;

export const initialPregnancies: MockPregnancy[] = [
  {
    id: 'pregnancy-1',
    motherProfileId: 'profile-1',
    status: 'ACTIVE',
    lmpDate: lmp1,
    eddDate: new Date(new Date(lmp1).getTime() + GESTATION_MS).toISOString(),
    notes: null,
  },
  {
    id: 'pregnancy-2',
    motherProfileId: 'profile-2',
    status: 'ACTIVE',
    lmpDate: lmp2,
    eddDate: new Date(new Date(lmp2).getTime() + GESTATION_MS).toISOString(),
    notes: null,
  },
  {
    id: 'pregnancy-3',
    motherProfileId: 'profile-3',
    status: 'COMPLETED',
    lmpDate: lmp3,
    eddDate: new Date(new Date(lmp3).getTime() + GESTATION_MS).toISOString(),
    notes: null,
  },
];

export interface MockAppointment {
  id: string;
  motherProfileId: string;
  pregnancyId: string | null;
  createdByUserId: string;
  type: 'ANC_VISIT' | 'ULTRASOUND' | 'LAB_TEST' | 'VACCINATION' | 'POSTNATAL' | 'OTHER';
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED' | 'RESCHEDULED';
  scheduledAt: string;
  facilityName: string;
  location: string | null;
  notes: string | null;
}

export const initialAppointments: MockAppointment[] = [
  {
    id: 'appt-1',
    motherProfileId: 'profile-1',
    pregnancyId: 'pregnancy-1',
    createdByUserId: 'user-mother1',
    type: 'ANC_VISIT',
    status: 'SCHEDULED',
    scheduledAt: daysFromNow(14),
    facilityName: 'Kacyiru Health Center',
    location: 'Gasabo, Kacyiru',
    notes: 'Routine antenatal check-up.',
  },
  {
    id: 'appt-2',
    motherProfileId: 'profile-1',
    pregnancyId: 'pregnancy-1',
    createdByUserId: 'user-mother1',
    type: 'ULTRASOUND',
    status: 'COMPLETED',
    scheduledAt: daysAgo(30),
    facilityName: 'King Faisal Hospital',
    location: 'Kigali',
    notes: 'Anatomy scan completed, all normal.',
  },
  {
    id: 'appt-3',
    motherProfileId: 'profile-1',
    pregnancyId: 'pregnancy-1',
    createdByUserId: 'user-mother1',
    type: 'LAB_TEST',
    status: 'MISSED',
    scheduledAt: daysAgo(10),
    facilityName: 'Kacyiru Health Center',
    location: null,
    notes: null,
  },
  {
    id: 'appt-4',
    motherProfileId: 'profile-1',
    pregnancyId: 'pregnancy-1',
    createdByUserId: 'user-mother1',
    type: 'ANC_VISIT',
    status: 'CANCELLED',
    scheduledAt: daysAgo(45),
    facilityName: 'Kacyiru Health Center',
    location: null,
    notes: "Rescheduled at the clinic's request.",
  },
];

export interface MockReminder {
  id: string;
  userId: string;
  appointmentId: string | null;
  type: 'APPOINTMENT' | 'MEDICATION' | 'DAILY_TIP' | 'CUSTOM';
  title: string;
  message: string;
  scheduledFor: string;
  status: 'PENDING' | 'SENT' | 'DISMISSED' | 'FAILED';
  channel: 'IN_APP' | 'EMAIL' | 'SMS';
}

export const initialReminders: MockReminder[] = [
  {
    id: 'reminder-1',
    userId: 'user-mother1',
    appointmentId: 'appt-1',
    type: 'APPOINTMENT',
    title: 'ANC appointment in 2 weeks',
    message:
      "Your appointment is scheduled for two weeks from now. Don't forget your health card and any questions for your healthcare provider.",
    scheduledFor: daysFromNow(13),
    status: 'PENDING',
    channel: 'IN_APP',
  },
  {
    id: 'reminder-2',
    userId: 'user-mother1',
    appointmentId: null,
    type: 'DAILY_TIP',
    title: 'Stay hydrated',
    message: 'Drinking enough water supports you and your baby, especially in the second trimester.',
    scheduledFor: daysAgo(1),
    status: 'SENT',
    channel: 'IN_APP',
  },
  {
    id: 'reminder-3',
    userId: 'user-mother1',
    appointmentId: null,
    type: 'CUSTOM',
    title: 'Prepare questions for your next visit',
    message: 'Write down anything you want to ask your healthcare provider at your next appointment.',
    scheduledFor: daysAgo(5),
    status: 'DISMISSED',
    channel: 'IN_APP',
  },
];

export interface MockEducationArticle {
  id: string;
  slug: string;
  category: string;
  titleEnglish: string;
  titleKinyarwanda: string;
  summaryEnglish: string;
  summaryKinyarwanda: string;
  contentEnglish: string;
  contentKinyarwanda: string;
  pregnancyStage: string | null;
  readTimeMinutes: number;
  reviewedBy: string | null;
  updatedAt: string;
}

export const educationArticles: MockEducationArticle[] = [
  {
    id: 'article-1',
    slug: 'eating-well-during-pregnancy',
    category: 'NUTRITION',
    titleEnglish: 'Eating well during pregnancy',
    titleKinyarwanda: 'Kurya neza mu gihe utwite',
    summaryEnglish: 'Simple, affordable food choices that support a healthy pregnancy.',
    summaryKinyarwanda: "Uburyo bworoshye kandi buhendutse bwo guhitamo ibiryo bifasha kubana neza n'inda.",
    contentEnglish:
      "Why nutrition matters\n\nEating a variety of foods each day helps you and your baby stay healthy.\n\n• Eat vegetables and fruits daily\n• Include beans, groundnuts, or fish for protein\n• Drink clean water throughout the day\n• Ask your health worker about iron and folic acid supplements\n\nIf you experience severe nausea that prevents you from eating, contact your healthcare provider.",
    contentKinyarwanda:
      "Impamvu imirire ari ingenzi\n\nKurya ibiryo binyuranye buri munsi bifasha wowe n'umwana wawe kubana neza.\n\n• Fata imboga n'imbuto buri munsi\n• Ongeramo ibishyimbo, ubunyobwa cyangwa amafi kugira ngo ubone poroteyine\n• Nywa amazi asukuye mu buryo bwiza\n• Baza umujyanama w'ubuzima ku byerekeye imiti y'ibyuma na folic acid\n\nUramutse wumva isesemi ikabije ikakubuza kurya, hamagara umujyanama w'ubuzima.",
    pregnancyStage: '1',
    readTimeMinutes: 4,
    reviewedBy: 'MamaCare Clinical Review Panel',
    updatedAt: daysAgo(20),
  },
  {
    id: 'article-2',
    slug: 'why-antenatal-visits-matter',
    category: 'ANTENATAL_CARE',
    titleEnglish: 'Why antenatal visits matter',
    titleKinyarwanda: "Impamvu kwitabira gahunda z'ubuzima bw'inda ari ingenzi",
    summaryEnglish: 'Regular check-ups help catch problems early and keep you and your baby safe.',
    summaryKinyarwanda: "Kwipimisha kenshi bifasha kumenya vuba ibibazo bishoboka kandi bikarinda wowe n'umwana.",
    contentEnglish:
      "What happens at an ANC visit\n\nDuring each visit, a health worker will:\n\n• Check your blood pressure and weight\n• Monitor your baby's growth\n• Answer your questions\n• Update your health card\n\nAttending every scheduled visit — even when you feel well — helps your care team notice changes early.",
    contentKinyarwanda:
      "Ibibera muri gahunda yo kwipimisha\n\nMu gihe cy'isuzuma, umujyanama w'ubuzima azakora ibi bikurikira:\n\n• Gupima umuvuduko w'amaraso n'ibiro byawe\n• Gukurikirana iterambere ry'umwana wawe\n• Gusubiza ibibazo byawe\n• Kuvugurura ikarita yawe y'ubuzima\n\nKwitabira buri gahunda yateganyijwe, na none n'iyo wumva umeze neza, bifasha itsinda ryawe ry'ubuzima kumenya impinduka hakiri kare.",
    pregnancyStage: '2',
    readTimeMinutes: 3,
    reviewedBy: 'MamaCare Clinical Review Panel',
    updatedAt: daysAgo(45),
  },
  {
    id: 'article-3',
    slug: 'recognizing-danger-signs',
    category: 'DANGER_SIGNS',
    titleEnglish: 'Recognizing warning signs during pregnancy',
    titleKinyarwanda: "Kumenya ibimenyetso by'akaga mu gihe utwite",
    summaryEnglish: 'Know which symptoms mean you should seek care immediately.',
    summaryKinyarwanda: "Menya ibimenyetso bigomba gutuma ubona ubufasha bw'ubuvuzi ako kanya.",
    contentEnglish:
      'Seek care immediately if you notice:\n\n• Heavy vaginal bleeding\n• Severe headache or blurred vision\n• Severe abdominal pain\n• High fever\n• Reduced or no baby movement\n• Swelling of the face or hands\n\nThis information does not replace medical care. If you notice any of these signs, contact your health facility or CHW right away.',
    contentKinyarwanda:
      "Saba ubufasha ako kanya niba wabonye ibi bikurikira:\n\n• Kuva cyane mu gitsina\n• Umutwe ukaze cyane cyangwa kutabona neza\n• Kubabara cyane mu nda\n• Umuriro mwinshi\n• Umwana kutagenda cyangwa kugenda gato\n• Kubyimba mu maso cyangwa mu ntoki\n\nAya makuru ntasimbura ubuvuzi. Niba wabonye kimwe muri ibi bimenyetso, hamagara ivuriro cyangwa umujyanama w'ubuzima ako kanya.",
    pregnancyStage: 'all',
    readTimeMinutes: 3,
    reviewedBy: 'MamaCare Clinical Review Panel',
    updatedAt: daysAgo(10),
  },
  {
    id: 'article-4',
    slug: 'starting-breastfeeding',
    category: 'BREASTFEEDING',
    titleEnglish: 'Starting breastfeeding in the first hour',
    titleKinyarwanda: 'Gutangira konsa mu isaha ya mbere',
    summaryEnglish: "Early, frequent breastfeeding supports your baby's health and your recovery.",
    summaryKinyarwanda: "Konsa hakiri kare kandi kenshi bifasha ubuzima bw'umwana wawe n'ugukira kwawe.",
    contentEnglish:
      "Getting started\n\n• Skin-to-skin contact right after birth helps your baby latch\n• Feed on demand — as often as your baby wants\n• Ask a health worker or CHW for help with positioning\n\nBreastfeeding can be challenging at first. Support is available — you do not have to figure it out alone.",
    contentKinyarwanda:
      "Gutangira\n\n• Gukoranya uruhu n'uruhu nyuma yo kubyara bifasha umwana kunywa neza\n• Konsa igihe cyose umwana ashaka\n• Saba ubufasha bw'umujyanama w'ubuzima ku byerekeye uko wicara umukonsa\n\nGukonsa birashobora kugorana mu ntangiriro. Ubufasha burahari - ntugomba kubimenya wenyine.",
    pregnancyStage: 'postpartum',
    readTimeMinutes: 3,
    reviewedBy: 'MamaCare Clinical Review Panel',
    updatedAt: daysAgo(60),
  },
  {
    id: 'article-5',
    slug: 'caring-for-your-mental-wellbeing',
    category: 'MENTAL_WELLBEING',
    titleEnglish: 'Caring for your mental wellbeing',
    titleKinyarwanda: 'Kwita ku buzima bwo mu mutwe',
    summaryEnglish: "It's normal to have mixed emotions during and after pregnancy — support is available.",
    summaryKinyarwanda:
      "Ni ibisanzwe kugira amarangamutima atandukanye mu gihe utwite no nyuma yo kubyara — ubufasha burahari.",
    contentEnglish:
      'You are not alone\n\nMany mothers feel worried, tired, or overwhelmed at times. This is common.\n\n• Talk to someone you trust about how you feel\n• Rest when you can\n• Reach out to your CHW if feelings of sadness or anxiety persist for more than two weeks\n\nIf you ever feel like harming yourself, seek help immediately from a healthcare professional.',
    contentKinyarwanda:
      "Ntabwo uri wenyine\n\nAbandi bagore benshi bumva impungenge, umunaniro, cyangwa kunanirwa rimwe na rimwe. Ibi ni ibisanzwe.\n\n• Ganira n'umuntu wizera ku byerekeye uko wiyumva\n• Ruhuka igihe ubishoboye\n• Vugana n'umujyanama w'ubuzima niba wumva ubabaye cyangwa impungenge zikomeje kurenza ibyumweru bibiri\n\nNiba wowe wumva ushaka kwikoreza ibintu bibi, saba ubufasha ako kanya ku muganga.",
    pregnancyStage: 'all',
    readTimeMinutes: 3,
    reviewedBy: 'MamaCare Clinical Review Panel',
    updatedAt: daysAgo(15),
  },
  {
    id: 'article-6',
    slug: 'keeping-your-newborn-healthy',
    category: 'NEWBORN_CARE',
    titleEnglish: 'Keeping your newborn healthy in the first weeks',
    titleKinyarwanda: "Kubungabunga ubuzima bw'umwana mu byumweru bya mbere",
    summaryEnglish: "Simple daily care practices for your newborn's first weeks of life.",
    summaryKinyarwanda: "Uburyo bworoshye bwo kwita ku mwana wawe mu byumweru bya mbere by'ubuzima bwe.",
    contentEnglish:
      "Daily care basics\n\n• Keep the umbilical cord area clean and dry\n• Keep your baby warm, especially at night\n• Watch for feeding well and normal wet diapers\n• Attend scheduled check-ups and vaccination visits\n\nContact a health worker if your baby has difficulty feeding, a fever, or seems unusually weak.",
    contentKinyarwanda:
      "Ibanze byo kwita ku mwana buri munsi\n\n• Bungabunga aho umukondo uri hasukuye kandi hakumye\n• Shyushya umwana, cyane cyane nijoro\n• Reba niba umwana ye kunywa neza kandi agafuka impuha mu buryo busanzwe\n• Itabira gahunda zo gusuzumwa no gukingirwa\n\nHamagara umujyanama w'ubuzima niba umwana afite ikibazo cyo konka, umuriro, cyangwa asa n'udafite imbaraga.",
    pregnancyStage: 'postpartum',
    readTimeMinutes: 4,
    reviewedBy: 'MamaCare Clinical Review Panel',
    updatedAt: daysAgo(5),
  },
  {
    id: 'article-7',
    slug: 'preparing-for-birth',
    category: 'BIRTH_PREPARATION',
    titleEnglish: 'Preparing for a safe birth',
    titleKinyarwanda: 'Kwitegura kubyara neza',
    summaryEnglish: 'A simple checklist to help you plan for delivery at a health facility.',
    summaryKinyarwanda: 'Urutonde rworoshye rugufasha gutegura kubyarira ku ivuriro.',
    contentEnglish:
      "Birth preparedness checklist\n\n• Know which health facility you plan to deliver at\n• Arrange transport in advance\n• Pack your health card, clothes for you and the baby, and any documents\n• Identify someone who can accompany you\n\nDiscuss your birth plan with your CHW or healthcare provider well before your due date.",
    contentKinyarwanda:
      "Urutonde rwo kwitegura kubyara\n\n• Menya ivuriro ushaka kubyarira\n• Tegura uburyo bwo kugendera hakiri kare\n• Tegura ikarita y'ubuzima, imyenda yawe n'iy'umwana, n'inyandiko zose zikenewe\n• Menya umuntu wagutwara agukurikirane\n\nGanira ku gahunda yawe yo kubyara n'umujyanama w'ubuzima cyangwa umuganga hakiri kare mbere y'itariki uteganyijwe yo kubyara.",
    pregnancyStage: '3',
    readTimeMinutes: 3,
    reviewedBy: 'MamaCare Clinical Review Panel',
    updatedAt: daysAgo(90),
  },
];

export interface MockPartnerLink {
  id: string;
  partnerUserId: string;
  motherProfileId: string;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED';
  invitedAt: string;
  acceptedAt: string | null;
}

export const initialPartnerLinks: MockPartnerLink[] = [
  {
    id: 'link-1',
    partnerUserId: 'user-partner',
    motherProfileId: 'profile-1',
    status: 'ACTIVE',
    invitedAt: daysAgo(90),
    acceptedAt: daysAgo(89),
  },
];

export interface MockFollowUp {
  id: string;
  motherProfileId: string;
  assignedCHWId: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reason: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
}

export const initialFollowUps: MockFollowUp[] = [
  {
    id: 'followup-1',
    motherProfileId: 'profile-1',
    assignedCHWId: 'user-chw',
    priority: 'MEDIUM',
    reason: 'Missed a scheduled lab test appointment',
    status: 'OPEN',
    dueDate: daysFromNow(7),
    notes: null,
    createdAt: daysAgo(9),
  },
];

export interface MockNotification {
  id: string;
  userId: string;
  type: 'APPOINTMENT' | 'REMINDER' | 'FOLLOW_UP' | 'EDUCATION' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const initialNotifications: MockNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-mother1',
    type: 'SYSTEM',
    title: 'Welcome to MamaCare Rwanda',
    message: "Your account is ready. Explore your pregnancy journey and today's health tips.",
    read: false,
    createdAt: daysAgo(90),
  },
  {
    id: 'notif-2',
    userId: 'user-mother1',
    type: 'SYSTEM',
    title: 'Partner connected',
    message: 'Eric Habimana has connected as your partner.',
    read: false,
    createdAt: daysAgo(89),
  },
  {
    id: 'notif-3',
    userId: 'user-chw',
    type: 'FOLLOW_UP',
    title: 'Follow-up needed',
    message: 'Grace Uwase missed a scheduled appointment and needs follow-up.',
    read: false,
    createdAt: daysAgo(9),
  },
];

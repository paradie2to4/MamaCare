import { PrismaClient, Role, AppointmentType, AppointmentStatus, ReminderType, ReminderStatus, ReminderChannel, EducationCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEV_PASSWORD = 'Password123!';

async function upsertUser(params: {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
}) {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: params.email },
    update: {},
    create: {
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      role: params.role,
      phone: params.phone,
      passwordHash,
    },
  });
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function main() {
  // --- Users across roles (only MOTHER has working UI this phase; others exercise the schema) ---
  const mother1 = await upsertUser({
    email: 'mother@example.com',
    firstName: 'Grace',
    lastName: 'Uwase',
    role: Role.MOTHER,
    phone: '+250780000001',
  });
  const mother2 = await upsertUser({
    email: 'mother2@example.com',
    firstName: 'Claudine',
    lastName: 'Mukamana',
    role: Role.MOTHER,
    phone: '+250780000002',
  });
  const mother3 = await upsertUser({
    email: 'mother3@example.com',
    firstName: 'Immaculee',
    lastName: 'Nyirahabimana',
    role: Role.MOTHER,
    phone: '+250780000003',
  });
  const partner = await upsertUser({
    email: 'partner@example.com',
    firstName: 'Eric',
    lastName: 'Habimana',
    role: Role.PARTNER,
    phone: '+250780000004',
  });
  const chw = await upsertUser({
    email: 'chw@example.com',
    firstName: 'Beatrice',
    lastName: 'Ingabire',
    role: Role.CHW,
    phone: '+250780000005',
  });
  await upsertUser({
    email: 'officer@example.com',
    firstName: 'Jean Paul',
    lastName: 'Nkurunziza',
    role: Role.HEALTH_OFFICER,
    phone: '+250780000006',
  });
  await upsertUser({
    email: 'admin@example.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: Role.ADMIN,
  });

  // --- Mother profiles ---
  const profile1 = await prisma.motherProfile.upsert({
    where: { userId: mother1.id },
    update: { assignedCHWId: chw.id },
    create: {
      userId: mother1.id,
      assignedCHWId: chw.id,
      district: 'Gasabo',
      sector: 'Kacyiru',
      cell: 'Kamatamu',
      village: 'Ubumwe',
      emergencyContactName: 'Eric Habimana',
      emergencyContactPhone: '+250780000004',
    },
  });
  const profile2 = await prisma.motherProfile.upsert({
    where: { userId: mother2.id },
    update: { assignedCHWId: chw.id },
    create: {
      userId: mother2.id,
      assignedCHWId: chw.id,
      district: 'Kicukiro',
      sector: 'Niboye',
      cell: 'Nyanza',
      village: 'Amahoro',
    },
  });
  const profile3 = await prisma.motherProfile.upsert({
    where: { userId: mother3.id },
    update: {},
    create: {
      userId: mother3.id,
      district: 'Nyarugenge',
      sector: 'Nyamirambo',
      cell: 'Rugarama',
      village: 'Terimbere',
    },
  });

  // --- Pregnancies: mid-journey, early, and completed/postpartum ---
  const lmp1 = daysAgo(24 * 7);
  const pregnancy1 = await prisma.pregnancy.create({
    data: {
      motherProfileId: profile1.id,
      lmpDate: lmp1,
      eddDate: new Date(lmp1.getTime() + 280 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
  });

  const lmp2 = daysAgo(8 * 7);
  await prisma.pregnancy.create({
    data: {
      motherProfileId: profile2.id,
      lmpDate: lmp2,
      eddDate: new Date(lmp2.getTime() + 280 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
  });

  const lmp3 = daysAgo(42 * 7 + 14);
  await prisma.pregnancy.create({
    data: {
      motherProfileId: profile3.id,
      lmpDate: lmp3,
      eddDate: new Date(lmp3.getTime() + 280 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
    },
  });

  // --- Appointments for the primary demo mother covering every status ---
  await prisma.appointment.create({
    data: {
      motherProfileId: profile1.id,
      pregnancyId: pregnancy1.id,
      createdByUserId: mother1.id,
      type: AppointmentType.ANC_VISIT,
      status: AppointmentStatus.SCHEDULED,
      scheduledAt: daysFromNow(14),
      facilityName: 'Kacyiru Health Center',
      location: 'Gasabo, Kacyiru',
      notes: 'Routine antenatal check-up.',
    },
  });
  await prisma.appointment.create({
    data: {
      motherProfileId: profile1.id,
      pregnancyId: pregnancy1.id,
      createdByUserId: mother1.id,
      type: AppointmentType.ULTRASOUND,
      status: AppointmentStatus.COMPLETED,
      scheduledAt: daysAgo(30),
      facilityName: 'King Faisal Hospital',
      location: 'Kigali',
      notes: 'Anatomy scan completed, all normal.',
    },
  });
  await prisma.appointment.create({
    data: {
      motherProfileId: profile1.id,
      pregnancyId: pregnancy1.id,
      createdByUserId: mother1.id,
      type: AppointmentType.LAB_TEST,
      status: AppointmentStatus.MISSED,
      scheduledAt: daysAgo(10),
      facilityName: 'Kacyiru Health Center',
    },
  });
  await prisma.appointment.create({
    data: {
      motherProfileId: profile1.id,
      pregnancyId: pregnancy1.id,
      createdByUserId: mother1.id,
      type: AppointmentType.ANC_VISIT,
      status: AppointmentStatus.CANCELLED,
      scheduledAt: daysAgo(45),
      facilityName: 'Kacyiru Health Center',
      notes: 'Rescheduled at the clinic\'s request.',
    },
  });

  // --- Partner link: demo partner already connected to the primary demo mother ---
  await prisma.partnerLink.upsert({
    where: { id: `${partner.id}:${profile1.id}` },
    update: {},
    create: {
      id: `${partner.id}:${profile1.id}`,
      partnerUserId: partner.id,
      motherProfileId: profile1.id,
      status: 'ACTIVE',
      acceptedAt: new Date(),
    },
  });

  // --- Follow-up: CHW-assigned, referencing the missed lab test appointment above ---
  await prisma.healthFollowUp.create({
    data: {
      motherProfileId: profile1.id,
      assignedCHWId: chw.id,
      priority: 'MEDIUM',
      reason: 'Missed a scheduled lab test appointment',
      status: 'OPEN',
      dueDate: daysFromNow(7),
    },
  });

  // --- Reminders across statuses ---
  await prisma.reminder.create({
    data: {
      userId: mother1.id,
      type: ReminderType.APPOINTMENT,
      title: 'ANC appointment in 2 weeks',
      message:
        "Your appointment is scheduled for two weeks from now. Don't forget your health card and any questions for your healthcare provider.",
      scheduledFor: daysFromNow(13),
      status: ReminderStatus.PENDING,
      channel: ReminderChannel.IN_APP,
    },
  });
  await prisma.reminder.create({
    data: {
      userId: mother1.id,
      type: ReminderType.DAILY_TIP,
      title: 'Stay hydrated',
      message: 'Drinking enough water supports you and your baby, especially in the second trimester.',
      scheduledFor: daysAgo(1),
      status: ReminderStatus.SENT,
      channel: ReminderChannel.IN_APP,
    },
  });
  await prisma.reminder.create({
    data: {
      userId: mother1.id,
      type: ReminderType.CUSTOM,
      title: 'Prepare questions for your next visit',
      message: 'Write down anything you want to ask your healthcare provider at your next appointment.',
      scheduledFor: daysAgo(5),
      status: ReminderStatus.DISMISSED,
      channel: ReminderChannel.IN_APP,
    },
  });

  // --- Bilingual education articles across categories ---
  const articles: Array<Parameters<typeof prisma.educationArticle.upsert>[0]['create']> = [
    {
      slug: 'eating-well-during-pregnancy',
      category: EducationCategory.NUTRITION,
      titleEnglish: 'Eating well during pregnancy',
      titleKinyarwanda: 'Kurya neza mu gihe utwite',
      summaryEnglish: 'Simple, affordable food choices that support a healthy pregnancy.',
      summaryKinyarwanda: 'Uburyo bworoshye kandi buhendutse bwo guhitamo ibiryo bifasha kubana neza n\'inda.',
      contentEnglish:
        'Why nutrition matters\n\nEating a variety of foods each day helps you and your baby stay healthy.\n\n• Eat vegetables and fruits daily\n• Include beans, groundnuts, or fish for protein\n• Drink clean water throughout the day\n• Ask your health worker about iron and folic acid supplements\n\nIf you experience severe nausea that prevents you from eating, contact your healthcare provider.',
      contentKinyarwanda:
        'Impamvu imirire ari ingenzi\n\nKurya ibiryo binyuranye buri munsi bifasha wowe n\'umwana wawe kubana neza.\n\n• Fata imboga n\'imbuto buri munsi\n• Ongeramo ibishyimbo, ubunyobwa cyangwa amafi kugira ngo ubone poroteyine\n• Nywa amazi asukuye mu buryo bwiza\n• Baza umujyanama w\'ubuzima ku byerekeye imiti y\'ibyuma na folic acid\n\nUramutse wumva isesemi ikabije ikakubuza kurya, hamagara umujyanama w\'ubuzima.',
      pregnancyStage: '1',
      readTimeMinutes: 4,
      reviewedBy: 'MamaCare Clinical Review Panel',
    },
    {
      slug: 'why-antenatal-visits-matter',
      category: EducationCategory.ANTENATAL_CARE,
      titleEnglish: 'Why antenatal visits matter',
      titleKinyarwanda: 'Impamvu kwitabira gahunda z\'ubuzima bw\'inda ari ingenzi',
      summaryEnglish: 'Regular check-ups help catch problems early and keep you and your baby safe.',
      summaryKinyarwanda: 'Kwipimisha kenshi bifasha kumenya vuba ibibazo bishoboka kandi bikarinda wowe n\'umwana.',
      contentEnglish:
        'What happens at an ANC visit\n\nDuring each visit, a health worker will:\n\n• Check your blood pressure and weight\n• Monitor your baby\'s growth\n• Answer your questions\n• Update your health card\n\nAttending every scheduled visit — even when you feel well — helps your care team notice changes early.',
      contentKinyarwanda:
        'Ibibera muri gahunda yo kwipimisha\n\nMu gihe cy\'isuzuma, umujyanama w\'ubuzima azakora ibi bikurikira:\n\n• Gupima umuvuduko w\'amaraso n\'ibiro byawe\n• Gukurikirana iterambere ry\'umwana wawe\n• Gusubiza ibibazo byawe\n• Kuvugurura ikarita yawe y\'ubuzima\n\nKwitabira buri gahunda yateganyijwe, na none n\'iyo wumva umeze neza, bifasha itsinda ryawe ry\'ubuzima kumenya impinduka hakiri kare.',
      pregnancyStage: '2',
      readTimeMinutes: 3,
      reviewedBy: 'MamaCare Clinical Review Panel',
    },
    {
      slug: 'recognizing-danger-signs',
      category: EducationCategory.DANGER_SIGNS,
      titleEnglish: 'Recognizing warning signs during pregnancy',
      titleKinyarwanda: 'Kumenya ibimenyetso by\'akaga mu gihe utwite',
      summaryEnglish: 'Know which symptoms mean you should seek care immediately.',
      summaryKinyarwanda: 'Menya ibimenyetso bigomba gutuma ubona ubufasha bw\'ubuvuzi ako kanya.',
      contentEnglish:
        'Seek care immediately if you notice:\n\n• Heavy vaginal bleeding\n• Severe headache or blurred vision\n• Severe abdominal pain\n• High fever\n• Reduced or no baby movement\n• Swelling of the face or hands\n\nThis information does not replace medical care. If you notice any of these signs, contact your health facility or CHW right away.',
      contentKinyarwanda:
        'Saba ubufasha ako kanya niba wabonye ibi bikurikira:\n\n• Kuva cyane mu gitsina\n• Umutwe ukaze cyane cyangwa kutabona neza\n• Kubabara cyane mu nda\n• Umuriro mwinshi\n• Umwana kutagenda cyangwa kugenda gato\n• Kubyimba mu maso cyangwa mu ntoki\n\nAya makuru ntasimbura ubuvuzi. Niba wabonye kimwe muri ibi bimenyetso, hamagara ivuriro cyangwa umujyanama w\'ubuzima ako kanya.',
      pregnancyStage: 'all',
      readTimeMinutes: 3,
      reviewedBy: 'MamaCare Clinical Review Panel',
    },
    {
      slug: 'starting-breastfeeding',
      category: EducationCategory.BREASTFEEDING,
      titleEnglish: 'Starting breastfeeding in the first hour',
      titleKinyarwanda: 'Gutangira konsa mu isaha ya mbere',
      summaryEnglish: 'Early, frequent breastfeeding supports your baby\'s health and your recovery.',
      summaryKinyarwanda: 'Konsa hakiri kare kandi kenshi bifasha ubuzima bw\'umwana wawe n\'ugukira kwawe.',
      contentEnglish:
        'Getting started\n\n• Skin-to-skin contact right after birth helps your baby latch\n• Feed on demand — as often as your baby wants\n• Ask a health worker or CHW for help with positioning\n\nBreastfeeding can be challenging at first. Support is available — you do not have to figure it out alone.',
      contentKinyarwanda:
        'Gutangira\n\n• Gukoranya uruhu n\'uruhu nyuma yo kubyara bifasha umwana kunywa neza\n• Konsa igihe cyose umwana ashaka\n• Saba ubufasha bw\'umujyanama w\'ubuzima ku byerekeye uko wicara umukonsa\n\nGukonsa birashobora kugorana mu ntangiriro. Ubufasha burahari - ntugomba kubimenya wenyine.',
      pregnancyStage: 'postpartum',
      readTimeMinutes: 3,
      reviewedBy: 'MamaCare Clinical Review Panel',
    },
    {
      slug: 'caring-for-your-mental-wellbeing',
      category: EducationCategory.MENTAL_WELLBEING,
      titleEnglish: 'Caring for your mental wellbeing',
      titleKinyarwanda: 'Kwita ku buzima bwo mu mutwe',
      summaryEnglish: 'It\'s normal to have mixed emotions during and after pregnancy — support is available.',
      summaryKinyarwanda: 'Ni ibisanzwe kugira amarangamutima atandukanye mu gihe utwite no nyuma yo kubyara — ubufasha burahari.',
      contentEnglish:
        'You are not alone\n\nMany mothers feel worried, tired, or overwhelmed at times. This is common.\n\n• Talk to someone you trust about how you feel\n• Rest when you can\n• Reach out to your CHW if feelings of sadness or anxiety persist for more than two weeks\n\nIf you ever feel like harming yourself, seek help immediately from a healthcare professional.',
      contentKinyarwanda:
        'Ntabwo uri wenyine\n\nAbandi bagore benshi bumva impungenge, umunaniro, cyangwa kunanirwa rimwe na rimwe. Ibi ni ibisanzwe.\n\n• Ganira n\'umuntu wizera ku byerekeye uko wiyumva\n• Ruhuka igihe ubishoboye\n• Vugana n\'umujyanama w\'ubuzima niba wumva ubabaye cyangwa impungenge zikomeje kurenza ibyumweru bibiri\n\nNiba wowe wumva ushaka kwikoreza ibintu bibi, saba ubufasha ako kanya ku muganga.',
      pregnancyStage: 'all',
      readTimeMinutes: 3,
      reviewedBy: 'MamaCare Clinical Review Panel',
    },
    {
      slug: 'keeping-your-newborn-healthy',
      category: EducationCategory.NEWBORN_CARE,
      titleEnglish: 'Keeping your newborn healthy in the first weeks',
      titleKinyarwanda: 'Kubungabunga ubuzima bw\'umwana mu byumweru bya mbere',
      summaryEnglish: 'Simple daily care practices for your newborn\'s first weeks of life.',
      summaryKinyarwanda: 'Uburyo bworoshye bwo kwita ku mwana wawe mu byumweru bya mbere by\'ubuzima bwe.',
      contentEnglish:
        'Daily care basics\n\n• Keep the umbilical cord area clean and dry\n• Keep your baby warm, especially at night\n• Watch for feeding well and normal wet diapers\n• Attend scheduled check-ups and vaccination visits\n\nContact a health worker if your baby has difficulty feeding, a fever, or seems unusually weak.',
      contentKinyarwanda:
        'Ibanze byo kwita ku mwana buri munsi\n\n• Bungabunga aho umukondo uri hasukuye kandi hakumye\n• Shyushya umwana, cyane cyane nijoro\n• Reba niba umwana ye kunywa neza kandi agafuka impuha mu buryo busanzwe\n• Itabira gahunda zo gusuzumwa no gukingirwa\n\nHamagara umujyanama w\'ubuzima niba umwana afite ikibazo cyo konka, umuriro, cyangwa asa n\'udafite imbaraga.',
      pregnancyStage: 'postpartum',
      readTimeMinutes: 4,
      reviewedBy: 'MamaCare Clinical Review Panel',
    },
    {
      slug: 'preparing-for-birth',
      category: EducationCategory.BIRTH_PREPARATION,
      titleEnglish: 'Preparing for a safe birth',
      titleKinyarwanda: 'Kwitegura kubyara neza',
      summaryEnglish: 'A simple checklist to help you plan for delivery at a health facility.',
      summaryKinyarwanda: 'Urutonde rworoshye rugufasha gutegura kubyarira ku ivuriro.',
      contentEnglish:
        'Birth preparedness checklist\n\n• Know which health facility you plan to deliver at\n• Arrange transport in advance\n• Pack your health card, clothes for you and the baby, and any documents\n• Identify someone who can accompany you\n\nDiscuss your birth plan with your CHW or healthcare provider well before your due date.',
      contentKinyarwanda:
        'Urutonde rwo kwitegura kubyara\n\n• Menya ivuriro ushaka kubyarira\n• Tegura uburyo bwo kugendera hakiri kare\n• Tegura ikarita y\'ubuzima, imyenda yawe n\'iy\'umwana, n\'inyandiko zose zikenewe\n• Menya umuntu wagutwara agukurikirane\n\nGanira ku gahunda yawe yo kubyara n\'umujyanama w\'ubuzima cyangwa umuganga hakiri kare mbere y\'itariki uteganyijwe yo kubyara.',
      pregnancyStage: '3',
      readTimeMinutes: 3,
      reviewedBy: 'MamaCare Clinical Review Panel',
    },
  ];

  for (const article of articles) {
    await prisma.educationArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }

  // --- Notifications ---
  await prisma.notification.create({
    data: {
      userId: mother1.id,
      type: 'SYSTEM',
      title: 'Welcome to MamaCare Rwanda',
      message: 'Your account is ready. Explore your pregnancy journey and today\'s health tips.',
    },
  });
  await prisma.notification.create({
    data: {
      userId: mother1.id,
      type: 'SYSTEM',
      title: 'Partner connected',
      message: 'Eric Habimana has connected as your partner.',
    },
  });
  await prisma.notification.create({
    data: {
      userId: chw.id,
      type: 'FOLLOW_UP',
      title: 'Follow-up needed',
      message: 'Grace Uwase missed a scheduled appointment and needs follow-up.',
    },
  });

  console.log('Seed data created successfully.');
  console.log(`Demo accounts (password: ${DEV_PASSWORD}):`);
  console.log('  mother@example.com, mother2@example.com, mother3@example.com');
  console.log('  partner@example.com, chw@example.com, officer@example.com, admin@example.com');
  console.log('CHW "chw@example.com" is assigned to mother@example.com and mother2@example.com.');
  console.log('Partner "partner@example.com" is ACTIVE-linked to mother@example.com.');
  console.log('A MEDIUM-priority follow-up is open for mother@example.com.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

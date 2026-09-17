import { EducationCategory } from '@prisma/client';

/**
 * Grounding content for the assistant's system prompt. English only for now — each entry
 * is keyed by `id` so a future Kinyarwanda knowledge base can be added and selected by
 * language without reshaping `ai.service.ts` or `ai.fallback.ts`.
 */
export interface KnowledgeTopic {
  id: string;
  category: EducationCategory;
  title: string;
  keywords: string[];
  content: string;
}

export const AI_KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: 'anc-schedule',
    category: EducationCategory.ANTENATAL_CARE,
    title: 'Antenatal care visit schedule',
    keywords: ['appointment', 'anc', 'visit', 'checkup', 'check-up', 'schedule', 'clinic'],
    content:
      "Rwanda's Ministry of Health recommends at least 4 antenatal care (ANC) visits during a pregnancy, " +
      'ideally starting in the first trimester (before week 16). Visits typically check blood pressure, weight, ' +
      "the baby's growth and heartbeat, and screen for danger signs. Missing a scheduled visit should be " +
      'rescheduled as soon as possible, not skipped.',
  },
  {
    id: 'danger-signs',
    category: EducationCategory.DANGER_SIGNS,
    title: 'Warning signs needing urgent care',
    keywords: [
      'bleeding',
      'blood',
      'headache',
      'pain',
      'fever',
      'swelling',
      'swollen',
      'convulsion',
      'seizure',
      'movement',
      'kick',
      'dizzy',
      'vision',
      'blurry',
      'emergency',
      'urgent',
    ],
    content:
      'Seek care immediately (contact your CHW or go to the nearest health facility) for: heavy vaginal bleeding, ' +
      'severe or persistent headache, blurred vision, severe abdominal pain, high fever, sudden swelling of the ' +
      'face/hands/feet, convulsions, reduced or absent baby movement, or fluid leaking before labor. These signs ' +
      'cannot be safely assessed over chat and need an in-person clinical check.',
  },
  {
    id: 'nutrition',
    category: EducationCategory.NUTRITION,
    title: 'Nutrition during pregnancy',
    keywords: ['eat', 'food', 'nutrition', 'diet', 'iron', 'folic', 'vitamin', 'hungry', 'meal'],
    content:
      'A varied diet with vegetables, fruit, protein (beans, fish, eggs, meat), and whole grains supports a ' +
      'healthy pregnancy. Iron and folic acid supplements, as prescribed at ANC visits, help prevent anemia. ' +
      'Drink enough water and limit caffeine. Any specific dietary concern (nausea preventing eating, extreme ' +
      'weight change) should be raised with a CHW or clinician rather than self-managed.',
  },
  {
    id: 'common-discomforts',
    category: EducationCategory.EXERCISE_WELLBEING,
    title: 'Common pregnancy discomforts',
    keywords: [
      'nausea',
      'vomit',
      'tired',
      'fatigue',
      'backache',
      'back',
      'cramp',
      'heartburn',
      'sleep',
    ],
    content:
      'Nausea, fatigue, mild backache, and heartburn are common, especially in the first and third trimesters. ' +
      'Rest when possible, eat smaller frequent meals, and gentle movement can help. These are usually not ' +
      'emergencies, but symptoms that are severe, sudden, or unusual for you are worth mentioning to your CHW.',
  },
  {
    id: 'birth-preparation',
    category: EducationCategory.BIRTH_PREPARATION,
    title: 'Preparing for birth',
    keywords: ['labor', 'labour', 'birth', 'delivery', 'contraction', 'due date', 'edd'],
    content:
      'A birth plan typically includes: knowing your estimated due date, choosing a health facility for delivery, ' +
      'arranging transport in advance, and packing essentials (clean clothes for mother and baby, ID documents, ' +
      'ANC record book). Contractions that are regular, increasingly close together, and increasingly strong are ' +
      'a sign labor may be starting — head to your delivery facility.',
  },
  {
    id: 'postnatal-newborn',
    category: EducationCategory.POSTNATAL_CARE,
    title: 'Postnatal and newborn basics',
    keywords: [
      'newborn',
      'baby',
      'postnatal',
      'postpartum',
      'breastfeed',
      'breastfeeding',
      'cord',
      'jaundice',
    ],
    content:
      'After birth, exclusive breastfeeding is recommended for the first 6 months. Keep the umbilical cord stump ' +
      "clean and dry. Postnatal check-ups monitor both mother and baby's recovery. Warning signs in a newborn " +
      '(difficulty feeding, yellowing skin/eyes, fever, very fast or labored breathing) need prompt clinical care.',
  },
  {
    id: 'mental-wellbeing',
    category: EducationCategory.MENTAL_WELLBEING,
    title: 'Emotional wellbeing',
    keywords: [
      'stress',
      'anxious',
      'anxiety',
      'sad',
      'depressed',
      'depression',
      'overwhelmed',
      'mood',
      'scared',
      'afraid',
    ],
    content:
      'Mood changes, worry, and stress are common during and after pregnancy. Talking with a partner, family, or ' +
      'your CHW can help. Persistent sadness, loss of interest, or thoughts of self-harm are signs to reach out to ' +
      'a health worker promptly — you are not expected to manage these alone.',
  },
  {
    id: 'hygiene',
    category: EducationCategory.HYGIENE,
    title: 'Hygiene during pregnancy',
    keywords: ['hygiene', 'clean', 'wash', 'infection', 'bath'],
    content:
      'Regular handwashing, bathing, and clean drinking water reduce infection risk during pregnancy. Report ' +
      'unusual discharge, itching, or burning during urination to a CHW or clinician rather than self-treating.',
  },
];

const GENERIC_FALLBACK_CONTENT =
  'I can help with general information about pregnancy, appointments, nutrition, common discomforts, birth ' +
  'preparation, postnatal care, and warning signs. For anything urgent or specific to your health, please ' +
  'contact your CHW or the nearest health facility.';

export function findBestMatchingTopic(userMessage: string): KnowledgeTopic | null {
  const normalized = userMessage.toLowerCase();
  let best: { topic: KnowledgeTopic; score: number } | null = null;

  for (const topic of AI_KNOWLEDGE_BASE) {
    const score = topic.keywords.reduce(
      (count, keyword) => (normalized.includes(keyword) ? count + 1 : count),
      0,
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { topic, score };
    }
  }

  return best?.topic ?? null;
}

export { GENERIC_FALLBACK_CONTENT };

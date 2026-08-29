import { z } from 'zod';

export const educationCategorySchema = z.enum([
  'NUTRITION',
  'ANTENATAL_CARE',
  'EXERCISE_WELLBEING',
  'BIRTH_PREPARATION',
  'DANGER_SIGNS',
  'MENTAL_WELLBEING',
  'NEWBORN_CARE',
  'BREASTFEEDING',
  'POSTNATAL_CARE',
  'IMMUNIZATION',
  'HYGIENE',
  'FAMILY_SUPPORT',
]);

export const educationArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  category: educationCategorySchema,
  titleEnglish: z.string(),
  titleKinyarwanda: z.string(),
  summaryEnglish: z.string(),
  summaryKinyarwanda: z.string(),
  contentEnglish: z.string(),
  contentKinyarwanda: z.string(),
  pregnancyStage: z.string().nullable().optional(),
  readTimeMinutes: z.number(),
  reviewedBy: z.string().nullable().optional(),
  updatedAt: z.string(),
});

export const educationArticleListSchema = z.array(educationArticleSchema);

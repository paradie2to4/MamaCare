import { apiClient, unwrap } from './client';
import { educationArticleListSchema, educationArticleSchema } from '../schemas/education.schema';
import type { EducationCategory } from '../../types';

export async function fetchEducationArticles(category?: EducationCategory) {
  const response = await apiClient.get('/education', { params: category ? { category } : undefined });
  return educationArticleListSchema.parse(unwrap(response));
}

export async function fetchEducationArticle(slug: string) {
  const response = await apiClient.get(`/education/${slug}`);
  return educationArticleSchema.parse(unwrap(response));
}

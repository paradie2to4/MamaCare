import { useQuery } from '@tanstack/react-query';
import * as educationApi from '../../lib/api/education.api';
import { educationKeys } from '../../lib/query/keys';
import type { EducationCategory } from '../../types';

export function useEducationArticles(category?: EducationCategory) {
  return useQuery({
    queryKey: educationKeys.list(category),
    queryFn: () => educationApi.fetchEducationArticles(category),
  });
}

export function useEducationArticle(slug: string) {
  return useQuery({
    queryKey: educationKeys.detail(slug),
    queryFn: () => educationApi.fetchEducationArticle(slug),
    enabled: Boolean(slug),
  });
}

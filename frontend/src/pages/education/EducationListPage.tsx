import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { useEducationArticles } from '../../hooks/api/useEducation';
import { Card, CardContent, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { cn } from '../../lib/utils';
import type { EducationCategory } from '../../types';

const CATEGORIES: EducationCategory[] = [
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
];

export function EducationListPage() {
  const { t, i18n } = useTranslation('education');
  const [searchParams, setSearchParams] = useSearchParams();
  const category = (searchParams.get('category') as EducationCategory | null) ?? undefined;

  const { data: articles, isLoading, isError, refetch } = useEducationArticles(category);
  const isKinyarwanda = i18n.language === 'rw';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-secondary">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className={cn(
            'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium',
            !category ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
          )}
        >
          {t('allCategories')}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSearchParams({ category: cat })}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium',
              category === cat ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
            )}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && articles && articles.length === 0 && (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title={t('empty')} />
      )}

      <div className="space-y-3">
        {articles?.map((article) => (
          <Link key={article.id} to={`/app/learn/${article.slug}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-2 pt-5">
                <Badge variant="secondary">{t(`categories.${article.category}`)}</Badge>
                <CardTitle className="text-base">
                  {isKinyarwanda ? article.titleKinyarwanda : article.titleEnglish}
                </CardTitle>
                <CardDescription>
                  {isKinyarwanda ? article.summaryKinyarwanda : article.summaryEnglish}
                </CardDescription>
                <p className="text-xs text-muted-foreground">{t('readTime', { minutes: article.readTimeMinutes })}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

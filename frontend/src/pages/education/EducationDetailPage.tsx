import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useEducationArticle } from '../../hooks/api/useEducation';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { ErrorState } from '../../components/common/ErrorState';

export function EducationDetailPage() {
  const { t, i18n } = useTranslation('education');
  const { slug = '' } = useParams();
  const { data: article, isLoading, isError, refetch } = useEducationArticle(slug);
  const isKinyarwanda = i18n.language === 'rw';

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (isError || !article) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const title = isKinyarwanda ? article.titleKinyarwanda : article.titleEnglish;
  const content = isKinyarwanda ? article.contentKinyarwanda : article.contentEnglish;

  return (
    <article className="space-y-4">
      <Link to="/app/learn" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('backToLearn')}
      </Link>

      <div className="space-y-2">
        <Badge variant="secondary">{t(`categories.${article.category}`)}</Badge>
        <h1 className="text-2xl font-semibold text-secondary">{title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{t('readTime', { minutes: article.readTimeMinutes })}</span>
          <span>{t('updated', { date: new Date(article.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) })}</span>
          {article.reviewedBy && (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              {t('reviewed', { reviewer: article.reviewedBy })}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground">{content}</div>
    </article>
  );
}

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Send, Sparkles } from 'lucide-react';
import { useAiMessages, useSendAiMessage } from '../../hooks/api/useAi';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { cn } from '../../lib/utils';

const SUGGESTED_PROMPT_KEYS = ['prompts.ancSchedule', 'prompts.nutrition', 'prompts.dangerSigns'] as const;

export function AssistantPage() {
  const { t } = useTranslation('assistant');
  const { data: messages, isLoading } = useAiMessages();
  const sendMessage = useSendAiMessage();
  const [draft, setDraft] = useState('');

  function submit(content: string) {
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) return;
    setDraft('');
    sendMessage.mutate(trimmed, {
      onError: () => toast.error(t('status.somethingWentWrong', { ns: 'common' })),
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit(draft);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-secondary">{t('title')}</h1>
      <p className="text-xs text-muted-foreground">{t('disclaimer')}</p>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-3/4 ml-auto" />
        </div>
      )}

      {!isLoading && messages && messages.length === 0 && (
        <div className="space-y-3">
          <EmptyState icon={<Sparkles className="h-6 w-6" />} title={t('empty')} />
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPT_KEYS.map((key) => (
              <Button key={key} type="button" variant="outline" size="sm" onClick={() => submit(t(key))}>
                {t(key)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!isLoading && messages && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={cn('flex', message.role === 'USER' ? 'justify-end' : 'justify-start')}>
              <Card
                className={cn(
                  'max-w-[85%]',
                  message.role === 'USER' ? 'bg-primary text-primary-foreground' : 'bg-card',
                )}
              >
                <CardContent className="whitespace-pre-wrap p-3 text-sm">{message.content}</CardContent>
              </Card>
            </div>
          ))}
          {sendMessage.isPending && (
            <div className="flex justify-start">
              <Card className="max-w-[85%] bg-card">
                <CardContent className="p-3 text-sm text-muted-foreground">{t('thinking')}</CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          disabled={sendMessage.isPending}
          className="min-h-[52px]"
        />
        <Button type="submit" disabled={sendMessage.isPending || !draft.trim()}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {t('send')}
        </Button>
      </form>
    </div>
  );
}

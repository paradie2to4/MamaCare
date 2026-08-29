import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { useCreatePregnancy } from '../../hooks/api/useMothers';

const STEP_KEYS = ['language', 'pregnancy', 'care', 'notifications', 'privacy'] as const;

export function OnboardingPage() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [lmpDate, setLmpDate] = useState('');
  const [eddDate, setEddDate] = useState('');

  const createPregnancy = useCreatePregnancy();

  const isLastStep = step === STEP_KEYS.length - 1;
  const currentKey = STEP_KEYS[step];

  async function handleFinish() {
    try {
      if (lmpDate) {
        await createPregnancy.mutateAsync({ lmpDate, eddDate: eddDate || undefined });
      }
      navigate('/app', { replace: true });
    } catch {
      toast.error(t('status.somethingWentWrong', { ns: 'common' }));
    }
  }

  function handleContinue() {
    if (isLastStep) {
      handleFinish();
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-12">
      <h1 className="text-center text-xl font-semibold text-secondary">{t('title')}</h1>

      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {STEP_KEYS.map((key, index) => (
          <span
            key={key}
            className={`h-1.5 w-8 rounded-full ${index <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t(`steps.${currentKey}.label`)}
            </p>
            <h2 className="text-lg font-semibold">{t(`steps.${currentKey}.title`)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(`steps.${currentKey}.description`)}</p>
          </div>

          {currentKey === 'language' && (
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
          )}

          {currentKey === 'pregnancy' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="lmpDate">{t('steps.pregnancy.lmpDate')}</Label>
                <Input
                  id="lmpDate"
                  type="date"
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
                <p className="text-xs text-muted-foreground">{t('steps.pregnancy.lmpHint')}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eddDate">{t('steps.pregnancy.eddDate')}</Label>
                <Input id="eddDate" type="date" value={eddDate} onChange={(e) => setEddDate(e.target.value)} />
                <p className="text-xs text-muted-foreground">{t('steps.pregnancy.eddHint')}</p>
              </div>
            </div>
          )}

          {currentKey === 'notifications' && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="h-4 w-4" />
              {t('steps.notifications.inApp')}
            </label>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          {t('actions.back', { ns: 'common' })}
        </Button>
        <Button onClick={handleContinue} disabled={createPregnancy.isPending}>
          {isLastStep ? t('finish') : t('actions.continue', { ns: 'common' })}
        </Button>
      </div>
    </div>
  );
}

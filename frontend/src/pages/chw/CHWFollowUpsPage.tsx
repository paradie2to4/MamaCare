import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ClipboardList, Plus } from 'lucide-react';
import { useAssignedMothers } from '../../hooks/api/useChw';
import { useCompleteFollowUp, useCreateFollowUp, useMyFollowUps } from '../../hooks/api/useFollowUps';
import { createFollowUpFormSchema, type CreateFollowUpFormValues } from '../../lib/schemas/follow-ups.schema';
import { Card, CardContent, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import type { FollowUpPriority } from '../../types';

const PRIORITIES: FollowUpPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const PRIORITY_VARIANT: Record<FollowUpPriority, 'default' | 'warning' | 'destructive'> = {
  LOW: 'default',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'destructive',
};

function NewFollowUpDialog() {
  const { t } = useTranslation('chw');
  const [open, setOpen] = useState(false);
  const { data: mothers } = useAssignedMothers();
  const createFollowUp = useCreateFollowUp();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateFollowUpFormValues>({
    resolver: zodResolver(createFollowUpFormSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  async function onSubmit(values: CreateFollowUpFormValues) {
    try {
      await createFollowUp.mutateAsync(values);
      toast.success(t('followUps.form.submit'));
      reset();
      setOpen(false);
    } catch {
      toast.error(t('status.somethingWentWrong', { ns: 'common' }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('followUps.new')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('followUps.new')}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="motherProfileId">{t('followUps.form.mother')}</Label>
            <Select onValueChange={(value) => setValue('motherProfileId', value)}>
              <SelectTrigger id="motherProfileId">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mothers?.map((mother) => (
                  <SelectItem key={mother.id} value={mother.id}>
                    {mother.user.firstName} {mother.user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.motherProfileId && (
              <p className="text-sm text-destructive" role="alert">
                {errors.motherProfileId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">{t('followUps.form.reason')}</Label>
            <Input id="reason" {...register('reason')} />
            {errors.reason && (
              <p className="text-sm text-destructive" role="alert">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priority">{t('followUps.form.priority')}</Label>
            <Select value={watch('priority')} onValueChange={(value) => setValue('priority', value as FollowUpPriority)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {t(`followUps.priority.${priority}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dueDate">{t('followUps.form.dueDate')}</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('followUps.form.notes')}</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createFollowUp.isPending}>
              {t('followUps.form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CHWFollowUpsPage() {
  const { t } = useTranslation('chw');
  const { data: followUps, isLoading } = useMyFollowUps();
  const completeFollowUp = useCompleteFollowUp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary">{t('followUps.title')}</h1>
        <NewFollowUpDialog />
      </div>

      <p className="text-xs text-muted-foreground">{t('followUps.disclaimer')}</p>

      {isLoading && <Skeleton className="h-32 w-full" />}

      {!isLoading && followUps && followUps.length === 0 && (
        <EmptyState icon={<ClipboardList className="h-6 w-6" />} title={t('followUps.empty')} />
      )}

      <div className="space-y-3">
        {followUps?.map((followUp) => (
          <Card key={followUp.id}>
            <CardContent className="space-y-2 pt-5">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">
                  {followUp.motherProfile
                    ? `${followUp.motherProfile.user.firstName} ${followUp.motherProfile.user.lastName}`
                    : t('followUps.title')}
                </CardTitle>
                <Badge variant={PRIORITY_VARIANT[followUp.priority]}>{t(`followUps.priority.${followUp.priority}`)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{followUp.reason}</p>
              <p className="text-xs text-muted-foreground">{t(`followUps.status.${followUp.status}`)}</p>
              {(followUp.status === 'OPEN' || followUp.status === 'IN_PROGRESS') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => completeFollowUp.mutate(followUp.id)}
                  disabled={completeFollowUp.isPending}
                >
                  {t('followUps.complete')}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

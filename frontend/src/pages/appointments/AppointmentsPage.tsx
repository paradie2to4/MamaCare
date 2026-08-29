import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CalendarPlus, MapPin } from 'lucide-react';
import { useAppointments, useCreateAppointment, useUpdateAppointmentStatus } from '../../hooks/api/useAppointments';
import { createAppointmentFormSchema, type CreateAppointmentFormValues } from '../../lib/schemas/appointments.schema';
import { AppointmentStatusBadge } from '../../components/appointments/AppointmentStatusBadge';
import { Card, CardContent, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import type { AppointmentType } from '../../types';

const APPOINTMENT_TYPES: AppointmentType[] = ['ANC_VISIT', 'ULTRASOUND', 'LAB_TEST', 'VACCINATION', 'POSTNATAL', 'OTHER'];

function NewAppointmentDialog() {
  const { t } = useTranslation('appointments');
  const [open, setOpen] = useState(false);
  const createAppointment = useCreateAppointment();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentFormSchema),
    defaultValues: { type: 'ANC_VISIT' },
  });

  async function onSubmit(values: CreateAppointmentFormValues) {
    try {
      await createAppointment.mutateAsync(values);
      toast.success(t('form.submit'));
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
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          {t('new')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('new')}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="type">{t('form.type')}</Label>
            <Select value={watch('type')} onValueChange={(value) => setValue('type', value as AppointmentType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`type.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scheduledAt">{t('form.date')}</Label>
            <Input id="scheduledAt" type="datetime-local" {...register('scheduledAt')} />
            {errors.scheduledAt && (
              <p className="text-sm text-destructive" role="alert">
                {errors.scheduledAt.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facilityName">{t('form.facility')}</Label>
            <Input id="facilityName" {...register('facilityName')} />
            {errors.facilityName && (
              <p className="text-sm text-destructive" role="alert">
                {errors.facilityName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">{t('form.location')}</Label>
            <Input id="location" {...register('location')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('form.notes')}</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createAppointment.isPending}>
              {t('form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AppointmentsPage() {
  const { t } = useTranslation('appointments');
  const { data: appointments, isLoading, isError, refetch } = useAppointments();
  const updateStatus = useUpdateAppointmentStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <NewAppointmentDialog />
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && appointments && appointments.length === 0 && (
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      )}

      <div className="space-y-3">
        {appointments?.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="space-y-2 pt-5">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{t(`type.${appointment.type}`)}</CardTitle>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(appointment.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {appointment.facilityName}
              </p>
              {appointment.status === 'SCHEDULED' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus.mutate({ id: appointment.id, status: 'COMPLETED' })}
                  >
                    {t('actions.markCompleted')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus.mutate({ id: appointment.id, status: 'CANCELLED' })}
                  >
                    {t('actions.cancel')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

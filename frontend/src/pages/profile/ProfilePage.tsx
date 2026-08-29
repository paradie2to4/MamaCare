import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useMotherProfile, useUpdateMotherProfile } from '../../hooks/api/useMothers';
import { useInvitePartner, useMyPartnerLink, useRevokePartnerLink } from '../../hooks/api/usePartners';
import {
  updateMotherProfileFormSchema,
  type UpdateMotherProfileFormValues,
} from '../../lib/schemas/mothers.schema';
import { invitePartnerFormSchema, type InvitePartnerFormValues } from '../../lib/schemas/partners.schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';

function PartnerLinkCard() {
  const { t } = useTranslation('profile');
  const { data: link, isLoading } = useMyPartnerLink();
  const invitePartner = useInvitePartner();
  const revokeLink = useRevokePartnerLink();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvitePartnerFormValues>({ resolver: zodResolver(invitePartnerFormSchema) });

  async function onInvite(values: InvitePartnerFormValues) {
    try {
      await invitePartner.mutateAsync(values.email);
      toast.success(t('saveSuccess'));
      reset();
    } catch {
      toast.error(t('status.somethingWentWrong', { ns: 'common' }));
    }
  }

  async function onRevoke() {
    try {
      await revokeLink.mutateAsync();
    } catch {
      toast.error(t('status.somethingWentWrong', { ns: 'common' }));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('sections.partner')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : link ? (
          <div className="space-y-3">
            <CardDescription>
              {link.status === 'PENDING'
                ? t('partnerCard.pending', { email: link.partner?.email })
                : t('partnerCard.active', { name: `${link.partner?.firstName} ${link.partner?.lastName}` })}
            </CardDescription>
            <Button variant="outline" size="sm" onClick={onRevoke} disabled={revokeLink.isPending}>
              {t('partnerCard.revoke')}
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit(onInvite)} noValidate>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="partnerEmail">{t('partnerCard.emailLabel')}</Label>
              <Input id="partnerEmail" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={invitePartner.isPending}>
              {t('partnerCard.invite')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfilePage() {
  const { t } = useTranslation('profile');
  const { user, logout } = useAuth();
  const isMother = user?.role === 'MOTHER';
  const { data: profile, isLoading } = useMotherProfile(isMother);
  const updateProfile = useUpdateMotherProfile();

  const { register, handleSubmit, reset } = useForm<UpdateMotherProfileFormValues>({
    resolver: zodResolver(updateMotherProfileFormSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        district: profile.district ?? '',
        sector: profile.sector ?? '',
        cell: profile.cell ?? '',
        village: profile.village ?? '',
        emergencyContactName: profile.emergencyContactName ?? '',
        emergencyContactPhone: profile.emergencyContactPhone ?? '',
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: UpdateMotherProfileFormValues) {
    try {
      await updateProfile.mutateAsync(values);
      toast.success(t('saveSuccess'));
    } catch {
      toast.error(t('status.somethingWentWrong', { ns: 'common' }));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-secondary">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('sections.personal')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">{t('fields.firstName')}: </span>
            {user?.firstName}
          </p>
          <p>
            <span className="text-muted-foreground">{t('fields.lastName')}: </span>
            {user?.lastName}
          </p>
          <p>
            <span className="text-muted-foreground">{t('fields.email')}: </span>
            {user?.email}
          </p>
          {user?.phone && (
            <p>
              <span className="text-muted-foreground">{t('fields.phone')}: </span>
              {user.phone}
            </p>
          )}
        </CardContent>
      </Card>

      {isMother && (
        <>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('sections.location')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="district">{t('fields.district')}</Label>
                      <Input id="district" {...register('district')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sector">{t('fields.sector')}</Label>
                      <Input id="sector" {...register('sector')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cell">{t('fields.cell')}</Label>
                      <Input id="cell" {...register('cell')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="village">{t('fields.village')}</Label>
                      <Input id="village" {...register('village')} />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <Label htmlFor="emergencyContactName">{t('sections.emergencyContact')}</Label>
                    <Input
                      id="emergencyContactName"
                      placeholder={t('fields.emergencyContactName')}
                      {...register('emergencyContactName')}
                    />
                    <Input
                      id="emergencyContactPhone"
                      placeholder={t('fields.emergencyContactPhone')}
                      {...register('emergencyContactPhone')}
                    />
                  </div>

                  <Button type="submit" disabled={updateProfile.isPending}>
                    {t('actions.save', { ns: 'common' })}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <PartnerLinkCard />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('sections.language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('sections.account')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => logout()}>
            {t('actions.logout', { ns: 'common' })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

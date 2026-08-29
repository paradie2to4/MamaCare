import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { registerFormSchema, type RegisterFormValues } from '../../lib/schemas/auth.schema';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerUser(values);
      navigate('/onboarding', { replace: true });
    } catch {
      setServerError(t('register.error'));
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-secondary">{t('register.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('register.subtitle')}</p>
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">{t('register.firstName')}</Label>
            <Input id="firstName" autoComplete="given-name" {...register('firstName')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">{t('register.lastName')}</Label>
            <Input id="lastName" autoComplete="family-name" {...register('lastName')} />
          </div>
        </div>
        {(errors.firstName || errors.lastName) && (
          <p className="text-sm text-destructive" role="alert">
            {t('validation.required')}
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">{t('register.email')}</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">
              {t('validation.invalidEmail')}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">{t('register.phone')}</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t('register.password')}</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          <p className="text-xs text-muted-foreground">{t('register.passwordHint')}</p>
          {errors.password && (
            <p className="text-sm text-destructive" role="alert">
              {t('validation.passwordTooShort')}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {t('register.submit')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('register.haveAccount')}{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          {t('register.logIn')}
        </Link>
      </p>
    </div>
  );
}

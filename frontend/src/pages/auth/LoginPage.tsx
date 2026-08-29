import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { loginFormSchema, type LoginFormValues } from '../../lib/schemas/auth.schema';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values);
      const redirectTo = (location.state as { from?: { pathname: string } } | undefined)?.from?.pathname ?? '/app';
      navigate(redirectTo, { replace: true });
    } catch {
      setServerError(t('login.error'));
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-secondary">{t('login.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('login.subtitle')}</p>
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('login.email')}</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">
              {t('validation.invalidEmail')}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('login.password')}</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
          {errors.password && (
            <p className="text-sm text-destructive" role="alert">
              {t('validation.required')}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {t('login.submit')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          {t('login.createAccount')}
        </Link>
      </p>
    </div>
  );
}

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { createLoginFormSchema } from '../../features/auth/create-login-form-schema';
import { FloatLabel } from 'primereact/floatlabel';
import { Label } from 'primereact/label';
import { InputText } from 'primereact/inputtext';
import { supabase } from '../../lib/supabase/client';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const schema = useMemo(() => createLoginFormSchema(t), [t]);

  type LoginFormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const previousLanguage = useRef(i18n.resolvedLanguage);

  useEffect(() => {
    if (previousLanguage.current === i18n.resolvedLanguage) {
      return;
    }

    previousLanguage.current = i18n.resolvedLanguage;

    const fieldsWithErrors = Object.keys(errors).filter(
      (field) => field !== 'root',
    ) as Array<keyof LoginFormValues>;

    if (fieldsWithErrors.length > 0) {
      void trigger(fieldsWithErrors);
    }
  }, [i18n.resolvedLanguage, errors, trigger]);

  async function onSubmit(values: LoginFormValues) {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setError('root', {
        type:
          error.code === 'invalid_credentials'
            ? 'invalidCredentials'
            : 'loginFailed',
      });

      return;
    }

    navigate('/app', { replace: true });
  }

  return (
    <main className='flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-6 py-12'>
      <div className='w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm'>
        <div className='p-2 sm:p-4'>
          <div className='mb-8 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
              {t('auth.loginTitle')}
            </h1>

            <p className='mt-2 text-sm text-foreground-secondary'>
              {t('auth.loginDescription')}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-6'
          >
            <div>
              <FloatLabel className='relative block'>
                <InputText
                  id='email'
                  type='email'
                  autoComplete='email'
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  placeholder=' '
                  {...register('email')}
                  className={[
                    'peer w-full rounded-lg border bg-background px-3 pb-2 pt-2',
                    'text-sm text-foreground outline-none transition-colors',
                    'focus:border-primary focus:ring-1 focus:ring-primary',
                    errors.email ? 'border-danger' : 'border-border',
                  ].join(' ')}
                />

                <Label
                  htmlFor='email'
                  className={[
                    'pointer-events-none absolute left-3 z-10 px-1 transition-all',
                    'bg-surface text-foreground-muted',

                    // filled / default floating state
                    '-top-5 text-xs',

                    // empty input
                    'peer-placeholder-shown:top-1/2',
                    'peer-placeholder-shown:-translate-y-1/2',
                    'peer-placeholder-shown:bg-transparent',
                    'peer-placeholder-shown:px-0',
                    'peer-placeholder-shown:text-sm',

                    // focused input
                    'peer-focus:-top-5',
                    'peer-focus:translate-y-0',
                    'peer-focus:text-xs',
                    'peer-focus:text-primary',
                  ].join(' ')}
                >
                  {t('auth.email')}
                </Label>
              </FloatLabel>

              <p
                id='email-error'
                className='mt-1.5 min-h-5 text-sm text-danger'
              >
                {errors.email?.message ?? ''}
              </p>
            </div>

            <div>
              <FloatLabel className='relative block'>
                <InputText
                  id='password'
                  type='password'
                  autoComplete='current-password'
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  placeholder=' '
                  {...register('password')}
                  className={[
                    'peer w-full rounded-lg border bg-background px-3 pb-2 pt-2',
                    'text-sm text-foreground outline-none transition-colors',
                    'focus:border-primary focus:ring-1 focus:ring-primary',
                    errors.password ? 'border-danger' : 'border-border',
                  ].join(' ')}
                />

                <Label
                  htmlFor='password'
                  className={[
                    'pointer-events-none absolute left-3 z-10 px-1 transition-all',
                    'text-foreground-muted',

                    '-top-5 text-xs',

                    'peer-placeholder-shown:top-1/2',
                    'peer-placeholder-shown:-translate-y-1/2',
                    'peer-placeholder-shown:px-0',
                    'peer-placeholder-shown:text-sm',

                    'peer-focus:-top-5',
                    'peer-focus:translate-y-0',
                    'peer-focus:text-xs',
                    'peer-focus:text-primary',
                  ].join(' ')}
                >
                  {t('auth.password')}
                </Label>
              </FloatLabel>

              <p
                id='password-error'
                className='mt-1.5 min-h-5 text-sm text-danger'
              >
                {errors.password?.message ?? ''}
              </p>
            </div>

            {errors.root && (
              <p
                role='alert'
                className='rounded-lg border border-danger/30 bg-surface px-3 py-2 text-sm text-danger'
              >
                {errors.root.type === 'invalidCredentials'
                  ? t('auth.invalidCredentials')
                  : t('auth.loginFailed')}
              </p>
            )}

            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

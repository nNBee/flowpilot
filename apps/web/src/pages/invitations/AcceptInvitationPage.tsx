import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import {
  createAcceptInvitationFormSchema,
  AcceptInvitationFormValues,
} from '../../features/invitations/accept-invitation-form-schema';
import { ApiError, apiRequest } from '../../lib/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function AcceptInvitationPage() {
  const { t, i18n } = useTranslation();
  const formSchema = useMemo(() => createAcceptInvitationFormSchema(t), [t]);
  const { invitationId } = useParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setIsLoading(false);
    }

    void loadSession();
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
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
    ) as Array<keyof AcceptInvitationFormValues>;

    if (fieldsWithErrors.length > 0) {
      void trigger(fieldsWithErrors);
    }
  }, [i18n.resolvedLanguage, errors, trigger]);

  if (!invitationId) {
    return <p>{t('invitation.invalid')}</p>;
  }

  if (isLoading) {
    return <p>{t('common.loading')}</p>;
  }

  if (!session) {
    return <p>{t('invitation.expired')}</p>;
  }

  if (isSuccess) {
    return (
      <div>
        <h1>{t('invitation.acceptedTitle')}</h1>
        <p>{t('invitation.acceptedDescription')}</p>
      </div>
    );
  }

  async function onSubmit(values: AcceptInvitationFormValues) {
    if (!invitationId || !session) {
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (passwordError) {
      setError('root', {
        message: 'Failed to set password. Please try again.',
      });

      return;
    }

    try {
      await apiRequest(`/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', {
          type: error.code,
          message: error.message,
        });

        return;
      }

      setError('root', {
        type: 'internal_server_error',
      });

      return;
    }

    //TODO Redirect implementation
    setIsSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor='firstName'>{t('invitation.firstName')}</label>
        <input
          id='firstName'
          {...register('firstName')}
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? 'firstName-error' : undefined}
        />
        <p id='firstName-error'>{errors.firstName?.message ?? ''}</p>{' '}
      </div>
      <div>
        <label htmlFor='lastName'>{t('invitation.lastName')}</label>
        <input
          id='lastName'
          {...register('lastName')}
          aria-invalid={Boolean(errors.lastName)}
          aria-describedby={errors.lastName ? 'lastName-error' : undefined}
        />
        <p id='lastName-error'>{errors.lastName?.message ?? ''}</p>{' '}
      </div>
      <div>
        <label htmlFor='password'>{t('invitation.password')}</label>
        <input
          id='password'
          type='password'
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        <p id='password-error'>{errors.password?.message ?? ''}</p>{' '}
      </div>
      <div>
        <label htmlFor='confirmPassword'>
          {t('invitation.confirmPassword')}
        </label>
        <input
          id='confirmPassword'
          type='password'
          {...register('confirmPassword')}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword ? 'confirmPassword-error' : undefined
          }
        />
        <p id='confirmPassword-error'>
          {errors.confirmPassword?.message ?? ''}
        </p>{' '}
      </div>
      {errors.root && (
        <p role='alert'>
          {t(`errors.${errors.root.type}`, {
            defaultValue:
              errors.root.message ?? t('errors.internal_server_error'),
          })}
        </p>
      )}{' '}
      <button type='submit' disabled={isSubmitting}>
        {t('invitation.accept')}
      </button>
    </form>
  );
}

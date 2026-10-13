import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import {
  acceptInvitationFormSchema,
  AcceptInvitationFormValues,
} from './accept-invitation-form-schema';
import { ApiError, apiRequest } from '../../lib/api/client';
import { zodResolver } from '@hookform/resolvers/zod/src/index.js';
import { useForm } from 'react-hook-form';

export function AcceptInvitationPage() {
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
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (!invitationId) {
    return <p>Invalid invitation.</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isSuccess) {
    return (
      <div>
        <h1>Invitation accepted</h1>
        <p>Your account has been set up successfully.</p>
      </div>
    );
  }

  if (!session) {
    return <p>Invalid or expired invitation link.</p>;
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
      setError('root', {
        message:
          error instanceof ApiError
            ? error.message
            : 'Something went wrong. Please try again.',
      });

      return;
    }

    //TODO Redirect implementation
    setIsSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor='firstName'>First name</label>
        <input id='firstName' {...register('firstName')} />
        {errors.firstName && <p>{errors.firstName.message}</p>}
      </div>

      <div>
        <label htmlFor='lastName'>Last name</label>
        <input id='lastName' {...register('lastName')} />
        {errors.lastName && <p>{errors.lastName.message}</p>}
      </div>

      <div>
        <label htmlFor='password'>Password</label>
        <input id='password' type='password' {...register('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor='confirmPassword'>Confirm password</label>
        <input
          id='confirmPassword'
          type='password'
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
      </div>
      {errors.root?.message && <p role='alert'>{errors.root.message}</p>}
      <button type='submit' disabled={isSubmitting}>
        Accept invitation
      </button>
    </form>
  );
}

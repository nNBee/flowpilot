import { useEffect, type PropsWithChildren } from 'react';

import { useAppDispatch } from '../../store/hooks';
import { supabase } from '../../lib/supabase/client';
import { authInitialized, sessionChanged } from '../../store/slices/auth-slice';

export function AuthSync({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(sessionChanged(session));

      if (event === 'INITIAL_SESSION') {
        dispatch(authInitialized());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return children;
}

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  isLoading: boolean;
};

const initialState: AuthState = {
  session: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionChanged(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
    },

    authInitialized(state) {
      state.isLoading = false;
    },
  },
});

export const { sessionChanged, authInitialized } = authSlice.actions;

export default authSlice.reducer;

"use client";
import React, { createContext, useContext } from 'react'
import { Session } from '@supabase/supabase-js'

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  error: null
});

export const useAuth = () => useContext(AuthContext);

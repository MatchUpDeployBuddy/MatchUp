"use client";
import React, { useEffect, useState, FC } from 'react'
import { supabase } from './supabseClient'
import { AuthContext } from './AuthContext'
import { Session } from '@supabase/supabase-js'

interface Props {
  children: React.ReactNode;
}

const AuthProvider: FC<Props> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (mounted) {
        if (error) {
          setError(error);
        }
        setSession(data.session);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setError(null); // Reset error on state change
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

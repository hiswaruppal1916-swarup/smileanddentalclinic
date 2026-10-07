import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        localStorage.setItem('sdc_is_doctor', 'true');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        localStorage.setItem('sdc_is_doctor', 'true');
      } else {
        localStorage.removeItem('sdc_is_doctor');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginDoctor = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    localStorage.setItem('sdc_is_doctor', 'true');
    return data;
  };

  const logoutDoctor = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('sdc_is_doctor');
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isDoctor: !!session,
        loading,
        loginDoctor,
        logoutDoctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

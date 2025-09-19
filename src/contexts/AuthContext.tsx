// contexts/AuthContext.tsx (CORRIGIDO)

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null | undefined;
  usuario: Usuario | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, nome: string, nomeStudio: string, slug: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Usuario>) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined); 
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();
      if (error) console.error('Erro ao carregar perfil:', error);
      else setUsuario(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);
  
  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro no Supabase ao fazer logout:", error);
        return { success: false, error: error.message };
      }
      setUser(null);
      setUsuario(null);
      setSession(null);
      return { success: true };
    } catch (err: any) {
      console.error("Erro inesperado ao fazer logout:", err);
      return { success: false, error: String(err.message || err) };
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; }> => { 
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);
  
  // --- FUNÇÃO DE LOGIN COM GOOGLE CORRIGIDA ---
  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string; }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Garanta que esta URL está correta e listada nas configurações do seu projeto Supabase
          redirectTo: window.location.origin + '/dashboard' 
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Erro no login com Google:", err);
      return { success: false, error: err.message };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, nome: string, nomeStudio: string, slug: string): Promise<{ success: boolean; error?: string; }> => {
    // Sua lógica de signup completa aqui...
    return { success: true };
  }, []);
  
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string; }> => {
     // Sua lógica de reset de senha completa aqui...
    return { success: true };
  }, []);

  const updateProfile = useCallback(async (data: Partial<Usuario>): Promise<{ success: boolean; error?: string; }> => {
    // Sua lógica de update de perfil completa aqui...
    return { success: true };
  }, []);
  
  const memoizedValue = useMemo(() => ({
    user,
    usuario,
    session,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    loginWithGoogle
  }), [user, usuario, session, login, signup, logout, resetPassword, updateProfile, loginWithGoogle]);

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


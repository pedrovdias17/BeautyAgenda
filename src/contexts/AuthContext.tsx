import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserProfile, getUserProfile, updateUserProfile } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, nome: string, nomeStudio: string, slug: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserProfile(getUserProfile(session.user));
      }
      setIsLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setUserProfile(getUserProfile(session.user));
        } else {
          setUserProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao fazer login' };
    }
  };

  const signup = async (email: string, password: string, nome: string, nomeStudio: string, slug: string) => {
    try {
      // Verificar se o slug já existe (buscar em auth.users.user_metadata)
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const slugExists = existingUsers.users?.some(u => u.user_metadata?.slug === slug);

      if (slugExists) {
        return { success: false, error: 'Este slug já está em uso. Escolha outro.' };
      }

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14); // 14 dias de trial

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            nome_studio: nomeStudio,
            slug,
            status_assinatura: 'trial',
            trial_termina_em: trialEnd.toISOString(),
            configuracoes: {}
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao criar conta' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao enviar email' };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { error } = await updateUserProfile(data);

      if (error) {
        return { success: false, error: error.message };
      }

      // Atualizar estado local
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao atualizar perfil' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      session,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      resetPassword,
      updateProfile
    }}>
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
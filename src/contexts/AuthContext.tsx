import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Usuario } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, nome: string, nomeStudio: string, slug: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Usuario>) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUsuario(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
      } else {
        setUsuario(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Funcao para login com Google
  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173/dashboard', // ou a página que você quiser depois do login
        },
      });

      if (error) {
        throw error;
      }

      // Supabase já lida com o redirecionamento. O retorno aqui é apenas informativo.
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };


const signup = async (email: string, password: string, nome: string, nomeStudio: string, slug: string) => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            console.error('Erro na criação do usuário:', authError);
            return { success: false, error: authError.message };
        }

        if (!authData.user) {
            return { success: false, error: 'Usuário não foi criado.' };
        }

        const newUserId = authData.user.id;
        const { data: profileData, error: profileError } = await supabase
            .from('usuarios')
            .insert([
                {
                    id: newUserId,
                    email: email,
                    nome: nome,
                    nome_studio: nomeStudio,
                    slug: slug,
                    status_assinatura: 'trial',
                    trial_termina_em: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    configuracoes: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

        if (profileError) {
            console.error('Erro ao salvar o perfil:', profileError);
            return { success: false, error: profileError.message || 'Erro ao salvar perfil.' };
        }

        console.log('Usuário e perfil criados com sucesso!');
        return { success: true };

    } catch (error) {
        console.error('Erro inesperado na função signup:', error);
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

  const updateProfile = async (data: Partial<Usuario>) => {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('usuarios')
        .update(data)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Recarregar perfil
      await loadUserProfile(user.id);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao atualizar perfil' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      usuario,
      session,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithGoogle, 
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
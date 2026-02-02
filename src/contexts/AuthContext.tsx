import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Perfil {
  id: string;
  user_id: string;
  nombre: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  usuario: User | null;
  sesion: Session | null;
  perfil: Perfil | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<{ error: Error | null }>;
  registrarse: (email: string, password: string, nombre: string) => Promise<{ error: Error | null }>;
  iniciarConGoogle: () => Promise<{ error: Error | null }>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [sesion, setSesion] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  // Cargar perfil del usuario
  const cargarPerfil = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setPerfil(data);
    }
  };

  useEffect(() => {
    // Configurar listener de cambios de autenticación PRIMERO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSesion(session);
        setUsuario(session?.user ?? null);
        
        if (session?.user) {
          // Usar setTimeout para evitar deadlocks con Supabase
          setTimeout(() => cargarPerfil(session.user.id), 0);
        } else {
          setPerfil(null);
        }
        
        setCargando(false);
      }
    );

    // Obtener sesión inicial DESPUÉS
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setUsuario(session?.user ?? null);
      
      if (session?.user) {
        cargarPerfil(session.user.id);
      }
      
      setCargando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const iniciarSesion = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const registrarse = async (email: string, password: string, nombre: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: nombre,
        },
      },
    });
    return { error: error as Error | null };
  };

  const iniciarConGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setPerfil(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        sesion,
        perfil,
        cargando,
        iniciarSesion,
        registrarse,
        iniciarConGoogle,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

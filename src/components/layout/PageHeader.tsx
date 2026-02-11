import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, LogIn, LogOut, User } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '@/integrations/supabase/types';
import type { GitHubProfile } from '@/hooks/useGitHub';

interface PageHeaderProps {
  usuario: SupabaseUser | null;
  perfil: Profile | null;
  githubProfile: GitHubProfile | null;
  githubLoading: boolean;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export function PageHeader({
  usuario,
  perfil,
  githubProfile,
  githubLoading,
  onLogout,
  onOpenAuth,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-gradient-brand shadow-md">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Sidebar Trigger */}
        <SidebarTrigger className="text-white hover:bg-white/10" />

        {/* Logo y Título */}
        <div className="flex items-center gap-3">
          <img
            src="/MakeMeEt.png"
            alt="MakeMeEt Logo"
            className="h-10 w-auto transition-transform hover:scale-105 duration-300"
          />
          <div>
            <h1 className="text-xl font-bold text-white">MakeMeEt</h1>
            <p className="text-sm text-white/90">Crea tu currículum en segundos</p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* GitHub Profile Badge */}
        {githubProfile && (
          <Badge variant="secondary" className="gap-2 bg-white/10 text-white border-white/20">
            <Github className="h-3 w-3" />
            {githubProfile.login}
          </Badge>
        )}

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-white/90 text-sm">
                <User className="h-4 w-4" />
                <span>{perfil?.full_name || usuario.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenAuth}
              className="text-white hover:bg-white/10"
            >
              <LogIn className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

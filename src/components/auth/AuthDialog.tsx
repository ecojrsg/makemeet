import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Mail, Chrome } from 'lucide-react';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';

interface AuthDialogProps {
  abierto: boolean;
  onCerrar: () => void;
}

// Obtener proveedores habilitados desde variable de entorno
const proveedoresAuth = (import.meta.env.VITE_AUTH_PROVIDERS || 'email').split(',').map((p: string) => p.trim().toLowerCase());
const googleHabilitado = proveedoresAuth.includes('google');

export function AuthDialog({ abierto, onCerrar }: AuthDialogProps) {
  const { iniciarSesion, registrarse, iniciarConGoogle } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);

  // Estado del formulario de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estado del formulario de registro
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNombre, setRegNombre] = useState('');

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    const { error } = await iniciarSesion(loginEmail, loginPassword);
    
    if (error) {
      toast.error('Error al iniciar sesión: ' + error.message);
    } else {
      toast.success('¡Bienvenido de vuelta!');
      onCerrar();
      limpiarFormularios();
    }
    
    setCargando(false);
  };

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    const { error } = await registrarse(regEmail, regPassword, regNombre);
    
    if (error) {
      toast.error('Error al registrarse: ' + error.message);
    } else {
      toast.success('¡Cuenta creada! Revisa tu correo para confirmar.');
      onCerrar();
      limpiarFormularios();
    }
    
    setCargando(false);
  };

  const manejarGoogle = async () => {
    setCargandoGoogle(true);
    const { error } = await iniciarConGoogle();
    
    if (error) {
      toast.error('Error con Google: ' + error.message);
      setCargandoGoogle(false);
    }
    // No cerrar el diálogo, se redirigirá a Google
  };

  const limpiarFormularios = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegEmail('');
    setRegPassword('');
    setRegNombre('');
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Accede a tu cuenta
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={manejarLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo electrónico</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Iniciar sesión
              </Button>
              <Button 
                type="button"
                variant="link" 
                className="w-full text-sm"
                onClick={() => {
                  onCerrar();
                  setMostrarRecuperacion(true);
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={manejarRegistro} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-nombre">Nombre completo</Label>
                <Input
                  id="reg-nombre"
                  type="text"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  placeholder="Juan García"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Correo electrónico</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Contraseña</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Crear cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {googleHabilitado && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={manejarGoogle}
              disabled={cargandoGoogle}
            >
              {cargandoGoogle ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Chrome className="h-4 w-4 mr-2" />
              )}
              Google
            </Button>
          </>
        )}
      </DialogContent>

      <ForgotPasswordDialog 
        abierto={mostrarRecuperacion}
        onCerrar={() => setMostrarRecuperacion(false)}
        onVolverLogin={() => {
          setMostrarRecuperacion(false);
          // Re-abrir el diálogo de auth si estaba abierto
        }}
      />
    </Dialog>
  );
}

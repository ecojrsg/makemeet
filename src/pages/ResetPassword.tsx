import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay un token de recuperación en la URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type !== 'recovery' || !accessToken) {
      setError('Enlace de recuperación inválido o expirado.');
    }
  }, []);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmarPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      toast.error('Error al actualizar la contraseña: ' + updateError.message);
      setError(updateError.message);
    } else {
      setExito(true);
      toast.success('¡Contraseña actualizada correctamente!');
    }

    setCargando(false);
  };

  if (error && !exito) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle>Enlace inválido</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>¡Contraseña actualizada!</CardTitle>
            <CardDescription>
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/')}>
              Ir al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Nueva contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              Cambiar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

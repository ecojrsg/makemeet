import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotPasswordDialogProps {
  abierto: boolean;
  onCerrar: () => void;
  onVolverLogin: () => void;
}

export function ForgotPasswordDialog({ abierto, onCerrar, onVolverLogin }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error('Error al enviar el correo: ' + error.message);
    } else {
      setEnviado(true);
      toast.success('Correo enviado correctamente');
    }

    setCargando(false);
  };

  const manejarCerrar = () => {
    setEmail('');
    setEnviado(false);
    onCerrar();
  };

  const manejarVolver = () => {
    setEmail('');
    setEnviado(false);
    onVolverLogin();
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && manejarCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {enviado ? 'Revisa tu correo' : 'Restablecer contraseña'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {enviado 
              ? 'Te hemos enviado un enlace para restablecer tu contraseña.'
              : 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.'}
          </DialogDescription>
        </DialogHeader>

        {enviado ? (
          <div className="space-y-4 mt-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Si existe una cuenta con el correo <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={manejarVolver}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Correo electrónico</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Enviar enlace
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              className="w-full" 
              onClick={manejarVolver}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

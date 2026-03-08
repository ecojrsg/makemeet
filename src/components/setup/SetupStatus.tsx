import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Database,
  Shield,
  Users,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSetup } from '@/contexts/SetupContext';

interface ElementoEstadoProps {
  titulo: string;
  ok: boolean;
  verificando: boolean;
  icono: React.ReactNode;
  descripcion?: string;
}

function ElementoEstado({ titulo, ok, verificando, icono, descripcion }: ElementoEstadoProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="flex-shrink-0 text-muted-foreground">{icono}</div>
      <div className="flex-grow">
        <p className="font-medium text-sm">{titulo}</p>
        {descripcion && <p className="text-xs text-muted-foreground">{descripcion}</p>}
      </div>
      <div className="flex-shrink-0">
        {verificando ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : ok ? (
          <CheckCircle className="h-5 w-5 text-primary" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
      </div>
    </div>
  );
}

export function SetupStatus() {
  const {
    verificando,
    conexionOk,
    tablasOk,
    tablasFaltantes,
    tablasIADiagnostico,
    proveedoresAuth,
    errorMensaje,
  } = useSetup();

  const tablasIAOk = tablasIADiagnostico.api_keys && tablasIADiagnostico.ai_request_logs;
  const tablasIAFaltantes: string[] = [];
  if (!tablasIADiagnostico.api_keys) tablasIAFaltantes.push('api_keys');
  if (!tablasIADiagnostico.ai_request_logs) tablasIAFaltantes.push('ai_request_logs');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado del Sistema
        </CardTitle>
        <CardDescription>Verificacion de la conexion y configuracion de Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ElementoEstado
          titulo="Conexion a Supabase"
          ok={conexionOk}
          verificando={verificando}
          icono={<Shield className="h-5 w-5" />}
          descripcion={conexionOk ? 'Conectado correctamente' : 'Sin conexion'}
        />

        <ElementoEstado
          titulo="Tablas base (requeridas)"
          ok={tablasOk}
          verificando={verificando}
          icono={<Database className="h-5 w-5" />}
          descripcion={tablasOk ? 'profiles y cvs listas' : `Faltantes: ${tablasFaltantes.join(', ')}`}
        />

        <ElementoEstado
          titulo="Tablas IA (diagnostico)"
          ok={tablasIAOk}
          verificando={verificando}
          icono={<Sparkles className="h-5 w-5" />}
          descripcion={tablasIAOk ? 'api_keys y ai_request_logs listas' : `Faltantes: ${tablasIAFaltantes.join(', ')}`}
        />

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex-shrink-0 text-muted-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-grow">
            <p className="font-medium text-sm">Proveedores de autenticacion</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {proveedoresAuth.length > 0 ? (
                proveedoresAuth.map((proveedor) => (
                  <Badge key={proveedor} variant="secondary" className="text-xs capitalize">
                    {proveedor}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Ninguno configurado</span>
              )}
            </div>
          </div>
        </div>

        {errorMensaje && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{errorMensaje}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

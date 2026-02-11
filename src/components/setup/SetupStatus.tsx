import { CheckCircle, XCircle, AlertCircle, Loader2, Database, Shield, Users, Sparkles } from 'lucide-react';
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
      <div className="flex-shrink-0 text-muted-foreground">
        {icono}
      </div>
      <div className="flex-grow">
        <p className="font-medium text-sm">{titulo}</p>
        {descripcion && (
          <p className="text-xs text-muted-foreground">{descripcion}</p>
        )}
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
    proveedoresAuth,
    errorMensaje
  } = useSetup();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado del Sistema
        </CardTitle>
        <CardDescription>
          Verificación de la conexión y configuración de Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de conexión */}
        <ElementoEstado
          titulo="Conexión a Supabase"
          ok={conexionOk}
          verificando={verificando}
          icono={<Shield className="h-5 w-5" />}
          descripcion={conexionOk ? 'Conectado correctamente' : 'Sin conexión'}
        />

        {/* Estado de tablas */}
        <ElementoEstado
          titulo="Tablas de base de datos"
          ok={tablasOk}
          verificando={verificando}
          icono={<Database className="h-5 w-5" />}
          descripcion={
            tablasOk 
              ? 'Todas las tablas configuradas' 
              : `Faltantes: ${tablasFaltantes.join(', ')}`
          }
        />

        {/* Proveedores de autenticación */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex-shrink-0 text-muted-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-grow">
            <p className="font-medium text-sm">Proveedores de autenticación</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {proveedoresAuth.length > 0 ? (
                proveedoresAuth.map((proveedor) => (
                  <Badge key={proveedor} variant="secondary" className="text-xs capitalize">
                    {proveedor}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  Ninguno configurado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
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

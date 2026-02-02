import { useState } from 'react';
import { Loader2, Copy, Check, RefreshCw, ExternalLink, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSetup } from '@/contexts/SetupContext';
import { SQL_SETUP, copiarSQLAlPortapapeles } from '@/services/setupService';
import { SetupStatus } from './SetupStatus';

export function SetupWizard() {
  const { verificando, conexionOk, tablasOk, listo, reintentar } = useSetup();
  const [copiado, setCopiado] = useState(false);
  const [reintentando, setReintentando] = useState(false);

  const manejarCopiar = async () => {
    const exito = await copiarSQLAlPortapapeles();
    if (exito) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const manejarReintentar = async () => {
    setReintentando(true);
    await reintentar();
    setReintentando(false);
  };

  // Si está listo, no mostrar el wizard
  if (listo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración Inicial</h1>
          <p className="text-muted-foreground">
            CV Generator necesita configurar la base de datos antes de continuar
          </p>
        </div>

        {/* Estado actual */}
        <SetupStatus />

        {/* Instrucciones según el estado */}
        {!conexionOk ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error de conexión
              </CardTitle>
              <CardDescription>
                No se pudo conectar a Supabase. Verifica tu configuración.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Verifica tu archivo .env</AlertTitle>
                <AlertDescription className="mt-2">
                  <code className="text-xs bg-muted p-1 rounded">
                    VITE_SUPABASE_URL=https://tu-proyecto.supabase.co<br />
                    VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key
                  </code>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={manejarReintentar} 
                disabled={reintentando}
                className="w-full"
              >
                {reintentando ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reintentar conexión
              </Button>
            </CardFooter>
          </Card>
        ) : !tablasOk ? (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Base de Datos</CardTitle>
              <CardDescription>
                Las tablas necesarias no existen. Ejecuta el siguiente SQL en tu consola de Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="instrucciones">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="instrucciones">Instrucciones</TabsTrigger>
                  <TabsTrigger value="sql">SQL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="instrucciones" className="space-y-4 mt-4">
                  <ol className="list-decimal list-inside space-y-3 text-sm">
                    <li>
                      Abre tu{' '}
                      <a 
                        href="https://supabase.com/dashboard" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Dashboard de Supabase
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>Selecciona tu proyecto</li>
                    <li>Ve a <strong>SQL Editor</strong> en el menú lateral</li>
                    <li>Copia el SQL de la pestaña "SQL" y ejecútalo</li>
                    <li>Haz clic en "Reintentar verificación" abajo</li>
                  </ol>
                </TabsContent>
                
                <TabsContent value="sql" className="mt-4">
                  <div className="relative">
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
                      <code>{SQL_SETUP}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={manejarCopiar}
                    >
                      {copiado ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                onClick={manejarReintentar} 
                disabled={reintentando}
                className="flex-1"
              >
                {reintentando ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reintentar verificación
              </Button>
            </CardFooter>
          </Card>
        ) : null}

        {/* Verificando */}
        {verificando && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando configuración...</span>
          </div>
        )}
      </div>
    </div>
  );
}

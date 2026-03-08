import { useState } from 'react';
import { Loader2, RefreshCw, ExternalLink, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSetup } from '@/contexts/SetupContext';
import { SetupStatus } from './SetupStatus';

const COMANDO_RESET_LOCAL = 'npm run db:start && npm run db:reset && npm run db:types:local';

export function SetupWizard() {
  const { verificando, conexionOk, tablasOk, listo, reintentar } = useSetup();
  const [reintentando, setReintentando] = useState(false);

  const manejarReintentar = async () => {
    setReintentando(true);
    await reintentar();
    setReintentando(false);
  };

  if (listo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Configuracion Inicial</h1>
          <p className="text-muted-foreground">
            MakeMeEt necesita validar la conexion y migraciones de base de datos antes de continuar
          </p>
        </div>

        <SetupStatus />

        {!conexionOk ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error de conexion
              </CardTitle>
              <CardDescription>
                No se pudo conectar a Supabase. Verifica tu configuracion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Verifica tu archivo .env</AlertTitle>
                <AlertDescription className="mt-2">
                  <code className="text-xs bg-muted p-1 rounded">
                    VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
                    <br />
                    VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key
                  </code>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={manejarReintentar} disabled={reintentando} className="w-full">
                {reintentando ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reintentar conexion
              </Button>
            </CardFooter>
          </Card>
        ) : !tablasOk ? (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Base de Datos con Supabase CLI</CardTitle>
              <CardDescription>
                Faltan tablas base. Inicializa la base desde migraciones versionadas usando Supabase CLI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="local">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="local">Local (recomendado)</TabsTrigger>
                  <TabsTrigger value="remoto">Remoto (SaaS/Self-hosted)</TabsTrigger>
                </TabsList>

                <TabsContent value="local" className="space-y-4 mt-4">
                  <ol className="list-decimal list-inside space-y-3 text-sm">
                    <li>Instala Supabase CLI y asegurate de tener Docker encendido.</li>
                    <li>Desde la raiz del proyecto ejecuta:</li>
                  </ol>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    <code>{COMANDO_RESET_LOCAL}</code>
                  </pre>
                  <p className="text-sm text-muted-foreground">
                    Esto levanta Supabase local, aplica las migraciones y regenera tipos.
                  </p>
                </TabsContent>

                <TabsContent value="remoto" className="space-y-4 mt-4">
                  <ol className="list-decimal list-inside space-y-3 text-sm">
                    <li>Autentica y vincula tu proyecto (SaaS):</li>
                  </ol>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    <code>{`supabase login
supabase link --project-ref <project-ref>
npm run db:push
npm run db:types:linked`}</code>
                  </pre>
                  <ol className="list-decimal list-inside space-y-3 text-sm" start={2}>
                    <li>Para self-hosted usa conexion directa por URL:</li>
                  </ol>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    <code>{`npx supabase db push --db-url "postgresql://USER:PASSWORD@HOST:PORT/postgres"
npx supabase gen types typescript --db-url "postgresql://USER:PASSWORD@HOST:PORT/postgres" --schema public > src/integrations/supabase/types.ts`}</code>
                  </pre>
                  <a
                    href="https://supabase.com/docs/guides/cli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                  >
                    Documentacion de Supabase CLI
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={manejarReintentar} disabled={reintentando} className="flex-1">
                {reintentando ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reintentar verificacion
              </Button>
            </CardFooter>
          </Card>
        ) : null}

        {verificando && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando configuracion...</span>
          </div>
        )}
      </div>
    </div>
  );
}

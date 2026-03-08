import { useState } from 'react';
import { ArrowLeft, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSetup } from '@/contexts/SetupContext';
import { SetupStatus } from '@/components/setup/SetupStatus';
import { APIKeyManager } from '@/components/setup/APIKeyManager';

const COMANDO_RESET_LOCAL = 'npm run db:start && npm run db:reset && npm run db:types:local';

export default function Setup() {
  const { listo, reintentar } = useSetup();
  const [reintentando, setReintentando] = useState(false);

  const manejarReintentar = async () => {
    setReintentando(true);
    await reintentar();
    setReintentando(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Panel de Configuracion</h1>
              <p className="text-muted-foreground">Administra la conexion y configuracion de Supabase</p>
            </div>
          </div>
          <Button variant="outline" onClick={manejarReintentar} disabled={reintentando}>
            {reintentando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar estado
          </Button>
        </div>

        <SetupStatus />
        <APIKeyManager />

        {listo ? (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Sistema listo</CardTitle>
              <CardDescription>
                La aplicacion esta correctamente configurada y conectada a Supabase.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link to="/">Ir a la aplicacion</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Migraciones de Base de Datos (Supabase CLI)</CardTitle>
              <CardDescription>
                Si falta configuracion, usa las migraciones versionadas del proyecto en lugar de ejecutar SQL manual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="local">
                <TabsList>
                  <TabsTrigger value="local">Local</TabsTrigger>
                  <TabsTrigger value="saas">SaaS</TabsTrigger>
                  <TabsTrigger value="selfhosted">Self-hosted</TabsTrigger>
                </TabsList>

                <TabsContent value="local" className="mt-4 space-y-4">
                  <p className="text-sm">Flujo recomendado para desarrollo:</p>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    <code>{COMANDO_RESET_LOCAL}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="saas" className="mt-4 space-y-4">
                  <p className="text-sm">Flujo para Supabase Cloud:</p>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    <code>{`supabase login
supabase link --project-ref <project-ref>
npm run db:push
npm run db:types:linked`}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="selfhosted" className="mt-4 space-y-4">
                  <p className="text-sm">Flujo para instancias auto-hospedadas:</p>
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
                    Ver documentacion de Supabase CLI
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowLeft, Copy, Check, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSetup } from '@/contexts/SetupContext';
import { SetupStatus } from '@/components/setup/SetupStatus';
import { APIKeyManager } from '@/components/setup/APIKeyManager';
import { SQL_SETUP, copiarSQLAlPortapapeles } from '@/services/setupService';

export default function Setup() {
  const { listo, reintentar } = useSetup();
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Panel de Configuración</h1>
              <p className="text-muted-foreground">
                Administra la conexión y configuración de Supabase
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={manejarReintentar}
            disabled={reintentando}
          >
            {reintentando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar estado
          </Button>
        </div>

        {/* Estado del sistema */}
        <SetupStatus />

        {/* Gestión de API Keys */}
        <APIKeyManager />

        {/* Estado general */}
        {listo ? (
          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">✓ Sistema listo</CardTitle>
              <CardDescription>
                La aplicación está correctamente configurada y conectada a Supabase.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link to="/">Ir a la aplicación</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>SQL de Configuración</CardTitle>
              <CardDescription>
                Si necesitas crear o recrear las tablas, usa el siguiente SQL en tu consola de Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sql">
                <TabsList>
                  <TabsTrigger value="sql">SQL Completo</TabsTrigger>
                  <TabsTrigger value="instrucciones">Instrucciones</TabsTrigger>
                </TabsList>
                
                <TabsContent value="sql" className="mt-4">
                  <div className="relative">
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
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
                          Copiar SQL
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="instrucciones" className="mt-4 space-y-4">
                  <ol className="list-decimal list-inside space-y-3">
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
                    <li>Selecciona tu proyecto o crea uno nuevo</li>
                    <li>Ve a <strong>SQL Editor</strong> en el menú lateral izquierdo</li>
                    <li>Haz clic en <strong>"New Query"</strong></li>
                    <li>Copia y pega el SQL de la pestaña "SQL Completo"</li>
                    <li>Haz clic en <strong>"Run"</strong> para ejecutar</li>
                    <li>Regresa aquí y haz clic en "Actualizar estado"</li>
                  </ol>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Variables de entorno necesarias</h4>
                    <code className="text-xs">
                      VITE_SUPABASE_URL=https://tu-proyecto.supabase.co<br />
                      VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key<br />
                      VITE_AUTH_PROVIDERS=email,google
                    </code>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

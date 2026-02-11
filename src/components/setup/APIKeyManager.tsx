import { useState } from 'react';
import { Plus, Trash2, Check, Eye, EyeOff, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAPIKeys } from '@/hooks/useAPIKeys';
import { AddAPIKeyDialog } from './AddAPIKeyDialog';
import type { APIKey } from '@/types/apiKeys';
import { useToast } from '@/hooks/use-toast';

export function APIKeyManager() {
  const { keys, activeKeyId, isAdmin, loading, addKey, deleteKey, setActiveKey } = useAPIKeys();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskAPIKey = (key: string, visible: boolean) => {
    if (visible) return key;
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.substring(0, 8) + '•'.repeat(key.length - 8);
  };

  const handleDelete = async (key: APIKey) => {
    const result = await deleteKey(key);
    if (result.success) {
      toast({
        title: 'API Key eliminada',
        description: `La key "${key.nombre}" fue eliminada correctamente.`,
      });
    } else {
      toast({
        title: 'Error al eliminar',
        description: result.error || 'No se pudo eliminar la API key.',
        variant: 'destructive',
      });
    }
  };

  const handleSetActive = async (key: APIKey) => {
    await setActiveKey(key);
    toast({
      title: 'API Key activa',
      description: `Ahora estás usando "${key.nombre}" (${key.proveedor}).`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de API Keys de IA</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de API Keys de IA</CardTitle>
              <CardDescription>
                Administra tus API keys personales y globales para OpenAI y Gemini
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay API keys configuradas</p>
              <p className="text-sm mt-1">Agrega una key para empezar a usar las funciones de IA</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => {
                const isActive = activeKeyId === key.id;
                const isVisible = visibleKeys.has(key.id);
                const canDelete = key.tipo === 'personal' || isAdmin;

                return (
                  <div
                    key={key.id}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border
                      ${isActive ? 'bg-primary/5 border-primary' : 'bg-muted/50'}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{key.nombre}</h4>
                        <Badge variant={key.tipo === 'personal' ? 'default' : 'secondary'}>
                          {key.tipo === 'personal' ? 'Personal' : 'Global'}
                        </Badge>
                        <Badge variant="outline">{key.proveedor}</Badge>
                        {isActive && (
                          <Badge variant="default" className="bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Activa
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <code className="px-2 py-1 bg-background rounded font-mono text-xs">
                          {maskAPIKey(key.clave, isVisible)}
                        </code>
                        <span>Modelo: {key.modelo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleKeyVisibility(key.id)}
                        title={isVisible ? 'Ocultar key' : 'Mostrar key'}
                      >
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>

                      {!isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetActive(key)}
                        >
                          Usar esta key
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(key)}
                          title="Eliminar key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      {!canDelete && (
                        <div className="w-9" /> // Espacio para mantener alineación
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isAdmin && (
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <strong>Nota:</strong> Solo puedes eliminar tus API keys personales. Las keys globales
              solo pueden ser eliminadas por administradores.
            </div>
          )}
        </CardContent>
      </Card>

      <AddAPIKeyDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={addKey}
        isAdmin={isAdmin}
      />
    </>
  );
}

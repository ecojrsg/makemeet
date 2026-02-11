import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Eye, EyeOff, Key, Clock, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAPIKeys } from '@/hooks/useAPIKeys';
import { AddAPIKeyDialog } from './AddAPIKeyDialog';
import type { APIKeySaved, APIKeyTemporal } from '@/types/apiKeys';
import { useToast } from '@/hooks/use-toast';
import { eliminarKeyTemporal } from '@/services/aiService';

// Función auxiliar para leer key temporal de sessionStorage
function obtenerKeyTemporalLocal(): APIKeyTemporal | null {
  try {
    const stored = sessionStorage.getItem('temp_api_key');
    if (!stored) return null;
    return JSON.parse(stored) as APIKeyTemporal;
  } catch {
    return null;
  }
}

export function APIKeyManager() {
  const { keys, activeKey, loading, deleteKey, activateKey } = useAPIKeys();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingKey, setEditingKey] = useState<APIKeySaved | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [keyTemporal, setKeyTemporal] = useState<APIKeyTemporal | null>(null);
  const { toast } = useToast();

  // Cargar key temporal al montar y cuando cambia sessionStorage
  useEffect(() => {
    const loadTempKey = () => {
      const temp = obtenerKeyTemporalLocal();
      setKeyTemporal(temp);
    };

    loadTempKey();

    // Escuchar cambios en sessionStorage (para cuando se agregue/elimine una key temporal)
    const interval = setInterval(loadTempKey, 500);
    return () => clearInterval(interval);
  }, []);

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskAPIKey = (key: string | undefined, visible: boolean) => {
    if (!key) return '••••••••••••••••••••••••';
    if (visible) return key;
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.substring(0, 8) + '•'.repeat(15);
  };

  const handleDelete = async (key: APIKeySaved) => {
    try {
      await deleteKey(key.id);
      toast({
        title: 'API Key eliminada',
        description: `La key "${key.nombre}" fue eliminada correctamente.`,
      });
    } catch (error) {
      toast({
        title: 'Error al eliminar',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la API key.',
        variant: 'destructive',
      });
    }
  };

  const handleActivate = async (key: APIKeySaved) => {
    try {
      // Eliminar key temporal si existe
      const tempKey = obtenerKeyTemporalLocal();
      if (tempKey) {
        eliminarKeyTemporal();
        setKeyTemporal(null);
      }
      
      // Activar la key guardada
      await activateKey(key.id);
      
      toast({
        title: 'API Key activada',
        description: `Ahora estás usando "${key.nombre}" (${key.proveedor}).`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo activar la key.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemporal = () => {
    eliminarKeyTemporal();
    setKeyTemporal(null);
    toast({
      title: 'Key temporal eliminada',
      description: 'La key temporal fue eliminada de esta sesión.',
    });
  };

  const handleEdit = (key: APIKeySaved) => {
    setEditingKey(key);
    setShowAddDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingKey(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis API Keys de IA</CardTitle>
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
              <CardTitle>Mis API Keys de IA</CardTitle>
              <CardDescription>
                Administra tus API keys guardadas para OpenAI y Gemini
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Key
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Key temporal (si existe) */}
            {keyTemporal && (
              <div className="p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <h4 className="font-medium text-sm">Key Temporal (Sesión Actual)</h4>
                      <Badge variant="default" className="text-xs bg-orange-600">
                        <Check className="w-3 h-3 mr-1" />
                        En uso
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {keyTemporal.proveedor === 'openai' ? 'OpenAI' : 'Gemini'}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <code className="text-xs font-mono bg-white px-2 py-1 rounded border">
                        {maskAPIKey(keyTemporal.clave, false)}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Modelo: {keyTemporal.modelo} • Se borrará al cerrar el navegador
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteTemporal}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Keys guardadas */}
            {keys.length === 0 && !keyTemporal ? (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">No tienes API keys guardadas.</p>
                <p className="text-xs mt-2">
                  Haz clic en "Agregar Key" para guardar una key en tu cuenta.
                </p>
              </div>
            ) : keys.length > 0 ? (
              <>
                {keyTemporal && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium text-muted-foreground">Keys Guardadas</h4>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {keys.map((key) => {
                    const isVisible = visibleKeys.has(key.id);
                    const isActive = activeKey?.id === key.id && !keyTemporal; // Solo es activa si no hay temporal

                    return (
                      <div
                        key={key.id}
                        className={`p-4 border rounded-lg ${
                          isActive ? 'bg-green-50/50 border-green-300' : 'bg-card'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="w-4 h-4 text-muted-foreground" />
                              <h4 className="font-medium text-sm truncate">{key.nombre}</h4>
                              {isActive && (
                                <Badge variant="default" className="text-xs bg-green-600">
                                  <Check className="w-3 h-3 mr-1" />
                                  Activa
                                </Badge>
                              )}
                              {!isActive && keyTemporal && key.activa && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactiva (hay temporal)
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {key.proveedor === 'openai' ? 'OpenAI' : 'Gemini'}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                  {maskAPIKey(key.clave, isVisible)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleKeyVisibility(key.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {isVisible ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                Modelo: {key.modelo}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActivate(key)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Activar
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(key)}
                            >
                              Editar
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(key)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <AddAPIKeyDialog
        open={showAddDialog}
        onClose={handleCloseDialog}
        editingKey={editingKey}
      />
    </>
  );
}

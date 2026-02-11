import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { APIKeyFormData, ProveedorIA, APIKeySaved } from '@/types/apiKeys';
import { MODELOS_DISPONIBLES } from '@/types/apiKeys';
import { useToast } from '@/hooks/use-toast';
import { useAPIKeys } from '@/hooks/useAPIKeys';
import { guardarKeyTemporal, probarAPIKey } from '@/services/aiService';

interface AddAPIKeyDialogProps {
  open: boolean;
  onClose: () => void;
  editingKey?: APIKeySaved | null;
}

export function AddAPIKeyDialog({ open, onClose, editingKey }: AddAPIKeyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ exito: boolean; mensaje: string } | null>(null);
  const [formData, setFormData] = useState<APIKeyFormData>({
    nombre: '',
    proveedor: 'openai',
    clave: '',
    modelo: 'gpt-5.2',
    guardar: true, // Por defecto, guardar en Supabase
  });
  const { toast } = useToast();
  const { addKey, updateKey } = useAPIKeys();

  // Si estamos editando, cargar datos de la key
  useEffect(() => {
    if (editingKey) {
      setFormData({
        nombre: editingKey.nombre,
        proveedor: editingKey.proveedor,
        clave: editingKey.clave,
        modelo: editingKey.modelo,
        guardar: true, // Siempre guardar si estamos editando
      });
    } else {
      // Reset al cerrar
      setFormData({
        nombre: '',
        proveedor: 'openai',
        clave: '',
        modelo: 'gpt-5.2',
        guardar: true,
      });
    }
    // Reset test result
    setTestResult(null);
  }, [editingKey, open]);

  const handleTest = async () => {
    if (!formData.clave.trim()) {
      toast({
        title: 'Error',
        description: 'Debes ingresar una API key antes de probar.',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await probarAPIKey(formData.proveedor, formData.clave, formData.modelo);
      setTestResult(result);

      if (result.exito) {
        toast({
          title: 'Prueba exitosa',
          description: result.mensaje,
        });
      } else {
        toast({
          title: 'Prueba fallida',
          description: result.mensaje,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al probar la API key.';
      setTestResult({ exito: false, mensaje });
      toast({
        title: 'Error',
        description: mensaje,
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.clave.trim()) {
      toast({
        title: 'Error',
        description: 'Debes proporcionar la API key.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.guardar && !formData.nombre.trim()) {
      toast({
        title: 'Error',
        description: 'Debes proporcionar un nombre para la key guardada.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (formData.guardar) {
        // Guardar en Supabase
        if (editingKey) {
          // Actualizar key existente
          await updateKey(editingKey.id, {
            nombre: formData.nombre,
            proveedor: formData.proveedor,
            clave: formData.clave,
            modelo: formData.modelo,
          });

          toast({
            title: 'Key actualizada',
            description: `La key "${formData.nombre}" fue actualizada correctamente.`,
          });
        } else {
          // Agregar nueva key
          await addKey(formData);

          toast({
            title: 'Key guardada',
            description: `La key "${formData.nombre}" fue guardada y activada correctamente.`,
          });
        }
      } else {
        // Guardar solo como temporal (sessionStorage)
        guardarKeyTemporal(formData.proveedor, formData.clave, formData.modelo);

        toast({
          title: 'Key temporal configurada',
          description: 'La key se usará solo en esta sesión y no se guardará en el servidor.',
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la API key.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProveedorChange = (proveedor: ProveedorIA) => {
    setFormData(prev => ({
      ...prev,
      proveedor,
      modelo: MODELOS_DISPONIBLES[proveedor][0].value,
    }));
    // Reset test result cuando cambia el proveedor
    setTestResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingKey ? 'Editar API Key' : 'Agregar API Key de IA'}
          </DialogTitle>
          <DialogDescription>
            {editingKey 
              ? 'Actualiza los datos de tu API key guardada.'
              : 'Configura una API key para mejorar tus CVs con IA.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo: Temporal vs Guardada */}
          {!editingKey && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="guardar-key" className="text-sm font-medium">
                  Guardar en mi cuenta
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formData.guardar 
                    ? 'La key se guardará en Supabase y estará disponible siempre'
                    : 'La key solo se usará en esta sesión (se borra al cerrar el navegador)'}
                </p>
              </div>
              <Switch
                id="guardar-key"
                checked={formData.guardar}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, guardar: checked }))}
              />
            </div>
          )}

          {/* Nombre (solo si se guarda) */}
          {formData.guardar && (
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la key</Label>
              <Input
                id="nombre"
                placeholder="Ej: Mi key de OpenAI"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
          )}

          {/* Proveedor */}
          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor</Label>
            <Select
              value={formData.proveedor}
              onValueChange={(value) => handleProveedorChange(value as ProveedorIA)}
            >
              <SelectTrigger id="proveedor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Select
              value={formData.modelo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, modelo: value }))}
            >
              <SelectTrigger id="modelo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELOS_DISPONIBLES[formData.proveedor].map((modelo) => (
                  <SelectItem key={modelo.value} value={modelo.value}>
                    {modelo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="clave">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="clave"
                type="password"
                placeholder={formData.proveedor === 'openai' ? 'sk-proj-...' : 'AIza...'}
                value={formData.clave}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, clave: e.target.value }));
                  setTestResult(null); // Reset test result cuando cambia la clave
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={testing || !formData.clave.trim()}
                className="shrink-0"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Probando...
                  </>
                ) : (
                  'Probar'
                )}
              </Button>
            </div>
            
            {/* Resultado de la prueba */}
            {testResult && (
              <div className={`flex items-center gap-2 text-xs p-2 rounded ${
                testResult.exito 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult.exito ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testResult.mensaje}</span>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Obtén tu API key desde:{' '}
              {formData.proveedor === 'openai' ? (
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI Platform
                </a>
              ) : (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editingKey ? 'Actualizar' : (formData.guardar ? 'Guardar' : 'Usar Temporalmente')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

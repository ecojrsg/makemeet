import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { APIKeyFormData, ProveedorIA } from '@/types/apiKeys';
import { MODELOS_DISPONIBLES } from '@/types/apiKeys';
import { useToast } from '@/hooks/use-toast';
import { validarAPIKey } from '@/services/aiService';

interface AddAPIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: APIKeyFormData) => Promise<{ success: boolean; error?: string }>;
  isAdmin: boolean;
}

export function AddAPIKeyDialog({ open, onOpenChange, onAdd, isAdmin }: AddAPIKeyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });
  const [formData, setFormData] = useState<APIKeyFormData>({
    nombre: '',
    proveedor: 'openai',
    clave: '',
    modelo: 'gpt-5.2',
    tipo: 'personal',
  });
  const { toast } = useToast();

  const handleValidate = async () => {
    if (!formData.clave.trim()) {
      toast({
        title: 'Error',
        description: 'Debes proporcionar la API key primero.',
        variant: 'destructive',
      });
      return;
    }

    setValidating(true);
    setValidationResult({ status: 'idle' });

    const resultado = await validarAPIKey(formData.proveedor, formData.clave, formData.modelo);

    setValidating(false);

    if (resultado.valida) {
      setValidationResult({ status: 'success', message: '¡API key válida!' });
      toast({
        title: 'Validación exitosa',
        description: 'La API key es válida y funciona correctamente.',
      });
    } else {
      setValidationResult({ status: 'error', message: resultado.error || 'Error desconocido' });
      toast({
        title: 'Validación fallida',
        description: resultado.error || 'No se pudo validar la API key.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast({
        title: 'Error de validación',
        description: 'Debes proporcionar un nombre para la key.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.clave.trim()) {
      toast({
        title: 'Error de validación',
        description: 'Debes proporcionar la API key.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await onAdd(formData);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'API Key agregada',
        description: `La key "${formData.nombre}" fue agregada correctamente.`,
      });
      // Reset form
      setFormData({
        nombre: '',
        proveedor: 'openai',
        clave: '',
        modelo: 'gpt-5.2',
        tipo: 'personal',
      });
      setValidationResult({ status: 'idle' });
      onOpenChange(false);
    } else {
      toast({
        title: 'Error al agregar',
        description: result.error || 'No se pudo agregar la API key.',
        variant: 'destructive',
      });
    }
  };

  const handleProveedorChange = (proveedor: ProveedorIA) => {
    const modelosDisponibles = MODELOS_DISPONIBLES[proveedor];
    setFormData({
      ...formData,
      proveedor,
      modelo: modelosDisponibles[0]?.value || '',
    });
    setValidationResult({ status: 'idle' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar API Key</DialogTitle>
            <DialogDescription>
              Configura una nueva API key para usar funciones de IA en tus CVs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tipo de key */}
            <div className="space-y-2">
              <Label>Tipo de API Key</Label>
              <RadioGroup
                value={formData.tipo}
                onValueChange={(value: 'personal' | 'global') =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="tipo-personal" />
                  <Label htmlFor="tipo-personal" className="font-normal cursor-pointer">
                    Personal (localStorage) - Solo visible en este navegador
                  </Label>
                </div>
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="global" id="tipo-global" />
                    <Label htmlFor="tipo-global" className="font-normal cursor-pointer">
                      Global (Supabase) - Compartida con todos los usuarios
                    </Label>
                  </div>
                )}
              </RadioGroup>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Solo administradores pueden crear keys globales
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Ej: OpenAI Personal"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Un nombre descriptivo para identificar esta key
              </p>
            </div>

            {/* Proveedor */}
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Select
                value={formData.proveedor}
                onValueChange={(value) => handleProveedorChange(value as ProveedorIA)}
                disabled={loading}
              >
                <SelectTrigger id="proveedor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Select
                value={formData.modelo}
                onValueChange={(value) => setFormData({ ...formData, modelo: value })}
                disabled={loading}
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
                  placeholder="sk-... o AIza..."
                  value={formData.clave}
                  onChange={(e) => {
                    setFormData({ ...formData, clave: e.target.value });
                    setValidationResult({ status: 'idle' });
                  }}
                  disabled={loading || validating}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleValidate}
                  disabled={loading || validating || !formData.clave.trim()}
                >
                  {validating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Probar'
                  )}
                </Button>
              </div>
              
              {validationResult.status === 'success' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{validationResult.message}</span>
                </div>
              )}
              
              {validationResult.status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span>{validationResult.message}</span>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Tu API key nunca se comparte y se almacena de forma segura
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agregar API Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Loader2 } from 'lucide-react';

interface SaveCVDialogProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (nombre: string, etiquetas: string[]) => Promise<void>;
  nombreInicial?: string;
  etiquetasIniciales?: string[];
  modoEdicion?: boolean;
}

export function SaveCVDialog({ 
  abierto, 
  onCerrar, 
  onGuardar, 
  nombreInicial = '',
  etiquetasIniciales = [],
  modoEdicion = false
}: SaveCVDialogProps) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [etiquetas, setEtiquetas] = useState<string[]>(etiquetasIniciales);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [guardando, setGuardando] = useState(false);

  const agregarEtiqueta = () => {
    const etiquetaLimpia = nuevaEtiqueta.trim();
    if (etiquetaLimpia && !etiquetas.includes(etiquetaLimpia)) {
      setEtiquetas([...etiquetas, etiquetaLimpia]);
      setNuevaEtiqueta('');
    }
  };

  const eliminarEtiqueta = (etiqueta: string) => {
    setEtiquetas(etiquetas.filter(e => e !== etiqueta));
  };

  const manejarGuardar = async () => {
    if (!nombre.trim()) return;
    
    setGuardando(true);
    await onGuardar(nombre.trim(), etiquetas);
    setGuardando(false);
    
    // Limpiar formulario solo si no es edición
    if (!modoEdicion) {
      setNombre('');
      setEtiquetas([]);
    }
    
    onCerrar();
  };

  const manejarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarEtiqueta();
    }
  };

  // Sincronizar estado cuando cambian las props
  useState(() => {
    setNombre(nombreInicial);
    setEtiquetas(etiquetasIniciales);
  });

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {modoEdicion ? 'Actualizar CV' : 'Guardar CV'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cv-nombre">Nombre del CV</Label>
            <Input
              id="cv-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: CV para empresas tech"
            />
          </div>

          <div className="space-y-2">
            <Label>Etiquetas (opcional)</Label>
            <div className="flex gap-2">
              <Input
                value={nuevaEtiqueta}
                onChange={(e) => setNuevaEtiqueta(e.target.value)}
                onKeyDown={manejarKeyDown}
                placeholder="Añadir etiqueta..."
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={agregarEtiqueta}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {etiquetas.map((etiqueta, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {etiqueta}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                      onClick={() => eliminarEtiqueta(etiqueta)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button 
            onClick={manejarGuardar} 
            disabled={!nombre.trim() || guardando}
          >
            {guardando ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {modoEdicion ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

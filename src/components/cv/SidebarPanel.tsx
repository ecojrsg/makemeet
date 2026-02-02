import { useState } from 'react';
import { CVGuardado } from '@/hooks/useCVs';
import { TipoPlantilla } from '@/types/templates';
import { CVList } from './CVList';
import { SelectorPlantilla } from './SelectorPlantilla';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FolderOpen, Plus, ChevronDown, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarPanelProps {
  usuario: boolean;
  cvs: CVGuardado[];
  cvsCargando: boolean;
  cvActualId?: string;
  plantillaActual: TipoPlantilla;
  onNuevoCV: () => void;
  onSeleccionarCV: (cv: CVGuardado) => void;
  onEliminarCV: (id: string) => void;
  onCambiarPlantilla: (plantilla: TipoPlantilla) => void;
}

export function SidebarPanel({
  usuario,
  cvs,
  cvsCargando,
  cvActualId,
  plantillaActual,
  onNuevoCV,
  onSeleccionarCV,
  onEliminarCV,
  onCambiarPlantilla,
}: SidebarPanelProps) {
  const [cvsAbierto, setCvsAbierto] = useState(true);
  const [plantillasAbierto, setPlantillasAbierto] = useState(true);

  return (
    <div className="space-y-3 sticky top-24">
      {/* Sección Mis CVs - solo visible si hay usuario */}
      {usuario && (
        <Card>
          <Collapsible open={cvsAbierto} onOpenChange={setCvsAbierto}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Mis CVs</CardTitle>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        cvsAbierto ? "rotate-0" : "-rotate-90"
                      )} 
                    />
                  </Button>
                </CollapsibleTrigger>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onNuevoCV();
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="max-h-[35vh] overflow-y-auto pt-0">
                <CVList
                  cvs={cvs}
                  cargando={cvsCargando}
                  onSeleccionar={onSeleccionarCV}
                  onEliminar={onEliminarCV}
                  cvActualId={cvActualId}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Sección Plantillas - siempre visible */}
      <Card>
        <Collapsible open={plantillasAbierto} onOpenChange={setPlantillasAbierto}>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center gap-2 w-full justify-start">
                <Palette className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Plantillas</CardTitle>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    plantillasAbierto ? "rotate-0" : "-rotate-90"
                  )} 
                />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <SelectorPlantillaInline 
                plantillaActual={plantillaActual}
                onCambiar={onCambiarPlantilla}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

// Versión inline del selector sin Card externa
import { PLANTILLAS } from '@/types/templates';
import { Check } from 'lucide-react';

function SelectorPlantillaInline({ 
  plantillaActual, 
  onCambiar 
}: { 
  plantillaActual: TipoPlantilla; 
  onCambiar: (plantilla: TipoPlantilla) => void;
}) {
  return (
    <div className="space-y-2">
      {PLANTILLAS.map((plantilla) => (
        <button
          key={plantilla.id}
          onClick={() => onCambiar(plantilla.id)}
          className={cn(
            "w-full p-3 rounded-lg border-2 transition-all text-left",
            "hover:border-primary/50 hover:bg-muted/50",
            plantillaActual === plantilla.id
              ? "border-primary bg-muted"
              : "border-border"
          )}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-8 h-10 rounded flex-shrink-0 border border-border"
              style={{ 
                background: `linear-gradient(180deg, ${plantilla.colorPrimario} 30%, #ffffff 30%)`
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{plantilla.nombre}</span>
                {plantillaActual === plantilla.id && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {plantilla.descripcion}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

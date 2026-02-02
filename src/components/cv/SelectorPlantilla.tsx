import { TipoPlantilla, PLANTILLAS } from '@/types/templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectorPlantillaProps {
  plantillaActual: TipoPlantilla;
  onCambiar: (plantilla: TipoPlantilla) => void;
}

export function SelectorPlantilla({ plantillaActual, onCambiar }: SelectorPlantillaProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" />
          Plantillas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
              {/* Miniatura de color */}
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
      </CardContent>
    </Card>
  );
}

import { CVGuardado } from '@/hooks/useCVs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CVListProps {
  cvs: CVGuardado[];
  cargando: boolean;
  onSeleccionar: (cv: CVGuardado) => void;
  onEliminar: (id: string) => void;
  cvActualId?: string;
}

export function CVList({ cvs, cargando, onSeleccionar, onEliminar, cvActualId }: CVListProps) {
  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No tienes CVs guardados</p>
        <p className="text-sm text-muted-foreground mt-1">
          Completa el formulario y guarda tu primer CV
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cvs.map((cv) => (
        <Card 
          key={cv.id} 
          className={`cursor-pointer transition-colors hover:border-primary/50 ${
            cvActualId === cv.id ? 'border-primary bg-primary/5' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div 
                className="flex-1 min-w-0"
                onClick={() => onSeleccionar(cv)}
              >
                <h4 className="font-medium text-foreground truncate">
                  {cv.nombre}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Actualizado {format(new Date(cv.updated_at), "d 'de' MMM, yyyy", { locale: es })}
                </p>
                {cv.etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cv.etiquetas.map((etiqueta, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {etiqueta}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeleccionar(cv);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEliminar(cv.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CVGuardado } from '@/hooks/useCVs';
import { TipoPlantilla } from '@/types/templates';
import { CVList } from '@/components/cv/CVList';
import { SelectorPlantilla } from '@/components/cv/SelectorPlantilla';
import { FolderOpen, Plus, Palette } from 'lucide-react';

interface AppSidebarProps {
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

export function AppSidebar({
  usuario,
  cvs,
  cvsCargando,
  cvActualId,
  plantillaActual,
  onNuevoCV,
  onSeleccionarCV,
  onEliminarCV,
  onCambiarPlantilla,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" side="left">
      <SidebarHeader className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Navegación</h2>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          {/* Sección Mis CVs */}
          {usuario && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>
                  <FolderOpen className="h-4 w-4" />
                  <span>Mis CVs</span>
                </SidebarGroupLabel>
                <SidebarGroupAction onClick={onNuevoCV} title="Nuevo CV">
                  <Plus className="h-4 w-4" />
                </SidebarGroupAction>
                <SidebarGroupContent>
                  <CVList
                    cvs={cvs}
                    cargando={cvsCargando}
                    onSeleccionar={onSeleccionarCV}
                    onEliminar={onEliminarCV}
                    cvActualId={cvActualId}
                  />
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />
            </>
          )}

          {/* Sección Plantillas */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <Palette className="h-4 w-4" />
              <span>Plantillas</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SelectorPlantilla
                plantillaActual={plantillaActual}
                onCambiar={onCambiarPlantilla}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

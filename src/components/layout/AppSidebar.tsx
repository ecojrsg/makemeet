import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarRail,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CVGuardado } from '@/hooks/useCVs';
import { TipoPlantilla } from '@/types/templates';
import { CVList } from '@/components/cv/CVList';
import { SelectorPlantilla } from '@/components/cv/SelectorPlantilla';
import { FolderOpen, Plus, Palette, Settings, CreditCard, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground leading-normal">Navegación</h2>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-2 py-2">
          {/* Sección Mis CVs */}
          {usuario && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center gap-2 px-2 h-9">
                  <FolderOpen className="h-4 w-4" />
                  <span>Mis CVs</span>
                </SidebarGroupLabel>
                <SidebarGroupAction onClick={onNuevoCV} title="Nuevo CV">
                  <Plus className="h-4 w-4" />
                </SidebarGroupAction>
                <SidebarGroupContent className="px-2">
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
            <SidebarGroupLabel className="flex items-center gap-2 px-2 h-9">
              <Palette className="h-4 w-4" />
              <span>Plantillas</span>
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SelectorPlantilla
                plantillaActual={plantillaActual}
                onCambiar={onCambiarPlantilla}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configuración">
              <Link to="/setup">
                <Settings aria-hidden="true" />
                <span>Setup</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Estado de la plataforma">
              <a href="https://uptime.ecojrsg.dev/status/makemeet" target="_blank" rel="noopener noreferrer">
                <Activity aria-hidden="true" />
                <span>Estado de la plataforma</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Obtener Pro"
              onClick={() => {
                window.open('https://www.youtube.com/watch?v=xvFZjo5PgG0', '_blank');
                toast('Nosotros no cobramos por esta aplicación... aún!', { duration: Infinity, closeButton: true });
              }}
            >
              <CreditCard aria-hidden="true" />
              <span>Obtener Pro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

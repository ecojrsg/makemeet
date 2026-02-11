import { CVData, GitHubProfile, GitHubRepo } from './cv';

// Tipos de plantilla disponibles
export type TipoPlantilla = 'moderno' | 'clasico' | 'minimalista' | 'creativo';

// Props comunes para todas las plantillas
export interface PlantillaProps {
  datos: CVData;
  perfilGithub: GitHubProfile | null;
  reposGithub: GitHubRepo[];
  mode?: 'preview' | 'export'; // preview: altura dinámica, export: dimensiones A4 fijas
}

// Información de cada plantilla para el selector
export interface InfoPlantilla {
  id: TipoPlantilla;
  nombre: string;
  descripcion: string;
  colorPrimario: string;
}

// Lista de plantillas disponibles
export const PLANTILLAS: InfoPlantilla[] = [
  {
    id: 'moderno',
    nombre: 'Moderno',
    descripcion: 'Diseño limpio con colores vibrantes',
    colorPrimario: 'hsl(203 54% 27%)'
  },
  {
    id: 'clasico',
    nombre: 'Clásico',
    descripcion: 'Diseño tradicional y formal',
    colorPrimario: 'hsl(203 54% 20%)'
  },
  {
    id: 'minimalista',
    nombre: 'Minimalista',
    descripcion: 'Diseño simple y elegante',
    colorPrimario: 'hsl(170 8% 25%)'
  },
  {
    id: 'creativo',
    nombre: 'Creativo',
    descripcion: 'Diseño visual llamativo',
    colorPrimario: 'hsl(170 54% 40%)'
  }
];

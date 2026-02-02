import { CVData, GitHubProfile, GitHubRepo } from './cv';

// Tipos de plantilla disponibles
export type TipoPlantilla = 'moderno' | 'clasico' | 'minimalista' | 'creativo';

// Props comunes para todas las plantillas
export interface PlantillaProps {
  datos: CVData;
  perfilGithub: GitHubProfile | null;
  reposGithub: GitHubRepo[];
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
    colorPrimario: '#5b4cdb'
  },
  {
    id: 'clasico',
    nombre: 'Clásico',
    descripcion: 'Diseño tradicional y formal',
    colorPrimario: '#1e3a5f'
  },
  {
    id: 'minimalista',
    nombre: 'Minimalista',
    descripcion: 'Diseño simple y elegante',
    colorPrimario: '#000000'
  },
  {
    id: 'creativo',
    nombre: 'Creativo',
    descripcion: 'Diseño visual llamativo',
    colorPrimario: '#e11d48'
  }
];

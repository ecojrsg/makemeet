/**
 * Configuración centralizada de colores para templates de CV.
 * Todos los templates usan variantes de la paleta corporativa basada en el logo MakeMeEt.
 */

export const templateColors = {
  moderno: {
    primary: 'hsl(203 54% 27%)',      // brand-ocean
    secondary: 'hsl(170 54% 40%)',    // brand-teal
    light: 'hsl(170 54% 95%)',
    gradient: 'linear-gradient(135deg, hsl(203 54% 27%) 0%, hsl(170 54% 40%) 100%)',
    name: 'Azul Océano & Teal',
  },
  clasico: {
    primary: 'hsl(203 54% 20%)',      // ocean más oscuro
    secondary: 'hsl(203 54% 37%)',    // ocean más claro
    light: 'hsl(203 54% 95%)',
    gradient: 'linear-gradient(135deg, hsl(203 54% 20%) 0%, hsl(203 54% 37%) 100%)',
    name: 'Azul Profundo',
  },
  minimalista: {
    primary: 'hsl(170 8% 25%)',       // neutral-700 con tinte teal
    secondary: 'hsl(170 54% 40%)',    // brand-teal como acento
    light: 'hsl(170 20% 98%)',
    gradient: 'linear-gradient(135deg, hsl(170 8% 25%) 0%, hsl(170 54% 40%) 100%)',
    name: 'Neutro con Teal',
  },
  creativo: {
    primary: 'hsl(170 54% 40%)',      // brand-teal
    secondary: 'hsl(162 63% 48%)',    // brand-mint
    light: 'hsl(170 54% 95%)',
    gradient: 'linear-gradient(135deg, hsl(170 54% 40%) 0%, hsl(162 63% 48%) 100%)',
    name: 'Teal & Menta',
  },
} as const;

export type TemplateColorKey = keyof typeof templateColors;

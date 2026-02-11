import { forwardRef, ReactNode } from 'react';

interface CVPageProps {
  children: ReactNode;
  pageNumber: number;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
}

/**
 * Componente que representa una página individual del CV
 * Dimensiones: 210mm x 297mm (A4)
 */
export const CVPage = forwardRef<HTMLDivElement, CVPageProps>(
  ({ children, pageNumber, isFirst = false, isLast = false, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        data-page={pageNumber}
        className={`cv-page ${className}`}
        style={{
          width: '210mm',
          height: '297mm',
          backgroundColor: '#ffffff',
          color: '#111827',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '11pt',
          lineHeight: '1.4',
          overflow: 'hidden',
          position: 'relative',
          // Padding: 20mm arriba y abajo, excepto primera página (menos arriba) y última (menos abajo)
          paddingTop: isFirst ? '15mm' : '20mm',
          paddingBottom: isLast ? '15mm' : '20mm',
          paddingLeft: '20mm',
          paddingRight: '20mm',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    );
  }
);

CVPage.displayName = 'CVPage';

import { ReactNode } from 'react';
import { CVPage } from './CVPage';

interface CVPageContainerProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

/**
 * Contenedor de páginas de CV con separación mínima entre ellas
 * Vista minimalista sin efectos de papel
 */
export function CVPageContainer({ children, id = 'styled-cv', className = '' }: CVPageContainerProps) {
  return (
    <div
      id={id}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px', // Separación mínima entre páginas
        width: 'fit-content',
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
}

interface SinglePageCVProps {
  children: ReactNode;
  id?: string;
}

/**
 * Wrapper simple para CVs de una sola página
 * Facilita la transición del código existente
 */
export function SinglePageCV({ children, id = 'styled-cv' }: SinglePageCVProps) {
  return (
    <CVPageContainer id={id}>
      <CVPage pageNumber={1} isFirst isLast>
        {children}
      </CVPage>
    </CVPageContainer>
  );
}

interface MultiPageCVProps {
  pages: ReactNode[];
  id?: string;
}

/**
 * Wrapper para CVs multipágina
 * Renderiza automáticamente múltiples páginas con numeración
 */
export function MultiPageCV({ pages, id = 'styled-cv' }: MultiPageCVProps) {
  return (
    <CVPageContainer id={id}>
      {pages.map((pageContent, index) => (
        <CVPage
          key={index}
          pageNumber={index + 1}
          isFirst={index === 0}
          isLast={index === pages.length - 1}
        >
          {pageContent}
        </CVPage>
      ))}
    </CVPageContainer>
  );
}

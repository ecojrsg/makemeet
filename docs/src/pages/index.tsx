import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Documentación"
      description="Guías técnicas y manual de usuario de MakeMeEt"
    >
      <header className="hero hero--primary">
        <div className="container">
          <h1 className="hero__title">Documentación de MakeMeEt</h1>
          <p className="hero__subtitle">
            Implementación técnica (SaaS/self-hosted) y manual de usuario final.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link className="button button--secondary button--lg" to="/implementacion/intro">
              Ir a Implementación
            </Link>
            <Link className="button button--outline button--lg" to="/manual/intro">
              Ir a Manual de usuario
            </Link>
          </div>
        </div>
      </header>
    </Layout>
  );
}

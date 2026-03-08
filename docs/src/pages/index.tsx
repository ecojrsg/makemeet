import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';

const accesos = [
  {
    titulo: 'Implementacion',
    descripcion: 'Guia tecnica para instalar, migrar y operar MakeMeEt en SaaS o self-hosted.',
    cta: 'Abrir implementacion',
    to: '/implementacion/intro',
    badge: 'Equipo tecnico',
  },
  {
    titulo: 'Manual de usuario',
    descripcion: 'Uso diario de la aplicacion: crear CV, mejorar con IA y exportar resultados.',
    cta: 'Abrir manual',
    to: '/manual/intro',
    badge: 'Usuario final',
  },
];

const pasos = [
  {
    numero: '01',
    titulo: 'Configura entorno',
    descripcion: 'Instala dependencias, prepara variables y conecta Supabase.',
  },
  {
    numero: '02',
    titulo: 'Aplica migraciones',
    descripcion: 'Ejecuta el flujo CLI para inicializar base de datos y generar tipos.',
  },
  {
    numero: '03',
    titulo: 'Valida setup',
    descripcion: 'Confirma estado en /setup y comienza desarrollo o uso diario.',
  },
];

export default function Home(): JSX.Element {
  const logoUrl = useBaseUrl('/img/MakeMeEt.png');
  return (
    <Layout title="Documentacion" description="Guias tecnicas y manual de usuario de MakeMeEt">
      <main className="docs-home">
        <section className="docs-hero">
          <div className="docs-hero__noise" aria-hidden="true" />
          <div className="docs-shell docs-hero__inner">
            <img
              className="docs-hero__logo hero-reveal hero-reveal--1"
            src={logoUrl}
              alt="MakeMeEt"
            />
            <h1 className="hero-reveal hero-reveal--2">
              Onboarding tecnico claro,<br />listo para produccion.
            </h1>
            <p className="docs-lead hero-reveal hero-reveal--3">
              Documentacion centralizada para implementar, operar y usar MakeMeEt.
            </p>
            <div className="docs-hero__actions hero-reveal hero-reveal--4">
              <Link className="docs-btn docs-btn--primary" to="/implementacion/intro">
                Ir a implementacion
              </Link>
              <Link className="docs-btn docs-btn--ghost" to="/manual/intro">
                Ir a manual
              </Link>
            </div>
          </div>
        </section>

        <section className="docs-shell docs-section" aria-label="Rutas de documentacion">
          <div className="docs-cards">
            {accesos.map((item, i) => (
              <article
                key={item.titulo}
                className={`docs-card section-reveal__item`}
                style={{ animationDelay: `${i * 100 + 100}ms` }}
              >
                <span className="docs-card__badge">{item.badge}</span>
                <h3>{item.titulo}</h3>
                <p>{item.descripcion}</p>
                <Link className="docs-card__link" to={item.to}>
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="docs-shell docs-section docs-section--steps" aria-label="Inicio rapido">
          <div className="docs-steps-strip">
            {pasos.map((paso, i) => (
              <div
                key={paso.numero}
                className="docs-step-item section-reveal__item"
                style={{ animationDelay: `${i * 80 + 120}ms` }}
              >
                <p className="docs-step__number">{paso.numero}</p>
                <p className="docs-step__title">{paso.titulo}</p>
                <p className="docs-step__desc">{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

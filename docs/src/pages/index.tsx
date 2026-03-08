import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

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

const highlights = [
  'Instalacion detallada para Supabase SaaS y self-hosted.',
  'Flujo de desarrollo local con Supabase CLI y migraciones versionadas.',
  'Configuracion y prioridad real de API keys de IA.',
  'Troubleshooting orientado a implementacion y operacion.',
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
  return (
    <Layout title="Documentacion" description="Guias tecnicas y manual de usuario de MakeMeEt">
      <main className="docs-home">
        <section className="docs-hero section-reveal">
          <div className="docs-hero__noise" aria-hidden="true" />
          <div className="docs-shell docs-hero__grid">
            <div className="docs-hero__content section-reveal__item">
              <p className="docs-eyebrow">MAKE ME ET - DOCUMENTACION OFICIAL</p>
              <h1>Onboarding tecnico claro, operativo y listo para produccion.</h1>
              <p className="docs-lead">
                Documentacion centralizada para implementar, operar y usar MakeMeEt con un flujo
                reproducible desde base vacia hasta despliegue estable.
              </p>
              <div className="docs-hero__actions">
                <Link className="docs-btn docs-btn--primary" to="/implementacion/intro">
                  Ir a implementacion
                </Link>
                <Link className="docs-btn docs-btn--ghost" to="/manual/intro">
                  Ir a manual
                </Link>
              </div>
            </div>

            <aside className="docs-hero__panel section-reveal__item" aria-label="Resumen rapido">
              <p className="docs-hero__panel-label">Resumen rapido</p>
              <h3 className="docs-hero__panel-title">Estado de onboarding</h3>
              <div className="docs-hero__stats">
                <div className="docs-hero__stat">
                  <span className="docs-hero__stat-value">2</span>
                  <span className="docs-hero__stat-label">Rutas</span>
                </div>
                <div className="docs-hero__stat">
                  <span className="docs-hero__stat-value">3</span>
                  <span className="docs-hero__stat-label">Pasos base</span>
                </div>
                <div className="docs-hero__stat">
                  <span className="docs-hero__stat-value">100%</span>
                  <span className="docs-hero__stat-label">CLI-first</span>
                </div>
              </div>
              <ul className="docs-hero__checklist">
                <li><span aria-hidden="true">✓</span> Implementacion y manual separados</li>
                <li><span aria-hidden="true">✓</span> Flujos SaaS y self-hosted listos para copiar</li>
                <li><span aria-hidden="true">✓</span> Validacion operativa desde /setup</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="docs-shell docs-section section-reveal" aria-labelledby="accesos-title">
          <div className="docs-section__head section-reveal__item">
            <p className="docs-section__eyebrow">Accesos rapidos</p>
            <h2 id="accesos-title">Elige la ruta de documentacion que necesitas ahora.</h2>
          </div>
          <div className="docs-cards">
            {accesos.map((item) => (
              <article key={item.titulo} className="docs-card section-reveal__item">
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

        <section className="docs-shell docs-section section-reveal" aria-labelledby="incluye-title">
          <div className="docs-section__head section-reveal__item">
            <p className="docs-section__eyebrow">Que incluye</p>
            <h2 id="incluye-title">Cobertura completa para implementacion y operacion.</h2>
          </div>
          <ul className="docs-highlight-list">
            {highlights.map((item) => (
              <li key={item} className="section-reveal__item">
                <span className="docs-highlight-list__dot" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="docs-shell docs-section section-reveal" aria-labelledby="quickstart-title">
          <div className="docs-section__head section-reveal__item">
            <p className="docs-section__eyebrow">Inicio rapido</p>
            <h2 id="quickstart-title">Arranca en 3 pasos.</h2>
          </div>
          <div className="docs-steps">
            {pasos.map((paso) => (
              <article key={paso.numero} className="docs-step section-reveal__item">
                <p className="docs-step__number">{paso.numero}</p>
                <h3>{paso.titulo}</h3>
                <p>{paso.descripcion}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="docs-shell docs-section docs-cta section-reveal" aria-label="Llamado final">
          <div className="docs-cta__box section-reveal__item">
            <h2>Listo para implementar MakeMeEt de forma reproducible.</h2>
            <p>
              Entra a la guia tecnica y sigue el flujo recomendado para levantar entorno,
              migraciones y validaciones sin pasos manuales.
            </p>
            <Link className="docs-btn docs-btn--primary" to="/implementacion/intro">
              Comenzar implementacion
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
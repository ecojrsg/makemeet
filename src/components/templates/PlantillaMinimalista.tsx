import { PlantillaProps } from '@/types/templates';
import { Mail, Phone, MapPin, Linkedin, Github, Star, Users, BookOpen } from 'lucide-react';

const formatearFecha = (fechaStr: string) => {
  if (!fechaStr) return '';
  const [anio, mes] = fechaStr.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[parseInt(mes) - 1]} ${anio}`;
};

const textoNivelIdioma: Record<string, string> = {
  basic: 'Básico',
  conversational: 'Conversacional',
  professional: 'Profesional',
  native: 'Nativo'
};

export function PlantillaMinimalista({ datos, perfilGithub, reposGithub }: PlantillaProps) {
  const { personalInfo, experiences, education, skills, languages } = datos;

  return (
    <div 
      id="styled-cv"
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        fontSize: '11pt', 
        lineHeight: '1.6',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        padding: '48px'
      }}
    >
      {/* Encabezado minimalista */}
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {personalInfo.photo && (
            <img
              src={personalInfo.photo}
              alt={personalInfo.fullName}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', filter: 'grayscale(100%)' }}
            />
          )}
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#000000', marginBottom: '4px', letterSpacing: '-0.5px' }}>
              {personalInfo.fullName || 'Tu Nombre'}
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '300' }}>
              {personalInfo.title || 'Título Profesional'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '12px', color: '#9ca3af', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Perfil */}
      {personalInfo.summary && (
        <section style={{ marginBottom: '32px' }}>
          <p style={{ color: '#4b5563', fontSize: '13px', lineHeight: '1.8', maxWidth: '600px' }}>{personalInfo.summary}</p>
        </section>
      )}

      {/* Experiencia */}
      {experiences.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
            Experiencia
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {experiences.map((exp) => (
              <div key={exp.id} style={{ pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ fontWeight: '500', color: '#000000', fontSize: '14px' }}>{exp.position}</h3>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {formatearFecha(exp.startDate)} — {exp.current ? 'Presente' : formatearFecha(exp.endDate)}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{exp.company}</p>
                {exp.description && (
                  <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Educación */}
      {education.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
            Educación
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {education.map((edu) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', pageBreakInside: 'avoid' }}>
                <div>
                  <h3 style={{ fontWeight: '500', color: '#000000', fontSize: '14px' }}>{edu.degree}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{edu.institution} · {edu.field}</p>
                </div>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {formatearFecha(edu.startDate)} — {formatearFecha(edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Habilidades e Idiomas */}
      <div style={{ display: 'flex', gap: '48px' }}>
        {skills.length > 0 && (
          <section style={{ flex: 1 }}>
            <h2 style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              Habilidades
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill) => (
                <span key={skill.id} style={{ fontSize: '12px', color: '#374151', padding: '4px 12px', backgroundColor: '#f3f4f6', borderRadius: '2px' }}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <h2 style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              Idiomas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#374151' }}>
              {languages.map((lang) => (
                <span key={lang.id}>{lang.name} · {textoNivelIdioma[lang.level]}</span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* GitHub */}
      {perfilGithub && (
        <section style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
            GitHub
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={perfilGithub.avatar_url} alt={perfilGithub.name} style={{ width: '36px', height: '36px', borderRadius: '50%', filter: 'grayscale(100%)', objectFit: 'cover' }} />
            <div>
              <p style={{ fontSize: '13px', color: '#000000' }}>{perfilGithub.name || perfilGithub.login}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af' }}>@{perfilGithub.login} · {perfilGithub.public_repos} repos · {perfilGithub.followers} seguidores</p>
              {perfilGithub.bio && <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{perfilGithub.bio}</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

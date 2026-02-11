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

export function PlantillaModerna({ datos, perfilGithub, reposGithub }: PlantillaProps) {
  const { personalInfo, experiences, education, skills, languages } = datos;
  const color = '#5b4cdb';
  const colorClaro = '#ededfc';

  return (
    <div
      id="styled-cv"
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontSize: '11pt',
        lineHeight: '1.4',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        breakInside: 'avoid-all'
      }}
    >
      {/* Encabezado */}
      <div style={{ padding: '32px', backgroundColor: color }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
          {personalInfo.photo && (
            <img
              src={personalInfo.photo}
              alt={personalInfo.fullName}
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, color: '#ffffff' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>
              {personalInfo.fullName || 'Tu Nombre'}
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '12px', color: '#ffffff' }}>
              {personalInfo.title || 'Título Profesional'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
              {personalInfo.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                  <Mail style={{ width: '16px', height: '16px' }} />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                  <Phone style={{ width: '16px', height: '16px' }} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                  <MapPin style={{ width: '16px', height: '16px' }} />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff' }}>
                  <Linkedin style={{ width: '16px', height: '16px' }} />
                  <span>{personalInfo.linkedin}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Perfil */}
        {personalInfo.summary && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '8px', color }}>
              Perfil Profesional
            </h2>
            <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{personalInfo.summary}</p>
          </section>
        )}

        {/* Experiencia */}
        {experiences.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '12px', color }}>
              Experiencia Laboral
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ position: 'relative', paddingLeft: '12px', borderLeft: '2px solid #e5e7eb', breakInside: 'avoid' }}>
                  <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                    <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{exp.position}</h3>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatearFecha(exp.startDate)} - {exp.current ? 'Presente' : formatearFecha(exp.endDate)}
                    </span>
                  </div>
                  <p style={{ fontWeight: '500', marginBottom: '4px', fontSize: '14px', color }}>{exp.company}</p>
                  {exp.description && (
                    <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.5' }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educación */}
        {education.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '12px', color }}>
              Educación
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ position: 'relative', paddingLeft: '12px', borderLeft: '2px solid #e5e7eb', breakInside: 'avoid' }}>
                  <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{edu.degree}</h3>
                      <p style={{ fontSize: '14px', color }}>{edu.institution}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{edu.field}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatearFecha(edu.startDate)} - {formatearFecha(edu.endDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Habilidades */}
        {skills.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '12px', color }}>
              Habilidades
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill) => (
                <div key={skill.id} style={{ width: 'calc(50% - 4px)', breakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>{skill.name}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '9999px',
                      backgroundColor: color,
                      width: skill.level === 'expert' ? '100%' : skill.level === 'advanced' ? '75%' : skill.level === 'intermediate' ? '50%' : '25%'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Idiomas */}
        {languages.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '12px', color }}>
              Idiomas
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', backgroundColor: colorClaro, color }}>
                  <span style={{ fontWeight: '500' }}>{lang.name}</span>
                  <span style={{ opacity: 0.8 }}> - {textoNivelIdioma[lang.level]}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GitHub */}
        {perfilGithub && (
          <section style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb', breakInside: 'avoid' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color }}>
              <Github style={{ width: '16px', height: '16px' }} />
              GitHub
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <img 
                src={perfilGithub.avatar_url} 
                alt={perfilGithub.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${color}`, objectFit: 'cover', flexShrink: 0 }}
              />
              <div>
                <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{perfilGithub.name || perfilGithub.login}</h3>
                <a href={perfilGithub.html_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color, textDecoration: 'none' }}>
                  @{perfilGithub.login}
                </a>
                {perfilGithub.bio && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{perfilGithub.bio}</p>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen style={{ width: '12px', height: '12px' }} />
                    {perfilGithub.public_repos} repos
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users style={{ width: '12px', height: '12px' }} />
                    {perfilGithub.followers} seguidores
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

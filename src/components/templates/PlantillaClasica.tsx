import { PlantillaProps } from '@/types/templates';
import { templateColors } from '@/config/templateColors';
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

export function PlantillaClasica({ datos, perfilGithub, reposGithub }: PlantillaProps) {
  const { personalInfo, experiences, education, skills, languages } = datos;
  const { primary: color, gradient } = templateColors.clasico;

  return (
    <div 
      id="styled-cv"
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        fontSize: '11pt', 
        lineHeight: '1.5',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        fontFamily: 'Georgia, "Times New Roman", serif'
      }}
    >
      {/* Encabezado clásico */}
      <div style={{ padding: '40px', borderBottom: `3px double ${color}`, textAlign: 'center' }}>
        {personalInfo.photo && (
          <img
            src={personalInfo.photo}
            alt={personalInfo.fullName}
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}`, margin: '0 auto 16px' }}
          />
        )}
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color, marginBottom: '4px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {personalInfo.fullName || 'Tu Nombre'}
        </h1>
        <p style={{ fontSize: '16px', color: '#4b5563', fontStyle: 'italic', marginBottom: '16px' }}>
          {personalInfo.title || 'Título Profesional'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', fontSize: '12px', color: '#6b7280' }}>
          {personalInfo.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail style={{ width: '14px', height: '14px' }} />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone style={{ width: '14px', height: '14px' }} />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin style={{ width: '14px', height: '14px' }} />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedin && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Linkedin style={{ width: '14px', height: '14px' }} />
              {personalInfo.linkedin}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Perfil */}
        {personalInfo.summary && (
          <section>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${color}`, paddingBottom: '6px', marginBottom: '12px' }}>
              Perfil Profesional
            </h2>
            <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.7', textAlign: 'justify' }}>{personalInfo.summary}</p>
          </section>
        )}

        {/* Experiencia */}
        {experiences.length > 0 && (
          <section>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${color}`, paddingBottom: '6px', marginBottom: '12px' }}>
              Experiencia Laboral
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h3 style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>{exp.position}</h3>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                      {formatearFecha(exp.startDate)} - {exp.current ? 'Presente' : formatearFecha(exp.endDate)}
                    </span>
                  </div>
                  <p style={{ fontStyle: 'italic', marginBottom: '6px', fontSize: '13px', color }}>{exp.company}</p>
                  {exp.description && (
                    <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.6' }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educación */}
        {education.length > 0 && (
          <section>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${color}`, paddingBottom: '6px', marginBottom: '12px' }}>
              Educación
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pageBreakInside: 'avoid' }}>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>{edu.degree}</h3>
                    <p style={{ fontSize: '13px', color, fontStyle: 'italic' }}>{edu.institution}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{edu.field}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                    {formatearFecha(edu.startDate)} - {formatearFecha(edu.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Habilidades e Idiomas en columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {skills.length > 0 && (
            <section>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${color}`, paddingBottom: '6px', marginBottom: '12px' }}>
                Habilidades
              </h2>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', fontSize: '12px', color: '#374151' }}>
                {skills.map((skill) => (
                  <li key={skill.id} style={{ marginBottom: '4px' }}>{skill.name}</li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${color}`, paddingBottom: '6px', marginBottom: '12px' }}>
                Idiomas
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px', color: '#374151' }}>
                {languages.map((lang) => (
                  <li key={lang.id} style={{ marginBottom: '4px' }}>
                    <strong>{lang.name}</strong> - {textoNivelIdioma[lang.level]}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* GitHub */}
        {perfilGithub && (
          <section style={{ paddingTop: '16px', borderTop: `1px solid ${color}`, pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${color}`, paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github style={{ width: '14px', height: '14px' }} />
              GitHub
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <img src={perfilGithub.avatar_url} alt={perfilGithub.name} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${color}`, objectFit: 'cover' }} />
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#111827' }}>{perfilGithub.name || perfilGithub.login}</p>
                <p style={{ fontSize: '12px', color }}><a href={perfilGithub.html_url} style={{ color, textDecoration: 'none' }}>@{perfilGithub.login}</a></p>
                {perfilGithub.bio && <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>{perfilGithub.bio}</p>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: '#6b7280' }}>
                  <span>{perfilGithub.public_repos} repositorios</span>
                  <span>{perfilGithub.followers} seguidores</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

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

export function PlantillaCreativa({ datos, perfilGithub, reposGithub, pdfMode = false }: PlantillaProps) {
  const { personalInfo, experiences, education, skills, languages } = datos;
  const colorPrimario = '#e11d48';
  const colorSecundario = '#fef2f2';

  // Si es modo PDF, usar layout apilado
  if (pdfMode) {
    return (
      <div
        id="styled-cv"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '32px',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          fontFamily: '"Poppins", system-ui, sans-serif',
          fontSize: '11pt',
          lineHeight: '1.5',
          breakInside: 'avoid-all'
        }}
      >
        {/* Header con foto y nombre */}
        <header style={{ marginBottom: '24px', breakInside: 'avoid' }}>
          {personalInfo.photo && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img
                src={personalInfo.photo}
                alt={personalInfo.fullName}
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: `4px solid ${colorPrimario}` }}
              />
            </div>
          )}
          <h1 style={{ fontSize: '28pt', fontWeight: '700', color: colorPrimario, marginTop: '16px', textAlign: 'center' }}>
            {personalInfo.fullName || 'Tu Nombre'}
          </h1>
          <p style={{ fontSize: '14pt', color: '#6b7280', textAlign: 'center' }}>
            {personalInfo.title || 'Título Profesional'}
          </p>
        </header>

        {/* Contacto en horizontal */}
        <section style={{ marginBottom: '24px', breakInside: 'avoid' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
            Contacto
          </h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#4b5563' }}>
            {personalInfo.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail style={{ width: '14px', height: '14px', color: colorPrimario }} />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone style={{ width: '14px', height: '14px', color: colorPrimario }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin style={{ width: '14px', height: '14px', color: colorPrimario }} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Linkedin style={{ width: '14px', height: '14px', color: colorPrimario }} />
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </section>

        {/* Skills en horizontal */}
        {skills.length > 0 && (
          <section style={{ marginBottom: '24px', breakAfter: 'auto' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
              Habilidades
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map((skill) => (
                <div key={skill.id} style={{ padding: '6px 12px', backgroundColor: colorSecundario, color: colorPrimario, borderRadius: '16px', fontSize: '11px', fontWeight: '500' }}>
                  {skill.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Idiomas */}
        {languages.length > 0 && (
          <section style={{ marginBottom: '24px', breakAfter: 'auto' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
              Idiomas
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#4b5563' }}>
              {languages.map((lang) => (
                <div key={lang.id}>
                  <span style={{ fontWeight: '600' }}>{lang.name}</span> - {textoNivelIdioma[lang.level]}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Perfil profesional */}
        {personalInfo.summary && (
          <section style={{ marginBottom: '24px', breakInside: 'avoid' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
              Sobre mí
            </h2>
            <p style={{ color: '#4b5563', fontSize: '13px', lineHeight: '1.7' }}>{personalInfo.summary}</p>
          </section>
        )}

        {/* Experiencia */}
        {experiences.length > 0 && (
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
              Experiencia
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ paddingLeft: '16px', borderLeft: `3px solid ${colorPrimario}`, breakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{exp.position}</h3>
                    <span style={{ fontSize: '11px', color: '#ffffff', backgroundColor: colorPrimario, padding: '2px 8px', borderRadius: '12px' }}>
                      {formatearFecha(exp.startDate)} - {exp.current ? 'Presente' : formatearFecha(exp.endDate)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: colorPrimario, fontWeight: '500', marginBottom: '4px' }}>{exp.company}</p>
                  {exp.description && (
                    <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educación */}
        {education.length > 0 && (
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
              Educación
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ padding: '12px', backgroundColor: colorSecundario, borderRadius: '8px', breakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{edu.degree}</h3>
                      <p style={{ fontSize: '13px', color: colorPrimario }}>{edu.institution}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{edu.field}</p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {formatearFecha(edu.startDate)} - {formatearFecha(edu.endDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GitHub */}
        {perfilGithub && (
          <section style={{ marginTop: '24px', breakInside: 'avoid' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github style={{ width: '16px', height: '16px' }} />
              GitHub
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: colorSecundario, borderRadius: '8px' }}>
              <img src={perfilGithub.avatar_url} alt={perfilGithub.name} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${colorPrimario}`, objectFit: 'cover' }} />
              <div>
                <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{perfilGithub.name || perfilGithub.login}</p>
                <p style={{ fontSize: '11px', color: colorPrimario }}>@{perfilGithub.login}</p>
                {perfilGithub.bio && <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{perfilGithub.bio}</p>}
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                  <span>{perfilGithub.public_repos} repos</span>
                  <span>{perfilGithub.followers} seguidores</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }

  // Layout original de 2 columnas para vista previa
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
        fontFamily: '"Poppins", system-ui, sans-serif',
        display: 'flex'
      }}
    >
      {/* Sidebar */}
      <div style={{ width: '35%', backgroundColor: colorPrimario, color: '#ffffff', padding: '32px 24px' }}>
        {/* Foto */}
        {personalInfo.photo && (
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <img
              src={personalInfo.photo}
              alt={personalInfo.fullName}
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)' }}
            />
          </div>
        )}

        {/* Contacto */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', opacity: 0.8 }}>Contacto</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            {personalInfo.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail style={{ width: '14px', height: '14px' }} />
                <span style={{ wordBreak: 'break-all' }}>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone style={{ width: '14px', height: '14px' }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin style={{ width: '14px', height: '14px' }} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Linkedin style={{ width: '14px', height: '14px' }} />
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Habilidades */}
        {skills.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', opacity: 0.8 }}>Habilidades</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>{skill.name}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                    <div style={{ 
                      height: '100%', 
                      backgroundColor: '#ffffff',
                      borderRadius: '2px',
                      width: skill.level === 'expert' ? '100%' : skill.level === 'advanced' ? '75%' : skill.level === 'intermediate' ? '50%' : '25%'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Idiomas */}
        {languages.length > 0 && (
          <div>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', opacity: 0.8 }}>Idiomas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              {languages.map((lang) => (
                <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{lang.name}</span>
                  <span style={{ opacity: 0.8 }}>{textoNivelIdioma[lang.level]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1, padding: '32px' }}>
        {/* Nombre y título */}
        <header style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: colorPrimario, marginBottom: '4px' }}>
            {personalInfo.fullName || 'Tu Nombre'}
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: '300' }}>
            {personalInfo.title || 'Título Profesional'}
          </p>
        </header>

        {/* Perfil */}
        {personalInfo.summary && (
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
              Sobre mí
            </h2>
            <p style={{ color: '#4b5563', fontSize: '13px', lineHeight: '1.7' }}>{personalInfo.summary}</p>
          </section>
        )}

        {/* Experiencia */}
        {experiences.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
              Experiencia
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ paddingLeft: '16px', borderLeft: `3px solid ${colorPrimario}`, breakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{exp.position}</h3>
                    <span style={{ fontSize: '11px', color: '#ffffff', backgroundColor: colorPrimario, padding: '2px 8px', borderRadius: '12px' }}>
                      {formatearFecha(exp.startDate)} - {exp.current ? 'Presente' : formatearFecha(exp.endDate)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: colorPrimario, fontWeight: '500', marginBottom: '4px' }}>{exp.company}</p>
                  {exp.description && (
                    <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educación */}
        {education.length > 0 && (
          <section style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '3px', backgroundColor: colorPrimario }} />
              Educación
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ padding: '12px', backgroundColor: colorSecundario, borderRadius: '8px', breakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{edu.degree}</h3>
                      <p style={{ fontSize: '13px', color: colorPrimario }}>{edu.institution}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{edu.field}</p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {formatearFecha(edu.startDate)} - {formatearFecha(edu.endDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GitHub */}
        {perfilGithub && (
          <section style={{ paddingTop: '16px', borderTop: `2px solid ${colorSecundario}`, breakInside: 'avoid' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: colorPrimario, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github style={{ width: '16px', height: '16px' }} />
              GitHub
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: colorSecundario, borderRadius: '8px' }}>
              <img src={perfilGithub.avatar_url} alt={perfilGithub.name} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${colorPrimario}`, objectFit: 'cover' }} />
              <div>
                <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{perfilGithub.name || perfilGithub.login}</p>
                <p style={{ fontSize: '11px', color: colorPrimario }}>@{perfilGithub.login}</p>
                {perfilGithub.bio && <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{perfilGithub.bio}</p>}
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                  <span>{perfilGithub.public_repos} repos</span>
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
